import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Plus, Search, Package, Clock, Building2, MapPin,
  ChevronRight, ShoppingCart, ArrowUpRight, Filter,
  Wifi, WifiOff, AlertTriangle, Activity, TrendingUp,
  BarChart3, RefreshCw, MoreHorizontal, Eye
} from 'lucide-react'

const C = {
  navy:   "#03045e",
  ocean:  "#0077b6",
  sky:    "#00b4d8",
  mist:   "#90e0ef",
  foam:   "#caf0f8",
  white:  "#ffffff",
  warn:   "#f59e0b",
  danger: "#ef4444",
  green:  "#22c55e",
}

const pharmacies = [
  { id: 1, name: "Kandy Central Pharmacy",   location: "Kandy, Central Province",       status: "active",  lastSync: "2 min ago",  orders: 14, stock: 94 },
  { id: 2, name: "Galle Fort MedPoint",      location: "Galle, Southern Province",      status: "active",  lastSync: "5 min ago",  orders: 8,  stock: 87 },
  { id: 3, name: "Jaffna Community Rx",      location: "Jaffna, Northern Province",     status: "warning", lastSync: "42 min ago", orders: 3,  stock: 61 },
  { id: 4, name: "Matara Rural Clinic",      location: "Matara, Southern Province",     status: "active",  lastSync: "1 min ago",  orders: 21, stock: 78 },
  { id: 5, name: "Anuradhapura PharmaCare",  location: "Anuradhapura, North Central",   status: "offline", lastSync: "3 hrs ago",  orders: 0,  stock: 45 },
  { id: 6, name: "Batticaloa MedStore",      location: "Batticaloa, Eastern Province",  status: "active",  lastSync: "8 min ago",  orders: 11, stock: 91 },
  { id: 7, name: "Kurunegala Health Hub",    location: "Kurunegala, North Western",     status: "warning", lastSync: "28 min ago", orders: 5,  stock: 55 },
  { id: 8, name: "Trincomalee Bay Pharmacy", location: "Trincomalee, Eastern Province", status: "active",  lastSync: "3 min ago",  orders: 17, stock: 83 },
]

const STATUS = {
  active:  { label: "Online",    color: C.green,  bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   icon: Wifi },
  warning: { label: "Slow Sync", color: C.warn,   bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: AlertTriangle },
  offline: { label: "Offline",   color: C.danger, bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: WifiOff },
}

function StatCard({ icon: Icon, value, label, sub, accent, delay, trend }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        borderRadius: 18,
        padding: "26px 24px 22px",
        cursor: "default",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        position: "relative",
        overflow: "hidden",
        background: hov
          ? `linear-gradient(135deg, ${accent}22, ${accent}10)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? accent + "40" : "rgba(144,224,239,0.08)"}`,
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${accent}20` : "0 4px 20px rgba(0,0,0,0.2)",
        animation: `fadeUp 0.5s ease ${delay} both`,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* bg glow */}
      <div style={{
        position: "absolute", right: -30, bottom: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
        transition: "opacity 0.3s",
        opacity: hov ? 1 : 0.5,
      }} />

      {/* top strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: hov ? 1 : 0,
        transition: "opacity 0.3s",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: "0 0 10px", fontSize: 10.5, fontWeight: 700,
            color: "rgba(144,224,239,0.5)",
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>{label}</p>
          <p style={{
            margin: 0, fontSize: 44, fontWeight: 800,
            color: hov ? accent : C.white,
            letterSpacing: "-2.5px", lineHeight: 1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "color 0.3s",
          }}>{value}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            {trend && (
              <div style={{
                display: "flex", alignItems: "center", gap: 3,
                background: "rgba(34,197,94,0.12)",
                borderRadius: 99, padding: "2px 7px",
                border: "1px solid rgba(34,197,94,0.2)",
              }}>
                <TrendingUp size={9} color={C.green} />
                <span style={{ fontSize: 10, fontWeight: 700, color: C.green }}>{trend}</span>
              </div>
            )}
            <p style={{ margin: 0, fontSize: 11.5, color: "rgba(144,224,239,0.35)", fontWeight: 500 }}>{sub}</p>
          </div>
        </div>

        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: hov ? `${accent}22` : "rgba(144,224,239,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${hov ? accent + "35" : "rgba(144,224,239,0.1)"}`,
          transition: "all 0.3s",
        }}>
          <Icon size={20} color={hov ? accent : "rgba(144,224,239,0.45)"} strokeWidth={1.8} style={{ transition: "color 0.3s" }} />
        </div>
      </div>
    </div>
  )
}

