import React, { useState, useMemo, useEffect } from 'react'
import {
  Search, Filter, ShoppingCart, Clock, Building2,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  ArrowUpDown, RefreshCw, Download, Eye,
  XCircle, AlertTriangle, Truck, CheckCircle2,
  DollarSign, Hash, Calendar, MapPin,
  Pill, TrendingUp, ClipboardList,
  Hourglass, Ban, CircleDot, X,
  ShieldAlert, SendHorizonal, ThumbsDown
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
  purple: "#a78bfa",
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
  pending:    { label:"Pending",    color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  icon:Hourglass    },
  processing: { label:"Processing", color:C.sky,     bg:"rgba(0,180,216,0.1)",   border:"rgba(0,180,216,0.25)",   icon:CircleDot    },
  in_transit: { label:"In Transit", color:C.purple,  bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.25)", icon:Truck        },
  delivered:  { label:"Delivered",  color:C.green,   bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.25)",   icon:CheckCircle2 },
  cancelled:  { label:"Cancelled",  color:C.danger,  bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",   icon:Ban          },
  dispatched: { label:"Dispatched", color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)",  icon:SendHorizonal},
  rejected:   { label:"Rejected",   color:"#fb7185", bg:"rgba(251,113,133,0.1)", border:"rgba(251,113,133,0.25)", icon:ThumbsDown   },
}

const CAN_ACT    = ["pending","processing","in_transit"]
const pharmacies = ["All", ...new Set(INITIAL_ORDERS.map(o => o.pharmacy))]
const categories = ["All", ...new Set(INITIAL_ORDERS.map(o => o.category))]
const fmtDate    = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"
const totalVal   = (o) => o.qty * o.unitPrice

// ─────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const isDispatched = toast.type === "dispatched"
  const accent = isDispatched ? C.green : C.danger
  const Icon   = isDispatched ? SendHorizonal : ThumbsDown

  return (
    <div style={{
      position:"fixed", bottom:32, right:32, zIndex:1000,
      display:"flex", alignItems:"flex-start", gap:14,
      padding:"16px 20px 18px", borderRadius:16,
      background: isDispatched
        ? "linear-gradient(135deg,rgba(34,197,94,0.14),rgba(52,211,153,0.07))"
        : "linear-gradient(135deg,rgba(239,68,68,0.14),rgba(251,113,133,0.07))",
      border:`1px solid ${accent}35`,
      boxShadow:`0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${accent}12`,
      backdropFilter:"blur(20px)",
      minWidth:320, maxWidth:400,
      animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      overflow:"hidden",
    }}>
      <div style={{
        width:42, height:42, borderRadius:"50%", flexShrink:0,
        background:`${accent}18`, border:`1px solid ${accent}35`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 0 20px ${accent}30`,
      }}>
        <Icon size={18} color={accent} strokeWidth={2} />
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{
          margin:"0 0 3px", fontSize:14.5, fontWeight:700,
          color:C.white, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.2px",
        }}>
          {isDispatched ? "Order Dispatched" : "Order Rejected"}
        </p>
        <p style={{ margin:0, fontSize:12.5, color:`${accent}cc`, fontWeight:500 }}>
          {toast.orderId} · {toast.medicine}
        </p>
        <p style={{ margin:"3px 0 0", fontSize:12, color:"rgba(144,224,239,0.4)" }}>
          {toast.pharmacy}
        </p>
      </div>

      {/* Countdown bar */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:2, overflow:"hidden",
      }}>
        <div style={{
          height:"100%",
          background:`linear-gradient(90deg, ${accent}, ${accent}55)`,
          animation:"toastProgress 4s linear forwards",
        }} />
      </div>

      <button onClick={onClose} style={{
        background:"none", border:"none", cursor:"pointer",
        color:"rgba(144,224,239,0.3)", padding:0, flexShrink:0,
        display:"flex", alignItems:"flex-start", paddingTop:2, transition:"color 0.2s",
      }}
        onMouseEnter={e=>e.currentTarget.style.color="rgba(144,224,239,0.7)"}
        onMouseLeave={e=>e.currentTarget.style.color="rgba(144,224,239,0.3)"}
      >
        <X size={15} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────────────────────────
function ConfirmModal({ modal, onConfirm, onClose }) {
  const [reason, setReason] = useState("")
  const isAccept = modal.action === "dispatch"
  const accent   = isAccept ? C.green : C.danger
  const Icon     = isAccept ? SendHorizonal : ThumbsDown
  const canSubmit = isAccept || reason.trim().length > 0

  return (
    <div
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}
      style={{
        position:"fixed", inset:0, zIndex:500,
        background:"rgba(0,0,0,0.72)",
        backdropFilter:"blur(10px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:24,
        animation:"fadeIn 0.2s ease both",
      }}
    >
      <div style={{
        width:"100%", maxWidth:460,
        borderRadius:22,
        background:"linear-gradient(160deg, #040f28 0%, #020c1e 100%)",
        border:`1px solid ${accent}22`,
        boxShadow:`0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px ${accent}08`,
        overflow:"hidden",
        animation:"modalIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>

        {/* Top stripe */}
        <div style={{ height:3, background:`linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)` }} />

        {/* Header */}
        <div style={{ padding:"26px 28px 20px", borderBottom:"1px solid rgba(144,224,239,0.06)" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{
              width:54, height:54, borderRadius:16, flexShrink:0,
              background:`${accent}12`, border:`1px solid ${accent}28`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 8px 28px ${accent}18`,
            }}>
              <Icon size={26} color={accent} strokeWidth={1.8} />
            </div>
            <div style={{ flex:1, paddingTop:2 }}>
              <h3 style={{
                margin:"0 0 6px", fontSize:21, fontWeight:800,
                color:C.white, letterSpacing:"-0.5px",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}>
                {isAccept ? "Dispatch This Order?" : "Reject This Order?"}
              </h3>
              <p style={{ margin:0, fontSize:13, color:"rgba(144,224,239,0.38)", fontWeight:400, lineHeight:1.5 }}>
                {isAccept
                  ? "Confirming will mark this order as dispatched and notify the pharmacy."
                  : "Rejecting is permanent. The pharmacy will be notified immediately."}
              </p>
            </div>
            <button onClick={onClose} style={{
              background:"none", border:"none", cursor:"pointer", flexShrink:0,
              color:"rgba(144,224,239,0.22)", display:"flex", padding:0, transition:"color 0.2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.color="rgba(144,224,239,0.6)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(144,224,239,0.22)"}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ padding:"18px 28px", borderBottom:"1px solid rgba(144,224,239,0.06)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Order ID",  value:modal.order.id },
              { label:"Pharmacy",  value:modal.order.pharmacy.split(" ").slice(0,3).join(" ") },
              { label:"Medicine",  value:modal.order.medicine },
              { label:"Quantity",  value:`${modal.order.qty.toLocaleString()} units` },
            ].map((d,i)=>(
              <div key={i} style={{
                padding:"10px 14px", borderRadius:10,
                background:"rgba(144,224,239,0.025)",
                border:"1px solid rgba(144,224,239,0.07)",
              }}>
                <p style={{ margin:"0 0 3px", fontSize:9.5, fontWeight:700,
                  color:"rgba(144,224,239,0.28)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
                  {d.label}
                </p>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:"rgba(202,240,248,0.85)" }}>
                  {d.value}
                </p>
              </div>
            ))}
          </div>

          {/* Rejection reason textarea */}
          {!isAccept && (
            <div style={{ marginTop:14 }}>
              <label style={{
                fontSize:10, fontWeight:700, color:"rgba(144,224,239,0.35)",
                letterSpacing:"0.12em", textTransform:"uppercase",
                display:"block", marginBottom:7,
              }}>
                Rejection Reason <span style={{ color:"rgba(239,68,68,0.7)" }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={e=>setReason(e.target.value)}
                placeholder="Explain why this order is being rejected..."
                rows={3}
                style={{
                  width:"100%", padding:"11px 14px", borderRadius:10,
                  border:`1px solid ${reason.trim()?"rgba(239,68,68,0.35)":"rgba(144,224,239,0.1)"}`,
                  background:"rgba(255,255,255,0.03)", color:C.white,
                  fontSize:13, outline:"none", fontFamily:"inherit",
                  resize:"none", lineHeight:1.6, boxSizing:"border-box",
                  transition:"border-color 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor="rgba(239,68,68,0.5)"}
                onBlur={e=>e.target.style.borderColor=reason.trim()?"rgba(239,68,68,0.35)":"rgba(144,224,239,0.1)"}
              />
              {!reason.trim() && (
                <p style={{ margin:"5px 0 0", fontSize:11, color:"rgba(239,68,68,0.5)", fontWeight:500 }}>
                  A reason is required to reject an order.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notice */}
        <div style={{ padding:"14px 28px", borderBottom:"1px solid rgba(144,224,239,0.06)" }}>
          <div style={{
            display:"flex", alignItems:"center", gap:9,
            padding:"10px 14px", borderRadius:10,
            background:`${accent}08`, border:`1px solid ${accent}18`,
          }}>
            <ShieldAlert size={14} color={accent} strokeWidth={2} style={{ flexShrink:0 }} />
            <p style={{ margin:0, fontSize:12, color:`${accent}aa`, fontWeight:500, lineHeight:1.5 }}>
              {isAccept
                ? "Stock records will be updated and the pharmacy will receive a dispatch confirmation."
                : "The pharmacy will receive an immediate rejection notification with your reason."}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding:"18px 28px", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{
            padding:"10px 22px", borderRadius:11, cursor:"pointer", fontFamily:"inherit",
            border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
            color:"rgba(202,240,248,0.45)", fontWeight:600, fontSize:13.5, transition:"all 0.2s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.22)"; e.currentTarget.style.color="rgba(202,240,248,0.75)" }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(202,240,248,0.45)" }}
          >
            Cancel
          </button>

          <button
            onClick={()=>{ if(canSubmit) onConfirm(reason) }}
            disabled={!canSubmit}
            style={{
              padding:"10px 26px", borderRadius:11,
              cursor:canSubmit?"pointer":"not-allowed",
              border:"none", fontFamily:"inherit", fontWeight:700, fontSize:13.5,
              display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
              background: !canSubmit
                ? "rgba(144,224,239,0.05)"
                : isAccept
                  ? `linear-gradient(135deg, #16a34a, ${C.green})`
                  : `linear-gradient(135deg, #dc2626, ${C.danger})`,
              color: !canSubmit ? "rgba(144,224,239,0.2)" : C.white,
              boxShadow: !canSubmit ? "none" : `0 6px 22px ${accent}30`,
              opacity: !canSubmit ? 0.5 : 1,
            }}
            onMouseEnter={e=>{ if(canSubmit){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 10px 30px ${accent}42` }}}
            onMouseLeave={e=>{ if(canSubmit){ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 6px 22px ${accent}30` }}}
          >
            <Icon size={15} strokeWidth={2.5} />
            {isAccept ? "Confirm Dispatch" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────
function StatCard({ icon:Icon, value, label, accent, sub }) {
  return (
    <div style={{
      flex:1, padding:"20px 22px", borderRadius:16,
      background:"rgba(255,255,255,0.02)",
      border:`1px solid ${accent}20`, position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", right:-18, bottom:-18, width:80, height:80, borderRadius:"50%",
        background:`radial-gradient(circle, ${accent}18 0%, transparent 70%)`, pointerEvents:"none",
      }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:700, color:"rgba(144,224,239,0.35)",
            letterSpacing:"0.15em", textTransform:"uppercase" }}>{label}</p>
          <p style={{ margin:0, fontSize:34, fontWeight:800, color:C.white, letterSpacing:"-1.5px",
            lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{value}</p>
          {sub && <p style={{ margin:"6px 0 0", fontSize:11, color:"rgba(144,224,239,0.3)" }}>{sub}</p>}
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

// ─────────────────────────────────────────────────────────────────
// Order Row
// ─────────────────────────────────────────────────────────────────
function OrderRow({ order, index, expanded, onToggle, onAction }) {
  const [rowHov, setRowHov] = useState(false)
  const st     = STATUS_CFG[order.status]
  const StI    = st.icon
  const isOpen = expanded === order.id
  const canAct = CAN_ACT.includes(order.status)
  const initials = order.pharmacy.split(" ").slice(0,2).map(w=>w[0]).join("")

  return (
    <React.Fragment>
      <tr
        onMouseEnter={()=>setRowHov(true)}
        onMouseLeave={()=>setRowHov(false)}
        style={{
          borderBottom:"1px solid rgba(144,224,239,0.04)",
          background: isOpen?"rgba(0,180,216,0.04)":rowHov?"rgba(144,224,239,0.02)":"transparent",
          transition:"background 0.15s",
          animation:`fadeUp 0.4s ease ${index*0.04}s both`,
        }}
      >
        {/* ID */}
        <td style={{ padding:"13px 16px 13px 20px", whiteSpace:"nowrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {order.priority==="urgent" && (
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.danger,
                boxShadow:`0 0 6px ${C.danger}`, flexShrink:0 }} />
            )}
            <span style={{ fontSize:12, fontWeight:700, color:"rgba(144,224,239,0.3)",
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{order.id}</span>
          </div>
        </td>

        {/* Pharmacy */}
        <td style={{ padding:"13px 16px", minWidth:200 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:9, flexShrink:0,
              background:`linear-gradient(135deg, ${C.navy}cc, ${C.ocean})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:C.mist, fontWeight:800, fontSize:11,
              border:"1px solid rgba(0,180,216,0.2)",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
            }}>{initials}</div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:600,
                color:rowHov||isOpen?C.white:"rgba(202,240,248,0.85)",
                whiteSpace:"nowrap", transition:"color 0.15s" }}>{order.pharmacy}</p>
              <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:1 }}>
                <MapPin size={9} color="rgba(144,224,239,0.25)" />
                <span style={{ fontSize:11, color:"rgba(144,224,239,0.25)" }}>
                  {order.location.split(",")[0]}
                </span>
              </div>
            </div>
          </div>
        </td>

        {/* Medicine */}
        <td style={{ padding:"13px 16px", minWidth:180 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Pill size={13} color="rgba(0,180,216,0.4)" strokeWidth={1.8} />
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:500,
                color:"rgba(202,240,248,0.75)", whiteSpace:"nowrap" }}>{order.medicine}</p>
              <span style={{
                fontSize:10.5, fontWeight:600, padding:"1px 7px", borderRadius:99,
                background:"rgba(0,180,216,0.07)", color:"rgba(0,180,216,0.6)",
                border:"1px solid rgba(0,180,216,0.12)",
              }}>{order.category}</span>
            </div>
          </div>
        </td>

        {/* Qty */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:14, fontWeight:700, color:C.white,
            fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{order.qty.toLocaleString()}</span>
          <span style={{ fontSize:10.5, color:"rgba(144,224,239,0.3)", marginLeft:3 }}>units</span>
        </td>

        {/* Value */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:C.sky,
            fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {totalVal(order).toLocaleString()}
          </span>
          <span style={{ fontSize:10.5, color:"rgba(144,224,239,0.3)", marginLeft:3 }}>LKR</span>
        </td>

        {/* Status */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:5,
            background:st.bg, borderRadius:99, padding:"4px 10px",
            border:`1px solid ${st.border}`,
          }}>
            <StI size={10} color={st.color} strokeWidth={2} />
            <span style={{ fontSize:11, fontWeight:700, color:st.color }}>{st.label}</span>
          </div>
        </td>

        {/* Priority */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          {order.priority==="urgent" ? (
            <div style={{
              display:"inline-flex", alignItems:"center", gap:4,
              background:"rgba(239,68,68,0.08)", borderRadius:99, padding:"3px 9px",
              border:"1px solid rgba(239,68,68,0.2)",
            }}>
              <AlertTriangle size={9} color={C.danger} strokeWidth={2.5} />
              <span style={{ fontSize:10.5, fontWeight:700, color:C.danger }}>Urgent</span>
            </div>
          ) : (
            <span style={{ fontSize:11, color:"rgba(144,224,239,0.2)" }}>—</span>
          )}
        </td>

        {/* Date */}
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:12, color:"rgba(144,224,239,0.4)", fontWeight:500 }}>
            {fmtDate(order.orderedAt)}
          </span>
        </td>

        {/* Actions */}
        <td style={{ padding:"13px 20px 13px 16px", whiteSpace:"nowrap" }}>
          <div style={{ display:"flex", gap:7, alignItems:"center" }}>

            {canAct && (
              <>
                {/* Dispatch */}
                <button
                  onClick={()=>onAction(order,"dispatch")}
                  style={{
                    padding:"5px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:"1px solid rgba(34,197,94,0.22)",
                    background:"rgba(34,197,94,0.07)",
                    color:"rgba(34,197,94,0.7)",
                    fontWeight:600, fontSize:12, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:5,
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(34,197,94,0.15)"; e.currentTarget.style.borderColor="rgba(34,197,94,0.5)"; e.currentTarget.style.color=C.green; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(34,197,94,0.22)" }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(34,197,94,0.07)"; e.currentTarget.style.borderColor="rgba(34,197,94,0.22)"; e.currentTarget.style.color="rgba(34,197,94,0.7)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none" }}
                >
                  <SendHorizonal size={11} strokeWidth={2.5} />
                  Dispatch
                </button>

                {/* Reject */}
                <button
                  onClick={()=>onAction(order,"reject")}
                  style={{
                    padding:"5px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:"1px solid rgba(239,68,68,0.18)",
                    background:"rgba(239,68,68,0.06)",
                    color:"rgba(239,68,68,0.6)",
                    fontWeight:600, fontSize:12, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:5,
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"; e.currentTarget.style.color=C.danger; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(239,68,68,0.18)" }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.18)"; e.currentTarget.style.color="rgba(239,68,68,0.6)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none" }}
                >
                  <ThumbsDown size={11} strokeWidth={2.5} />
                  Reject
                </button>
              </>
            )}

            {/* Final state badges */}
            {order.status==="dispatched" && (
              <div style={{ display:"flex", alignItems:"center", gap:5,
                background:"rgba(52,211,153,0.08)", borderRadius:99, padding:"4px 11px",
                border:"1px solid rgba(52,211,153,0.2)" }}>
                <SendHorizonal size={10} color="#34d399" strokeWidth={2} />
                <span style={{ fontSize:11, fontWeight:700, color:"#34d399" }}>Dispatched</span>
              </div>
            )}
            {order.status==="rejected" && (
              <div style={{ display:"flex", alignItems:"center", gap:5,
                background:"rgba(251,113,133,0.08)", borderRadius:99, padding:"4px 11px",
                border:"1px solid rgba(251,113,133,0.2)" }}>
                <ThumbsDown size={10} color="#fb7185" strokeWidth={2} />
                <span style={{ fontSize:11, fontWeight:700, color:"#fb7185" }}>Rejected</span>
              </div>
            )}

            {/* View detail */}
            <button
              onClick={()=>onToggle(order.id)}
              style={{
                padding:"5px 11px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                border:`1px solid ${isOpen?"rgba(0,180,216,0.4)":"rgba(144,224,239,0.1)"}`,
                background: isOpen?"rgba(0,180,216,0.1)":"rgba(144,224,239,0.04)",
                color: isOpen?C.sky:"rgba(144,224,239,0.4)",
                fontWeight:600, fontSize:12, transition:"all 0.2s",
                display:"flex", alignItems:"center", gap:5,
              }}
              onMouseEnter={e=>{ if(!isOpen){ e.currentTarget.style.borderColor="rgba(0,180,216,0.3)"; e.currentTarget.style.color=C.sky }}}
              onMouseLeave={e=>{ if(!isOpen){ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(144,224,239,0.4)" }}}
            >
              <Eye size={11} strokeWidth={2} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {isOpen && (
        <tr style={{ borderBottom:"1px solid rgba(144,224,239,0.06)" }}>
          <td colSpan={9} style={{ padding:"0 20px 16px" }}>
            <div style={{
              borderRadius:14, padding:"20px 24px",
              background:"rgba(0,180,216,0.04)",
              border:"1px solid rgba(0,180,216,0.1)",
              animation:"fadeUp 0.25s ease both",
            }}>
              {/* Timeline */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
                {["pending","processing","in_transit","delivered"].map((s,i)=>{
                  const steps    = ["pending","processing","in_transit","delivered"]
                  const currIdx  = steps.indexOf(order.status)
                  const done     = i<=currIdx && !["cancelled","rejected"].includes(order.status)
                  const S  = STATUS_CFG[s]
                  const SI = S.icon
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                        <div style={{
                          width:32, height:32, borderRadius:"50%",
                          background:done?`${S.color}20`:"rgba(144,224,239,0.05)",
                          border:`1px solid ${done?S.color+"50":"rgba(144,224,239,0.1)"}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          <SI size={13} color={done?S.color:"rgba(144,224,239,0.2)"} strokeWidth={2} />
                        </div>
                        <span style={{ fontSize:9.5, fontWeight:700,
                          color:done?S.color:"rgba(144,224,239,0.2)",
                          textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{S.label}</span>
                      </div>
                      {i<3 && (
                        <div style={{
                          flex:1, height:1, marginBottom:18,
                          background: i<currIdx&&!["cancelled","rejected"].includes(order.status)
                            ? `linear-gradient(90deg,${STATUS_CFG[steps[i]].color}50,${STATUS_CFG[steps[i+1]].color}50)`
                            : "rgba(144,224,239,0.07)",
                        }} />
                      )}
                    </React.Fragment>
                  )
                })}
                {["dispatched","rejected","cancelled"].includes(order.status) && (
                  <div style={{
                    marginLeft:10, display:"flex", alignItems:"center", gap:6,
                    borderRadius:99, padding:"5px 14px",
                    background: order.status==="dispatched"?"rgba(52,211,153,0.1)":"rgba(239,68,68,0.08)",
                    border:`1px solid ${order.status==="dispatched"?"rgba(52,211,153,0.25)":"rgba(239,68,68,0.2)"}`,
                  }}>
                    {order.status==="dispatched" && <SendHorizonal size={11} color="#34d399" />}
                    {order.status==="rejected"   && <ThumbsDown    size={11} color="#fb7185" />}
                    {order.status==="cancelled"  && <Ban            size={11} color={C.danger} />}
                    <span style={{ fontSize:11, fontWeight:700,
                      color:order.status==="dispatched"?"#34d399":order.status==="rejected"?"#fb7185":C.danger }}>
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
                      <d.icon size={10} color="rgba(144,224,239,0.28)" strokeWidth={2} />
                      <span style={{ fontSize:9.5, fontWeight:700, color:"rgba(144,224,239,0.28)",
                        letterSpacing:"0.12em", textTransform:"uppercase" }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, color:"rgba(202,240,248,0.8)" }}>{d.value}</span>
                  </div>
                ))}
                {order.notes && (
                  <div style={{ gridColumn:"1/-1", paddingTop:12, borderTop:"1px solid rgba(144,224,239,0.07)",
                    display:"flex", flexDirection:"column", gap:5 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:"rgba(144,224,239,0.28)",
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>Notes</span>
                    <span style={{ fontSize:13, color:C.warn, fontWeight:500 }}>{order.notes}</span>
                  </div>
                )}
                {order.rejectionReason && (
                  <div style={{ gridColumn:"1/-1", paddingTop:12, borderTop:"1px solid rgba(144,224,239,0.07)",
                    display:"flex", flexDirection:"column", gap:5 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:"rgba(251,113,133,0.5)",
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>Rejection Reason</span>
                    <span style={{ fontSize:13, color:"#fb7185", fontWeight:500 }}>{order.rejectionReason}</span>
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

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
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
  const PER_PAGE = 8

  const handleSort   = (key) => { if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(key); setSortDir("asc") } }
  const handleAction = (order,action) => setModal({order,action})
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

  const SortIcon = ({col}) => {
    if(sortKey!==col) return <ArrowUpDown size={10} color="rgba(144,224,239,0.2)"/>
    return sortDir==="asc"?<ChevronUp size={10} color={C.sky}/>:<ChevronDown size={10} color={C.sky}/>
  }

  const thStyle = {
    padding:"10px 16px", textAlign:"left", fontWeight:700, fontSize:9.5,
    letterSpacing:"0.13em", textTransform:"uppercase",
    color:"rgba(144,224,239,0.3)", whiteSpace:"nowrap",
    borderBottom:"1px solid rgba(144,224,239,0.06)",
    background:"rgba(0,180,216,0.03)",
  }

  const ColHead = ({col,label,style={}}) => (
    <th onClick={()=>handleSort(col)} style={{...thStyle,cursor:"pointer",userSelect:"none",transition:"color 0.15s",...style}}
      onMouseEnter={e=>e.currentTarget.style.color="rgba(144,224,239,0.6)"}
      onMouseLeave={e=>e.currentTarget.style.color="rgba(144,224,239,0.3)"}
    >
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>{label}<SortIcon col={col}/></div>
    </th>
  )

  return (
    <div style={{ minHeight:"100vh", background:"transparent", fontFamily:"'DM Sans',sans-serif", padding:"36px 36px 56px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,180,216,0.18); border-radius:99px; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(40px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes toastProgress { from{width:100%} to{width:0%} }
        input::placeholder,textarea::placeholder { color:rgba(144,224,239,0.18); }
        select option { background:#020e28; color:#caf0f8; }
        table { border-collapse:collapse; width:100%; }
      `}</style>

      <div style={{ height:2, background:`linear-gradient(90deg,${C.navy},${C.ocean} 30%,${C.sky} 60%,${C.mist} 85%,transparent)` }} />

      {/* Header */}
      <div style={{ marginBottom:28, paddingTop:32, animation:"fadeUp 0.4s ease both" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:8,
                background:`linear-gradient(135deg,${C.ocean},${C.sky})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 12px rgba(0,180,216,0.3)" }}>
                <ShoppingCart size={14} color="white" strokeWidth={2} />
              </div>
              <span style={{ fontSize:11.5, color:"rgba(144,224,239,0.3)", fontWeight:500 }}>MediReach</span>
              <ChevronRight size={11} color="rgba(144,224,239,0.15)" />
              <span style={{ fontSize:11.5, color:C.sky, fontWeight:700,
                background:"rgba(0,180,216,0.1)", padding:"2px 9px", borderRadius:99,
                border:"1px solid rgba(0,180,216,0.18)" }}>Pharmacy Orders</span>
            </div>
            <h1 style={{ margin:0, fontSize:30, fontWeight:800, color:C.white,
              letterSpacing:"-1.2px", lineHeight:1.1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Order Management
            </h1>
            <p style={{ margin:"7px 0 0", color:"rgba(144,224,239,0.3)", fontSize:13.5 }}>
              Review, dispatch or reject medicine orders from the pharmacy network
            </p>
          </div>
          <div style={{ display:"flex", gap:9 }}>
            <button style={{ padding:"9px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
              border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
              color:"rgba(144,224,239,0.5)", fontWeight:600, fontSize:12.5,
              display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(0,180,216,0.3)"; e.currentTarget.style.color=C.sky }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.color="rgba(144,224,239,0.5)" }}
            ><RefreshCw size={13} strokeWidth={2}/> Refresh</button>
            <button style={{ padding:"9px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
              border:"none", background:`linear-gradient(135deg,${C.ocean},${C.sky})`,
              color:C.white, fontWeight:600, fontSize:12.5,
              display:"flex", alignItems:"center", gap:6,
              boxShadow:"0 4px 16px rgba(0,180,216,0.25)", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,180,216,0.35)" }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,180,216,0.25)" }}
            ><Download size={13} strokeWidth={2}/> Export</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease 0.05s both" }}>
        <StatCard icon={ClipboardList} value={stats.total}      label="Total Orders"  accent={C.sky}    sub="All time" />
        <StatCard icon={Hourglass}     value={stats.pending}    label="Pending"       accent={C.warn}   sub="Awaiting action" />
        <StatCard icon={Truck}         value={stats.inTransit}  label="In Transit"    accent={C.purple} sub="On the way" />
        <StatCard icon={SendHorizonal} value={stats.dispatched} label="Dispatched"    accent={C.green}  sub="Confirmed" />
        <StatCard icon={AlertTriangle} value={stats.urgent}     label="Urgent"        accent={C.danger} sub="Need attention" />
      </div>

      {/* Value strip */}
      <div style={{ padding:"12px 18px", borderRadius:12, marginBottom:22,
        background:"rgba(0,180,216,0.04)", border:"1px solid rgba(0,180,216,0.1)",
        display:"flex", alignItems:"center", gap:10, animation:"fadeUp 0.4s ease 0.1s both" }}>
        <TrendingUp size={14} color={C.sky} />
        <span style={{ fontSize:13, color:"rgba(144,224,239,0.5)", fontWeight:500 }}>Total order value:</span>
        <span style={{ fontSize:16, fontWeight:800, color:C.sky,
          fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.5px" }}>
          LKR {stats.totalValue.toLocaleString()}
        </span>
      </div>

      {/* Search + filters */}
      <div style={{ marginBottom:16, animation:"fadeUp 0.4s ease 0.12s both" }}>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} color="rgba(144,224,239,0.3)" />
            <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
              placeholder="Search by order ID, pharmacy or medicine..."
              style={{ width:"100%", padding:"9px 14px 9px 34px", borderRadius:10,
                border:"1px solid rgba(144,224,239,0.1)", background:"rgba(255,255,255,0.03)",
                fontSize:13, outline:"none", fontFamily:"inherit", color:C.white, transition:"border-color 0.2s" }}
              onFocus={e=>{ e.target.style.borderColor="rgba(0,180,216,0.4)"; e.target.style.background="rgba(0,180,216,0.05)" }}
              onBlur={e=>{ e.target.style.borderColor="rgba(144,224,239,0.1)"; e.target.style.background="rgba(255,255,255,0.03)" }}
            />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["All","pending","in_transit","dispatched","rejected","cancelled"].map(s=>{
              const cfg = s==="All"?null:STATUS_CFG[s]
              const active = statusFilter===s
              return (
                <button key={s} onClick={()=>{ setStatusFilter(s); setPage(1) }} style={{
                  padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                  border:`1px solid ${active?(cfg?cfg.border:"rgba(0,180,216,0.4)"):"rgba(144,224,239,0.08)"}`,
                  background:active?(cfg?cfg.bg:"rgba(0,180,216,0.1)"):"rgba(144,224,239,0.03)",
                  color:active?(cfg?cfg.color:C.sky):"rgba(144,224,239,0.35)",
                  fontWeight:600, fontSize:11.5, transition:"all 0.15s",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  {cfg && <cfg.icon size={10} strokeWidth={2.5}/>}
                  {s==="All"?"All":STATUS_CFG[s].label}
                </button>
              )
            })}
          </div>
          <button onClick={()=>setShowFilters(f=>!f)} style={{
            padding:"8px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
            border:`1px solid ${showFilters?"rgba(0,180,216,0.4)":"rgba(144,224,239,0.1)"}`,
            background:showFilters?"rgba(0,180,216,0.1)":"rgba(144,224,239,0.04)",
            color:showFilters?C.sky:"rgba(144,224,239,0.45)",
            fontWeight:600, fontSize:12.5, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
            <Filter size={12} strokeWidth={2}/>
            {activeFilters>0 && (
              <span style={{ width:15, height:15, borderRadius:"50%", background:C.sky,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:800, color:C.navy }}>{activeFilters}</span>
            )}
          </button>
          <span style={{ fontSize:12, color:"rgba(144,224,239,0.25)" }}>
            {filtered.length} of {orderData.length} orders
          </span>
        </div>

        {showFilters && (
          <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap",
            padding:"14px 16px", borderRadius:12,
            background:"rgba(0,180,216,0.03)", border:"1px solid rgba(144,224,239,0.07)",
            animation:"fadeUp 0.25s ease both" }}>
            {[
              { label:"Pharmacy", val:pharmFilter, set:setPharmFilter, opts:pharmacies },
              { label:"Category", val:catFilter,   set:setCatFilter,   opts:categories },
              { label:"Priority", val:prioFilter,  set:setPrioFilter,  opts:["All","urgent","normal"] },
            ].map(f=>(
              <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:9.5, fontWeight:700, color:"rgba(144,224,239,0.3)",
                  letterSpacing:"0.12em", textTransform:"uppercase" }}>{f.label}</label>
                <select value={f.val} onChange={e=>{ f.set(e.target.value); setPage(1) }} style={{
                  padding:"7px 28px 7px 10px", borderRadius:8,
                  border:"1px solid rgba(144,224,239,0.12)",
                  background:"rgba(255,255,255,0.04)", color:"rgba(202,240,248,0.75)",
                  fontSize:12.5, outline:"none", fontFamily:"inherit", cursor:"pointer", minWidth:160,
                  appearance:"none", WebkitAppearance:"none",
                  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2390e0ef' stroke-opacity='.4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center" }}>
                  {f.opts.map(o=><option key={o} value={o}>{o==="All"?`All ${f.label}s`:o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <button onClick={()=>{ setPharmFilter("All"); setCatFilter("All"); setPrioFilter("All"); setStatusFilter("All"); setPage(1) }} style={{
                padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                border:"1px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.06)",
                color:"rgba(239,68,68,0.6)", fontWeight:600, fontSize:12, transition:"all 0.2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.12)"; e.currentTarget.style.color=C.danger }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.06)"; e.currentTarget.style.color="rgba(239,68,68,0.6)" }}
              >Clear all</button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ borderRadius:18, overflow:"hidden",
        border:"1px solid rgba(144,224,239,0.07)",
        background:"rgba(255,255,255,0.02)",
        boxShadow:"0 8px 40px rgba(0,0,0,0.3)",
        animation:"fadeUp 0.4s ease 0.15s both" }}>
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead>
              <tr>
                <ColHead col="id"        label="Order ID"  style={{ paddingLeft:20 }} />
                <ColHead col="pharmacy"  label="Pharmacy" />
                <ColHead col="medicine"  label="Medicine" />
                <ColHead col="qty"       label="Qty" />
                <ColHead col="unitPrice" label="Value" />
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Priority</th>
                <ColHead col="orderedAt" label="Ordered" />
                <th style={{ ...thStyle, paddingRight:20 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length===0 ? (
                <tr><td colSpan={9} style={{ padding:"64px", textAlign:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                    <div style={{ width:52, height:52, borderRadius:14,
                      background:"rgba(144,224,239,0.05)", border:"1px solid rgba(144,224,239,0.1)",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <ShoppingCart size={22} color="rgba(144,224,239,0.2)" />
                    </div>
                    <p style={{ margin:0, fontSize:15, fontWeight:600, color:"rgba(202,240,248,0.4)" }}>No orders found</p>
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
          <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(144,224,239,0.05)",
            background:"rgba(0,0,0,0.15)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:"rgba(144,224,239,0.25)" }}>
              Page {page} of {totalPages} · {filtered.length} results
            </span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{
                width:32, height:32, borderRadius:8, cursor:page===1?"not-allowed":"pointer",
                border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
                color:page===1?"rgba(144,224,239,0.15)":"rgba(144,224,239,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChevronLeft size={14} strokeWidth={2.5}/>
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{
                  width:32, height:32, borderRadius:8, cursor:"pointer",
                  border:`1px solid ${p===page?"rgba(0,180,216,0.4)":"rgba(144,224,239,0.08)"}`,
                  background:p===page?`linear-gradient(135deg,${C.ocean},${C.sky})`:"rgba(144,224,239,0.03)",
                  color:p===page?C.white:"rgba(144,224,239,0.4)",
                  fontWeight:700, fontSize:12.5, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  boxShadow:p===page?"0 4px 14px rgba(0,180,216,0.25)":"none" }}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{
                width:32, height:32, borderRadius:8, cursor:page===totalPages?"not-allowed":"pointer",
                border:"1px solid rgba(144,224,239,0.1)", background:"rgba(144,224,239,0.04)",
                color:page===totalPages?"rgba(144,224,239,0.15)":"rgba(144,224,239,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChevronRight size={14} strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {modal && <ConfirmModal modal={modal} onConfirm={handleConfirm} onClose={()=>setModal(null)} />}

      {/* Toast */}
      {toast && <Toast toast={toast} onClose={()=>setToast(null)} />}
    </div>
  )
}