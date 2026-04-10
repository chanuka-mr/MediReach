import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ShoppingCart, Clock, Building2,
  ChevronRight, RefreshCw, Download, Eye,
  AlertTriangle, Truck, CheckCircle2,
  DollarSign, Hash, Calendar, MapPin,
  Pill, TrendingUp, ClipboardList,
  Hourglass, Ban, CircleDot, X,
  ShieldAlert, SendHorizonal, ThumbsDown, FileText,
  Wifi, WifiOff, Package, LayoutGrid, Plus,
  ArrowUpRight, Activity, Loader2
} from 'lucide-react';
import { pharmacyAPI, medicineAPI, romsAPI } from '../utils/apiEndpoints';

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

// ── getMockData — same as PharmacyDashboard ───────────────────────
const getMockData = (id) => {
  const sum = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return {
    syncMin: (sum % 59) + 1,
    isSlow:  sum % 5 === 0,
    orders:  sum % 30,
  }
}

const STATUS = {
  active:  { label:"Online",    color:"#2d7a4f", bg:"#eaf6f0", border:"#b3dfc8", icon:Wifi          },
  warning: { label:"Slow Sync", color:"#7a5a1a", bg:"#fdf4e3", border:"#e8d19a", icon:AlertTriangle  },
  offline: { label:"Offline",   color:"#8a3030", bg:"#fdeaea", border:"#e8b3b3", icon:WifiOff        },
}

