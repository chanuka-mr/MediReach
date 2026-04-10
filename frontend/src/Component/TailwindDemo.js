import React from 'react';
import {
  Search, Filter, ShoppingCart, Clock, Building2,
  ChevronRight, RefreshCw, Download, Eye,
  AlertTriangle, Truck, CheckCircle2,
  DollarSign, Hash, Calendar, MapPin,
  Pill, TrendingUp, ClipboardList,
  Hourglass, Ban, CircleDot, X,
  ShieldAlert, SendHorizonal, ThumbsDown, FileText
} from 'lucide-react';

// Sample component demonstrating Tailwind CSS classes
const TailwindDemo = () => {
  return (
    <div className="min-h-screen bg-snow font-sans text-blue-slate p-9">
      {/* Header Section */}
      <div className="mb-7 animate-fade-up">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.75 mb-3">
              <div className="w-7.5 h-7.5 rounded-lg bg-tech-blue flex items-center justify-center shadow-tech">
                <ShoppingCart size={14} className="text-snow" strokeWidth={2} />
              </div>
              <span className="text-xs text-lilac-ash font-normal">MediReach</span>
              <ChevronRight size={11} className="text-pale-slate" />
              <span className="text-xs font-bold text-tech-blue bg-tech-blue/8 px-2.5 py-0.5 rounded-full border border-tech-blue/15">
                Pharmacy Orders
              </span>
            </div>
            <h1 className="m-0 text-2xl font-bold tracking-tight text-blue-slate leading-tight font-display">
              Order Management
            </h1>
            <p className="mt-1.5 text-lilac-ash text-sm">
              Review, dispatch or reject medicine orders from the pharmacy network
            </p>
          </div>
          <div className="flex gap-2.25 flex-shrink-0">
            <button className="btn btn-secondary btn-sm">
              <RefreshCw size={13} strokeWidth={2} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm">
              <Download size={13} strokeWidth={2} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-3.5 mb-7 animate-fade-up animate-delay-100">
        <div className="stat-card animate-delay-150">
          <div className="flex justify-between items-start relative">
            <div>
              <p className="m-0 mb-1.75 text-xs font-bold text-lilac-ash tracking-wider uppercase">
                Total Orders
              </p>
              <p className="m-0 text-2xl font-bold tracking-tight text-tech-blue font-display transition-colors duration-300">
                247
              </p>
              <p className="mt-1.5 text-xs text-lilac-ash">All time</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-tech-blue/7 border border-tech-blue/12 flex items-center justify-center transition-all duration-300">
              <ClipboardList size={19} className="text-tech-blue" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="stat-card animate-delay-200">
          <div className="flex justify-between items-start relative">
            <div>
              <p className="m-0 mb-1.75 text-xs font-bold text-lilac-ash tracking-wider uppercase">
                Pending
              </p>
              <p className="m-0 text-2xl font-bold tracking-tight text-tech-blue font-display transition-colors duration-300">
                18
              </p>
              <p className="mt-1.5 text-xs text-lilac-ash">Awaiting action</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-tech-blue/7 border border-tech-blue/12 flex items-center justify-center transition-all duration-300">
              <Hourglass size={19} className="text-tech-blue" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="stat-card animate-delay-300">
          <div className="flex justify-between items-start relative">
            <div>
              <p className="m-0 mb-1.75 text-xs font-bold text-lilac-ash tracking-wider uppercase">
                In Transit
              </p>
              <p className="m-0 text-2xl font-bold tracking-tight text-tech-blue font-display transition-colors duration-300">
                12
              </p>
              <p className="mt-1.5 text-xs text-lilac-ash">On the way</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-tech-blue/7 border border-tech-blue/12 flex items-center justify-center transition-all duration-300">
              <Truck size={19} className="text-tech-blue" strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Value Strip */}
      <div className="p-2.75 rounded-xl mb-5 bg-white border border-pale-slate flex items-center gap-2.5 shadow-sm animate-fade-up animate-delay-400">
        <TrendingUp size={14} className="text-tech-blue" />
        <span className="text-xs text-lilac-ash font-medium">Total order value:</span>
        <span className="text-base font-bold text-tech-blue font-display tracking-tight">
          LKR 2,847,650
        </span>
      </div>

      {/* Search and Filters */}
      <div className="mb-3.5 animate-fade-up animate-delay-500">
        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search size={13} className="absolute left-2.75 top-1/2 -translate-y-1/2 text-tech-blue" />
            <input
              type="text"
              placeholder="Search by order ID, pharmacy or medicine..."
              className="input pl-8.25"
            />
          </div>

          {/* Status Pills */}
          <div className="flex gap-1.5 flex-wrap">
            {["All", "Pending", "In Transit", "Delivered"].map(status => (
              <button
                key={status}
                className="px-3 py-1.5 rounded-lg cursor-pointer font-semibold text-xs transition-all duration-150 flex items-center gap-1.25 border border-pale-slate bg-white text-blue-slate hover:border-tech-blue hover:text-tech-blue"
              >
                {status}
              </button>
            ))}
          </div>

          <button className="btn btn-outline btn-sm">
            <Filter size={12} strokeWidth={2} />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container animate-fade-up animate-delay-600">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-5.5">Order ID</th>
                <th>Pharmacy</th>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Value</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Ordered</th>
                <th className="pr-5.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row-hover">
                <td className="py-3.25 pl-5.5">
                  <div className="flex items-center gap-1.75">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger shadow-glow-danger" />
                    <span className="text-xs font-bold text-lilac-ash font-display">ORD-2843</span>
                  </div>
                </td>
                <td className="py-3.25 min-w-48">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-tech-blue to-blue-600 flex items-center justify-center text-snow font-bold text-xs border border-tech-blue/40 shadow-button font-display tracking-wide">
                      JC
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold text-blue-slate">Jaffna Community Rx</p>
                      <div className="flex items-center gap-0.75 mt-0.25">
                        <MapPin size={9} className="text-lilac-ash" />
                        <span className="text-xs text-lilac-ash">Jaffna</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.25 min-w-44">
                  <div className="flex items-center gap-1.75">
                    <Pill size={13} className="text-lilac-ash" strokeWidth={1.8} />
                    <div>
                      <p className="m-0 text-xs font-medium text-blue-slate">Salbutamol Inhaler</p>
                      <span className="text-xs font-semibold px-1.75 py-0.25 rounded-full bg-lilac-ash/8 text-lilac-ash border border-lilac-ash/18">
                        Respiratory
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.25">
                  <span className="text-sm font-bold text-tech-blue font-display">50</span>
                  <span className="text-xs text-lilac-ash ml-0.75">units</span>
                </td>
                <td className="py-3.25">
                  <span className="text-sm font-bold text-tech-blue font-display">34,000</span>
                  <span className="text-xs text-lilac-ash ml-0.75">LKR</span>
                </td>
                <td className="py-3.25">
                  <div className="badge-warning">
                    <Hourglass size={10} strokeWidth={2} />
                    Pending
                  </div>
                </td>
                <td className="py-3.25">
                  <div className="badge-danger">
                    <AlertTriangle size={9} strokeWidth={2.5} />
                    Urgent
                  </div>
                </td>
                <td className="py-3.25">
                  <span className="text-xs text-lilac-ash font-medium">Mar 6, 2025</span>
                </td>
                <td className="py-3.25 pr-5.5 pl-4">
                  <div className="flex gap-1.75 items-center">
                    <button className="btn btn-success btn-sm">
                      <SendHorizonal size={11} strokeWidth={2.5} />
                      Dispatch
                    </button>
                    <button className="btn btn-outline btn-sm">
                      <Eye size={11} strokeWidth={2} />
                      View
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="table-row-hover">
                <td className="py-3.25 pl-5.5">
                  <div className="flex items-center gap-1.75">
                    <span className="text-xs font-bold text-lilac-ash font-display">ORD-2842</span>
                  </div>
                </td>
                <td className="py-3.25 min-w-48">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-pale-slate to-lilac-ash flex items-center justify-center text-snow font-bold text-xs border border-pale-slate shadow-button font-display tracking-wide">
                      GF
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold text-blue-slate">Galle Fort MedPoint</p>
                      <div className="flex items-center gap-0.75 mt-0.25">
                        <MapPin size={9} className="text-lilac-ash" />
                        <span className="text-xs text-lilac-ash">Galle</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.25 min-w-44">
                  <div className="flex items-center gap-1.75">
                    <Pill size={13} className="text-lilac-ash" strokeWidth={1.8} />
                    <div>
                      <p className="m-0 text-xs font-medium text-blue-slate">Paracetamol 500mg</p>
                      <span className="text-xs font-semibold px-1.75 py-0.25 rounded-full bg-lilac-ash/8 text-lilac-ash border border-lilac-ash/18">
                        Analgesic
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.25">
                  <span className="text-sm font-bold text-tech-blue font-display">500</span>
                  <span className="text-xs text-lilac-ash ml-0.75">units</span>
                </td>
                <td className="py-3.25">
                  <span className="text-sm font-bold text-tech-blue font-display">17,500</span>
                  <span className="text-xs text-lilac-ash ml-0.75">LKR</span>
                </td>
                <td className="py-3.25">
                  <div className="badge-primary">
                    <Truck size={10} strokeWidth={2} />
                    In Transit
                  </div>
                </td>
                <td className="py-3.25">
                  <span className="text-xs text-lilac-ash">—</span>
                </td>
                <td className="py-3.25">
                  <span className="text-xs text-lilac-ash font-medium">Mar 5, 2025</span>
                </td>
                <td className="py-3.25 pr-5.5 pl-4">
                  <div className="flex gap-1.75 items-center">
                    <div className="badge-primary">
                      <Truck size={10} strokeWidth={2} />
                      Dispatched
                    </div>
                    <button className="btn btn-outline btn-sm">
                      <Eye size={11} strokeWidth={2} />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Page 1 of 3 · 247 results
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>
              <ChevronRight size={14} strokeWidth={2.5} className="rotate-180" />
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Example */}
      <div className="modal-overlay">
        <div className="modal-content max-w-md">
          <div className="modal-header">
            <h3 className="m-0 text-lg font-bold text-blue-slate font-display">
              Generate Report
            </h3>
            <button className="btn btn-ghost btn-icon">
              <X size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="modal-body">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select className="select">
                  <option>Orders Report</option>
                  <option>Inventory Report</option>
                  <option>Expiry Report</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <div className="flex gap-2">
                  <button className="btn btn-outline flex-1">PDF</button>
                  <button className="btn btn-outline flex-1">JSON</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary">Cancel</button>
            <button className="btn btn-primary">
              <Download size={14} strokeWidth={2} />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Toast Example */}
      <div className="toast toast-success">
        <div className="toast-icon">
          <SendHorizonal size={17} strokeWidth={2} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 mb-0.75 text-sm font-bold text-blue-slate font-display">
            Order Dispatched
          </p>
          <p className="m-0 text-xs font-semibold text-success">ORD-2843 · Salbutamol Inhaler</p>
          <p className="mt-0.5 text-xs text-lilac-ash">Jaffna Community Rx</p>
        </div>
        <div className="toast-progress">
          <div className="toast-progress-bar bg-success" />
        </div>
        <button className="btn btn-ghost btn-icon">
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default TailwindDemo;
