import React, { useState, useMemo, useEffect } from 'react'
import {
  Search, Filter, ShoppingCart, Clock, Building2,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  ArrowUpDown, RefreshCw, Download, Eye,
  XCircle, AlertTriangle, Truck, CheckCircle2,
  DollarSign, Hash, Calendar, MapPin,
  Pill, TrendingUp, ClipboardList,
  Hourglass, Ban, CircleDot, X,
  ShieldAlert, SendHorizonal, ThumbsDown, FileText
} from 'lucide-react'
import ReportGenerator from './ReportGenerator'

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

const INITIAL_ORDERS = [
  { id:"ORD-2841", pharmacy:"Kandy Central Pharmacy",   location:"Kandy, Central Province",       medicine:"Amoxicillin 500mg",     category:"Antibiotic",     qty:200, unitPrice:145,  status:"delivered",  priority:"normal",  orderedAt:"2025-03-01", deliveredAt:"2025-03-03", notes:"" },
  { id:"ORD-2842", pharmacy:"Galle Fort MedPoint",      location:"Galle, Southern Province",      medicine:"Paracetamol 500mg",     category:"Analgesic",      qty:500, unitPrice:35,   status:"in_transit", priority:"normal",  orderedAt:"2025-03-05", deliveredAt:null,         notes:"" },
  { id:"ORD-2843", pharmacy:"Jaffna Community Rx",      location:"Jaffna, Northern Province",     medicine:"Salbutamol Inhaler",    category:"Respiratory",    qty:50,  unitPrice:680,  status:"pending",    priority:"urgent",  orderedAt:"2025-03-06", deliveredAt:null,         notes:"Low supply — urgent" },
  { id:"ORD-2844", pharmacy:"Matara Rural Clinic",      location:"Matara, Southern Province",     medicine:"Metformin 850mg",       category:"Antidiabetic",   qty:300, unitPrice:95,   status:"delivered",  priority:"normal",  orderedAt:"2025-02-28", deliveredAt:"2025-03-02", notes:"" },
  { id:"ORD-2845", pharmacy:"Anuradhapura PharmaCare",  location:"Anuradhapura, North Central",   medicine:"ORS Sachets",           category:"Rehydration",    qty:800, unitPrice:25,   status:"cancelled",  priority:"normal",  orderedAt:"2025-03-04", deliveredAt:null,         notes:"Order cancelled by pharmacy" },
  { id:"ORD-2846", pharmacy:"Batticaloa MedStore",      location:"Batticaloa, Eastern Province",  medicine:"Cetirizine 10mg",       category:"Antihistamine",  qty:150, unitPrice:55,   status:"processing", priority:"normal",  orderedAt:"2025-03-07", deliveredAt:null,         notes:"" },
  { id:"ORD-2847", pharmacy:"Kurunegala Health Hub",    location:"Kurunegala, North Western",     medicine:"Amlodipine 5mg",        category:"Cardiovascular", qty:120, unitPrice:210,  status:"pending",    priority:"urgent",  orderedAt:"2025-03-07", deliveredAt:null,         notes:"Critical — stock depleted" },
  { id:"ORD-2848", pharmacy:"Trincomalee Bay Pharmacy", location:"Trincomalee, Eastern Province", medicine:"Azithromycin 500mg",    category:"Antibiotic",     qty:80,  unitPrice:280,  status:"in_transit", priority:"normal",  orderedAt:"2025-03-06", deliveredAt:null,         notes:"" },
  { id:"ORD-2849", pharmacy:"Kandy Central Pharmacy",   location:"Kandy, Central Province",       medicine:"Vitamin D3 1000 IU",    category:"Supplement",     qty:400, unitPrice:120,  status:"delivered",  priority:"normal",  orderedAt:"2025-02-25", deliveredAt:"2025-02-27", notes:"" },
  { id:"ORD-2850", pharmacy:"Galle Fort MedPoint",      location:"Galle, Southern Province",      medicine:"Ibuprofen 400mg",       category:"Analgesic",      qty:600, unitPrice:65,   status:"processing", priority:"normal",  orderedAt:"2025-03-07", deliveredAt:null,         notes:"" },
  { id:"ORD-2851", pharmacy:"Matara Rural Clinic",      location:"Matara, Southern Province",     medicine:"Fluconazole 150mg",     category:"Antifungal",     qty:60,  unitPrice:320,  status:"delivered",  priority:"normal",  orderedAt:"2025-02-20", deliveredAt:"2025-02-22", notes:"" },
  { id:"ORD-2852", pharmacy:"Batticaloa MedStore",      location:"Batticaloa, Eastern Province",  medicine:"Omeprazole 20mg",       category:"Other",          qty:250, unitPrice:88,   status:"in_transit", priority:"urgent",  orderedAt:"2025-03-05", deliveredAt:null,         notes:"Expedited shipping" },
  { id:"ORD-2853", pharmacy:"Jaffna Community Rx",      location:"Jaffna, Northern Province",     medicine:"Oseltamivir 75mg",      category:"Antiviral",      qty:30,  unitPrice:1250, status:"pending",    priority:"urgent",  orderedAt:"2025-03-07", deliveredAt:null,         notes:"Flu outbreak — critical" },
  { id:"ORD-2854", pharmacy:"Trincomalee Bay Pharmacy", location:"Trincomalee, Eastern Province", medicine:"Atorvastatin 20mg",     category:"Cardiovascular", qty:180, unitPrice:175,  status:"delivered",  priority:"normal",  orderedAt:"2025-02-22", deliveredAt:"2025-02-25", notes:"" },
  { id:"ORD-2855", pharmacy:"Kurunegala Health Hub",    location:"Kurunegala, North Western",     medicine:"Morphine Sulfate 10mg", category:"Analgesic",      qty:20,  unitPrice:890,  status:"processing", priority:"urgent",  orderedAt:"2025-03-06", deliveredAt:null,         notes:"Controlled — requires auth" },
]