// ── Build pharmacy list from live DB pharmacies + medicines ───────
async function buildPharmacyList(pharmacies, medicines) {
  try {
    // Fetch medication requests from database
    const ordersRes = await romsAPI.getAllRequests();
    const medicationRequests = ordersRes.data || [];

    console.log('🔄 Building pharmacy list with medication requests...');
    console.log('📦 Total medication requests:', medicationRequests.length);
    console.log('📊 Pharmacies to process:', pharmacies.map(p => p.name));

    // Show sample medication request data
    if (medicationRequests.length > 0) {
      console.log('🔍 Sample medication request:', medicationRequests[0]);
      console.log('🔍 All pharmacy_ids in requests:', [...new Set(medicationRequests.map(r => r.pharmacy_id))]);
    }

    return pharmacies.map((p, i) => {
      const mock = getMockData(p._id)
      const isActive = p.isActive

      // Derive status
      const status = !isActive ? 'offline' : mock.isSlow ? 'warning' : 'active'

      // Last sync label
      const lastSync = isActive ? `${mock.syncMin} min ago` : '2 days ago'

      // Stock % from medicines belonging to this pharmacy
      const pharmacyMeds = medicines.filter(m => (m.Pharmacy || m.pharmacy) === p.name)
      const maxPossible = pharmacyMeds.length * 1300
      const totalStock = pharmacyMeds.reduce((s, m) => s + (Number(m.mediStock) || 0), 0)
      const stockPct = maxPossible > 0 ? Math.min(Math.round((totalStock / maxPossible) * 100), 99) : 0

      // Count medication requests for this pharmacy
      const pharmacyMedRequests = medicationRequests.filter(request => {
        // pharmacy_id in MedicationRequest is a String (pharmacy name)
        // p.name is the pharmacy name from the pharmacy document
        const match = request.pharmacy_id === p.name;
        if (match) {
          console.log(`✅ Found request for ${p.name}: status=${request.status}`);
        }
        return match;
      });
      
      const pendingOrders = pharmacyMedRequests.filter(request => request.status === 'Pending').length;
      const toDispatch = pharmacyMedRequests.filter(request => request.status === 'Payment-Verified').length;
      const verificationPending = pharmacyMedRequests.filter(request => request.status === 'VerificationPending').length;

      console.log(`🏥 Pharmacy: ${p.name}`);
      console.log(`  📋 Total requests: ${pharmacyMedRequests.length}`);
      console.log(`  ⏳ Pending Orders: ${pendingOrders}`);
      console.log(`  🚚 To Dispatch: ${toDispatch}`);
      console.log(`  🔍 Verification Pending: ${verificationPending}`);
      console.log(`  🔴 Show red circle: ${pendingOrders > 0 || toDispatch > 0 || verificationPending > 0}`);

      // Test: Force show red circle for Uduwella pharmacy for testing
      const shouldShowRedCircle = (pendingOrders > 0 || toDispatch > 0 || verificationPending > 0) || (p.name.toLowerCase().includes('uduwella'));

      const result = {
        id: p._id,
        name: p.name,
        location: `${p.district}, Sri Lanka`,
        status,
        lastSync,
        orders: isActive ? mock.orders : 0,
        stock: isActive ? stockPct : 0,
        medCount: pharmacyMeds.length,
        isActive,
        pendingOrders,
        toDispatch,
        verificationPending,
      }
      
      console.log(`✅ Final result for ${p.name}:`, result);
      return result;
    })
  } catch (error) {
    console.error('Error building pharmacy list:', error);
    // Fallback to mock data if API fails
    return pharmacies.map((p, i) => {
      const mock = getMockData(p._id)
      const isActive = p.isActive
      const status = !isActive ? 'offline' : mock.isSlow ? 'warning' : 'active'
      const lastSync = isActive ? `${mock.syncMin} min ago` : '2 days ago'
      const pharmacyMeds = medicines.filter(m => (m.Pharmacy || m.pharmacy) === p.name)
      const maxPossible = pharmacyMeds.length * 1300
      const totalStock = pharmacyMeds.reduce((s, m) => s + (Number(m.mediStock) || 0), 0)
      const stockPct = maxPossible > 0 ? Math.min(Math.round((totalStock / maxPossible) * 100), 99) : 0

      return {
        id: p._id,
        name: p.name,
        location: `${p.district}, Sri Lanka`,
        status,
        lastSync,
        orders: isActive ? mock.orders : 0,
        stock: isActive ? stockPct : 0,
        medCount: pharmacyMeds.length,
        isActive,
        pendingOrders: 0,
        toDispatch: 0,
        verificationPending: 0,
      }
    })
  }
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon:Icon, value, label, sub, delay, trend }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        flex:1, borderRadius:16, padding:"24px 22px", cursor:"default",
        transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
        position:"relative", overflow:"hidden",
        background: hov ? C.techBlue : C.white,
        border:`1.5px solid ${hov ? C.techBlue : C.paleSlate}`,
        boxShadow: hov
          ? `0 16px 40px rgba(39,93,173,0.18), 0 4px 12px rgba(39,93,173,0.1)`
          : "0 2px 12px rgba(91,97,106,0.07)",
        transform: hov ? "translateY(-3px)" : "none",
        animation:`fadeUp 0.5s ease ${delay} both`,
      }}
    >
      {hov && (
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize:"20px 20px",
        }} />
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div style={{ flex:1 }}>
          <p style={{
            margin:"0 0 8px", fontSize:10.5, fontWeight:600,
            color: hov ? "rgba(255,255,255,0.65)" : C.lilacAsh,
            letterSpacing:"0.14em", textTransform:"uppercase",
          }}>{label}</p>
          <p style={{
            margin:0, fontSize:42, fontWeight:700,
            color: hov ? C.white : C.techBlue,
            letterSpacing:"-2px", lineHeight:1,
            fontFamily:"'Sora',sans-serif", transition:"color 0.28s",
          }}>{value}</p>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:7 }}>
            {trend && (
              <div style={{
                display:"flex", alignItems:"center", gap:3,
                background: hov ? "rgba(255,255,255,0.2)" : "rgba(39,93,173,0.08)",
                borderRadius:99, padding:"2px 8px",
                border: hov ? "1px solid rgba(255,255,255,0.3)" : `1px solid rgba(39,93,173,0.15)`,
              }}>
                <TrendingUp size={9} color={hov ? C.white : C.techBlue} />
                <span style={{ fontSize:10, fontWeight:700, color: hov ? C.white : C.techBlue }}>{trend}</span>
              </div>
            )}
            <p style={{
              margin:0, fontSize:12, fontWeight:400,
              color: hov ? "rgba(255,255,255,0.55)" : C.lilacAsh,
            }}>{sub}</p>
          </div>
        </div>
        <div style={{
          width:46, height:46, borderRadius:12, flexShrink:0,
          background: hov ? "rgba(255,255,255,0.15)" : `rgba(39,93,173,0.07)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          border:`1.5px solid ${hov ? "rgba(255,255,255,0.25)" : "rgba(39,93,173,0.12)"}`,
          transition:"all 0.28s",
        }}>
          <Icon size={20} color={hov ? C.white : C.techBlue} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

// ── Stock Indicator ─────────────────────────────────────────────────────
function StockIndicator({ pharmacyName, medicines }) {
  // Get medicines for this pharmacy
  const pharmacyMeds = medicines.filter(m => (m.Pharmacy || m.pharmacy) === pharmacyName);
  
  // Calculate actual stock levels
  const stockLevels = pharmacyMeds.map(med => Number(med.mediStock) || 0);
  
  // Check if any medicines fall into each category
  const hasHighStock = stockLevels.some(stock => stock >= 500);
  const hasMediumStock = stockLevels.some(stock => stock >= 100 && stock < 500);
  const hasLowStock = stockLevels.some(stock => stock < 100);
  
  // If no medicines, show no indicator
  if (pharmacyMeds.length === 0) {
    return (
      <div style={{ width:78, display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}>
        <span style={{ fontSize:10.5, fontWeight:600, color:C.lilacAsh, textAlign:"center" }}>No Data</span>
      </div>
    );
  }
  
  return (
    <div style={{ width:78, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
      {hasHighStock && (
        <div style={{
          width:10, height:10, borderRadius:"50%", background:"#2d7a4f",
          boxShadow: "0 0 6px rgba(45,122,79,0.4)",
          position: "relative"
        }}>
          <div style={{
            position: "absolute", inset:0, borderRadius:"50%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)"
          }} />
        </div>
      )}
      {hasMediumStock && (
        <div style={{
          width:10, height:10, borderRadius:"50%", background:"#d4a017",
          boxShadow: "0 0 6px rgba(212,160,23,0.4)",
          position: "relative"
        }}>
          <div style={{
            position: "absolute", inset:0, borderRadius:"50%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)"
          }} />
        </div>
      )}
      {hasLowStock && (
        <div style={{
          width:10, height:10, borderRadius:"50%", background:"#8a3030",
          boxShadow: "0 0 6px rgba(138,48,48,0.4)",
          position: "relative"
        }}>
          <div style={{
            position: "absolute", inset:0, borderRadius:"50%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)"
          }} />
        </div>
      )}
    </div>
  )
}

// ── Pharmacy Row ──────────────────────────────────────────────────
function PharmacyRow({ pharmacy, index, total, navigate, medicines }) {
  const [invHov, setInvHov] = useState(false)
  const [ordHov, setOrdHov] = useState(false)
  const [rowHov, setRowHov] = useState(false)
  const initials = pharmacy.name.split(" ").slice(0,2).map(w=>w[0]).join("")

  // Debug logging for each pharmacy row
  console.log(`🏥 Rendering PharmacyRow for: ${pharmacy.name}`);
  console.log(`  ⏳ Pending Orders: ${pharmacy.pendingOrders}`);
  console.log(`  🚚 To Dispatch: ${pharmacy.toDispatch}`);
  console.log(`  � Verification Pending: ${pharmacy.verificationPending || 0}`);
  console.log(`  � Show red circle: ${pharmacy.pendingOrders > 0 || pharmacy.toDispatch > 0 || (pharmacy.verificationPending || 0) > 0}`);
  console.log(`  📋 Full pharmacy data:`, pharmacy);

  return (
    <div
      onMouseEnter={()=>setRowHov(true)}
      onMouseLeave={()=>setRowHov(false)}
      style={{
        display:"flex", alignItems:"center",
        padding:"13px 22px",
        borderBottom: index < total-1 ? `1px solid ${C.snow}` : "none",
        background: rowHov ? `rgba(39,93,173,0.03)` : C.white,
        transition:"background 0.18s",
        animation:`fadeUp 0.42s ease ${0.04*index}s both`,
        position:"relative",
      }}
    >
      {rowHov && (
        <div style={{
          position:"absolute", left:0, top:"15%", bottom:"15%",
          width:3, borderRadius:"0 3px 3px 0", background:C.techBlue,
        }} />
      )}

      <span style={{
        width:32, color:C.paleSlate, fontSize:11.5, fontWeight:600,
        flexShrink:0, fontFamily:"'Sora',sans-serif",
      }}>
        {String(index+1).padStart(2,"0")}
      </span>

      <div style={{
        width:40, height:40, borderRadius:11, flexShrink:0, marginRight:14,
        background: rowHov
          ? `linear-gradient(135deg, ${C.techBlue}, #3d74c4)`
          : `linear-gradient(135deg, ${C.paleSlate}, ${C.lilacAsh})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        color:C.white, fontWeight:700, fontSize:12,
        fontFamily:"'Sora',sans-serif",
        border:`1.5px solid ${rowHov ? C.techBlue+"40" : C.paleSlate}`,
        transition:"all 0.2s",
        boxShadow: rowHov ? `0 4px 14px rgba(39,93,173,0.2)` : "none",
        letterSpacing:"0.5px",
      }}>
        {initials}
      </div>

      <div style={{ flex:1, minWidth:0, marginRight:16 }}>
        <p style={{
          margin:0, fontWeight:600, fontSize:14,
          color: rowHov ? C.techBlue : C.blueSlate,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          transition:"color 0.18s",
        }}>{pharmacy.name}</p>
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
          <MapPin size={10} color={C.lilacAsh} />
          <p style={{
            margin:0, fontSize:11.5, color:C.lilacAsh, fontWeight:400,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {pharmacy.location}
          </p>
        </div>
      </div>

      <div style={{ marginRight:20, flexShrink:0 }}>
        <StockIndicator pharmacyName={pharmacy.name} medicines={medicines} />
      </div>

      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
        <button
          onMouseEnter={()=>setInvHov(true)}
          onMouseLeave={()=>setInvHov(false)}
          onClick={()=>navigate(`/medicineInventory?pharmacy=${encodeURIComponent(pharmacy.name)}`)}
          style={{
            padding:"7px 14px", borderRadius:8,
            border:`1.5px solid ${invHov ? C.techBlue : C.paleSlate}`,
            background: invHov ? C.techBlue : C.white,
            color: invHov ? C.white : C.blueSlate,
            fontWeight:600, fontSize:12.5, cursor:"pointer",
            transition:"all 0.2s",
            display:"flex", alignItems:"center", gap:5,
            fontFamily:"inherit",
            transform: invHov ? "translateY(-1px)" : "none",
            boxShadow: invHov ? `0 4px 16px rgba(39,93,173,0.22)` : "none",
          }}
        >
          <Package size={12} strokeWidth={2} />
          Inventory
        </button>

        <button
          onMouseEnter={()=>setOrdHov(true)}
          onMouseLeave={()=>setOrdHov(false)}
          onClick={()=>navigate(`/orders?pharmacy=${encodeURIComponent(pharmacy.name)}`)}
          style={{
            padding:"7px 14px", borderRadius:8,
            border:`1.5px solid ${ordHov ? C.lilacAsh : C.paleSlate}`,
            background: ordHov ? C.lilacAsh : C.white,
            color: ordHov ? C.white : C.lilacAsh,
            fontWeight:600, fontSize:12, cursor:"pointer", transition:"all 0.2s",
            display:"flex", alignItems:"center", gap:6,
            transform: ordHov ? "translateY(-1px)" : "none",
            boxShadow: ordHov ? "0 4px 14px rgba(2,62,138,0.15)" : "none",
            position:"relative",
          }}
        >
          {(pharmacy.pendingOrders > 0 || pharmacy.toDispatch > 0 || (pharmacy.verificationPending || 0) > 0) && (
            <div style={{
              position:"absolute", top:"-4px", right:"-4px",
              width:8, height:8, borderRadius:"50%", background:C.danger,
              boxShadow: `0 0 6px ${C.danger}80`,
            }} />
          )}
          <ShoppingCart size={12} strokeWidth={2} />
          Orders
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function InventoryDashboard() {
  const navigate = useNavigate()

  const [pharmacyList,  setPharmacyList]  = useState([])
  const [medicines,     setMedicines]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)
  const [search,        setSearch]        = useState("")
  const [filter,        setFilter]        = useState("all")
  const [addHov,        setAddHov]        = useState(false)
  const [focusSearch,   setFocusSearch]   = useState(false)
  const [lastRefresh,   setLastRefresh]   = useState(new Date())

  // ── Fetch pharmacies (from pharmacy API) + medicines (for stock %) ─
  const fetchData = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [pharmRes, medRes] = await Promise.all([
        pharmacyAPI.getAllPharmacies(),
        medicineAPI.getAllMedicines(),
      ])

      const pharmData = pharmRes.data
      const medData   = medRes.data

      const pharmacies = pharmData.data?.pharmacies || pharmData.pharmacies || []
      const meds       = Array.isArray(medData) ? medData : (medData.medicines || medData.data || [])

      setPharmacyList(pharmacies)
      setMedicines(meds)
      setLastRefresh(new Date())
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ── Build pharmacy rows combining live DB pharmacies + medicine stock ─
  const [pharmacies, setPharmacies] = useState([])

  useEffect(() => {
    const buildPharmacies = async () => {
      try {
        const builtPharmacies = await buildPharmacyList(pharmacyList, medicines)
        setPharmacies(builtPharmacies)
      } catch (error) {
        console.error('Error building pharmacies:', error)
      }
    }
    buildPharmacies()
  }, [pharmacyList, medicines])

  // ── Real-time stats ───────────────────────────────────────────
  const stats = useMemo(() => ({
    totalMedicines:  medicines.length,
    totalPharmacies: pharmacyList.length,
    totalOrders:     pharmacies.reduce((s,p) => s + (p.pendingOrders || 0), 0), // Real pending orders count
    lowStock:        medicines.filter(m => {
                       const q = Number(m.mediStock) || 0
                       return q > 0 && q <= 50
                     }).length,
    outOfStock:      medicines.filter(m => Number(m.mediStock) === 0).length,
  }), [pharmacies, medicines, pharmacyList])

  const counts = useMemo(() => ({
    active:  pharmacies.filter(p=>p.status==="active").length,
    warning: pharmacies.filter(p=>p.status==="warning").length,
    offline: pharmacies.filter(p=>p.status==="offline").length,
  }), [pharmacies])

  const filtered = pharmacies.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter==="all" || p.status===filter)
  )

  const formatTime = (date) => date.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.snow, minHeight:"100vh", width:"100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.paleSlate}; border-radius:99px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .id-filter-btn {
          padding:7px 16px; border-radius:8px; font-weight:600; font-size:12.5px;
          cursor:pointer; transition:all 0.18s; font-family:inherit;
          display:flex; align-items:center; gap:5px; letter-spacing:0.02em;
        }
        input::placeholder { color:${C.lilacAsh}; }
      `}</style>

      <div style={{ height:3, background:`linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh}, ${C.paleSlate}, ${C.snow})` }} />

      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`
          radial-gradient(circle at 5% 5%, rgba(39,93,173,0.05) 0%, transparent 40%),
          radial-gradient(circle at 95% 95%, rgba(171,169,195,0.08) 0%, transparent 40%),
          radial-gradient(circle at 85% 10%, rgba(206,211,220,0.12) 0%, transparent 35%)
        `,
      }} />

      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
        backgroundSize:"28px 28px", opacity:0.35,
      }} />

      <div style={{ padding:"36px 40px 56px", position:"relative", zIndex:1 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom:32, animation:"fadeUp 0.4s ease both" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                <div style={{
                  width:30, height:30, borderRadius:8, background:C.techBlue,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 4px 12px rgba(39,93,173,0.28)`,
                }}>
                  <LayoutGrid size={14} color={C.white} strokeWidth={2} />
                </div>
                <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:400 }}>MediReach</span>
                <ChevronRight size={11} color={C.paleSlate} />
                <span style={{
                  fontSize:11.5, color:C.techBlue, fontWeight:600,
                  background:"rgba(39,93,173,0.08)", padding:"2px 10px", borderRadius:99,
                  border:"1px solid rgba(39,93,173,0.15)",
                }}>Inventory</span>
              </div>
              <h1 style={{
                margin:0, fontSize:32, fontWeight:700, letterSpacing:"-1.4px",
                color:C.blueSlate, lineHeight:1.1, fontFamily:"'Sora',sans-serif",
              }}>Inventory Dashboard</h1>
              <p style={{ margin:"7px 0 0", color:C.lilacAsh, fontSize:14, fontWeight:400 }}>
                Real-time dispatch monitoring across the pharmacy network
              </p>
            </div>

            <div style={{ display:"flex", gap:9, flexShrink:0, alignItems:"flex-start" }}>
              <button
                onClick={fetchData}
                disabled={loading}
                style={{
                  padding:"10px 16px", borderRadius:10, cursor:loading?"not-allowed":"pointer",
                  fontFamily:"inherit", border:`1.5px solid ${C.paleSlate}`, background:C.white,
                  color:loading?C.paleSlate:C.blueSlate, fontWeight:600, fontSize:13,
                  display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
                }}
                onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=loading?C.paleSlate:C.blueSlate }}
              >
                <RefreshCw size={13} strokeWidth={2} style={{ animation:loading?"spin 0.9s linear infinite":"none" }}/>
                Refresh
              </button>

              <button
                onMouseEnter={()=>setAddHov(true)}
                onMouseLeave={()=>setAddHov(false)}
                onClick={()=>navigate('/medicineAdd')}
                style={{
                  background: addHov ? "#1e4d94" : C.techBlue, color: C.white, border:"none",
                  padding:"12px 22px", borderRadius:11, fontWeight:600, fontSize:14,
                  cursor:"pointer", display:"flex", alignItems:"center",
                  gap:8, transition:"all 0.22s", fontFamily:"'DM Sans',sans-serif",
                  boxShadow: addHov ? `0 10px 28px rgba(39,93,173,0.38)` : `0 4px 18px rgba(39,93,173,0.22)`,
                  transform: addHov ? "translateY(-2px)" : "none",
                  letterSpacing:"-0.2px", flexShrink:0, whiteSpace:"nowrap",
                }}
              >
                <div style={{
                  width:24, height:24, borderRadius:7, background:"rgba(255,255,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Plus size={13} strokeWidth={3} />
                </div>
                Add Medicine
                <ArrowUpRight size={14} strokeWidth={2.5} style={{ opacity:0.85 }} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Fetch Error Banner ── */}
        {fetchError && (
          <div style={{
            padding:"13px 18px", borderRadius:10, marginBottom:22,
            background:"rgba(192,57,43,0.06)", border:`1px solid rgba(192,57,43,0.22)`,
            display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.3s ease both",
          }}>
            <AlertTriangle size={16} color={C.danger} />
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontWeight:600, color:C.danger, fontSize:13 }}>Failed to load pharmacy data</p>
              <p style={{ margin:"2px 0 0", fontSize:12, color:C.danger, opacity:0.7 }}>{fetchError}</p>
            </div>
            <button onClick={fetchData} style={{
              padding:"6px 14px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
              border:`1.5px solid rgba(192,57,43,0.3)`, background:"rgba(192,57,43,0.08)",
              color:C.danger, fontWeight:600, fontSize:12,
            }}>Retry</button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div style={{ display:"flex", gap:16, marginBottom:32 }}>
          <StatCard
            icon={Activity}
            value={loading ? "—" : medicines.length.toLocaleString()}
            label="Total Medicines"
            sub="Registered in network"
            delay="0.07s"
          />
          <StatCard
            icon={Clock}
            value={loading ? "—" : stats.totalOrders}
            label="Pending Orders"
            sub="Awaiting fulfilment"
            delay="0.13s"
          />
          <StatCard
            icon={Building2}
            value={loading ? "—" : String(stats.totalPharmacies).padStart(2,"0")}
            label="Connected Pharmacies"
            sub="Registered in network"
            delay="0.19s"
          />
        </div>

        {/* ── Status Summary ── */}
        <div style={{ display:"flex", gap:10, marginBottom:24, animation:"fadeUp 0.4s ease 0.22s both", flexWrap:"wrap" }}>
          {[
            { label:"Online",    count:counts.active,  color:"#2d7a4f", bg:"#eaf6f0", border:"#b3dfc8", icon:Wifi          },
            { label:"Slow Sync", count:counts.warning, color:"#7a5a1a", bg:"#fdf4e3", border:"#e8d19a", icon:AlertTriangle  },
            { label:"Offline",   count:counts.offline, color:"#8a3030", bg:"#fdeaea", border:"#e8b3b3", icon:WifiOff        },
          ].map(s=>{
            const SI = s.icon
            return (
              <div key={s.label} style={{
                display:"flex", alignItems:"center", gap:7, padding:"7px 16px",
                borderRadius:10, background:s.bg, border:`1px solid ${s.border}`,
              }}>
                <SI size={12} color={s.color} strokeWidth={2} />
                <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.count}</span>
                <span style={{ fontSize:12, color:s.color, opacity:0.7 }}>{s.label}</span>
              </div>
            )
          })}

          {!loading && stats.lowStock > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
              borderRadius:10, background:"#fdf4e3", border:"1px solid #e8d19a" }}>
              <AlertTriangle size={12} color="#7a5a1a" />
              <span style={{ fontSize:11.5, color:"#7a5a1a", fontWeight:600 }}>{stats.lowStock} Low Stock</span>
            </div>
          )}
          {!loading && stats.outOfStock > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
              borderRadius:10, background:"#fdeaea", border:"1px solid #e8b3b3" }}>
              <WifiOff size={12} color="#8a3030" />
              <span style={{ fontSize:11.5, color:"#8a3030", fontWeight:600 }}>{stats.outOfStock} Out of Stock</span>
            </div>
          )}

          <div style={{ flex:1 }} />

          <div style={{
            display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
            borderRadius:10, background:C.white, border:`1px solid ${C.paleSlate}`,
          }}>
            <RefreshCw size={12} color={C.lilacAsh} />
            <span style={{ fontSize:11.5, color:C.lilacAsh, fontWeight:400 }}>
              {loading ? "Refreshing..." : `Refreshed at ${formatTime(lastRefresh)}`}
            </span>
          </div>
        </div>

        {/* ── Table Section ── */}
        <div style={{ animation:"fadeUp 0.4s ease 0.28s both" }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, gap:16, flexWrap:"wrap" }}>
            <div>
              <h2 style={{ margin:0, fontWeight:700, fontSize:18, color:C.blueSlate,
                letterSpacing:"-0.5px", fontFamily:"'Sora',sans-serif" }}>Connected Pharmacies</h2>
              <p style={{ margin:"2px 0 0", color:C.lilacAsh, fontSize:12 }}>
                {loading ? "Loading from database..." : `${filtered.length} of ${pharmacies.length} pharmacies · stock % derived from registered medicines`}
              </p>
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ position:"relative" }}>
                <Search size={13}
                  color={focusSearch ? C.techBlue : C.lilacAsh}
                  style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", transition:"color 0.2s" }}
                />
                <input
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  onFocus={()=>setFocusSearch(true)}
                  onBlur={()=>setFocusSearch(false)}
                  placeholder="Search pharmacies..."
                  style={{
                    padding:"8px 14px 8px 32px", borderRadius:9, width:215,
                    border:`1.5px solid ${focusSearch ? C.techBlue : C.paleSlate}`,
                    background:C.white, fontSize:13, outline:"none",
                    fontFamily:"inherit", color:C.blueSlate,
                    transition:"border-color 0.2s",
                    boxShadow: focusSearch ? `0 0 0 3px rgba(39,93,173,0.08)` : "none",
                  }}
                />
              </div>

              <div style={{ width:1, height:24, background:C.paleSlate }} />

              {[
                { key:"all",     label:"All"     },
                { key:"active",  label:"Online"  },
                { key:"warning", label:"Slow"    },
                { key:"offline", label:"Offline" },
              ].map(f=>(
                <button key={f.key} className="id-filter-btn" onClick={()=>setFilter(f.key)} style={{
                  border:`1.5px solid ${filter===f.key ? C.techBlue : C.paleSlate}`,
                  background: filter===f.key ? C.techBlue : C.white,
                  color: filter===f.key ? C.white : C.blueSlate,
                  boxShadow: filter===f.key ? `0 3px 12px rgba(39,93,173,0.2)` : "none",
                }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table card */}
          <div style={{
            borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.paleSlate}`,
            background:C.white, boxShadow:"0 4px 24px rgba(91,97,106,0.08)",
          }}>

            {/* Column headers */}
            <div style={{
              display:"flex", alignItems:"center", padding:"11px 22px",
              background:C.snow, borderBottom:`1.5px solid ${C.paleSlate}`,
            }}>
              {[
                { label:"#",         style:{ width:32, flexShrink:0 } },
                { label:"",          style:{ width:54, flexShrink:0 } },
                { label:"Pharmacy",  style:{ flex:1 } },
                { label:"Stock",     style:{ width:112, flexShrink:0, textAlign:"right", paddingRight:8 } },
                { label:"Actions",   style:{ width:190, flexShrink:0, textAlign:"right" } },
              ].map((col,i)=>(
                <span key={i} style={{
                  ...col.style, fontSize:9.5, fontWeight:700, letterSpacing:"0.13em",
                  textTransform:"uppercase", color:C.lilacAsh,
                }}>{col.label}</span>
              ))}
            </div>

            {/* Loading state */}
            {loading ? (
              <div style={{ padding:"60px", textAlign:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                  <div style={{
                    width:52, height:52, borderRadius:13, margin:"0 auto",
                    background:"rgba(2,62,138,0.07)", border:`1.5px solid rgba(2,62,138,0.15)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <Loader2 size={22} color={C.techBlue} style={{ animation:"spin 0.9s linear infinite" }} />
                  </div>
                  <p style={{ margin:0, fontWeight:600, fontSize:14, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>
                    Loading pharmacy data...
                  </p>
                  <p style={{ margin:0, fontSize:12, color:C.lilacAsh }}>
                    Fetching from database
                  </p>
                </div>
              </div>

            ) : filtered.length===0 ? (
              <div style={{ padding:"60px", textAlign:"center" }}>
                <div style={{
                  width:52, height:52, borderRadius:13, margin:"0 auto 16px",
                  background:C.snow, border:`1.5px solid ${C.paleSlate}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Building2 size={22} color={C.lilacAsh} />
                </div>
                <p style={{ margin:0, fontWeight:600, fontSize:15, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>
                  {pharmacies.length === 0 ? "No pharmacies registered yet" : "No pharmacies found"}
                </p>
                <p style={{ margin:"6px 0 0", fontSize:12.5, color:C.lilacAsh }}>
                  {pharmacies.length === 0 ? "Add pharmacies via the Pharmacy Dashboard to get started" : "Try adjusting your search or filter"}
                </p>
              </div>

            ) : (
              filtered.map((pharmacy, index)=>(
                <PharmacyRow
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  index={index}
                  total={filtered.length}
                  navigate={navigate}
                  medicines={medicines}
                />
              ))
            )}

            {/* Footer */}
            <div style={{
              padding:"11px 22px", background:C.snow,
              borderTop:`1.5px solid ${C.paleSlate}`,
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <span style={{ fontSize:12, color:C.lilacAsh }}>
                {loading ? "Loading..." : `Showing ${filtered.length} of ${pharmacies.length} pharmacies`}
              </span>
              <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{
                    width: i===0 ? 22 : 8, height:8, borderRadius:99,
                    background: i===0 ? C.techBlue : C.paleSlate,
                    transition:"width 0.3s",
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