function StockBar({ value }) {
  const color = value >= 80 ? C.green : value >= 55 ? C.warn : C.danger
  return (
    <div style={{ width: 72, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(144,224,239,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, borderRadius: 99, background: color, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 10.5, fontWeight: 700, color, textAlign: "right" }}>{value}%</span>
    </div>
  )
}

function PharmacyRow({ pharmacy, index, total, navigate }) {
  const [invHov, setInvHov] = useState(false)
  const [ordHov, setOrdHov] = useState(false)
  const [rowHov, setRowHov] = useState(false)
  const st = STATUS[pharmacy.status]
  const StIcon = st.icon
  const initials = pharmacy.name.split(" ").slice(0, 2).map(w => w[0]).join("")

  return (
    
    <div
      onMouseEnter={() => setRowHov(true)}
      onMouseLeave={() => setRowHov(false)}
      style={{
        display: "flex", alignItems: "center",
        padding: "13px 22px",
        borderBottom: index < total - 1 ? "1px solid rgba(144,224,239,0.05)" : "none",
        background: rowHov ? "rgba(0,180,216,0.04)" : "transparent",
        transition: "background 0.15s",
        animation: `fadeUp 0.45s ease ${0.05 * index}s both`,
        position: "relative",
      }}
    >
      {/* hover left bar */}
      {rowHov && (
        <div style={{
          position: "absolute", left: 0, top: "10%", bottom: "10%",
          width: 2, borderRadius: "0 2px 2px 0",
          background: `linear-gradient(180deg, ${C.sky}, ${C.mist})`,
          boxShadow: `0 0 8px ${C.sky}`,
        }} />
      )}

      {/* Index */}
      <span style={{
        width: 32, color: "rgba(144,224,239,0.2)", fontSize: 11.5,
        fontWeight: 700, flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: `linear-gradient(135deg, ${C.navy}cc, ${C.ocean})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.mist, fontWeight: 800, fontSize: 12,
        flexShrink: 0, marginRight: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        border: "1px solid rgba(0,180,216,0.2)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}>
        {initials}
      </div>

      {/* Name & Location */}
      <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
        <p style={{
          margin: 0, fontWeight: 600, fontSize: 14,
          color: rowHov ? C.white : "rgba(202,240,248,0.85)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          transition: "color 0.15s",
        }}>{pharmacy.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <MapPin size={10} color="rgba(144,224,239,0.3)" />
          <p style={{ margin: 0, fontSize: 11.5, color: "rgba(144,224,239,0.3)", fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pharmacy.location}
          </p>
        </div>
      </div>

      {/* Status pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        background: st.bg, borderRadius: 99,
        padding: "5px 11px", marginRight: 20, flexShrink: 0,
        border: `1px solid ${st.border}`,
      }}>
        <StIcon size={10} color={st.color} strokeWidth={2.5} />
        <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</span>
      </div>

      {/* Last Sync */}
      <div style={{ marginRight: 20, flexShrink: 0, width: 82, textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
          <Clock size={10} color="rgba(144,224,239,0.3)" />
          <span style={{ fontSize: 11.5, color: "rgba(144,224,239,0.35)", fontWeight: 500 }}>
            {pharmacy.lastSync}
          </span>
        </div>
      </div>

      {/* Stock bar */}
      <div style={{ marginRight: 20, flexShrink: 0 }}>
        <StockBar value={pharmacy.stock} />
      </div>

      {/* Orders count */}
      <div style={{ marginRight: 20, flexShrink: 0, width: 40, textAlign: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: pharmacy.orders > 0 ? C.sky : "rgba(144,224,239,0.2)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {pharmacy.orders}
        </span>
        <p style={{ margin: 0, fontSize: 9.5, color: "rgba(144,224,239,0.25)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>orders</p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onMouseEnter={() => setInvHov(true)}
          onMouseLeave={() => setInvHov(false)}
          onClick={() => navigate('/medicineInventory')}
          style={{
            padding: "7px 14px", borderRadius: 9,
            border: `1px solid ${invHov ? "rgba(0,180,216,0.5)" : "rgba(0,180,216,0.2)"}`,
            background: invHov ? `linear-gradient(135deg, ${C.ocean}, ${C.sky})` : "rgba(0,180,216,0.08)",
            color: invHov ? C.white : C.sky,
            fontWeight: 600, fontSize: 12.5,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "inherit",
            transform: invHov ? "translateY(-1px)" : "none",
            boxShadow: invHov ? `0 6px 18px rgba(0,180,216,0.3)` : "none",
          }}
        >
          <Package size={12} strokeWidth={2} />
          Inventory
        </button>

        <button
          onMouseEnter={() => setOrdHov(true)}
          onMouseLeave={() => setOrdHov(false)}
          style={{
            padding: "7px 14px", borderRadius: 9,
            border: `1px solid ${ordHov ? "rgba(144,224,239,0.3)" : "rgba(144,224,239,0.1)"}`,
            background: ordHov ? "rgba(144,224,239,0.08)" : "transparent",
            color: ordHov ? "rgba(202,240,248,0.9)" : "rgba(144,224,239,0.4)",
            fontWeight: 600, fontSize: 12.5,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "inherit",
          }}
        >
          <ShoppingCart size={12} strokeWidth={2} />
          Orders
        </button>
      </div>
    </div>
  )
}

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [addHov, setAddHov] = useState(false)

  const filtered = pharmacies.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || p.status === filter)
  )

  const counts = {
    active: pharmacies.filter(p => p.status === "active").length,
    warning: pharmacies.filter(p => p.status === "warning").length,
    offline: pharmacies.filter(p => p.status === "offline").length,
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "transparent",
      minHeight: "100vh",
      width: "100%",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,180,216,0.15); border-radius: 99px; }

        .mr-filter-btn {
          padding: 7px 14px; border-radius: 8px;
          font-weight: 600; font-size: 12px; cursor: pointer;
          transition: all 0.18s; font-family: inherit;
          display: flex; align-items: center; gap: 5px;
          letter-spacing: 0.02em;
        }

        .mr-col-header {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(144,224,239,0.3);
        }
      `}</style>

      {/* ── Top accent ── */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${C.navy}, ${C.ocean} 30%, ${C.sky} 60%, ${C.mist} 85%, transparent)`,
      }} />

      <div style={{ padding: "36px 40px 48px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 12px rgba(0,180,216,0.3)`,
                }}>
                  <BarChart3 size={14} color="white" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 12, color: "rgba(144,224,239,0.4)", fontWeight: 500 }}>MediReach</span>
                <ChevronRight size={12} color="rgba(144,224,239,0.2)" />
                <span style={{
                  fontSize: 11.5, color: C.sky, fontWeight: 700,
                  background: "rgba(0,180,216,0.1)",
                  padding: "3px 10px", borderRadius: 99,
                  border: "1px solid rgba(0,180,216,0.2)",
                }}>Inventory</span>
              </div>

              <h1 style={{
                margin: 0, fontSize: 32, fontWeight: 800,
                letterSpacing: "-1.5px",
                color: C.white,
                lineHeight: 1.1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>Inventory Dashboard</h1>
              <p style={{ margin: "8px 0 0", color: "rgba(144,224,239,0.35)", fontSize: 13.5, fontWeight: 400 }}>
                Real-time dispatch monitoring across the pharmacy network
              </p>
            </div>

            {/* Add Medicine CTA */}
            <button
              onMouseEnter={() => setAddHov(true)}
              onMouseLeave={() => setAddHov(false)}
              onClick={() => navigate('/medicineAdd')}
              style={{
                background: addHov
                  ? `linear-gradient(135deg, ${C.sky}, ${C.mist})`
                  : `linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                color: addHov ? C.navy : C.white,
                border: "none",
                padding: "12px 22px", borderRadius: 12,
                fontWeight: 700, fontSize: 13.5,
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: 8, transition: "all 0.25s", fontFamily: "inherit",
                boxShadow: addHov ? `0 10px 30px rgba(0,180,216,0.45)` : `0 6px 22px rgba(0,119,182,0.35)`,
                transform: addHov ? "translateY(-2px)" : "none",
                letterSpacing: "-0.2px", flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: addHov ? "rgba(3,4,94,0.15)" : "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Plus size={13} strokeWidth={3} />
              </div>
              Add Medicine
              <ArrowUpRight size={14} strokeWidth={2.5} style={{ opacity: 0.7 }} />
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
          <StatCard
            icon={Activity}
            value="1,284"
            label="Total Dispatched"
            sub="All-time orders shipped"
            accent={C.sky}
            delay="0.07s"
            trend="+12%"
          />
          <StatCard
            icon={Clock}
            value="37"
            label="Pending Orders"
            sub="Awaiting fulfilment"
            accent={C.warn}
            delay="0.14s"
          />
          <StatCard
            icon={Building2}
            value="08"
            label="Connected Pharmacies"
            sub="Active on network"
            accent={C.mist}
            delay="0.21s"
          />
        </div>

        {/* ── Network status mini summary ── */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 24,
          animation: "fadeUp 0.5s ease 0.25s both",
        }}>
          {[
            { label: "Online", count: counts.active, color: C.green, bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", icon: Wifi },
            { label: "Slow Sync", count: counts.warning, color: C.warn, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", icon: AlertTriangle },
            { label: "Offline", count: counts.offline, color: C.danger, bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", icon: WifiOff },
          ].map(s => {
            const SI = s.icon
            return (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 10,
                background: s.bg, border: `1px solid ${s.border}`,
              }}>
                <SI size={13} color={s.color} strokeWidth={2} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: s.color }}>{s.count}</span>
                <span style={{ fontSize: 12, color: s.color, opacity: 0.65, fontWeight: 500 }}>{s.label}</span>
              </div>
            )
          })}

          <div style={{ flex: 1 }} />

          {/* Last refresh */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(144,224,239,0.04)", border: "1px solid rgba(144,224,239,0.08)" }}>
            <RefreshCw size={12} color="rgba(144,224,239,0.35)" />
            <span style={{ fontSize: 11.5, color: "rgba(144,224,239,0.3)", fontWeight: 500 }}>Refreshed just now</span>
          </div>
        </div>

        {/* ── Pharmacy List ── */}
        <div style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>

          {/* Section header + controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{
                margin: 0, fontWeight: 700, fontSize: 18,
                color: C.white,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "-0.5px",
              }}>
                Connected Pharmacies
              </h2>
              <p style={{ margin: "2px 0 0", color: "rgba(144,224,239,0.3)", fontSize: 12, fontWeight: 400 }}>
                {filtered.length} of {pharmacies.length} pharmacies shown
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} color="rgba(144,224,239,0.3)" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search pharmacies..."
                  style={{
                    padding: "8px 14px 8px 32px", borderRadius: 10,
                    border: "1px solid rgba(144,224,239,0.1)",
                    background: "rgba(144,224,239,0.04)",
                    fontSize: 13, outline: "none", width: 210,
                    fontFamily: "inherit", color: C.white,
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(0,180,216,0.4)"; e.target.style.background = "rgba(0,180,216,0.06)" }}
                  onBlur={e => { e.target.style.borderColor = "rgba(144,224,239,0.1)"; e.target.style.background = "rgba(144,224,239,0.04)" }}
                />
              </div>

              {/* Filter icon */}
              <div style={{ width: 1, height: 24, background: "rgba(144,224,239,0.1)" }} />

              {[
                { key: "all",     label: "All" },
                { key: "active",  label: "Online" },
                { key: "warning", label: "Slow" },
                { key: "offline", label: "Offline" },
              ].map(f => (
                <button
                  key={f.key}
                  className="mr-filter-btn"
                  onClick={() => setFilter(f.key)}
                  style={{
                    border: `1px solid ${filter === f.key ? "rgba(0,180,216,0.4)" : "rgba(144,224,239,0.1)"}`,
                    background: filter === f.key ? `linear-gradient(135deg, ${C.ocean}cc, ${C.sky}aa)` : "rgba(144,224,239,0.04)",
                    color: filter === f.key ? C.white : "rgba(144,224,239,0.4)",
                    boxShadow: filter === f.key ? `0 4px 14px rgba(0,180,216,0.2)` : "none",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table container */}
          <div style={{
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(144,224,239,0.08)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          }}>

            {/* Column headers */}
            <div style={{
              display: "flex", alignItems: "center",
              padding: "12px 22px",
              background: "rgba(0,180,216,0.04)",
              borderBottom: "1px solid rgba(144,224,239,0.06)",
            }}>
              <span className="mr-col-header" style={{ width: 32, flexShrink: 0 }}>#</span>
              <span className="mr-col-header" style={{ width: 54, flexShrink: 0 }} />
              <span className="mr-col-header" style={{ flex: 1 }}>Pharmacy</span>
              <span className="mr-col-header" style={{ width: 110, flexShrink: 0 }}>Status</span>
              <span className="mr-col-header" style={{ width: 102, flexShrink: 0, textAlign: "right" }}>Last Sync</span>
              <span className="mr-col-header" style={{ width: 112, flexShrink: 0, textAlign: "right", paddingRight: 8 }}>Stock Level</span>
              <span className="mr-col-header" style={{ width: 60, flexShrink: 0, textAlign: "center" }}>Orders</span>
              <span className="mr-col-header" style={{ width: 186, flexShrink: 0, textAlign: "right" }}>Actions</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "56px", textAlign: "center" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
                  background: "rgba(144,224,239,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(144,224,239,0.1)",
                }}>
                  <Building2 size={22} color="rgba(144,224,239,0.25)" />
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "rgba(202,240,248,0.5)" }}>No pharmacies found</p>
                <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "rgba(144,224,239,0.25)" }}>Try adjusting your search or filter</p>
              </div>
            ) : (
              filtered.map((pharmacy, index) => (
                <PharmacyRow
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  index={index}
                  total={filtered.length}
                  navigate={navigate}
                />
              ))
            )}

            {/* Footer */}
            <div style={{
              padding: "11px 22px",
              background: "rgba(0,0,0,0.15)",
              borderTop: "1px solid rgba(144,224,239,0.05)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 11.5, color: "rgba(144,224,239,0.3)", fontWeight: 500 }}>
                Showing {filtered.length} of {pharmacies.length} pharmacies
              </span>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: i === 0 ? 20 : 7, height: 7, borderRadius: 99,
                    background: i === 0 ? C.sky : "rgba(144,224,239,0.15)",
                    transition: "width 0.3s",
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