const STATUS_CFG = {
  pending:    { label:"Pending",    color:"#92400E", bg:"rgba(180,83,9,0.08)",    border:"rgba(180,83,9,0.22)",    icon:Hourglass     },
  processing: { label:"Processing", color:C.lilacAsh,bg:"rgba(76,110,245,0.08)", border:"rgba(76,110,245,0.22)", icon:CircleDot     },
  in_transit: { label:"In Transit", color:"#5B21B6", bg:"rgba(91,33,182,0.08)",  border:"rgba(91,33,182,0.22)",  icon:Truck         },
  delivered:  { label:"Delivered",  color:C.success, bg:"rgba(14,124,91,0.08)",  border:"rgba(14,124,91,0.22)",  icon:CheckCircle2  },
  cancelled:  { label:"Cancelled",  color:C.danger,  bg:"rgba(192,57,43,0.08)",  border:"rgba(192,57,43,0.22)",  icon:Ban           },
  dispatched: { label:"Dispatched", color:"#065F46", bg:"rgba(6,95,70,0.08)",    border:"rgba(6,95,70,0.22)",    icon:SendHorizonal },
  rejected:   { label:"Rejected",   color:C.danger,  bg:"rgba(192,57,43,0.08)",  border:"rgba(192,57,43,0.22)",  icon:ThumbsDown    },
}

