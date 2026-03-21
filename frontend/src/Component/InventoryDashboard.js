import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Color tokens ─────────────────────────────────────────────────
const C = {
  navy:    "#03045e",
  ocean:   "#0077b6",
  sky:     "#00b4d8",
  mist:    "#90e0ef",
  foam:    "#caf0f8",
  white:   "#ffffff",
  warn:    "#f59e0b",
  danger:  "#ef4444",
}

const pharmacies = [
  { id: 1, name: "Kandy Central Pharmacy",    location: "Kandy, Central Province",       status: "active",  lastSync: "2 min ago" },
  { id: 2, name: "Galle Fort MedPoint",       location: "Galle, Southern Province",      status: "active",  lastSync: "5 min ago" },
  { id: 3, name: "Jaffna Community Rx",       location: "Jaffna, Northern Province",     status: "warning", lastSync: "42 min ago" },
  { id: 4, name: "Matara Rural Clinic",       location: "Matara, Southern Province",     status: "active",  lastSync: "1 min ago" },
  { id: 5, name: "Anuradhapura PharmaCare",   location: "Anuradhapura, North Central",   status: "offline", lastSync: "3 hrs ago" },
  { id: 6, name: "Batticaloa MedStore",       location: "Batticaloa, Eastern Province",  status: "active",  lastSync: "8 min ago" },
  { id: 7, name: "Kurunegala Health Hub",     location: "Kurunegala, North Western",     status: "warning", lastSync: "28 min ago" },
  { id: 8, name: "Trincomalee Bay Pharmacy",  location: "Trincomalee, Eastern Province", status: "active",  lastSync: "3 min ago" },
]

const statusConfig = {
  active:  { label: "Online",    color: C.sky,    bg: "#e0f7fc", dot: C.sky },
  warning: { label: "Slow Sync", color: C.warn,   bg: "#fffbeb", dot: C.warn },
  offline: { label: "Offline",   color: C.danger, bg: "#fef2f2", dot: C.danger },
}

function StatCard({ icon, value, label, sub, gradient, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? gradient : C.white,
        borderRadius: 20,
        padding: "28px 28px 24px",
        flex: 1,
        cursor: "default",
        transition: "all 0.3s ease",
        boxShadow: hovered
          ? "0 16px 48px #03045e28"
          : "0 2px 16px #03045e0c",
        animation: "fadeUp 0.5s ease both",
        animationDelay: delay,
        position: "relative",
        overflow: "hidden",
        border: `1.5px solid ${hovered ? "transparent" : "#90e0ef50"}`,
      }}
    >
      {/* decorative circle */}
      <div style={{
        position: "absolute", right: -20, bottom: -20,
        width: 110, height: 110, borderRadius: "50%",
        background: hovered ? "rgba(255,255,255,0.08)" : `${C.foam}`,
        transition: "all 0.3s"
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <p style={{
            margin: "0 0 6px", fontSize: 11, fontWeight: 700,
            color: hovered ? "rgba(255,255,255,0.7)" : C.ocean,
            letterSpacing: "0.1em", textTransform: "uppercase",
            transition: "color 0.3s"
          }}>{label}</p>
          <p style={{
            margin: 0, fontSize: 46, fontWeight: 800,
            color: hovered ? C.white : C.navy,
            letterSpacing: "-2px", lineHeight: 1,
            fontFamily: "'Outfit', sans-serif",
            transition: "color 0.3s"
          }}>{value}</p>
          <p style={{
            margin: "8px 0 0", fontSize: 12,
            color: hovered ? "rgba(255,255,255,0.6)" : "#90a4ae",
            fontWeight: 500, transition: "color 0.3s"
          }}>{sub}</p>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: hovered ? "rgba(255,255,255,0.15)" : C.foam,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, flexShrink: 0,
          border: `1.5px solid ${hovered ? "rgba(255,255,255,0.2)" : C.mist}`,
          transition: "all 0.3s"
        }}>{icon}</div>
      </div>
    </div>
  )
}

