import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Filter, Package, AlertTriangle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, ArrowUpDown,
  Pill, Building2, Calendar, Tag, DollarSign,
  TrendingDown, RefreshCw, Download, Eye,
  ShieldCheck, ShieldOff, ShieldAlert, Hash,
  ChevronLeft, ChevronRight,
  Beaker, Clock, Layers, Loader2, PencilLine
} from 'lucide-react'

// ── Palette — matches InventoryDashboard ─────────────────────────
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

const API = "http://localhost:5000/medicines"

// Map DB field names → normalised shape used in the UI
function normalise(m) {
  return {
    id:       m._id || m.id || "",
    name:     m.mediName     || m.name     || "",
    category: m.mediCategory || m.category || "",
    company:  m.mediCompany  || m.company  || "",
    pharmacy: m.Pharmacy     || m.pharmacy || "",
    price:    Number(m.mediPrice || m.price || 0),
    stock:    Number(m.mediStock || m.stock || 0),
    mfgDate:  m.mediManufactureDate || m.mfgDate || "",
    expDate:  m.mediExpiryDate      || m.expDate || "",
    rxStatus: m.mediPrescriptionStatus || m.rxStatus || "",
  }
}

const stockStatus = (qty) => {
  if (qty===0)  return { label:"Out of Stock", color:C.danger,  bg:"rgba(192,57,43,0.07)",  border:"rgba(192,57,43,0.22)",  icon:XCircle }
  if (qty<=50)  return { label:"Low Stock",    color:C.warn,    bg:"rgba(180,83,9,0.07)",   border:"rgba(180,83,9,0.22)",   icon:AlertTriangle }
  return               { label:"In Stock",     color:C.success, bg:"rgba(14,124,91,0.07)",  border:"rgba(14,124,91,0.22)",  icon:CheckCircle2 }
}

const rxConfig = {
  "Prescription Required": { icon:ShieldCheck, color:C.techBlue, bg:"rgba(2,62,138,0.07)",  border:"rgba(2,62,138,0.2)"  },
  "Over The Counter":      { icon:ShieldOff,   color:C.success,  bg:"rgba(14,124,91,0.07)", border:"rgba(14,124,91,0.2)" },
  "Controlled Substance":  { icon:ShieldAlert, color:C.warn,     bg:"rgba(180,83,9,0.07)",  border:"rgba(180,83,9,0.2)"  },
}

const isExpiringSoon = (d) => { const diff=(new Date(d)-new Date())/(1000*60*60*24); return diff>0&&diff<=180 }
const isExpired      = (d) => new Date(d)<new Date()
const fmtDate        = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"

