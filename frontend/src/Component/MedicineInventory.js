import React, { useState, useMemo } from 'react'
import {
  Search, Filter, Package, AlertTriangle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, ArrowUpDown,
  Pill, Building2, Calendar, Tag, DollarSign,
  TrendingDown, RefreshCw, Download, Eye,
  ShieldCheck, ShieldOff, ShieldAlert, Hash,
  ChevronLeft, ChevronRight, MoreHorizontal,
  Beaker, Clock, Layers
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

// ── Sample medicine data ──────────────────────────────────────────
const medicines = [
  { id:"MED-001", name:"Amoxicillin 500mg",      category:"Antibiotic",      company:"Sun Pharma",     pharmacy:"Kandy Central Pharmacy",   price:145,  stock:820,  mfgDate:"2024-01-15", expDate:"2026-01-15", rxStatus:"Prescription Required",  },
  { id:"MED-002", name:"Metformin 850mg",         category:"Antidiabetic",    company:"Cipla Ltd",      pharmacy:"Galle Fort MedPoint",      price:95,   stock:44,   mfgDate:"2024-03-10", expDate:"2026-03-10", rxStatus:"Prescription Required",  },
  { id:"MED-003", name:"Amlodipine 5mg",          category:"Cardiovascular",  company:"GSK",            pharmacy:"Kandy Central Pharmacy",   price:210,  stock:310,  mfgDate:"2023-11-20", expDate:"2025-11-20", rxStatus:"Prescription Required",  },
  { id:"MED-004", name:"Salbutamol Inhaler",      category:"Respiratory",     company:"AstraZeneca",    pharmacy:"Jaffna Community Rx",      price:680,  stock:18,   mfgDate:"2024-02-05", expDate:"2026-02-05", rxStatus:"Prescription Required",  },
  { id:"MED-005", name:"Paracetamol 500mg",       category:"Analgesic",       company:"Hemas Pharma",   pharmacy:"Matara Rural Clinic",      price:35,   stock:1250, mfgDate:"2024-05-01", expDate:"2027-05-01", rxStatus:"Over The Counter",       },
  { id:"MED-006", name:"ORS Sachets",             category:"Rehydration",     company:"Nestle Health",  pharmacy:"Batticaloa MedStore",      price:25,   stock:940,  mfgDate:"2024-04-12", expDate:"2026-04-12", rxStatus:"Over The Counter",       },
  { id:"MED-007", name:"Oseltamivir 75mg",        category:"Antiviral",       company:"Roche",          pharmacy:"Kurunegala Health Hub",    price:1250, stock:72,   mfgDate:"2024-01-30", expDate:"2026-01-30", rxStatus:"Prescription Required",  },
  { id:"MED-008", name:"Fluconazole 150mg",       category:"Antifungal",      company:"Pfizer",         pharmacy:"Trincomalee Bay Pharmacy", price:320,  stock:165,  mfgDate:"2024-06-15", expDate:"2026-06-15", rxStatus:"Prescription Required",  },
  { id:"MED-009", name:"Cetirizine 10mg",         category:"Antihistamine",   company:"UCB Pharma",     pharmacy:"Galle Fort MedPoint",      price:55,   stock:690,  mfgDate:"2024-03-22", expDate:"2027-03-22", rxStatus:"Over The Counter",       },
  { id:"MED-010", name:"Vitamin D3 1000 IU",      category:"Supplement",      company:"Hemas Pharma",   pharmacy:"Anuradhapura PharmaCare",  price:120,  stock:0,    mfgDate:"2024-02-18", expDate:"2026-02-18", rxStatus:"Over The Counter",       },
  { id:"MED-011", name:"Morphine Sulfate 10mg",   category:"Analgesic",       company:"Neon Labs",      pharmacy:"Kandy Central Pharmacy",   price:890,  stock:32,   mfgDate:"2024-04-01", expDate:"2025-10-01", rxStatus:"Controlled Substance",   },
  { id:"MED-012", name:"Azithromycin 500mg",      category:"Antibiotic",      company:"Cipla Ltd",      pharmacy:"Matara Rural Clinic",      price:280,  stock:445,  mfgDate:"2024-05-20", expDate:"2026-05-20", rxStatus:"Prescription Required",  },
  { id:"MED-013", name:"Ibuprofen 400mg",         category:"Analgesic",       company:"Sun Pharma",     pharmacy:"Batticaloa MedStore",      price:65,   stock:875,  mfgDate:"2024-04-08", expDate:"2027-04-08", rxStatus:"Over The Counter",       },
  { id:"MED-014", name:"Atorvastatin 20mg",       category:"Cardiovascular",  company:"Torrent Pharma", pharmacy:"Trincomalee Bay Pharmacy", price:175,  stock:22,   mfgDate:"2023-12-10", expDate:"2025-12-10", rxStatus:"Prescription Required",  },
  { id:"MED-015", name:"Omeprazole 20mg",         category:"Other",           company:"AstraZeneca",    pharmacy:"Jaffna Community Rx",      price:88,   stock:510,  mfgDate:"2024-06-01", expDate:"2026-06-01", rxStatus:"Over The Counter",       },
]

// ── Helpers ───────────────────────────────────────────────────────
const stockStatus = (qty) => {
  if (qty === 0)   return { label:"Out of Stock",  color:C.danger, bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.2)",   icon:XCircle }
  if (qty <= 50)   return { label:"Low Stock",     color:C.warn,   bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.2)",  icon:AlertTriangle }
  return                   { label:"In Stock",     color:C.green,  bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.2)",   icon:CheckCircle2 }
}

const rxConfig = {
  "Prescription Required": { icon:ShieldCheck, color:C.sky,    bg:"rgba(0,180,216,0.08)",  border:"rgba(0,180,216,0.2)"  },
  "Over The Counter":      { icon:ShieldOff,   color:C.green,  bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.2)"  },
  "Controlled Substance":  { icon:ShieldAlert, color:C.warn,   bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.2)" },
}

const isExpiringSoon = (dateStr) => {
  const diff = (new Date(dateStr) - new Date()) / (1000*60*60*24)
  return diff > 0 && diff <= 180
}

const isExpired = (dateStr) => new Date(dateStr) < new Date()

const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB",{ day:"2-digit", month:"short", year:"numeric" })

const categories = ["All", ...new Set(medicines.map(m => m.category))]
const pharmacies  = ["All", ...new Set(medicines.map(m => m.pharmacy))]

// ── StockBar ─────────────────────────────────────────────────────
function StockBar({ qty }) {
  const max = 1300
  const pct = Math.min((qty / max) * 100, 100)
  const { color } = stockStatus(qty)
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:4, borderRadius:99, background:"rgba(144,224,239,0.08)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:color, transition:"width 0.6s ease" }} />
      </div>
      <span style={{ fontSize:12.5, fontWeight:700, color, minWidth:34, textAlign:"right",
        fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {qty.toLocaleString()}
      </span>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────
function StatCard({ icon:Icon, value, label, accent, sub }) {
  return (
    <div style={{
      flex:1, padding:"20px 22px", borderRadius:16,
      background:"rgba(255,255,255,0.02)",
      border:`1px solid ${accent}20`,
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", right:-20, bottom:-20, width:90, height:90, borderRadius:"50%",
        background:`radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:700, color:"rgba(144,224,239,0.35)",
            letterSpacing:"0.15em", textTransform:"uppercase" }}>{label}</p>
          <p style={{ margin:0, fontSize:36, fontWeight:800, color:C.white, letterSpacing:"-1.5px",
            lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{value}</p>
          {sub && <p style={{ margin:"6px 0 0", fontSize:11, color:"rgba(144,224,239,0.3)", fontWeight:500 }}>{sub}</p>}
        </div>
        <div style={{
          width:40, height:40, borderRadius:11,
          background:`${accent}15`, border:`1px solid ${accent}25`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Icon size={18} color={accent} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function MedicineInventory() {
  const [search,      setSearch]      = useState("")
  const [catFilter,   setCatFilter]   = useState("All")
  const [pharmFilter, setPharmFilter] = useState("All")
  const [rxFilter,    setRxFilter]    = useState("All")
  const [stockFilter, setStockFilter] = useState("All")
  const [sortKey,     setSortKey]     = useState("name")
  const [sortDir,     setSortDir]     = useState("asc")
  const [page,        setPage]        = useState(1)
  const [expanded,    setExpanded]    = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const PER_PAGE = 8

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d==="asc"?"desc":"asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const filtered = useMemo(() => {
    return medicines
      .filter(m =>
        (m.name.toLowerCase().includes(search.toLowerCase()) ||
         m.id.toLowerCase().includes(search.toLowerCase()) ||
         m.company.toLowerCase().includes(search.toLowerCase())) &&
        (catFilter   === "All" || m.category === catFilter) &&
        (pharmFilter === "All" || m.pharmacy === pharmFilter) &&
        (rxFilter    === "All" || m.rxStatus === rxFilter) &&
        (stockFilter === "All" ||
          (stockFilter==="in"      && m.stock > 50) ||
          (stockFilter==="low"     && m.stock > 0 && m.stock <= 50) ||
          (stockFilter==="out"     && m.stock === 0))
      )
      .sort((a,b) => {
        let av = a[sortKey], bv = b[sortKey]
        if (typeof av === "string") av = av.toLowerCase()
        if (typeof bv === "string") bv = bv.toLowerCase()
        return sortDir==="asc" ? (av>bv?1:-1) : (av<bv?1:-1)
      })
  }, [search, catFilter, pharmFilter, rxFilter, stockFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageData   = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const stats = {
    total:    medicines.length,
    inStock:  medicines.filter(m=>m.stock>50).length,
    low:      medicines.filter(m=>m.stock>0&&m.stock<=50).length,
    out:      medicines.filter(m=>m.stock===0).length,
    expiring: medicines.filter(m=>isExpiringSoon(m.expDate)).length,
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} color="rgba(144,224,239,0.2)" />
    return sortDir==="asc"
      ? <ChevronUp   size={11} color={C.sky} />
      : <ChevronDown size={11} color={C.sky} />
  }

  const ColHead = ({ col, label, style={} }) => (
    <th onClick={()=>handleSort(col)} style={{
      padding:"10px 16px", textAlign:"left", cursor:"pointer",
      fontWeight:700, fontSize:9.5, letterSpacing:"0.13em", textTransform:"uppercase",
      color:"rgba(144,224,239,0.3)", whiteSpace:"nowrap",
      borderBottom:"1px solid rgba(144,224,239,0.06)",
      background:"rgba(0,180,216,0.03)",
      userSelect:"none", transition:"color 0.15s",
      ...style,
    }}
      onMouseEnter={e=>e.currentTarget.style.color="rgba(144,224,239,0.6)"}
      onMouseLeave={e=>e.currentTarget.style.color="rgba(144,224,239,0.3)"}
    >
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        {label} <SortIcon col={col} />
      </div>
    </th>
  )

  return (
    <div style={{
      minHeight:"100vh", background:"transparent",
      fontFamily:"'DM Sans',sans-serif", padding:"36px 36px 56px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,180,216,0.18); border-radius:99px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes expandRow { from{opacity:0;max-height:0} to{opacity:1;max-height:300px} }
        input::placeholder { color:rgba(144,224,239,0.2); }
        select option { background:#020e28; color:#caf0f8; }
        table { border-collapse:collapse; width:100%; }
      `}</style>

      {/* Top accent */}
      <div style={{
        height:2, marginBottom:0,
        background:`linear-gradient(90deg, ${C.navy}, ${C.ocean} 30%, ${C.sky} 60%, ${C.mist} 85%, transparent)`,
      }} />

      {/* ── Header ── */}
      <div style={{ marginBottom:28, paddingTop:32, animation:"fadeUp 0.4s ease both" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
              <div style={{
                width:28, height:28, borderRadius:8,
                background:`linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 12px rgba(0,180,216,0.3)",
              }}>
                <Layers size={14} color="white" strokeWidth={2} />
              </div>
              <span style={{ fontSize:11.5, color:"rgba(144,224,239,0.3)", fontWeight:500 }}>MediReach</span>
              <ChevronRight size={11} color="rgba(144,224,239,0.15)" />
              <span style={{
                fontSize:11.5, color:C.sky, fontWeight:700,
                background:"rgba(0,180,216,0.1)", padding:"2px 9px", borderRadius:99,
                border:"1px solid rgba(0,180,216,0.18)",
              }}>Medicine Inventory</span>
            </div>
            <h1 style={{
              margin:0, fontSize:30, fontWeight:800, color:C.white,
              letterSpacing:"-1.2px", lineHeight:1.1,
              fontFamily:"'Plus Jakarta Sans',sans-serif",
            }}>Medicine Stock Registry</h1>
            <p style={{ margin:"7px 0 0", color:"rgba(144,224,239,0.3)", fontSize:13.5 }}>
              Complete inventory across all connected pharmacies
            </p>
          </div>

          <div style={{ display:"flex", gap:9, flexShrink:0 }}>
            <button style={{
              padding:"9px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
              border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
              color:"rgba(144,224,239,0.5)", fontWeight:600, fontSize:12.5,
              display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(0,180,216,0.3)"; e.currentTarget.style.color=C.sky }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(144,224,239,0.5)" }}
            >
              <RefreshCw size={13} strokeWidth={2} /> Refresh
            </button>
            <button style={{
              padding:"9px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
              border:"none", background:`linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
              color:C.white, fontWeight:600, fontSize:12.5,
              display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
              boxShadow:"0 4px 16px rgba(0,180,216,0.25)",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,180,216,0.35)" }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,180,216,0.25)" }}
            >
              <Download size={13} strokeWidth={2} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:"flex", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease 0.05s both" }}>
        <StatCard icon={Package}       value={stats.total}    label="Total Medicines" accent={C.sky}    sub="Across all pharmacies" />
        <StatCard icon={CheckCircle2}  value={stats.inStock}  label="In Stock"        accent={C.green}  sub="Sufficient supply" />
        <StatCard icon={AlertTriangle} value={stats.low}      label="Low Stock"       accent={C.warn}   sub="≤ 50 units remaining" />
        <StatCard icon={XCircle}       value={stats.out}      label="Out of Stock"    accent={C.danger} sub="Needs restocking" />
        <StatCard icon={Clock}         value={stats.expiring} label="Expiring Soon"   accent="#a78bfa"  sub="Within 6 months" />
      </div>

      {/* ── Search + Filter bar ── */}
      <div style={{ marginBottom:16, animation:"fadeUp 0.4s ease 0.1s both" }}>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} color="rgba(144,224,239,0.3)" />
            <input
              value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, ID or manufacturer..."
              style={{
                width:"100%", padding:"9px 14px 9px 34px", borderRadius:10,
                border:"1px solid rgba(144,224,239,0.1)", background:"rgba(255,255,255,0.03)",
                fontSize:13, outline:"none", fontFamily:"inherit", color:C.white,
                transition:"border-color 0.2s, background 0.2s",
              }}
              onFocus={e=>{ e.target.style.borderColor="rgba(0,180,216,0.4)"; e.target.style.background="rgba(0,180,216,0.05)" }}
              onBlur={e=>{  e.target.style.borderColor="rgba(144,224,239,0.1)"; e.target.style.background="rgba(255,255,255,0.03)" }}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={()=>setShowFilters(f=>!f)}
            style={{
              padding:"9px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
              border:`1px solid ${showFilters ? "rgba(0,180,216,0.4)" : "rgba(144,224,239,0.1)"}`,
              background: showFilters ? "rgba(0,180,216,0.1)" : "rgba(144,224,239,0.04)",
              color: showFilters ? C.sky : "rgba(144,224,239,0.5)",
              fontWeight:600, fontSize:12.5,
              display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
            }}
          >
            <Filter size={13} strokeWidth={2} />
            Filters
            {(catFilter!=="All"||pharmFilter!=="All"||rxFilter!=="All"||stockFilter!=="All") && (
              <span style={{
                width:16, height:16, borderRadius:"50%", background:C.sky,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:800, color:C.navy,
              }}>
                {[catFilter,pharmFilter,rxFilter,stockFilter].filter(f=>f!=="All").length}
              </span>
            )}
          </button>

          {/* Result count */}
          <span style={{ fontSize:12, color:"rgba(144,224,239,0.25)", fontWeight:500, whiteSpace:"nowrap" }}>
            {filtered.length} of {medicines.length} medicines
          </span>
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div style={{
            display:"flex", gap:10, marginTop:10, flexWrap:"wrap",
            padding:"14px 16px", borderRadius:12,
            background:"rgba(0,180,216,0.03)", border:"1px solid rgba(144,224,239,0.07)",
            animation:"fadeUp 0.25s ease both",
          }}>
            {[
              { label:"Category", val:catFilter, set:setCatFilter, opts:categories },
              { label:"Pharmacy", val:pharmFilter, set:setPharmFilter, opts:pharmacies },
              { label:"Rx Status", val:rxFilter, set:setRxFilter,
                opts:["All","Prescription Required","Over The Counter","Controlled Substance"] },
              { label:"Stock", val:stockFilter, set:setStockFilter,
                opts:[{v:"All",l:"All"},{v:"in",l:"In Stock"},{v:"low",l:"Low Stock"},{v:"out",l:"Out of Stock"}] },
            ].map(f => (
              <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:9.5, fontWeight:700, color:"rgba(144,224,239,0.3)",
                  letterSpacing:"0.12em", textTransform:"uppercase" }}>{f.label}</label>
                <select
                  value={f.val}
                  onChange={e=>{ f.set(e.target.value); setPage(1) }}
                  style={{
                    padding:"7px 28px 7px 10px", borderRadius:8,
                    border:"1px solid rgba(144,224,239,0.12)",
                    background:"rgba(255,255,255,0.04)", color:"rgba(202,240,248,0.75)",
                    fontSize:12.5, outline:"none", fontFamily:"inherit",
                    cursor:"pointer", minWidth:140,
                    appearance:"none", WebkitAppearance:"none",
                    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2390e0ef' stroke-opacity='.4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center",
                  }}
                >
                  {f.opts.map(o => typeof o==="string"
                    ? <option key={o} value={o}>{o}</option>
                    : <option key={o.v} value={o.v}>{o.l}</option>
                  )}
                </select>
              </div>
            ))}

            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <button
                onClick={()=>{ setCatFilter("All"); setPharmFilter("All"); setRxFilter("All"); setStockFilter("All"); setPage(1) }}
                style={{
                  padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                  border:"1px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.06)",
                  color:"rgba(239,68,68,0.6)", fontWeight:600, fontSize:12, transition:"all 0.2s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.12)"; e.currentTarget.style.color=C.danger }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.06)"; e.currentTarget.style.color="rgba(239,68,68,0.6)" }}
              >Clear all</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{
        borderRadius:18, overflow:"hidden",
        border:"1px solid rgba(144,224,239,0.07)",
        background:"rgba(255,255,255,0.02)",
        boxShadow:"0 8px 40px rgba(0,0,0,0.3)",
        animation:"fadeUp 0.4s ease 0.15s both",
      }}>
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead>
              <tr>
                <ColHead col="id"       label="ID"          style={{ paddingLeft:20 }} />
                <ColHead col="name"     label="Medicine"    />
                <ColHead col="category" label="Category"    />
                <ColHead col="company"  label="Manufacturer"/>
                <ColHead col="price"    label="Price (LKR)" />
                <ColHead col="stock"    label="Stock"       style={{ minWidth:160 }} />
                <th style={{
                  padding:"10px 16px", textAlign:"left", fontWeight:700, fontSize:9.5,
                  letterSpacing:"0.13em", textTransform:"uppercase",
                  color:"rgba(144,224,239,0.3)", whiteSpace:"nowrap",
                  borderBottom:"1px solid rgba(144,224,239,0.06)",
                  background:"rgba(0,180,216,0.03)",
                }}>Rx Status</th>
                <ColHead col="expDate" label="Expiry" />
                <th style={{
                  padding:"10px 16px", textAlign:"left", fontWeight:700, fontSize:9.5,
                  letterSpacing:"0.13em", textTransform:"uppercase",
                  color:"rgba(144,224,239,0.3)", whiteSpace:"nowrap",
                  borderBottom:"1px solid rgba(144,224,239,0.06)",
                  background:"rgba(0,180,216,0.03)",
                  paddingRight:20,
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding:"64px", textAlign:"center" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                      <div style={{
                        width:52, height:52, borderRadius:14,
                        background:"rgba(144,224,239,0.05)", border:"1px solid rgba(144,224,239,0.1)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <Package size={22} color="rgba(144,224,239,0.2)" />
                      </div>
                      <p style={{ margin:0, fontSize:15, fontWeight:600, color:"rgba(202,240,248,0.4)" }}>
                        No medicines found
                      </p>
                      <p style={{ margin:0, fontSize:12.5, color:"rgba(144,224,239,0.2)" }}>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : pageData.map((med, idx) => {
                const ss  = stockStatus(med.stock)
                const rx  = rxConfig[med.rxStatus]
                const RxI = rx.icon
                const StI = ss.icon
                const exp = isExpired(med.expDate)
                const expSoon = isExpiringSoon(med.expDate)
                const isOpen = expanded === med.id

                return (
                  <React.Fragment key={med.id}>
                    <tr
                      style={{
                        borderBottom:"1px solid rgba(144,224,239,0.04)",
                        background: isOpen ? "rgba(0,180,216,0.04)" : "transparent",
                        transition:"background 0.15s",
                        cursor:"pointer",
                        animation:`fadeUp 0.4s ease ${idx*0.04}s both`,
                      }}
                      onMouseEnter={e=>{ if(!isOpen) e.currentTarget.style.background="rgba(144,224,239,0.025)" }}
                      onMouseLeave={e=>{ if(!isOpen) e.currentTarget.style.background="transparent" }}
                    >
                      {/* ID */}
                      <td style={{ padding:"13px 16px 13px 20px", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:11.5, fontWeight:700, color:"rgba(144,224,239,0.25)",
                          fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{med.id}</span>
                      </td>

                      {/* Name */}
                      <td style={{ padding:"13px 16px", minWidth:190 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{
                            width:34, height:34, borderRadius:9, flexShrink:0,
                            background:`linear-gradient(135deg, ${C.navy}cc, ${C.ocean})`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            border:"1px solid rgba(0,180,216,0.2)",
                          }}>
                            <Pill size={14} color={C.mist} strokeWidth={1.8} />
                          </div>
                          <div>
                            <p style={{ margin:0, fontSize:13.5, fontWeight:600,
                              color:"rgba(202,240,248,0.9)", whiteSpace:"nowrap" }}>{med.name}</p>
                            <p style={{ margin:"1px 0 0", fontSize:11, color:"rgba(144,224,239,0.3)",
                              display:"flex", alignItems:"center", gap:3 }}>
                              <Building2 size={9} strokeWidth={2} />
                              {med.pharmacy.split(" ").slice(0,2).join(" ")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                        <span style={{
                          fontSize:11.5, fontWeight:600, padding:"3px 10px", borderRadius:99,
                          background:"rgba(0,180,216,0.08)", color:"rgba(0,180,216,0.75)",
                          border:"1px solid rgba(0,180,216,0.14)",
                        }}>{med.category}</span>
                      </td>

                      {/* Company */}
                      <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:13, color:"rgba(144,224,239,0.5)", fontWeight:500 }}>{med.company}</span>
                      </td>

                      {/* Price */}
                      <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:14, fontWeight:700, color:C.white,
                          fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                          {med.price.toLocaleString()}
                        </span>
                        <span style={{ fontSize:10.5, color:"rgba(144,224,239,0.3)", marginLeft:3 }}>LKR</span>
                      </td>

                      {/* Stock bar */}
                      <td style={{ padding:"13px 16px", minWidth:160 }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{
                              display:"flex", alignItems:"center", gap:4,
                              background:ss.bg, borderRadius:99, padding:"2px 8px",
                              border:`1px solid ${ss.border}`,
                            }}>
                              <StI size={9} color={ss.color} strokeWidth={2.5} />
                              <span style={{ fontSize:10, fontWeight:700, color:ss.color }}>{ss.label}</span>
                            </div>
                          </div>
                          <StockBar qty={med.stock} />
                        </div>
                      </td>

                      {/* Rx status */}
                      <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <RxI size={13} color={rx.color} strokeWidth={1.8} />
                          <span style={{ fontSize:11.5, color:rx.color, fontWeight:600 }}>
                            {med.rxStatus === "Prescription Required" ? "Rx Required"
                              : med.rxStatus === "Over The Counter" ? "OTC"
                              : "Controlled"}
                          </span>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          {exp ? (
                            <span style={{ fontSize:11.5, fontWeight:700, color:C.danger,
                              display:"flex", alignItems:"center", gap:4 }}>
                              <XCircle size={11} strokeWidth={2.5} /> Expired
                            </span>
                          ) : expSoon ? (
                            <span style={{ fontSize:11.5, fontWeight:700, color:C.warn,
                              display:"flex", alignItems:"center", gap:4 }}>
                              <AlertTriangle size={11} strokeWidth={2.5} /> {fmtDate(med.expDate)}
                            </span>
                          ) : (
                            <span style={{ fontSize:12, color:"rgba(144,224,239,0.4)", fontWeight:500 }}>
                              {fmtDate(med.expDate)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding:"13px 20px 13px 16px", whiteSpace:"nowrap" }}>
                        <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                          <button
                            onClick={()=>setExpanded(isOpen ? null : med.id)}
                            style={{
                              padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                              border:`1px solid ${isOpen ? "rgba(0,180,216,0.4)" : "rgba(144,224,239,0.1)"}`,
                              background: isOpen ? "rgba(0,180,216,0.1)" : "rgba(144,224,239,0.04)",
                              color: isOpen ? C.sky : "rgba(144,224,239,0.45)",
                              fontWeight:600, fontSize:12, transition:"all 0.2s",
                              display:"flex", alignItems:"center", gap:5,
                            }}
                            onMouseEnter={e=>{ if(!isOpen){ e.currentTarget.style.borderColor="rgba(0,180,216,0.35)"; e.currentTarget.style.color=C.sky }}}
                            onMouseLeave={e=>{ if(!isOpen){ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(144,224,239,0.45)" }}}
                          >
                            <Eye size={12} strokeWidth={2} />
                            {isOpen ? "Hide" : "View"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded detail row ── */}
                    {isOpen && (
                      <tr style={{ borderBottom:"1px solid rgba(144,224,239,0.06)" }}>
                        <td colSpan={9} style={{ padding:"0 20px 16px 20px" }}>
                          <div style={{
                            borderRadius:14, padding:"20px 24px",
                            background:"rgba(0,180,216,0.04)",
                            border:"1px solid rgba(0,180,216,0.1)",
                            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20,
                            animation:"fadeUp 0.25s ease both",
                          }}>
                            {[
                              { icon:Pill,         label:"Full Name",         value:med.name },
                              { icon:Building2,    label:"Assigned Pharmacy", value:med.pharmacy },
                              { icon:Tag,          label:"Category",          value:med.category },
                              { icon:Beaker,       label:"Manufacturer",      value:med.company },
                              { icon:DollarSign,   label:"Unit Price",        value:`LKR ${med.price.toLocaleString()}` },
                              { icon:Hash,         label:"Current Stock",     value:med.stock.toLocaleString()+" units" },
                              { icon:Calendar,     label:"Manufacture Date",  value:fmtDate(med.mfgDate) },
                              { icon:Calendar,     label:"Expiry Date",       value:fmtDate(med.expDate),
                                warn: exp ? "danger" : expSoon ? "warn" : null },
                            ].map((d,i) => (
                              <div key={i} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                  <d.icon size={11} color="rgba(144,224,239,0.3)" strokeWidth={2} />
                                  <span style={{ fontSize:9.5, fontWeight:700,
                                    color:"rgba(144,224,239,0.3)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
                                    {d.label}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize:13, fontWeight:600,
                                  color: d.warn==="danger" ? C.danger
                                        : d.warn==="warn"   ? C.warn
                                        : "rgba(202,240,248,0.8)",
                                }}>{d.value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{
            padding:"12px 20px",
            borderTop:"1px solid rgba(144,224,239,0.05)",
            background:"rgba(0,0,0,0.15)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <span style={{ fontSize:12, color:"rgba(144,224,239,0.25)", fontWeight:500 }}>
              Page {page} of {totalPages} · {filtered.length} results
            </span>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <button
                onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{
                  width:32, height:32, borderRadius:8, cursor:page===1?"not-allowed":"pointer",
                  border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
                  color:page===1?"rgba(144,224,239,0.15)":"rgba(144,224,239,0.5)",
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
                }}
                onMouseEnter={e=>{ if(page!==1){ e.currentTarget.style.borderColor="rgba(0,180,216,0.35)"; e.currentTarget.style.color=C.sky }}}
                onMouseLeave={e=>{ if(page!==1){ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(144,224,239,0.5)" }}}
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>

              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{
                  width:32, height:32, borderRadius:8, cursor:"pointer",
                  border:`1px solid ${p===page?"rgba(0,180,216,0.4)":"rgba(144,224,239,0.08)"}`,
                  background: p===page ? `linear-gradient(135deg,${C.ocean},${C.sky})` : "rgba(144,224,239,0.03)",
                  color: p===page ? C.white : "rgba(144,224,239,0.4)",
                  fontWeight:700, fontSize:12.5, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  boxShadow: p===page ? "0 4px 14px rgba(0,180,216,0.25)" : "none",
                  transition:"all 0.15s",
                }}>{p}</button>
              ))}

              <button
                onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{
                  width:32, height:32, borderRadius:8, cursor:page===totalPages?"not-allowed":"pointer",
                  border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
                  color:page===totalPages?"rgba(144,224,239,0.15)":"rgba(144,224,239,0.5)",
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
                }}
                onMouseEnter={e=>{ if(page!==totalPages){ e.currentTarget.style.borderColor="rgba(0,180,216,0.35)"; e.currentTarget.style.color=C.sky }}}
                onMouseLeave={e=>{ if(page!==totalPages){ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(144,224,239,0.5)" }}}
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}