function PharmacyRow({ pharmacy, index, total }) {
  const [invHover, setInvHover] = useState(false)
  const [ordHover, setOrdHover] = useState(false)
  const [rowHover, setRowHover] = useState(false)
  const status = statusConfig[pharmacy.status]
  const initials = pharmacy.name.split(" ").slice(0, 2).map(w => w[0]).join("")

  return (
    <div
      onMouseEnter={() => setRowHover(true)}
      onMouseLeave={() => setRowHover(false)}
      style={{
        display: "flex", alignItems: "center",
        padding: "14px 24px",
        borderBottom: index < total - 1 ? `1px solid ${C.foam}` : "none",
        background: rowHover ? "#f0faff" : C.white,
        transition: "background 0.15s",
        animation: "fadeUp 0.5s ease both",
        animationDelay: `${0.05 * index}s`,
      }}
    >
      {/* Index */}
      <span style={{
        width: 34, color: C.mist, fontSize: 12,
        fontWeight: 700, flexShrink: 0, fontFamily: "'Outfit', sans-serif"
      }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.mist, fontWeight: 800, fontSize: 13,
        flexShrink: 0, marginRight: 14,
        fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px",
        boxShadow: "0 4px 12px #03045e25"
      }}>
        {initials}
      </div>

      {/* Name & Location */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontWeight: 700, fontSize: 14.5, color: C.navy,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>{pharmacy.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#90a4ae" }}>
          📍 {pharmacy.location}
        </p>
      </div>

      {/* Status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: status.bg, borderRadius: 99,
        padding: "5px 13px", marginRight: 28, flexShrink: 0,
        border: `1px solid ${status.color}30`
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%", background: status.dot,
          boxShadow: pharmacy.status === "active" ? `0 0 0 3px ${status.dot}30` : "none"
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
      </div>

      {/* Last Sync */}
      <span style={{
        fontSize: 12, color: C.mist, marginRight: 28,
        flexShrink: 0, width: 80, textAlign: "right", fontWeight: 600
      }}>
        {pharmacy.lastSync}
      </span>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          onMouseEnter={() => setInvHover(true)}
          onMouseLeave={() => setInvHover(false)}
          style={{
            padding: "8px 18px", borderRadius: 9, border: "none",
            background: invHover
              ? `linear-gradient(135deg, ${C.ocean}, ${C.sky})`
              : `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
            color: C.white, fontWeight: 700, fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "inherit",
            boxShadow: invHover ? `0 6px 18px ${C.ocean}50` : `0 2px 8px ${C.navy}30`,
            transform: invHover ? "translateY(-1px)" : "none"
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          Inventory
        </button>

        <button
          onMouseEnter={() => setOrdHover(true)}
          onMouseLeave={() => setOrdHover(false)}
          style={{
            padding: "8px 18px", borderRadius: 9,
            border: `2px solid ${ordHover ? C.sky : C.mist}`,
            background: ordHover ? C.foam : "transparent",
            color: ordHover ? C.ocean : "#90a4ae",
            fontWeight: 700, fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "inherit",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Orders
        </button>
      </div>
    </div>
  )
}

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const [searchPharmacy, setSearchPharmacy] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [btnHover, setBtnHover] = useState(false)

  const filteredPharmacies = pharmacies.filter(p =>
    p.name.toLowerCase().includes(searchPharmacy.toLowerCase()) &&
    (filterStatus === "all" || p.status === filterStatus)
  )

  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      background: `linear-gradient(160deg, #e8f8fd 0%, #f0faff 50%, #e0f4fb 100%)`,
      minHeight: "100vh",
      width: "100%",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.mist}; border-radius: 99px; }
      `}</style>

      {/* Decorative top bar */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${C.navy}, ${C.ocean}, ${C.sky}, ${C.mist})`,
      }} />

      <div style={{ padding: "40px 48px" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.mist} strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span style={{ fontSize: 12, color: "#90a4ae", fontWeight: 600 }}>RemoteRx</span>
                <span style={{ color: C.mist, fontSize: 12 }}>›</span>
                <span style={{
                  fontSize: 12, color: C.ocean, fontWeight: 700,
                  background: C.foam, padding: "3px 10px", borderRadius: 99
                }}>Inventory</span>
              </div>

              <h1 style={{
                margin: 0, fontSize: 34, fontWeight: 800,
                letterSpacing: "-1.5px", color: C.navy, lineHeight: 1.1
              }}>Inventory Dashboard</h1>
              <p style={{ margin: "8px 0 0", color: "#90a4ae", fontSize: 13, fontWeight: 500 }}>
                Monitor dispatch activity and your connected pharmacy network in real time.
              </p>
            </div>

            {/* Add Medicine CTA */}
            <button
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              onClick={() => navigate('/medicineAdd')}
              style={{
                background: btnHover
                  ? `linear-gradient(135deg, ${C.ocean}, ${C.sky})`
                  : `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
                color: C.white, border: "none",
                padding: "13px 26px", borderRadius: 14, fontWeight: 700,
                fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
                gap: 9, transition: "all 0.25s", fontFamily: "inherit",
                boxShadow: btnHover
                  ? `0 8px 28px ${C.ocean}55`
                  : `0 4px 18px ${C.navy}35`,
                transform: btnHover ? "translateY(-2px)" : "none",
                letterSpacing: "-0.2px"
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              Add Medicine
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
          <StatCard
            icon="🚚" value="1,284"
            label="Total Dispatched" sub="All-time orders shipped"
            gradient={`linear-gradient(135deg, ${C.navy}, ${C.ocean})`}
            delay="0.08s"
          />
          <StatCard
            icon="⏳" value="37"
            label="Pending Orders" sub="Awaiting fulfilment"
            gradient={`linear-gradient(135deg, ${C.ocean}, ${C.sky})`}
            delay="0.16s"
          />
          <StatCard
            icon="🏥" value="08"
            label="Connected Pharmacies" sub="Active on network"
            gradient={`linear-gradient(135deg, ${C.sky}, ${C.mist})`}
            delay="0.24s"
          />
        </div>

        {/* ── Pharmacy List ── */}
        <div style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h2 style={{
                margin: 0, fontWeight: 800, fontSize: 20,
                letterSpacing: "-0.6px", color: C.navy
              }}>
                Connected Pharmacies
              </h2>
              <p style={{ margin: "3px 0 0", color: "#90a4ae", fontSize: 12, fontWeight: 500 }}>
                {filteredPharmacies.length} of {pharmacies.length} pharmacies shown
              </p>
            </div>

            {/* Search + Filters */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mist} strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={searchPharmacy}
                  onChange={e => setSearchPharmacy(e.target.value)}
                  placeholder="Search pharmacies..."
                  style={{
                    padding: "9px 14px 9px 34px", borderRadius: 10,
                    border: `2px solid ${C.foam}`, background: C.white,
                    fontSize: 13, outline: "none", width: 220,
                    fontFamily: "inherit", color: C.navy,
                    transition: "border-color 0.2s", fontWeight: 500
                  }}
                  onFocus={e => e.target.style.borderColor = C.sky}
                  onBlur={e => e.target.style.borderColor = C.foam}
                />
              </div>

              {["all", "active", "warning", "offline"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "8px 16px", borderRadius: 9,
                    border: `2px solid ${filterStatus === s ? C.ocean : C.foam}`,
                    background: filterStatus === s
                      ? `linear-gradient(135deg, ${C.navy}, ${C.ocean})`
                      : C.white,
                    color: filterStatus === s ? C.white : "#90a4ae",
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    textTransform: "capitalize", transition: "all 0.15s",
                    fontFamily: "inherit",
                    boxShadow: filterStatus === s ? `0 4px 12px ${C.navy}30` : "none"
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: C.white,
            borderRadius: 20, overflow: "hidden",
            border: `2px solid ${C.foam}`,
            boxShadow: `0 4px 32px ${C.navy}0a`
          }}>
            {/* Table column headers */}
            <div style={{
              display: "flex", alignItems: "center",
              padding: "13px 24px",
              background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
              borderBottom: `3px solid ${C.sky}`
            }}>
              {[
                { label: "#",         style: { width: 34, flexShrink: 0 } },
                { label: "",          style: { width: 56, flexShrink: 0 } },
                { label: "Pharmacy",  style: { flex: 1 } },
                { label: "Status",    style: { width: 120, flexShrink: 0 } },
                { label: "Last Sync", style: { width: 108, flexShrink: 0, textAlign: "right" } },
                { label: "Actions",   style: { width: 200, flexShrink: 0, textAlign: "right" } },
              ].map((col, i) => (
                <span key={i} style={{
                  ...col.style,
                  color: C.mist, fontSize: 10.5, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  fontFamily: "inherit"
                }}>{col.label}</span>
              ))}
            </div>

            {filteredPharmacies.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🏥</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.mist }}>No pharmacies found</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: C.foam }}>Try adjusting your search or filter</p>
              </div>
            ) : (
              filteredPharmacies.map((pharmacy, index) => (
                <PharmacyRow
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  index={index}
                  total={filteredPharmacies.length}
                />
              ))
            )}

            {/* Footer summary */}
            <div style={{
              padding: "12px 24px",
              background: C.foam,
              borderTop: `1px solid ${C.mist}40`,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 12, color: C.ocean, fontWeight: 600 }}>
                Showing {filteredPharmacies.length} pharmacy{filteredPharmacies.length !== 1 ? "ies" : ""}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3].map(p => (
                  <div key={p} style={{
                    width: p === 1 ? 24 : 8, height: 8, borderRadius: 99,
                    background: p === 1 ? C.ocean : C.mist
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}