import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Calendar, AlertCircle, Package, Pill,
  Clock, TrendingDown, Building2, Filter, Loader2, CheckCircle
} from 'lucide-react';
import { reportAPI } from '../utils/apiEndpoints';

// ── Palette ───────────────────────────────────────────────────────
const C = {
  snow:      "#FFFFFF",
  white:     "#F7F9FC",
  paleSlate: "#DDE3ED",
  techBlue:  "#023E8A",
  lilacAsh:  "#4C6EF5",
  blueSlate: "#4A5568",
  success:   "#0E7C5B",
  warn:      "#B45309",
  danger:    "#C0392B",
}

const categories = [
  "Antibiotic","Antidiabetic","Cardiovascular","Respiratory",
  "Analgesic","Rehydration","Antiviral","Antifungal",
  "Antihistamine","Supplement","Other"
]

const pharmaciesList = [
  "Kandy Central Pharmacy","Galle Fort MedPoint","Jaffna Community Rx",
  "Matara Rural Clinic","Anuradhapura PharmaCare","Batticaloa MedStore",
  "Kurunegala Health Hub","Trincomalee Bay Pharmacy"
]

// ── Report Types ───────────────────────────────────────────────────
const reportTypes = [
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Complete medicine inventory with stock levels and values',
    icon: Package,
    color: C.techBlue,
    formats: ['json', 'pdf']
  },
  {
    id: 'expiry',
    name: 'Expiry Report',
    description: 'Medicines expiring soon or already expired',
    icon: Clock,
    color: C.danger,
    formats: ['json', 'pdf']
  },
  {
    id: 'lowstock',
    name: 'Low Stock Report',
    description: 'Medicines that need to be reordered',
    icon: TrendingDown,
    color: C.warn,
    formats: ['json']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Performance',
    description: 'Performance metrics by pharmacy',
    icon: Building2,
    color: C.success,
    formats: ['json']
  },
  {
    id: 'orders',
    name: 'Orders Report',
    description: 'Complete order history and status tracking',
    icon: FileText,
    color: C.lilacAsh,
    formats: ['json', 'pdf']
  }
]

// ── Report Generator Component ───────────────────────────────────────
export default function ReportGenerator({ type = 'inventory', filters = {} }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [reportFilters, setReportFilters] = useState({
    pharmacy: filters.pharmacy || '',
    category: filters.category || '',
    days: filters.days || '90',
    threshold: filters.threshold || '10',
    status: filters.status || '',
    priority: filters.priority || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || ''
  })

  const reportConfig = reportTypes.find(r => r.id === type) || reportTypes[0]

  const downloadReport = async (format) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Build query parameters
      const params = new URLSearchParams({
        format,
        ...reportFilters
      })

      // Remove empty filters
      Object.keys(reportFilters).forEach(key => {
        if (!reportFilters[key]) {
          params.delete(key)
        }
      })

      const response = await reportAPI.generateReport(type, params.toString())
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to generate ${reportConfig.name}`)
      }

      if (format === 'pdf') {
        // Handle PDF download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Handle JSON download
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setReportFilters(prev => ({ ...prev, [key]: value }))
  }

  const availableFormats = reportConfig.formats

  return (
    <div style={{
      background: C.white,
      borderRadius: 12,
      border: `1px solid ${C.paleSlate}`,
      padding: 24,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        select option { color: #333; background: ${C.snow}; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${reportConfig.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <reportConfig.icon size={24} color={reportConfig.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: C.blueSlate, fontSize: 18, fontWeight: 700 }}>
            {reportConfig.name}
          </h3>
          <p style={{ margin: '4px 0 0', color: C.lilacAsh, fontSize: 13, fontWeight: 400 }}>
            {reportConfig.description}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px', color: C.blueSlate, fontSize: 14, fontWeight: 600 }}>
          Report Filters
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          
          {/* Pharmacy Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
              Pharmacy
            </label>
            <select
              value={reportFilters.pharmacy}
              onChange={(e) => handleFilterChange('pharmacy', e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${C.paleSlate}`, background: C.snow,
                fontSize: 13, color: C.blueSlate, outline: 'none'
              }}
            >
              <option value="">All Pharmacies</option>
              {pharmaciesList.map(pharmacy => (
                <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
              Category
            </label>
            <select
              value={reportFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${C.paleSlate}`, background: C.snow,
                fontSize: 13, color: C.blueSlate, outline: 'none'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Conditional Filters */}
          {type === 'expiry' && (
            <div>
              <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Days Until Expiry
              </label>
              <input
                type="number"
                value={reportFilters.days}
                onChange={(e) => handleFilterChange('days', e.target.value)}
                min="1"
                max="365"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${C.paleSlate}`, background: C.snow,
                  fontSize: 13, color: C.blueSlate, outline: 'none'
                }}
              />
            </div>
          )}

          {type === 'lowstock' && (
            <div>
              <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={reportFilters.threshold}
                onChange={(e) => handleFilterChange('threshold', e.target.value)}
                min="0"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${C.paleSlate}`, background: C.snow,
                  fontSize: 13, color: C.blueSlate, outline: 'none'
                }}
              />
            </div>
          )}

          {/* Order-specific filters */}
          {type === 'orders' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                  Status
                </label>
                <select
                  value={reportFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${C.paleSlate}`, background: C.snow,
                    fontSize: 13, color: C.blueSlate, outline: 'none'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                  Priority
                </label>
                <select
                  value={reportFilters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${C.paleSlate}`, background: C.snow,
                    fontSize: 13, color: C.blueSlate, outline: 'none'
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${C.paleSlate}`, background: C.snow,
                    fontSize: 13, color: C.blueSlate, outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, color: C.lilacAsh, fontSize: 11, fontWeight: 500, textTransform: 'uppercase' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${C.paleSlate}`, background: C.snow,
                    fontSize: 13, color: C.blueSlate, outline: 'none'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Format Selection */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px', color: C.blueSlate, fontSize: 14, fontWeight: 600 }}>
          Download Format
        </h4>
        <div style={{ display: 'flex', gap: 8 }}>
          {availableFormats.map(format => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              style={{
                padding: '8px 16px', borderRadius: 8,
                border: `2px solid ${selectedFormat === format ? reportConfig.color : C.paleSlate}`,
                background: selectedFormat === format ? `${reportConfig.color}15` : C.snow,
                color: selectedFormat === format ? reportConfig.color : C.lilacAsh,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', textTransform: 'uppercase'
              }}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={() => downloadReport(selectedFormat)}
          disabled={loading}
          style={{
            padding: '12px 24px', borderRadius: 8,
            border: 'none', background: reportConfig.color,
            color: C.snow, fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s', opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Generating...
            </>
          ) : (
            <>
              <Download size={16} />
              Download {selectedFormat.toUpperCase()}
            </>
          )}
        </button>

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: `${C.success}15`, border: `1px solid ${C.success}30`,
            color: C.success, fontSize: 13, fontWeight: 500,
            animation: 'slideIn 0.3s ease'
          }}>
            <CheckCircle size={16} />
            Report downloaded successfully!
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: `${C.danger}15`, border: `1px solid ${C.danger}30`,
            color: C.danger, fontSize: 13, fontWeight: 500,
            animation: 'slideIn 0.3s ease'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