// ── Stock Bar ─────────────────────────────────────────────────────
function StockBar({ qty }) {
  const max=1300, pct=Math.min((qty/max)*100,100)
  const { color } = stockStatus(qty)
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:4, borderRadius:99, background:C.paleSlate, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:color, transition:"width 0.6s ease" }} />
      </div>
      <span style={{ fontSize:12.5, fontWeight:700, color, minWidth:34, textAlign:"right", fontFamily:"'Sora',sans-serif" }}>
        {qty.toLocaleString()}
      </span>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon:Icon, value, label, sub, delay }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      flex:1, padding:"22px 20px", borderRadius:16, cursor:"default",
      transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
      background: hov ? C.techBlue : C.white,
      border:`1.5px solid ${hov ? C.techBlue : C.paleSlate}`,
      boxShadow: hov ? "0 16px 40px rgba(2,62,138,0.18)" : "0 2px 12px rgba(74,85,104,0.07)",
      transform: hov ? "translateY(-3px)" : "none",
      animation:`fadeUp 0.5s ease ${delay||"0s"} both`,
      position:"relative", overflow:"hidden",
    }}>
      {hov && <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
        backgroundSize:"20px 20px" }} />}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div>
          <p style={{ margin:"0 0 7px", fontSize:10.5, fontWeight:700,
            color: hov ? "rgba(255,255,255,0.6)" : C.lilacAsh,
            letterSpacing:"0.14em", textTransform:"uppercase" }}>{label}</p>
          <p style={{ margin:0, fontSize:38, fontWeight:700, letterSpacing:"-2px", lineHeight:1,
            color: hov ? C.snow : C.techBlue, fontFamily:"'Sora',sans-serif", transition:"color 0.28s" }}>{value}</p>
          {sub && <p style={{ margin:"6px 0 0", fontSize:12, color: hov ? "rgba(255,255,255,0.5)" : C.lilacAsh }}>{sub}</p>}
        </div>
        <div style={{
          width:44, height:44, borderRadius:11,
          background: hov ? "rgba(255,255,255,0.15)" : "rgba(2,62,138,0.07)",
          border:`1.5px solid ${hov ? "rgba(255,255,255,0.25)" : "rgba(2,62,138,0.12)"}`,
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.28s",
        }}>
          <Icon size={19} color={hov ? C.snow : C.techBlue} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function MedicineInventory() {
  const navigate   = useNavigate()
  const location   = useLocation()

  // Read ?pharmacy= param passed from InventoryDashboard Inventory button
  const urlPharmacy = new URLSearchParams(location.search).get("pharmacy") || "All"

  const [allMedicines, setAllMedicines] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState(null)
  const [search,       setSearch]       = useState("")
  const [catFilter,    setCatFilter]    = useState("All")
  const [pharmFilter,  setPharmFilter]  = useState(urlPharmacy)
  const [rxFilter,     setRxFilter]     = useState("All")
  const [stockFilter,  setStockFilter]  = useState("All")
  const [sortKey,      setSortKey]      = useState("name")
  const [sortDir,      setSortDir]      = useState("asc")
  const [page,         setPage]         = useState(1)
  const [expanded,     setExpanded]     = useState(null)
  const [showFilters,  setShowFilters]  = useState(false)
  const [focusSearch,  setFocusSearch]  = useState(false)
  const PER_PAGE = 8

  // Fetch all medicines from MongoDB
  const fetchMedicines = async () => {
    setLoading(true); setFetchError(null)
    try {
      const res  = await fetch(API)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch")
      // API returns { medicines: [...] } — extract the array
      const list = Array.isArray(data) ? data : (data.medicines || [])
      setAllMedicines(list.map(normalise))
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchMedicines() }, [])

  // Re-sync URL pharmacy param whenever navigation changes
  React.useEffect(() => {
    setPharmFilter(urlPharmacy)
    setPage(1)
  }, [urlPharmacy])

  // Derive filter options dynamically from live data
  const categories  = useMemo(() => ["All", ...new Set(allMedicines.map(m=>m.category).filter(Boolean))], [allMedicines])
  const pharmacies  = useMemo(() => ["All", ...new Set(allMedicines.map(m=>m.pharmacy).filter(Boolean))], [allMedicines])

  const handleSort = (key) => {
    if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const filtered = useMemo(()=>{
    return allMedicines
      .filter(m=>
        (m.name.toLowerCase().includes(search.toLowerCase()) ||
         String(m.id).toLowerCase().includes(search.toLowerCase()) ||
         m.company.toLowerCase().includes(search.toLowerCase())) &&
        (catFilter==="All"    || m.category===catFilter) &&
        (pharmFilter==="All"  || m.pharmacy===pharmFilter) &&
        (rxFilter==="All"     || m.rxStatus===rxFilter) &&
        (stockFilter==="All"  ||
          (stockFilter==="in"  && m.stock>50) ||
          (stockFilter==="low" && m.stock>0&&m.stock<=50) ||
          (stockFilter==="out" && m.stock===0))
      )
      .sort((a,b)=>{
        let av=a[sortKey], bv=b[sortKey]
        if(typeof av==="string"){av=av.toLowerCase();bv=bv.toLowerCase()}
        return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1)
      })
  },[allMedicines,search,catFilter,pharmFilter,rxFilter,stockFilter,sortKey,sortDir])

  const totalPages = Math.ceil(filtered.length/PER_PAGE)
  const pageData   = filtered.slice((page-1)*PER_PAGE,page*PER_PAGE)

  const stats = {
    total:    allMedicines.length,
    inStock:  allMedicines.filter(m=>m.stock>50).length,
    low:      allMedicines.filter(m=>m.stock>0&&m.stock<=50).length,
    out:      allMedicines.filter(m=>m.stock===0).length,
    expiring: allMedicines.filter(m=>isExpiringSoon(m.expDate)).length,
  }

  const thStyle = {
    padding:"10px 16px", textAlign:"left", fontWeight:700, fontSize:9.5,
    letterSpacing:"0.13em", textTransform:"uppercase", color:C.lilacAsh,
    whiteSpace:"nowrap", borderBottom:`1.5px solid ${C.paleSlate}`,
    background:C.snow,
  }

  const SortIcon = ({col}) => {
    if(sortKey!==col) return <ArrowUpDown size={11} color={C.paleSlate}/>
    return sortDir==="asc"?<ChevronUp size={11} color={C.techBlue}/>:<ChevronDown size={11} color={C.techBlue}/>
  }

  const ColHead = ({col,label,style={}}) => (
    <th onClick={()=>handleSort(col)} style={{...thStyle,cursor:"pointer",userSelect:"none",transition:"color 0.15s",...style}}
      onMouseEnter={e=>e.currentTarget.style.color=C.techBlue}
      onMouseLeave={e=>e.currentTarget.style.color=C.lilacAsh}
    >
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>{label}<SortIcon col={col}/></div>
    </th>
  )

  return (
    <div style={{ minHeight:"100vh", background:C.snow, fontFamily:"'DM Sans',sans-serif", padding:"36px 40px 56px", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:${C.paleSlate}; border-radius:99px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input::placeholder { color:${C.lilacAsh}; opacity:0.55; }
        select option { background:${C.snow}; color:${C.blueSlate}; }
        table { border-collapse:collapse; width:100%; }
      `}</style>

      {/* Top palette stripe */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3, zIndex:99,
        background:`linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh}, ${C.paleSlate}, ${C.snow})` }} />

      {/* Dot grid bg */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
        backgroundSize:"28px 28px", opacity:0.35 }} />

      <div style={{ position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ marginBottom:28, paddingTop:4, animation:"fadeUp 0.4s ease both" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:C.techBlue,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 4px 12px rgba(2,62,138,0.28)` }}>
                  <Layers size={14} color={C.snow} strokeWidth={2} />
                </div>
                <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:400 }}>MediReach</span>
                <ChevronRight size={11} color={C.paleSlate} />
                <span style={{ fontSize:11.5, color:C.techBlue, fontWeight:700,
                  background:"rgba(2,62,138,0.08)", padding:"2px 10px", borderRadius:99,
                  border:`1px solid rgba(2,62,138,0.15)` }}>Medicine Inventory</span>
              </div>
              <h1 style={{ margin:0, fontSize:32, fontWeight:700, letterSpacing:"-1.4px",
                color:C.blueSlate, lineHeight:1.1, fontFamily:"'Sora',sans-serif" }}>Medicine Stock Registry</h1>
              <p style={{ margin:"7px 0 0", color:C.lilacAsh, fontSize:14 }}>
                Complete inventory across all connected pharmacies
              </p>
            </div>
            <div style={{ display:"flex", gap:9, flexShrink:0 }}>
              <button style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                border:`1.5px solid ${C.paleSlate}`, background:C.white, color:C.blueSlate,
                fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
              ><RefreshCw size={13} strokeWidth={2}/> Refresh</button>
              <button style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                border:"none", background:C.techBlue, color:C.snow, fontWeight:600, fontSize:13,
                display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
                boxShadow:`0 4px 18px rgba(2,62,138,0.28)` }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 26px rgba(2,62,138,0.38)" }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 18px rgba(2,62,138,0.28)" }}
              ><Download size={13} strokeWidth={2}/> Export</button>
            </div>
          </div>
        </div>

        {/* Fetch error banner */}
        {fetchError && (
          <div style={{
            padding:"12px 18px", borderRadius:10, marginBottom:20,
            background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.22)",
            display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.3s ease both",
          }}>
            <AlertTriangle size={16} color={C.danger} />
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontWeight:600, color:C.danger, fontSize:13 }}>Failed to load medicines</p>
              <p style={{ margin:"2px 0 0", fontSize:12, color:C.danger, opacity:0.7 }}>{fetchError}</p>
            </div>
            <button onClick={fetchMedicines} style={{
              padding:"6px 14px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
              border:"1.5px solid rgba(192,57,43,0.3)", background:"rgba(192,57,43,0.08)",
              color:C.danger, fontWeight:600, fontSize:12,
            }}>Retry</button>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display:"flex", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease 0.05s both" }}>
          <StatCard icon={Package}       value={loading ? "—" : stats.total}    label="Total Medicines" sub="Across all pharmacies" delay="0.07s" />
          <StatCard icon={CheckCircle2}  value={loading ? "—" : stats.inStock}  label="In Stock"        sub="Sufficient supply"     delay="0.1s"  />
          <StatCard icon={AlertTriangle} value={loading ? "—" : stats.low}      label="Low Stock"       sub="≤ 50 units remaining"  delay="0.13s" />
          <StatCard icon={XCircle}       value={loading ? "—" : stats.out}      label="Out of Stock"    sub="Needs restocking"      delay="0.16s" />
          <StatCard icon={Clock}         value={loading ? "—" : stats.expiring} label="Expiring Soon"   sub="Within 6 months"       delay="0.19s" />
        </div>

        {/* Pharmacy context banner — shown when navigated from a specific pharmacy */}
        {pharmFilter !== "All" && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"11px 18px", borderRadius:10, marginBottom:14,
            background:"rgba(2,62,138,0.06)", border:`1.5px solid rgba(2,62,138,0.18)`,
            animation:"fadeUp 0.3s ease both",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Building2 size={15} color={C.techBlue} strokeWidth={2} />
              <div>
                <span style={{ fontSize:13, fontWeight:700, color:C.techBlue }}>
                  {pharmFilter}
                </span>
                <span style={{ fontSize:12, color:C.lilacAsh, marginLeft:8 }}>
                  — showing medicines registered to this pharmacy only
                </span>
              </div>
            </div>
            <button
              onClick={()=>{ setPharmFilter("All"); setPage(1) }}
              style={{
                background:"none", border:`1.5px solid rgba(2,62,138,0.22)`, borderRadius:7,
                padding:"4px 12px", cursor:"pointer", fontFamily:"inherit",
                color:C.techBlue, fontSize:12, fontWeight:600, transition:"all 0.2s",
                display:"flex", alignItems:"center", gap:5,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background=C.techBlue; e.currentTarget.style.color=C.snow }}
              onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.color=C.techBlue }}
            >
              <ChevronRight size={11} style={{ transform:"rotate(180deg)" }} /> Show All
            </button>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ marginBottom:14, animation:"fadeUp 0.4s ease 0.1s both" }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:1, minWidth:220 }}>
              <Search size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}
                color={focusSearch ? C.techBlue : C.lilacAsh} />
              <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name, ID or manufacturer..."
                onFocus={()=>setFocusSearch(true)} onBlur={()=>setFocusSearch(false)}
                style={{ width:"100%", padding:"9px 14px 9px 33px", borderRadius:9,
                  border:`1.5px solid ${focusSearch ? C.techBlue : C.paleSlate}`,
                  background:C.white, fontSize:13, outline:"none", fontFamily:"inherit", color:C.blueSlate,
                  transition:"border-color 0.2s",
                  boxShadow: focusSearch ? `0 0 0 3px rgba(2,62,138,0.08)` : "none" }}
              />
            </div>
            <button onClick={()=>setShowFilters(f=>!f)} style={{
              padding:"9px 16px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
              border:`1.5px solid ${showFilters ? C.techBlue : C.paleSlate}`,
              background: showFilters ? "rgba(2,62,138,0.07)" : C.white,
              color: showFilters ? C.techBlue : C.blueSlate,
              fontWeight:600, fontSize:12.5, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
              <Filter size={13} strokeWidth={2}/>
              Filters
              {[catFilter,pharmFilter,rxFilter,stockFilter].filter(f=>f!=="All").length>0 && (
                <span style={{ width:16, height:16, borderRadius:"50%", background:C.techBlue,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, fontWeight:800, color:C.snow }}>
                  {[catFilter,pharmFilter,rxFilter,stockFilter].filter(f=>f!=="All").length}
                </span>
              )}
            </button>
            <span style={{ fontSize:12, color:C.lilacAsh }}>{loading ? "Loading..." : `${filtered.length} of ${allMedicines.length} medicines`}</span>
          </div>

          {showFilters && (
            <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap",
              padding:"14px 16px", borderRadius:10,
              background:C.white, border:`1.5px solid ${C.paleSlate}`,
              boxShadow:"0 2px 12px rgba(2,62,138,0.06)",
              animation:"fadeUp 0.25s ease both" }}>
              {[
                { label:"Category",  val:catFilter,   set:setCatFilter,   opts:categories },
                { label:"Pharmacy",  val:pharmFilter,  set:setPharmFilter,  opts:pharmacies },
                { label:"Rx Status", val:rxFilter,    set:setRxFilter,    opts:["All","Prescription Required","Over The Counter","Controlled Substance"] },
                { label:"Stock",     val:stockFilter, set:setStockFilter, opts:[{v:"All",l:"All"},{v:"in",l:"In Stock"},{v:"low",l:"Low Stock"},{v:"out",l:"Out of Stock"}] },
              ].map(f=>(
                <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <label style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                    letterSpacing:"0.12em", textTransform:"uppercase" }}>{f.label}</label>
                  <select value={f.val} onChange={e=>{ f.set(e.target.value); setPage(1) }} style={{
                    padding:"7px 28px 7px 10px", borderRadius:8,
                    border:`1.5px solid ${C.paleSlate}`, background:C.snow,
                    color:C.blueSlate, fontSize:12.5, outline:"none", fontFamily:"inherit",
                    cursor:"pointer", minWidth:140, appearance:"none", WebkitAppearance:"none",
                    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234C6EF5' stroke-opacity='.5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center" }}>
                    {f.opts.map(o=>typeof o==="string"
                      ?<option key={o} value={o}>{o}</option>
                      :<option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"flex-end" }}>
                <button onClick={()=>{ setCatFilter("All"); setPharmFilter("All"); setRxFilter("All"); setStockFilter("All"); setPage(1) }} style={{
                  padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                  border:`1.5px solid rgba(192,57,43,0.22)`, background:"rgba(192,57,43,0.05)",
                  color:C.danger, fontWeight:600, fontSize:12, transition:"all 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(192,57,43,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(192,57,43,0.05)"}
                >Clear all</button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.paleSlate}`,
          background:C.white, boxShadow:"0 4px 24px rgba(2,62,138,0.07)",
          animation:"fadeUp 0.4s ease 0.15s both" }}>
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr>
                  <ColHead col="name"     label="Medicine"     />
                  <ColHead col="category" label="Category"     />
                  <ColHead col="company"  label="Manufacturer" />
                  <ColHead col="price"    label="Price (LKR)"  />
                  <ColHead col="stock"    label="Stock"        style={{ minWidth:160 }} />
                  <th style={thStyle}>Rx Status</th>
                  <ColHead col="expDate"  label="Expiry"       />
                  <th style={{ ...thStyle, paddingRight:22 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding:"64px", textAlign:"center" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                      <div style={{ width:52, height:52, borderRadius:13,
                        background:"rgba(2,62,138,0.07)", border:"1.5px solid rgba(2,62,138,0.15)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Loader2 size={22} color={C.techBlue} style={{ animation:"spin 0.9s linear infinite" }} />
                      </div>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>Loading medicines...</p>
                      <p style={{ margin:0, fontSize:12, color:C.lilacAsh }}>Fetching from database</p>
                    </div>
                  </td></tr>
                ) : pageData.length===0 ? (
                  <tr><td colSpan={9} style={{ padding:"64px", textAlign:"center" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                      <div style={{ width:52, height:52, borderRadius:14, background:C.white,
                        border:`1.5px solid ${C.paleSlate}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Package size={22} color={C.lilacAsh} />
                      </div>
                      <p style={{ margin:0, fontSize:15, fontWeight:600, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>No medicines found</p>
                      <p style={{ margin:0, fontSize:12.5, color:C.lilacAsh }}>Try adjusting your search or filters</p>
                    </div>
                  </td></tr>
                ) : pageData.map((med,idx)=>{
                  const ss    = stockStatus(med.stock)
                  const rx    = rxConfig[med.rxStatus]
                  const RxI   = rx.icon
                  const StI   = ss.icon
                  const exp   = isExpired(med.expDate)
                  const expSn = isExpiringSoon(med.expDate)
                  const isOpen= expanded===med.id

                  return (
                    <React.Fragment key={med.id}>
                      <tr style={{
                        borderBottom:`1px solid ${C.snow}`,
                        background: isOpen ? "rgba(2,62,138,0.03)" : C.white,
                        transition:"background 0.15s", cursor:"pointer",
                        animation:`fadeUp 0.4s ease ${idx*0.04}s both`,
                      }}
                        onMouseEnter={e=>{ if(!isOpen) e.currentTarget.style.background="rgba(2,62,138,0.02)" }}
                        onMouseLeave={e=>{ if(!isOpen) e.currentTarget.style.background=C.white }}
                      >
                        {/* Name */}
                        <td style={{ padding:"13px 16px", minWidth:190 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{
                              width:34, height:34, borderRadius:9, flexShrink:0,
                              background:`linear-gradient(135deg, ${C.techBlue}, #3d74c4)`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              border:`1.5px solid rgba(2,62,138,0.3)`,
                            }}>
                              <Pill size={14} color={C.snow} strokeWidth={1.8} />
                            </div>
                            <div>
                              <p style={{ margin:0, fontSize:13.5, fontWeight:600, color:C.blueSlate, whiteSpace:"nowrap" }}>{med.name}</p>
                              <p style={{ margin:"1px 0 0", fontSize:11, color:C.lilacAsh, display:"flex", alignItems:"center", gap:3 }}>
                                <Building2 size={9} strokeWidth={2} />
                                {med.pharmacy.split(" ").slice(0,2).join(" ")}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                          <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 10px", borderRadius:99,
                            background:"rgba(76,110,245,0.08)", color:C.lilacAsh,
                            border:`1px solid rgba(76,110,245,0.18)` }}>{med.category}</span>
                        </td>

                        {/* Company */}
                        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                          <span style={{ fontSize:13, color:C.blueSlate, fontWeight:500 }}>{med.company}</span>
                        </td>

                        {/* Price */}
                        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                          <span style={{ fontSize:14, fontWeight:700, color:C.techBlue, fontFamily:"'Sora',sans-serif" }}>
                            {med.price.toLocaleString()}
                          </span>
                          <span style={{ fontSize:10.5, color:C.lilacAsh, marginLeft:3 }}>LKR</span>
                        </td>

                        {/* Stock */}
                        <td style={{ padding:"13px 16px", minWidth:160 }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            <div style={{ display:"inline-flex", alignItems:"center", gap:4,
                              background:ss.bg, borderRadius:99, padding:"2px 9px", border:`1px solid ${ss.border}` }}>
                              <StI size={9} color={ss.color} strokeWidth={2.5} />
                              <span style={{ fontSize:10, fontWeight:700, color:ss.color }}>{ss.label}</span>
                            </div>
                            <StockBar qty={med.stock} />
                          </div>
                        </td>

                        {/* Rx status */}
                        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <RxI size={13} color={rx.color} strokeWidth={1.8} />
                            <span style={{ fontSize:11.5, color:rx.color, fontWeight:600 }}>
                              {med.rxStatus==="Prescription Required"?"Rx Required":med.rxStatus==="Over The Counter"?"OTC":"Controlled"}
                            </span>
                          </div>
                        </td>

                        {/* Expiry */}
                        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                          {exp ? (
                            <span style={{ fontSize:11.5, fontWeight:700, color:C.danger, display:"flex", alignItems:"center", gap:4 }}>
                              <XCircle size={11} strokeWidth={2.5} /> Expired
                            </span>
                          ) : expSn ? (
                            <span style={{ fontSize:11.5, fontWeight:700, color:C.warn, display:"flex", alignItems:"center", gap:4 }}>
                              <AlertTriangle size={11} strokeWidth={2.5} /> {fmtDate(med.expDate)}
                            </span>
                          ) : (
                            <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:500 }}>{fmtDate(med.expDate)}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding:"13px 22px 13px 16px", whiteSpace:"nowrap" }}>
                          <div style={{ display:"flex", gap:7, alignItems:"center" }}>

                            {/* Update */}
                            <button
                              onClick={()=>navigate(`/updateMedicine/${med.id}`)}
                              style={{
                                padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                                border:`1.5px solid rgba(76,110,245,0.28)`,
                                background:"rgba(76,110,245,0.07)",
                                color:C.lilacAsh,
                                fontWeight:600, fontSize:12, transition:"all 0.2s",
                                display:"flex", alignItems:"center", gap:5,
                              }}
                              onMouseEnter={e=>{
                                e.currentTarget.style.background=C.lilacAsh
                                e.currentTarget.style.borderColor=C.lilacAsh
                                e.currentTarget.style.color=C.snow
                                e.currentTarget.style.transform="translateY(-1px)"
                                e.currentTarget.style.boxShadow="0 4px 14px rgba(76,110,245,0.28)"
                              }}
                              onMouseLeave={e=>{
                                e.currentTarget.style.background="rgba(76,110,245,0.07)"
                                e.currentTarget.style.borderColor="rgba(76,110,245,0.28)"
                                e.currentTarget.style.color=C.lilacAsh
                                e.currentTarget.style.transform="none"
                                e.currentTarget.style.boxShadow="none"
                              }}
                            >
                              <PencilLine size={12} strokeWidth={2} /> Update
                            </button>

                            {/* View / Hide */}
                            <button
                              onClick={()=>setExpanded(isOpen ? null : med.id)}
                              style={{
                                padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                                border:`1.5px solid ${isOpen ? C.techBlue : C.paleSlate}`,
                                background: isOpen ? "rgba(2,62,138,0.07)" : C.white,
                                color: isOpen ? C.techBlue : C.lilacAsh,
                                fontWeight:600, fontSize:12, transition:"all 0.2s",
                                display:"flex", alignItems:"center", gap:5,
                              }}
                              onMouseEnter={e=>{ if(!isOpen){ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}}
                              onMouseLeave={e=>{ if(!isOpen){ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.lilacAsh }}}
                            >
                              <Eye size={12} strokeWidth={2} /> {isOpen ? "Hide" : "View"}
                            </button>

                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {isOpen && (
                        <tr style={{ borderBottom:`1px solid ${C.paleSlate}` }}>
                          <td colSpan={9} style={{ padding:"0 22px 16px" }}>
                            <div style={{
                              borderRadius:12, padding:"18px 22px",
                              background:C.white, border:`1.5px solid ${C.paleSlate}`,
                              display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18,
                              animation:"fadeUp 0.25s ease both",
                            }}>
                              {[
                                { icon:Pill,       label:"Full Name",         value:med.name },
                                { icon:Building2,  label:"Assigned Pharmacy", value:med.pharmacy },
                                { icon:Tag,        label:"Category",          value:med.category },
                                { icon:Beaker,     label:"Manufacturer",      value:med.company },
                                { icon:DollarSign, label:"Unit Price",        value:`LKR ${med.price.toLocaleString()}` },
                                { icon:Hash,       label:"Current Stock",     value:med.stock.toLocaleString()+" units" },
                                { icon:Calendar,   label:"Manufacture Date",  value:fmtDate(med.mfgDate) },
                                { icon:Calendar,   label:"Expiry Date",       value:fmtDate(med.expDate), warn:exp?"danger":expSn?"warn":null },
                              ].map((d,i)=>(
                                <div key={i} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                    <d.icon size={10} color={C.lilacAsh} strokeWidth={2} />
                                    <span style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                                      letterSpacing:"0.12em", textTransform:"uppercase" }}>{d.label}</span>
                                  </div>
                                  <span style={{ fontSize:13, fontWeight:600,
                                    color: d.warn==="danger"?C.danger:d.warn==="warn"?C.warn:C.blueSlate }}>
                                    {d.value}
                                  </span>
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

          {/* Pagination */}
          {totalPages>1 && (
            <div style={{ padding:"12px 22px", borderTop:`1.5px solid ${C.paleSlate}`,
              background:C.snow, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:C.lilacAsh }}>
                Page {page} of {totalPages} · {loading ? '...' : filtered.length} results
              </span>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{
                  width:32, height:32, borderRadius:8, cursor:page===1?"not-allowed":"pointer",
                  border:`1.5px solid ${C.paleSlate}`, background:C.white,
                  color:page===1?C.paleSlate:C.lilacAsh,
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                  <ChevronLeft size={14} strokeWidth={2.5}/>
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)} style={{
                    width:32, height:32, borderRadius:8, cursor:"pointer",
                    border:`1.5px solid ${p===page?C.techBlue:C.paleSlate}`,
                    background:p===page?C.techBlue:C.white,
                    color:p===page?C.snow:C.blueSlate,
                    fontWeight:700, fontSize:12.5, fontFamily:"'Sora',sans-serif",
                    boxShadow:p===page?`0 4px 14px rgba(2,62,138,0.25)`:"none",
                    transition:"all 0.15s" }}>{p}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{
                  width:32, height:32, borderRadius:8, cursor:page===totalPages?"not-allowed":"pointer",
                  border:`1.5px solid ${C.paleSlate}`, background:C.white,
                  color:page===totalPages?C.paleSlate:C.lilacAsh,
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                  <ChevronRight size={14} strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}