const CAN_ACT    = ["pending","processing","in_transit"]
const pharmacies = ["All", ...new Set(INITIAL_ORDERS.map(o => o.pharmacy))]
const categories = ["All", ...new Set(INITIAL_ORDERS.map(o => o.category))]
const fmtDate    = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"
const totalVal   = (o) => o.qty * o.unitPrice

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => { const t = setTimeout(onClose,4000); return ()=>clearTimeout(t) },[onClose])
  const isDispatched = toast.type==="dispatched"
  const accent = isDispatched ? C.success : C.danger
  const Icon   = isDispatched ? SendHorizonal : ThumbsDown
  return (
    <div style={{
      position:"fixed", bottom:32, right:32, zIndex:1000,
      display:"flex", alignItems:"flex-start", gap:14,
      padding:"16px 20px 18px", borderRadius:14,
      background:C.white, border:`1.5px solid ${isDispatched ? "rgba(14,124,91,0.3)" : "rgba(192,57,43,0.3)"}`,
      boxShadow:"0 16px 48px rgba(2,62,138,0.14)",
      minWidth:300, maxWidth:380,
      animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      overflow:"hidden",
    }}>
      <div style={{
        width:40, height:40, borderRadius:"50%", flexShrink:0,
        background: isDispatched ? "rgba(14,124,91,0.1)" : "rgba(192,57,43,0.1)",
        border:`1px solid ${isDispatched ? "rgba(14,124,91,0.25)" : "rgba(192,57,43,0.25)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Icon size={17} color={accent} strokeWidth={2} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>
          {isDispatched ? "Order Dispatched" : "Order Rejected"}
        </p>
        <p style={{ margin:0, fontSize:12, color:accent, fontWeight:600 }}>{toast.orderId} · {toast.medicine}</p>
        <p style={{ margin:"2px 0 0", fontSize:11.5, color:C.lilacAsh }}>{toast.pharmacy}</p>
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, overflow:"hidden" }}>
        <div style={{ height:"100%", background:accent, animation:"toastProgress 4s linear forwards" }} />
      </div>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.paleSlate, padding:0, flexShrink:0, display:"flex" }}>
        <X size={15} />
      </button>
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────
function ConfirmModal({ modal, onConfirm, onClose }) {
  const [reason, setReason] = useState("")
  const isAccept = modal.action==="dispatch"
  const accent   = isAccept ? C.success : C.danger
  const Icon     = isAccept ? SendHorizonal : ThumbsDown
  const canSubmit = isAccept || reason.trim().length>0

  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose() }} style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(2,62,138,0.18)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      animation:"fadeIn 0.2s ease both",
    }}>
      <div style={{
        width:"100%", maxWidth:460, borderRadius:20,
        background:C.snow, border:`1.5px solid ${C.paleSlate}`,
        boxShadow:"0 32px 80px rgba(2,62,138,0.18)",
        overflow:"hidden", animation:"modalIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        {/* Top stripe */}
        <div style={{ height:3, background:isAccept
          ? `linear-gradient(90deg, ${C.techBlue}, ${C.success})`
          : `linear-gradient(90deg, ${C.techBlue}, ${C.danger})` }} />

        {/* Header */}
        <div style={{ padding:"24px 26px 18px", borderBottom:`1px solid ${C.paleSlate}` }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
            <div style={{
              width:50, height:50, borderRadius:14, flexShrink:0,
              background: isAccept ? "rgba(14,124,91,0.08)" : "rgba(192,57,43,0.08)",
              border:`1.5px solid ${isAccept ? "rgba(14,124,91,0.22)" : "rgba(192,57,43,0.22)"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Icon size={24} color={accent} strokeWidth={1.8} />
            </div>
            <div style={{ flex:1, paddingTop:2 }}>
              <h3 style={{ margin:"0 0 5px", fontSize:20, fontWeight:800, color:C.blueSlate,
                letterSpacing:"-0.5px", fontFamily:"'Sora',sans-serif" }}>
                {isAccept ? "Dispatch This Order?" : "Reject This Order?"}
              </h3>
              <p style={{ margin:0, fontSize:13, color:C.lilacAsh, lineHeight:1.5 }}>
                {isAccept
                  ? "Confirming will mark this order as dispatched and notify the pharmacy."
                  : "Rejecting is permanent. The pharmacy will be notified immediately."}
              </p>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.paleSlate, display:"flex", padding:0 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ padding:"16px 26px", borderBottom:`1px solid ${C.paleSlate}` }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
            {[
              { label:"Order ID",  value:modal.order.id },
              { label:"Pharmacy",  value:modal.order.pharmacy.split(" ").slice(0,3).join(" ") },
              { label:"Medicine",  value:modal.order.medicine },
              { label:"Quantity",  value:`${modal.order.qty.toLocaleString()} units` },
            ].map((d,i)=>(
              <div key={i} style={{ padding:"9px 12px", borderRadius:9, background:C.white, border:`1px solid ${C.paleSlate}` }}>
                <p style={{ margin:"0 0 2px", fontSize:9.5, fontWeight:700, color:C.lilacAsh, letterSpacing:"0.12em", textTransform:"uppercase" }}>{d.label}</p>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.blueSlate }}>{d.value}</p>
              </div>
            ))}
          </div>
          {!isAccept && (
            <div style={{ marginTop:12 }}>
              <label style={{ fontSize:10, fontWeight:700, color:C.lilacAsh, letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
                Rejection Reason <span style={{ color:C.danger }}>*</span>
              </label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)}
                placeholder="Explain why this order is being rejected..."
                rows={3}
                style={{
                  width:"100%", padding:"10px 13px", borderRadius:9,
                  border:`1.5px solid ${reason.trim() ? C.danger : C.paleSlate}`,
                  background:C.white, color:C.blueSlate, fontSize:13, outline:"none",
                  fontFamily:"inherit", resize:"none", lineHeight:1.6, boxSizing:"border-box",
                  transition:"border-color 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor=C.danger}
                onBlur={e=>e.target.style.borderColor=reason.trim()?C.danger:C.paleSlate}
              />
              {!reason.trim() && (
                <p style={{ margin:"4px 0 0", fontSize:11, color:C.danger, fontWeight:500 }}>A reason is required to reject an order.</p>
              )}
            </div>
          )}
        </div>

        {/* Notice */}
        <div style={{ padding:"12px 26px", borderBottom:`1px solid ${C.paleSlate}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 13px", borderRadius:9,
            background: isAccept ? "rgba(14,124,91,0.06)" : "rgba(192,57,43,0.06)",
            border:`1px solid ${isAccept ? "rgba(14,124,91,0.18)" : "rgba(192,57,43,0.18)"}` }}>
            <ShieldAlert size={13} color={accent} strokeWidth={2} style={{ flexShrink:0 }} />
            <p style={{ margin:0, fontSize:12, color:accent, fontWeight:500, lineHeight:1.5 }}>
              {isAccept
                ? "Stock records will be updated and the pharmacy will receive a dispatch confirmation."
                : "The pharmacy will receive an immediate rejection notification with your reason."}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding:"16px 26px", display:"flex", gap:9, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{
            padding:"9px 20px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
            border:`1.5px solid ${C.paleSlate}`, background:C.white,
            color:C.blueSlate, fontWeight:600, fontSize:13.5, transition:"all 0.2s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
          >Cancel</button>
          <button onClick={()=>{ if(canSubmit) onConfirm(reason) }} disabled={!canSubmit} style={{
            padding:"9px 24px", borderRadius:9,
            cursor:canSubmit?"pointer":"not-allowed",
            border:"none", fontFamily:"inherit", fontWeight:700, fontSize:13.5,
            display:"flex", alignItems:"center", gap:7, transition:"all 0.2s",
            background: !canSubmit ? C.paleSlate : isAccept ? C.success : C.danger,
            color: !canSubmit ? C.lilacAsh : C.snow,
            boxShadow: !canSubmit ? "none" : `0 4px 18px ${accent}30`,
            opacity: !canSubmit ? 0.6 : 1,
          }}
            onMouseEnter={e=>{ if(canSubmit){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 8px 26px ${accent}40` }}}
            onMouseLeave={e=>{ if(canSubmit){ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 4px 18px ${accent}30` }}}
          >
            <Icon size={14} strokeWidth={2.5} />
            {isAccept ? "Confirm Dispatch" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon:Icon, value, label, accent, sub, delay }) {
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

// ── Order Row ─────────────────────────────────────────────────────
function OrderRow({ order, index, expanded, onToggle, onAction }) {
  const [rowHov, setRowHov] = useState(false)
  const [invHov, setInvHov] = useState(false)
  const [rejHov, setRejHov] = useState(false)
  const st     = STATUS_CFG[order.status]
  const StI    = st.icon
  const isOpen = expanded===order.id
  const canAct = CAN_ACT.includes(order.status)
  const initials = order.pharmacy.split(" ").slice(0,2).map(w=>w[0]).join("")

  return (
    <React.Fragment>
      <tr
        onMouseEnter={()=>setRowHov(true)}
        onMouseLeave={()=>setRowHov(false)}
        style={{
          borderBottom:`1px solid ${C.snow}`,
          background: isOpen ? "rgba(2,62,138,0.03)" : rowHov ? "rgba(2,62,138,0.02)" : C.white,
          transition:"background 0.15s",
          animation:`fadeUp 0.4s ease ${index*0.04}s both`,
          position:"relative",
        }}
      >
        {/* ID */}
        <td style={{ padding:"13px 16px 13px 22px", whiteSpace:"nowrap", position:"relative" }}>
          {(rowHov || isOpen) && (
            <div style={{
              position:"absolute", left:0, top:"15%", bottom:"15%",
              width:3, borderRadius:"0 3px 3px 0",
              background: isOpen ? C.lilacAsh : C.techBlue,
              pointerEvents:"none",
            }} />
          )}
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {order.priority==="urgent" && (
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.danger,
                boxShadow:`0 0 5px ${C.danger}80`, flexShrink:0 }} />
            )}
            <span style={{ fontSize:12, fontWeight:700, color:C.lilacAsh, fontFamily:"'Sora',sans-serif" }}>{order.id}</span>
          </div>
        </td>

        {/* Pharmacy */}
        <td style={{ padding:"13px 16px", minWidth:200 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:9, flexShrink:0,
              background: rowHov||isOpen ? `linear-gradient(135deg, ${C.techBlue}, #3d74c4)` : `linear-gradient(135deg, ${C.paleSlate}, ${C.lilacAsh})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:C.snow, fontWeight:700, fontSize:11,
              border:`1.5px solid ${rowHov||isOpen ? C.techBlue+"40" : C.paleSlate}`,
              transition:"all 0.2s",
              boxShadow: rowHov||isOpen ? "0 4px 14px rgba(2,62,138,0.2)" : "none",
              fontFamily:"'Sora',sans-serif", letterSpacing:"0.5px",
            }}>{initials}</div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:600,
                color: rowHov||isOpen ? C.techBlue : C.blueSlate,
                whiteSpace:"nowrap", transition:"color 0.15s" }}>{order.pharmacy}</p>
              <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:1 }}>
                <MapPin size={9} color={C.lilacAsh} />
                <span style={{ fontSize:11, color:C.lilacAsh }}>{order.location.split(",")[0]}</span>
              </div>
            </div>
          </div>
        </td>

        {/* Medicine */}
        <td style={{ padding:"13px 16px", minWidth:180 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Pill size={13} color={C.lilacAsh} strokeWidth={1.8} />
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.blueSlate, whiteSpace:"nowrap" }}>{order.medicine}</p>
              <span style={{ fontSize:10.5, fontWeight:600, padding:"1px 7px", borderRadius:99,
                background:"rgba(76,110,245,0.08)", color:C.lilacAsh, border:"1px solid rgba(76,110,245,0.18)" }}>
                {order.category}
              </span>
            </div>
          </div>
        </td>

        {/* Qty */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:14, fontWeight:700, color:C.techBlue, fontFamily:"'Sora',sans-serif" }}>{order.qty.toLocaleString()}</span>
          <span style={{ fontSize:10.5, color:C.lilacAsh, marginLeft:3 }}>units</span>
        </td>

        {/* Value */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:C.techBlue, fontFamily:"'Sora',sans-serif" }}>
            {totalVal(order).toLocaleString()}
          </span>
          <span style={{ fontSize:10.5, color:C.lilacAsh, marginLeft:3 }}>LKR</span>
        </td>

        {/* Status */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5,
            background:st.bg, borderRadius:99, padding:"4px 10px", border:`1px solid ${st.border}` }}>
            <StI size={10} color={st.color} strokeWidth={2} />
            <span style={{ fontSize:11, fontWeight:700, color:st.color }}>{st.label}</span>
          </div>
        </td>

        {/* Priority */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          {order.priority==="urgent" ? (
            <div style={{ display:"inline-flex", alignItems:"center", gap:4,
              background:"rgba(192,57,43,0.07)", borderRadius:99, padding:"3px 9px",
              border:"1px solid rgba(192,57,43,0.2)" }}>
              <AlertTriangle size={9} color={C.danger} strokeWidth={2.5} />
              <span style={{ fontSize:10.5, fontWeight:700, color:C.danger }}>Urgent</span>
            </div>
          ) : (
            <span style={{ fontSize:11, color:C.paleSlate }}>—</span>
          )}
        </td>

        {/* Date */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:500 }}>{fmtDate(order.orderedAt)}</span>
        </td>

        {/* Actions */}
        <td style={{ padding:"13px 22px 13px 16px", whiteSpace:"nowrap" }}>
          <div style={{ display:"flex", gap:7, alignItems:"center" }}>
            {canAct && (
              <>
                <button
                  onMouseEnter={()=>setInvHov(true)} onMouseLeave={()=>setInvHov(false)}
                  onClick={()=>onAction(order,"dispatch")}
                  style={{
                    padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:`1.5px solid ${invHov ? C.success : "rgba(14,124,91,0.25)"}`,
                    background: invHov ? C.success : "rgba(14,124,91,0.06)",
                    color: invHov ? C.snow : C.success,
                    fontWeight:600, fontSize:12, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:5,
                    transform: invHov ? "translateY(-1px)" : "none",
                    boxShadow: invHov ? "0 4px 14px rgba(14,124,91,0.22)" : "none",
                  }}
                ><SendHorizonal size={11} strokeWidth={2.5} /> Dispatch</button>

                <button
                  onMouseEnter={()=>setRejHov(true)} onMouseLeave={()=>setRejHov(false)}
                  onClick={()=>onAction(order,"reject")}
                  style={{
                    padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:`1.5px solid ${rejHov ? C.danger : "rgba(192,57,43,0.22)"}`,
                    background: rejHov ? "rgba(192,57,43,0.08)" : "rgba(192,57,43,0.04)",
                    color: rejHov ? C.danger : "rgba(192,57,43,0.7)",
                    fontWeight:600, fontSize:12, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:5,
                    transform: rejHov ? "translateY(-1px)" : "none",
                    boxShadow: rejHov ? "0 4px 14px rgba(192,57,43,0.15)" : "none",
                  }}
                ><ThumbsDown size={11} strokeWidth={2.5} /> Reject</button>
              </>
            )}
            {order.status==="dispatched" && (
              <div style={{ display:"flex", alignItems:"center", gap:5,
                background:"rgba(14,124,91,0.07)", borderRadius:99, padding:"4px 11px",
                border:"1px solid rgba(14,124,91,0.2)" }}>
                <SendHorizonal size={10} color={C.success} />
                <span style={{ fontSize:11, fontWeight:700, color:C.success }}>Dispatched</span>
              </div>
            )}
            {order.status==="rejected" && (
              <div style={{ display:"flex", alignItems:"center", gap:5,
                background:"rgba(192,57,43,0.07)", borderRadius:99, padding:"4px 11px",
                border:"1px solid rgba(192,57,43,0.2)" }}>
                <ThumbsDown size={10} color={C.danger} />
                <span style={{ fontSize:11, fontWeight:700, color:C.danger }}>Rejected</span>
              </div>
            )}
            <button onClick={()=>onToggle(order.id)} style={{
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
              <Eye size={11} strokeWidth={2} />
              {isOpen ? "Hide" : "View"}
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
              animation:"fadeUp 0.25s ease both",
            }}>
              {/* Status timeline */}
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
                {["pending","processing","in_transit","delivered"].map((s,i)=>{
                  const steps   = ["pending","processing","in_transit","delivered"]
                  const currIdx = steps.indexOf(order.status)
                  const done    = i<=currIdx && !["cancelled","rejected","dispatched"].includes(order.status)
                  const S  = STATUS_CFG[s]
                  const SI = S.icon
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        <div style={{
                          width:32, height:32, borderRadius:"50%",
                          background: done ? S.bg : C.white,
                          border:`1.5px solid ${done ? S.border : C.paleSlate}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          <SI size={13} color={done ? S.color : C.paleSlate} strokeWidth={2} />
                        </div>
                        <span style={{ fontSize:9.5, fontWeight:700, textTransform:"uppercase",
                          letterSpacing:"0.08em", whiteSpace:"nowrap",
                          color: done ? S.color : C.paleSlate }}>{S.label}</span>
                      </div>
                      {i<3 && (
                        <div style={{
                          flex:1, height:2, borderRadius:99, marginBottom:20,
                          background: i<currIdx && !["cancelled","rejected"].includes(order.status)
                            ? C.techBlue : C.paleSlate,
                          transition:"background 0.3s",
                        }} />
                      )}
                    </React.Fragment>
                  )
                })}

                {["dispatched","rejected","cancelled"].includes(order.status) && (
                  <div style={{
                    marginLeft:12, display:"flex", alignItems:"center", gap:6,
                    borderRadius:99, padding:"5px 14px",
                    background: order.status==="dispatched" ? "rgba(14,124,91,0.08)" : "rgba(192,57,43,0.08)",
                    border:`1px solid ${order.status==="dispatched" ? "rgba(14,124,91,0.25)" : "rgba(192,57,43,0.22)"}`,
                  }}>
                    {order.status==="dispatched" && <SendHorizonal size={11} color={C.success} />}
                    {order.status==="rejected"   && <ThumbsDown    size={11} color={C.danger} />}
                    {order.status==="cancelled"  && <Ban            size={11} color={C.danger} />}
                    <span style={{ fontSize:11.5, fontWeight:700,
                      color: order.status==="dispatched" ? C.success : C.danger }}>
                      Order {order.status.charAt(0).toUpperCase()+order.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Detail grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>
                {[
                  { icon:ClipboardList, label:"Order ID",   value:order.id },
                  { icon:Building2,    label:"Pharmacy",    value:order.pharmacy },
                  { icon:Pill,         label:"Medicine",    value:order.medicine },
                  { icon:Hash,         label:"Quantity",    value:`${order.qty.toLocaleString()} units` },
                  { icon:DollarSign,   label:"Unit Price",  value:`LKR ${order.unitPrice.toLocaleString()}` },
                  { icon:DollarSign,   label:"Total Value", value:`LKR ${totalVal(order).toLocaleString()}` },
                  { icon:Calendar,     label:"Ordered",     value:fmtDate(order.orderedAt) },
                  { icon:Calendar,     label:"Delivered",   value:fmtDate(order.deliveredAt) },
                ].map((d,i)=>(
                  <div key={i} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <d.icon size={10} color={C.lilacAsh} strokeWidth={2} />
                      <span style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                        letterSpacing:"0.12em", textTransform:"uppercase" }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, color:C.blueSlate }}>{d.value}</span>
                  </div>
                ))}

                {order.notes && (
                  <div style={{ gridColumn:"1/-1", paddingTop:14, borderTop:`1px solid ${C.paleSlate}`,
                    display:"flex", flexDirection:"column", gap:4 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>Notes</span>
                    <span style={{ fontSize:13, color:C.warn, fontWeight:500 }}>{order.notes}</span>
                  </div>
                )}

                {order.rejectionReason && (
                  <div style={{ gridColumn:"1/-1", paddingTop:14, borderTop:`1px solid ${C.paleSlate}`,
                    display:"flex", flexDirection:"column", gap:4 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:C.danger,
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>Rejection Reason</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8,
                      padding:"10px 14px", borderRadius:8,
                      background:"rgba(192,57,43,0.05)", border:"1px solid rgba(192,57,43,0.18)" }}>
                      <ThumbsDown size={13} color={C.danger} strokeWidth={2} style={{ flexShrink:0 }} />
                      <span style={{ fontSize:13, color:C.danger, fontWeight:500 }}>{order.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {canAct && (
                  <div style={{
                    gridColumn:"1/-1", paddingTop:16,
                    borderTop:`1.5px solid ${C.paleSlate}`,
                    display:"flex", alignItems:"center", gap:10,
                  }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:C.lilacAsh,
                      letterSpacing:"0.12em", textTransform:"uppercase", marginRight:4 }}>
                      Actions
                    </span>
                    <button
                      onClick={()=>onAction(order,"dispatch")}
                      style={{
                        padding:"9px 20px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                        border:"1.5px solid rgba(14,124,91,0.3)",
                        background:"rgba(14,124,91,0.07)",
                        color:C.success,
                        fontWeight:600, fontSize:13, transition:"all 0.2s",
                        display:"flex", alignItems:"center", gap:7,
                      }}
                      onMouseEnter={e=>{
                        e.currentTarget.style.background=C.success
                        e.currentTarget.style.borderColor=C.success
                        e.currentTarget.style.color=C.snow
                        e.currentTarget.style.transform="translateY(-1px)"
                        e.currentTarget.style.boxShadow="0 6px 18px rgba(14,124,91,0.28)"
                      }}
                      onMouseLeave={e=>{
                        e.currentTarget.style.background="rgba(14,124,91,0.07)"
                        e.currentTarget.style.borderColor="rgba(14,124,91,0.3)"
                        e.currentTarget.style.color=C.success
                        e.currentTarget.style.transform="none"
                        e.currentTarget.style.boxShadow="none"
                      }}
                    >
                      <SendHorizonal size={14} strokeWidth={2.2} />
                      Dispatch Order
                    </button>
                    <button
                      onClick={()=>onAction(order,"reject")}
                      style={{
                        padding:"9px 20px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                        border:"1.5px solid rgba(192,57,43,0.25)",
                        background:"rgba(192,57,43,0.05)",
                        color:C.danger,
                        fontWeight:600, fontSize:13, transition:"all 0.2s",
                        display:"flex", alignItems:"center", gap:7,
                      }}
                      onMouseEnter={e=>{
                        e.currentTarget.style.background="rgba(192,57,43,0.1)"
                        e.currentTarget.style.borderColor=C.danger
                        e.currentTarget.style.transform="translateY(-1px)"
                        e.currentTarget.style.boxShadow="0 6px 18px rgba(192,57,43,0.18)"
                      }}
                      onMouseLeave={e=>{
                        e.currentTarget.style.background="rgba(192,57,43,0.05)"
                        e.currentTarget.style.borderColor="rgba(192,57,43,0.25)"
                        e.currentTarget.style.transform="none"
                        e.currentTarget.style.boxShadow="none"
                      }}
                    >
                      <ThumbsDown size={14} strokeWidth={2.2} />
                      Reject Order
                    </button>
                    <span style={{ fontSize:12, color:C.lilacAsh, marginLeft:4 }}>
                      Order placed {fmtDate(order.orderedAt)} ·{" "}
                      {order.priority==="urgent"
                        ? <span style={{ color:C.danger, fontWeight:600 }}>⚡ Urgent</span>
                        : "Normal priority"}
                    </span>
                  </div>
                )}

                {(order.status==="dispatched" || order.status==="rejected" || order.status==="cancelled") && (
                  <div style={{
                    gridColumn:"1/-1", paddingTop:16,
                    borderTop:`1.5px solid ${C.paleSlate}`,
                    display:"flex", alignItems:"center", gap:10,
                  }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:8,
                      padding:"9px 18px", borderRadius:9,
                      background: order.status==="dispatched" ? "rgba(14,124,91,0.07)" : "rgba(192,57,43,0.06)",
                      border:`1.5px solid ${order.status==="dispatched" ? "rgba(14,124,91,0.22)" : "rgba(192,57,43,0.2)"}`,
                    }}>
                      {order.status==="dispatched" && <SendHorizonal size={14} color={C.success} strokeWidth={2} />}
                      {order.status==="rejected"   && <ThumbsDown    size={14} color={C.danger}  strokeWidth={2} />}
                      {order.status==="cancelled"  && <Ban            size={14} color={C.danger}  strokeWidth={2} />}
                      <span style={{ fontSize:13, fontWeight:700,
                        color: order.status==="dispatched" ? C.success : C.danger }}>
                        This order has been {order.status} — no further actions available.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function PharmacyOrders() {
  const [orderData,    setOrderData]    = useState(INITIAL_ORDERS)
  const [search,       setSearch]       = useState("")
  const [pharmFilter,  setPharmFilter]  = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [catFilter,    setCatFilter]    = useState("All")
  const [prioFilter,   setPrioFilter]   = useState("All")
  const [sortKey,      setSortKey]      = useState("orderedAt")
  const [sortDir,      setSortDir]      = useState("desc")
  const [page,         setPage]         = useState(1)
  const [expanded,     setExpanded]     = useState(null)
  const [showFilters,  setShowFilters]  = useState(false)
  const [modal,        setModal]        = useState(null)
  const [toast,        setToast]        = useState(null)
  const [focusSearch,  setFocusSearch]  = useState(false)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const PER_PAGE = 8

  const handleSort    = (key) => { if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(key); setSortDir("asc") } }
  const handleAction  = (order,action) => setModal({order,action})
  const handleConfirm = (reason) => {
    const { order, action } = modal
    const newStatus = action==="dispatch" ? "dispatched" : "rejected"
    setOrderData(prev => prev.map(o =>
      o.id===order.id ? { ...o, status:newStatus, rejectionReason:action==="reject"?reason:undefined } : o
    ))
    setToast({ type:newStatus, orderId:order.id, medicine:order.medicine, pharmacy:order.pharmacy })
    setModal(null)
  }

  const filtered = useMemo(()=>{
    return orderData
      .filter(o =>
        (o.id.toLowerCase().includes(search.toLowerCase()) ||
         o.pharmacy.toLowerCase().includes(search.toLowerCase()) ||
         o.medicine.toLowerCase().includes(search.toLowerCase())) &&
        (pharmFilter==="All"  || o.pharmacy===pharmFilter) &&
        (statusFilter==="All" || o.status===statusFilter) &&
        (catFilter==="All"    || o.category===catFilter) &&
        (prioFilter==="All"   || o.priority===prioFilter)
      )
      .sort((a,b)=>{
        let av=a[sortKey], bv=b[sortKey]
        if(sortKey==="orderedAt"||sortKey==="deliveredAt"){ av=av?new Date(av).getTime():0; bv=bv?new Date(bv).getTime():0 }
        if(typeof av==="string"){av=av.toLowerCase();bv=bv.toLowerCase()}
        return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1)
      })
  },[orderData,search,pharmFilter,statusFilter,catFilter,prioFilter,sortKey,sortDir])

  const totalPages    = Math.ceil(filtered.length/PER_PAGE)
  const pageData      = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const activeFilters = [pharmFilter,statusFilter,catFilter,prioFilter].filter(f=>f!=="All").length

  const stats = {
    total:      orderData.length,
    pending:    orderData.filter(o=>o.status==="pending").length,
    inTransit:  orderData.filter(o=>o.status==="in_transit").length,
    dispatched: orderData.filter(o=>o.status==="dispatched").length,
    urgent:     orderData.filter(o=>o.priority==="urgent").length,
    totalValue: orderData.reduce((s,o)=>s+totalVal(o),0),
  }

  const thStyle = {
    padding:"10px 16px", textAlign:"left", fontWeight:700, fontSize:9.5,
    letterSpacing:"0.13em", textTransform:"uppercase", color:C.lilacAsh,
    whiteSpace:"nowrap", borderBottom:`1.5px solid ${C.paleSlate}`,
    background:C.snow,
  }

  const SortIcon = ({col}) => {
    if(sortKey!==col) return <ArrowUpDown size={10} color={C.paleSlate}/>
    return sortDir==="asc" ? <ChevronUp size={10} color={C.techBlue}/> : <ChevronDown size={10} color={C.techBlue}/>
  }

  const ColHead = ({col,label,style={}}) => (
    <th onClick={()=>handleSort(col)}
      style={{...thStyle,cursor:"pointer",userSelect:"none",transition:"color 0.15s",...style}}
      onMouseEnter={e=>e.currentTarget.style.color=C.techBlue}
      onMouseLeave={e=>e.currentTarget.style.color=C.lilacAsh}
    >
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>{label}<SortIcon col={col}/></div>
    </th>
  )

  return (
    <>
      <div style={{ minHeight:"100vh", background:C.snow, fontFamily:"'DM Sans',sans-serif", padding:"36px 40px 56px", position:"relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          * { box-sizing:border-box; }
          ::-webkit-scrollbar { width:4px; height:4px; }
          ::-webkit-scrollbar-thumb { background:${C.paleSlate}; border-radius:99px; }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes modalIn { from{opacity:0;transform:scale(0.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
          @keyframes toastProgress { from{width:100%} to{width:0%} }
          input::placeholder,textarea::placeholder { color:${C.lilacAsh}; opacity:0.55; }
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
                    boxShadow:"0 4px 12px rgba(2,62,138,0.28)" }}>
                    <ShoppingCart size={14} color={C.snow} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:400 }}>MediReach</span>
                  <ChevronRight size={11} color={C.paleSlate} />
                  <span style={{ fontSize:11.5, color:C.techBlue, fontWeight:700,
                    background:"rgba(2,62,138,0.08)", padding:"2px 10px", borderRadius:99,
                    border:"1px solid rgba(2,62,138,0.15)" }}>Pharmacy Orders</span>
                </div>
                <h1 style={{ margin:0, fontSize:32, fontWeight:700, letterSpacing:"-1.4px",
                  color:C.blueSlate, lineHeight:1.1, fontFamily:"'Sora',sans-serif" }}>Order Management</h1>
                <p style={{ margin:"7px 0 0", color:C.lilacAsh, fontSize:14 }}>
                  Review, dispatch or reject medicine orders from the pharmacy network
                </p>
              </div>
              <div style={{ display:"flex", gap:9, flexShrink:0 }}>
                <button style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  border:`1.5px solid ${C.paleSlate}`, background:C.white, color:C.blueSlate,
                  fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
                ><RefreshCw size={13} strokeWidth={2}/> Refresh</button>
                <button onClick={()=>setShowReportGenerator(true)} style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  border:"none", background:C.techBlue, color:C.snow, fontWeight:600, fontSize:13,
                  display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
                  boxShadow:"0 4px 18px rgba(2,62,138,0.28)" }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 26px rgba(2,62,138,0.38)" }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 18px rgba(2,62,138,0.28)" }}
                ><Download size={13} strokeWidth={2}/> Export</button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease 0.05s both" }}>
            <StatCard icon={ClipboardList} value={stats.total}      label="Total Orders" sub="All time"        delay="0.07s" />
            <StatCard icon={Hourglass}     value={stats.pending}    label="Pending"      sub="Awaiting action" delay="0.1s"  />
            <StatCard icon={Truck}         value={stats.inTransit}  label="In Transit"   sub="On the way"      delay="0.13s" />
            <StatCard icon={SendHorizonal} value={stats.dispatched} label="Dispatched"   sub="Confirmed"       delay="0.16s" />
            <StatCard icon={AlertTriangle} value={stats.urgent}     label="Urgent"       sub="Need attention"  delay="0.19s" />
          </div>

          {/* Value strip */}
          <div style={{ padding:"11px 18px", borderRadius:10, marginBottom:20,
            background:C.white, border:`1.5px solid ${C.paleSlate}`,
            display:"flex", alignItems:"center", gap:10, animation:"fadeUp 0.4s ease 0.1s both",
            boxShadow:"0 2px 8px rgba(2,62,138,0.05)" }}>
            <TrendingUp size={14} color={C.techBlue} />
            <span style={{ fontSize:13, color:C.lilacAsh, fontWeight:500 }}>Total order value:</span>
            <span style={{ fontSize:16, fontWeight:800, color:C.techBlue,
              fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
              LKR {stats.totalValue.toLocaleString()}
            </span>
          </div>

          {/* Search + filters */}
          <div style={{ marginBottom:14, animation:"fadeUp 0.4s ease 0.12s both" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:1, minWidth:220 }}>
                <Search size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}
                  color={focusSearch ? C.techBlue : C.lilacAsh} />
                <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
                  placeholder="Search by order ID, pharmacy or medicine..."
                  onFocus={()=>setFocusSearch(true)} onBlur={()=>setFocusSearch(false)}
                  style={{ width:"100%", padding:"9px 14px 9px 33px", borderRadius:9,
                    border:`1.5px solid ${focusSearch ? C.techBlue : C.paleSlate}`,
                    background:C.white, fontSize:13, outline:"none", fontFamily:"inherit", color:C.blueSlate,
                    transition:"border-color 0.2s",
                    boxShadow: focusSearch ? "0 0 0 3px rgba(2,62,138,0.08)" : "none" }}
                />
              </div>

              {/* Status pills */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {["All","pending","in_transit","dispatched","rejected","cancelled"].map(s=>{
                  const cfg = s==="All" ? null : STATUS_CFG[s]
                  const active = statusFilter===s
                  return (
                    <button key={s} onClick={()=>{ setStatusFilter(s); setPage(1) }} style={{
                      padding:"7px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                      border:`1.5px solid ${active ? (cfg ? cfg.border : C.techBlue) : C.paleSlate}`,
                      background: active ? (cfg ? cfg.bg : "rgba(2,62,138,0.07)") : C.white,
                      color: active ? (cfg ? cfg.color : C.techBlue) : C.blueSlate,
                      fontWeight:600, fontSize:11.5, transition:"all 0.15s",
                      display:"flex", alignItems:"center", gap:5,
                      boxShadow: active ? "0 2px 8px rgba(2,62,138,0.1)" : "none",
                    }}>
                      {cfg && <cfg.icon size={10} strokeWidth={2.5}/>}
                      {s==="All" ? "All" : STATUS_CFG[s].label}
                    </button>
                  )
                })}
              </div>

              <button onClick={()=>setShowFilters(f=>!f)} style={{
                padding:"8px 14px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                border:`1.5px solid ${showFilters ? C.techBlue : C.paleSlate}`,
                background: showFilters ? "rgba(2,62,138,0.07)" : C.white,
                color: showFilters ? C.techBlue : C.blueSlate,
                fontWeight:600, fontSize:12.5, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
                <Filter size={12} strokeWidth={2}/>
                {activeFilters>0 && (
                  <span style={{ width:15, height:15, borderRadius:"50%", background:C.techBlue,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, fontWeight:800, color:C.snow }}>{activeFilters}</span>
                )}
              </button>
              <span style={{ fontSize:12, color:C.lilacAsh }}>{filtered.length} of {orderData.length} orders</span>
            </div>

            {showFilters && (
              <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap",
                padding:"14px 16px", borderRadius:10,
                background:C.white, border:`1.5px solid ${C.paleSlate}`,
                boxShadow:"0 2px 12px rgba(2,62,138,0.06)",
                animation:"fadeUp 0.25s ease both" }}>
                {[
                  { label:"Pharmacy", val:pharmFilter, set:setPharmFilter, opts:pharmacies },
                  { label:"Category", val:catFilter,   set:setCatFilter,   opts:categories },
                  { label:"Priority", val:prioFilter,  set:setPrioFilter,  opts:["All","urgent","normal"] },
                ].map(f=>(
                  <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    <label style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>{f.label}</label>
                    <select value={f.val} onChange={e=>{ f.set(e.target.value); setPage(1) }} style={{
                      padding:"7px 28px 7px 10px", borderRadius:8,
                      border:`1.5px solid ${C.paleSlate}`, background:C.snow,
                      color:C.blueSlate, fontSize:12.5, outline:"none", fontFamily:"inherit",
                      cursor:"pointer", minWidth:160, appearance:"none", WebkitAppearance:"none",
                      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234C6EF5' stroke-opacity='.5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center" }}>
                      {f.opts.map(o=><option key={o} value={o}>{o==="All"?`All ${f.label}s`:o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ display:"flex", alignItems:"flex-end" }}>
                  <button onClick={()=>{ setPharmFilter("All"); setCatFilter("All"); setPrioFilter("All"); setStatusFilter("All"); setPage(1) }} style={{
                    padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:"1.5px solid rgba(192,57,43,0.22)", background:"rgba(192,57,43,0.05)",
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
                    <ColHead col="id"        label="Order ID" style={{ paddingLeft:22 }} />
                    <ColHead col="pharmacy"  label="Pharmacy" />
                    <ColHead col="medicine"  label="Medicine" />
                    <ColHead col="qty"       label="Qty" />
                    <ColHead col="unitPrice" label="Value" />
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Priority</th>
                    <ColHead col="orderedAt" label="Ordered" />
                    <th style={{ ...thStyle, paddingRight:22 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length===0 ? (
                    <tr><td colSpan={9} style={{ padding:"64px", textAlign:"center" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                        <div style={{ width:52, height:52, borderRadius:14, background:C.white,
                          border:`1.5px solid ${C.paleSlate}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <ShoppingCart size={22} color={C.lilacAsh} />
                        </div>
                        <p style={{ margin:0, fontSize:15, fontWeight:600, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>No orders found</p>
                        <p style={{ margin:0, fontSize:12.5, color:C.lilacAsh }}>Try adjusting your search or filters</p>
                      </div>
                    </td></tr>
                  ) : pageData.map((order,idx)=>(
                    <OrderRow key={order.id} order={order} index={idx}
                      expanded={expanded}
                      onToggle={id=>setExpanded(e=>e===id?null:id)}
                      onAction={handleAction}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages>1 && (
              <div style={{ padding:"12px 22px", borderTop:`1.5px solid ${C.paleSlate}`,
                background:C.snow, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:C.lilacAsh }}>
                  Page {page} of {totalPages} · {filtered.length} results
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{
                    width:32, height:32, borderRadius:8, cursor:page===1?"not-allowed":"pointer",
                    border:`1.5px solid ${C.paleSlate}`, background:C.white,
                    color:page===1?C.paleSlate:C.lilacAsh,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <ChevronLeft size={14} strokeWidth={2.5}/>
                  </button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setPage(p)} style={{
                      width:32, height:32, borderRadius:8, cursor:"pointer",
                      border:`1.5px solid ${p===page?C.techBlue:C.paleSlate}`,
                      background:p===page?C.techBlue:C.white,
                      color:p===page?C.snow:C.blueSlate,
                      fontWeight:700, fontSize:12.5, fontFamily:"'Sora',sans-serif",
                      boxShadow:p===page?"0 4px 14px rgba(2,62,138,0.25)":"none",
                      transition:"all 0.15s" }}>{p}</button>
                  ))}
                  <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{
                    width:32, height:32, borderRadius:8, cursor:page===totalPages?"not-allowed":"pointer",
                    border:`1.5px solid ${C.paleSlate}`, background:C.white,
                    color:page===totalPages?C.paleSlate:C.lilacAsh,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <ChevronRight size={14} strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modals & Toasts — outside main div, inside fragment */}
      {modal && <ConfirmModal modal={modal} onConfirm={handleConfirm} onClose={()=>setModal(null)} />}
      {toast && <Toast toast={toast} onClose={()=>setToast(null)} />}

      {showReportGenerator && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(4,18,38,0.55)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"fadeUp 0.2s ease both",
        }}>
          <div style={{
            width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto",
            borderRadius:18, background:C.snow, border:`1.5px solid ${C.paleSlate}`,
            boxShadow:"0 32px 80px rgba(2,62,138,0.22)",
            animation:"fadeUp 0.25s ease both",
          }}>
            <div style={{
              padding:"24px 28px 20px", borderBottom:`1px solid ${C.paleSlate}`,
              display:"flex", alignItems:"center", justifyContent:"space-between"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:40, height:40, borderRadius:10,
                  background:`${C.techBlue}15`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <FileText size={20} color={C.techBlue} strokeWidth={2} />
                </div>
                <div>
                  <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:C.blueSlate }}>
                    Generate Report
                  </h3>
                  <p style={{ margin:"2px 0 0", fontSize:12, color:C.lilacAsh }}>
                    Download order reports in PDF or JSON format
                  </p>
                </div>
              </div>
              <button
                onClick={()=>setShowReportGenerator(false)}
                style={{
                  width:32, height:32, borderRadius:8,
                  border:`1.5px solid ${C.paleSlate}`, background:C.white,
                  color:C.lilacAsh, cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.lilacAsh }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <ReportGenerator
                type="orders"
                filters={{
                  pharmacy: pharmFilter==="All" ? "" : pharmFilter,
                  status:   statusFilter==="All" ? "" : statusFilter,
                  priority: prioFilter==="All" ? "" : prioFilter
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}