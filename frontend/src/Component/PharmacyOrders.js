import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search, Filter, ShoppingCart, Clock, Building2,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  ArrowUpDown, RefreshCw, Download, Eye,
  XCircle, AlertTriangle, Truck, CheckCircle2,
  DollarSign, Hash, Calendar, MapPin,
  Pill, TrendingUp, ClipboardList,
  Hourglass, Ban, CircleDot, X,
  ShieldAlert, SendHorizonal, ThumbsDown, FileText,
  ArrowLeft, Building, Loader2
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

// API endpoint for fetching orders
const API = "http://localhost:5000/api/roms/pharmacy-tasks";


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
  const isDispatch = modal.action==="dispatch"
  const isAccept = modal.action==="accept"
  const isReject = modal.action==="reject"
  const accent   = isDispatch ? C.success : (isAccept ? C.lilacAsh : C.danger)
  const Icon     = isDispatch ? SendHorizonal : (isAccept ? CheckCircle2 : ThumbsDown)
  const canSubmit = isDispatch || isAccept || reason.trim().length>0

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
        <div style={{ height:3, background:isAccept
          ? `linear-gradient(90deg, ${C.techBlue}, ${C.success})`
          : `linear-gradient(90deg, ${C.techBlue}, ${C.danger})` }} />
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
                {isDispatch ? "Dispatch This Order?" : (isAccept ? "Accept This Order?" : "Reject This Order?")}
              </h3>
              <p style={{ margin:0, fontSize:13, color:C.lilacAsh, lineHeight:1.5 }}>
                {isDispatch
                  ? "Confirming will mark this order as dispatched and notify the pharmacy."
                  : (isAccept
                    ? "Confirming will mark this order as accepted and enable payment verification."
                    : "Rejecting is permanent. The pharmacy will be notified immediately.")}
              </p>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.paleSlate, display:"flex", padding:0 }}>
              <X size={18} />
            </button>
          </div>
        </div>
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
          {!isAccept && !isDispatch && (
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
        <div style={{ padding:"12px 26px", borderBottom:`1px solid ${C.paleSlate}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 13px", borderRadius:9,
            background: isAccept ? "rgba(14,124,91,0.06)" : "rgba(192,57,43,0.06)",
            border:`1px solid ${isAccept ? "rgba(14,124,91,0.18)" : "rgba(192,57,43,0.18)"}` }}>
            <ShieldAlert size={13} color={accent} strokeWidth={2} style={{ flexShrink:0 }} />
            <p style={{ margin:0, fontSize:12, color:accent, fontWeight:500, lineHeight:1.5 }}>
              {isDispatch
                ? "Stock records will be updated and the pharmacy will receive a dispatch confirmation."
                : (isAccept
                  ? "Stock records will be updated and the pharmacy will receive an acceptance confirmation."
                  : "The pharmacy will receive an immediate rejection notification with your reason.")}
            </p>
          </div>
        </div>
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
            {isDispatch ? "Confirm Dispatch" : (isAccept ? "Confirm Accept" : "Confirm Rejection")}
          </button>
        </div>
      </div>
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

// ── Order Row ─────────────────────────────────────────────────────
function OrderRow({ order, index, expanded, onToggle, onAction }) {
  const [rowHov, setRowHov] = useState(false)
  const [dispHov, setDispHov] = useState(false)
  const [accHov, setAccHov] = useState(false)
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
        <td style={{ padding:"13px 16px 13px 22px", minWidth:200 }}>
          {(rowHov || isOpen) && (
            <div style={{
              position:"absolute", left:0, top:"15%", bottom:"15%",
              width:3, borderRadius:"0 3px 3px 0",
              background: isOpen ? C.lilacAsh : C.techBlue,
              pointerEvents:"none",
            }} />
          )}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {order.priority==="urgent" && (
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.danger,
                boxShadow:`0 0 5px ${C.danger}80`, flexShrink:0 }} />
            )}
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
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:14, fontWeight:700, color:C.techBlue, fontFamily:"'Sora',sans-serif" }}>{order.qty.toLocaleString()}</span>
          <span style={{ fontSize:10.5, color:C.lilacAsh, marginLeft:3 }}>units</span>
        </td>
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:C.techBlue, fontFamily:"'Sora',sans-serif" }}>
            {totalVal(order).toLocaleString()}
          </span>
          <span style={{ fontSize:10.5, color:C.lilacAsh, marginLeft:3 }}>LKR</span>
        </td>
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5,
            background:st.bg, borderRadius:99, padding:"4px 10px", border:`1px solid ${st.border}` }}>
            <StI size={10} color={st.color} strokeWidth={2} />
            <span style={{ fontSize:11, fontWeight:700, color:st.color }}>{st.label}</span>
          </div>
        </td>
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
        <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:500 }}>{fmtDate(order.orderedAt)}</span>
        </td>
        <td style={{ padding:"13px 22px 13px 16px", whiteSpace:"nowrap" }}>
          <div style={{ display:"flex", gap:7, alignItems:"center" }}>
            {canAct && (
              <>
                <button
                  onMouseEnter={()=>setDispHov(true)} onMouseLeave={()=>setDispHov(false)}
                  onClick={()=>onAction(order,"dispatch")}
                  style={{
                    padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:`1.5px solid ${dispHov ? C.success : "rgba(14,124,91,0.25)"}`,
                    background: dispHov ? C.success : "rgba(14,124,91,0.06)",
                    color: dispHov ? C.snow : C.success,
                    fontWeight:600, fontSize:12, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:5,
                    transform: dispHov ? "translateY(-1px)" : "none",
                    boxShadow: dispHov ? "0 4px 14px rgba(14,124,91,0.22)" : "none",
                  }}
                ><SendHorizonal size={11} strokeWidth={2.5} /> Dispatch</button>
                <button
                  onMouseEnter={()=>setAccHov(true)} onMouseLeave={()=>setAccHov(false)}
                  onClick={()=>onAction(order,"accept")}
                  style={{
                    padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    border:`1.5px solid ${accHov ? C.techBlue : "rgba(76,110,245,0.25)"}`,
                    background: accHov ? C.techBlue : "rgba(76,110,245,0.06)",
                    color: accHov ? C.snow : C.techBlue,
                    fontWeight:600, fontSize:12, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:5,
                    transform: accHov ? "translateY(-1px)" : "none",
                    boxShadow: accHov ? "0 4px 14px rgba(76,110,245,0.22)" : "none",
                  }}
                ><CheckCircle2 size={11} strokeWidth={2.5} /> Accept</button>
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

      {/* Expanded detail row */}
      {isOpen && (
        <tr style={{ borderBottom:`1px solid ${C.paleSlate}` }}>
          <td colSpan={9} style={{ padding:"0 22px 16px" }}>
            <div style={{
              borderRadius:12, padding:"18px 22px",
              background:C.white, border:`1.5px solid ${C.paleSlate}`,
              animation:"fadeUp 0.25s ease both",
            }}>
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
                          background: i<currIdx && !["cancelled","rejected"].includes(order.status) ? C.techBlue : C.paleSlate,
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
                {order.medicines && order.medicines.length > 0 && (
                  <div style={{ gridColumn:"1/-1", paddingTop:14, borderTop:`1px solid ${C.paleSlate}`,
                    display:"flex", flexDirection:"column", gap:4 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>Medicines Ordered</span>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {order.medicines.map((med, idx) => (
                        <div key={idx} style={{
                          padding:"12px 14px", borderRadius:8,
                          background:"rgba(2,62,138,0.03)", border:"1px solid rgba(2,62,138,0.12)",
                          display:"flex", alignItems:"center", gap:12
                        }}>
                          <div style={{ width:36, height:36, borderRadius:8, background:C.white,
                            border:"1px solid rgba(2,62,138,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Pill size={16} color={C.techBlue} strokeWidth={2} />
                          </div>
                          <div style={{ flex:1, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:C.blueSlate, marginBottom:2 }}>
                                {med.medicine_name}
                              </div>
                              <div style={{ fontSize:11.5, color:C.lilacAsh }}>
                                Qty: {med.quantity} × LKR {med.unit_price.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:14, fontWeight:700, color:C.techBlue, fontFamily:"'Sora',sans-serif" }}>
                                LKR {med.total_price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {canAct && (
                  <div style={{ gridColumn:"1/-1", paddingTop:16, borderTop:`1.5px solid ${C.paleSlate}`,
                    display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:C.lilacAsh, letterSpacing:"0.12em", textTransform:"uppercase", marginRight:4 }}>Actions</span>
                    <button onClick={()=>onAction(order,"dispatch")} style={{
                      padding:"9px 20px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                      border:"1.5px solid rgba(14,124,91,0.3)", background:"rgba(14,124,91,0.07)", color:C.success,
                      fontWeight:600, fontSize:13, transition:"all 0.2s", display:"flex", alignItems:"center", gap:7 }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=C.success; e.currentTarget.style.borderColor=C.success; e.currentTarget.style.color=C.snow; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 18px rgba(14,124,91,0.28)" }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="rgba(14,124,91,0.07)"; e.currentTarget.style.borderColor="rgba(14,124,91,0.3)"; e.currentTarget.style.color=C.success; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none" }}
                    ><SendHorizonal size={14} strokeWidth={2.2} /> Dispatch Order</button>
                  </div>
                )}
                {(order.status==="dispatched" || order.status==="rejected" || order.status==="cancelled") && (
                  <div style={{ gridColumn:"1/-1", paddingTop:16, borderTop:`1.5px solid ${C.paleSlate}`, display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:9,
                      background: order.status==="dispatched" ? "rgba(14,124,91,0.07)" : "rgba(192,57,43,0.06)",
                      border:`1.5px solid ${order.status==="dispatched" ? "rgba(14,124,91,0.22)" : "rgba(192,57,43,0.2)"}` }}>
                      {order.status==="dispatched" && <SendHorizonal size={14} color={C.success} />}
                      {order.status==="rejected"   && <ThumbsDown    size={14} color={C.danger} />}
                      {order.status==="cancelled"  && <Ban            size={14} color={C.danger} />}
                      <span style={{ fontSize:13, fontWeight:700,
                        color: order.status==="dispatched" ? C.success : C.danger }}>
                        Order {order.status.charAt(0).toUpperCase()+order.status.slice(1)}
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
  const navigate   = useNavigate()
  const location   = useLocation()

  // ── Read ?pharmacy=... from URL (set by InventoryDashboard) ──
  const urlParams        = new URLSearchParams(location.search)
  const urlPharmacy      = urlParams.get("pharmacy") || ""   // "" means "show all"

  const [orderData,    setOrderData]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState(null)
  const [search,       setSearch]       = useState("")
  const [pharmFilter,  setPharmFilter]  = useState(urlPharmacy)  // ← pre-set from URL
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

  // Fetch orders from database
  useEffect(() => {
    fetchOrders()
  }, [pharmFilter])

  const fetchOrders = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const url = new URL(API)
      // Add pharmacy filter if specified
      if (pharmFilter && pharmFilter !== 'All') {
        url.searchParams.append('pharmacy_id', pharmFilter)
      }
      
      const res = await fetch(url.toString())
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders")
      
      // Transform database orders to match UI structure and fetch routing status
      const transformedOrders = await Promise.all(data.map(async (order) => {
        // Fetch routing status for each order
        let routingStatus = null;
        try {
          const routingRes = await fetch(`http://localhost:5000/api/roms/${order._id}/routing-status`);
          if (routingRes.ok) {
            const routingData = await routingRes.json();
            routingStatus = routingData.route_status;
          }
        } catch (routingError) {
          console.log('Failed to fetch routing status for order:', order._id);
        }
        
        // Handle medicines array - if it exists, display the medicines, otherwise fallback to notes
        let medicineDisplay = 'Medication Request';
        let totalQuantity = 1;
        let totalValue = 0;
        
        if (order.medicines && order.medicines.length > 0) {
          // If we have medicines array, display them
          const medicineNames = order.medicines.map(med => med.medicine_name).join(', ');
          medicineDisplay = medicineNames;
          totalQuantity = order.medicines.reduce((sum, med) => sum + med.quantity, 0);
          totalValue = order.medicines.reduce((sum, med) => sum + med.total_price, 0);
        } else if (order.notes && order.notes.trim()) {
          // Fallback to notes if no medicines array
          medicineDisplay = order.notes.split(' - ')[0].trim();
        } else if (order.patient_id) {
          // Final fallback
          medicineDisplay = `Prescription for ${order.patient_id}`;
        }
        
        return {
          id: order._id || `ORD-${order.patient_id}`,
          pharmacy: order.pharmacy_id || 'Unknown Pharmacy',
          location: 'Sri Lanka', // Default location
          medicine: medicineDisplay,
          category: 'Prescription',
          qty: totalQuantity,
          unitPrice: totalValue / totalQuantity || 0,
          status: routingStatus ? mapRoutingStatus(routingStatus) : mapStatus(order.status),
          priority: mapPriority(order.priority_level),
          orderedAt: order.createdAt || order.request_date,
          deliveredAt: null,
          notes: order.notes || '',
          patient_id: order.patient_id,
          expiry_time: order.expiry_time,
          prescription_image: order.prescription_image,
          medicines: order.medicines || [] // Store the full medicines array for detailed view
        }
      }))
      
      setOrderData(transformedOrders)
    } catch (error) {
      setFetchError(error.message)
      console.error('Fetch orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Map database status to UI status
  const mapStatus = (status) => {
    switch (status) {
      case 'Pending': return 'pending'
      case 'Approved': return 'processing'
      case 'Ready': return 'in_transit'
      case 'Rejected': return 'rejected'
      case 'Cancelled': return 'cancelled'
      case 'Dispatched': return 'dispatched'
      default: return 'pending'
    }
  }

  // Map routing status to UI status
  const mapRoutingStatus = (routingStatus) => {
    switch (routingStatus) {
      case 'Pending': return 'pending'
      case 'Accepted': return 'processing' // This will show as green/processing color
      case 'Dispatched': return 'dispatched'
      case 'Rejected': return 'rejected'
      default: return 'pending'
    }
  }

  // Map database priority to UI priority
  const mapPriority = (priority) => {
    switch (priority) {
      case 'Emergency': return 'urgent'
      case 'Urgent': return 'urgent'
      case 'Normal': return 'normal'
      default: return 'normal'
    }
  }

  // Sync pharmFilter if URL param changes (e.g. browser back/forward)
  useEffect(() => {
    setPharmFilter(urlPharmacy)
    setPage(1)
  }, [urlPharmacy])

  // Derive unique pharmacy & category lists from current data
  const pharmacies = ["All", ...new Set(orderData.map(o => o.pharmacy))]
  const categories = ["All", ...new Set(orderData.map(o => o.category))]

  const handleSort    = (key) => { if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(key); setSortDir("asc") } }
  const handleAction  = (order,action) => setModal({order,action})
  const handleConfirm = async (reason) => {
    const { order, action } = modal
    console.log('handleConfirm called with action:', action, 'order:', order.id)
    
    try {
      if (action === "accept") {
        console.log('Processing accept action')
        // Accept action: Only enable OrderDashboard buttons, don't update order status
        // Store accepted order in localStorage for OrderDashboard to read
        const acceptedOrders = JSON.parse(localStorage.getItem('acceptedOrders') || '[]');
        if (!acceptedOrders.includes(order.id)) {
          acceptedOrders.push(order.id);
          localStorage.setItem('acceptedOrders', JSON.stringify(acceptedOrders));
        }
        
        setToast({ type: "accepted", orderId: order.id, medicine: order.medicine, pharmacy: order.pharmacy });
        setModal(null);
        return;
      }

      console.log('Processing API call for action:', action)
      // For dispatch and reject actions, make API call to update order status
      const response = await fetch(`http://localhost:5000/api/roms/${order.id}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          pharmacy_id: order.pharmacy_id,
          rejectionReason: action === 'reject' ? reason : undefined,
          notes: action === 'dispatch' ? 'Order dispatched by pharmacy' : undefined
        })
      });

      console.log('API response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Failed to update order: ${errorText}`);
      }

      const updatedOrder = await response.json();
      console.log('API success:', updatedOrder)
      
      // Update local state with the response
      const newStatus = action === "dispatch" ? "dispatched" : 
                       action === "reject" ? "Rejected" : order.status;
      
      setOrderData(prev => prev.map(o =>
        o.id === order.id ? { 
          ...o, 
          status: mapStatus(newStatus), 
          rejectionReason: action === "reject" ? reason : undefined
        } : o
      ));
      
      setToast({ type: newStatus, orderId: order.id, medicine: order.medicine, pharmacy: order.pharmacy });
      setModal(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order: ' + error.message);
    }
  }

  // Clear pharmacy filter → also clears URL param
  const clearPharmacyFilter = () => {
    setPharmFilter("All")
    setPage(1)
    navigate("/orders", { replace: true })
  }

  const filtered = useMemo(()=>{
    return orderData
      .filter(o =>
        (o.id.toLowerCase().includes(search.toLowerCase()) ||
         o.pharmacy.toLowerCase().includes(search.toLowerCase()) ||
         o.medicine.toLowerCase().includes(search.toLowerCase())) &&
        // pharmFilter "All" shows everything; otherwise match pharmacy name
        (pharmFilter==="" || pharmFilter==="All" || o.pharmacy===pharmFilter) &&
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
  const activeFilters = [
    pharmFilter && pharmFilter!=="All" ? pharmFilter : null,
    statusFilter!=="All" ? statusFilter : null,
    catFilter!=="All"    ? catFilter    : null,
    prioFilter!=="All"   ? prioFilter   : null,
  ].filter(Boolean).length

  // Stats scoped to current pharmacy filter (or all if no filter)
  const scopedOrders = pharmFilter && pharmFilter!=="All"
    ? orderData.filter(o => o.pharmacy===pharmFilter)
    : orderData

  const stats = {
    total:      scopedOrders.length,
    pending:    scopedOrders.filter(o=>o.status==="pending").length,
    inTransit:  scopedOrders.filter(o=>o.status==="in_transit").length,
    dispatched: scopedOrders.filter(o=>o.status==="dispatched").length,
    urgent:     scopedOrders.filter(o=>o.priority==="urgent").length,
    totalValue: scopedOrders.reduce((s,o)=>s+totalVal(o),0),
  }

  const isPharmacyFiltered = pharmFilter && pharmFilter!=="All"

  const thStyle = {
    padding:"10px 16px", textAlign:"left", fontWeight:700, fontSize:9.5,
    letterSpacing:"0.13em", textTransform:"uppercase", color:C.lilacAsh,
    whiteSpace:"nowrap", borderBottom:`1.5px solid ${C.paleSlate}`, background:C.snow,
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

        <div style={{ position:"fixed", top:0, left:0, right:0, height:3, zIndex:99,
          background:`linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh}, ${C.paleSlate}, ${C.snow})` }} />
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
          backgroundImage:`radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
          backgroundSize:"28px 28px", opacity:0.35 }} />

        <div style={{ position:"relative", zIndex:1 }}>

          {/* ── Header ── */}
          <div style={{ marginBottom:28, paddingTop:4, animation:"fadeUp 0.4s ease both" }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:C.techBlue,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 4px 12px rgba(2,62,138,0.28)" }}>
                    <ShoppingCart size={14} color={C.snow} strokeWidth={2} />
                  </div>
                  <button onClick={()=>navigate('/medicineInventory')} style={{
                    background:"none", border:"none", cursor:"pointer", padding:0,
                    fontSize:12, color:C.lilacAsh, fontWeight:400, fontFamily:"inherit",
                    display:"flex", alignItems:"center", gap:4, transition:"color 0.2s",
                  }}
                    onMouseEnter={e=>e.currentTarget.style.color=C.techBlue}
                    onMouseLeave={e=>e.currentTarget.style.color=C.lilacAsh}
                  >
                    <ArrowLeft size={11} strokeWidth={2} />
                    Inventory
                  </button>
                  <ChevronRight size={11} color={C.paleSlate} />
                  <span style={{ fontSize:11.5, color:C.techBlue, fontWeight:700,
                    background:"rgba(2,62,138,0.08)", padding:"2px 10px", borderRadius:99,
                    border:"1px solid rgba(2,62,138,0.15)" }}>Orders</span>
                  {isPharmacyFiltered && (
                    <>
                      <ChevronRight size={11} color={C.paleSlate} />
                      <span style={{
                        fontSize:11.5, color:C.success, fontWeight:700,
                        background:"rgba(14,124,91,0.07)", padding:"2px 10px", borderRadius:99,
                        border:"1px solid rgba(14,124,91,0.2)",
                        display:"flex", alignItems:"center", gap:5,
                      }}>
                        <Building2 size={10} strokeWidth={2.5} />
                        {pharmFilter}
                      </span>
                    </>
                  )}
                </div>

                <h1 style={{ margin:0, fontSize:32, fontWeight:700, letterSpacing:"-1.4px",
                  color:C.blueSlate, lineHeight:1.1, fontFamily:"'Sora',sans-serif" }}>
                  {isPharmacyFiltered ? "Pharmacy Orders" : "Order Management"}
                </h1>
                <p style={{ margin:"7px 0 0", color:C.lilacAsh, fontSize:14 }}>
                  {isPharmacyFiltered
                    ? `Showing orders for `
                    : "Review, dispatch or reject medicine orders from the pharmacy network"}
                  {isPharmacyFiltered && (
                    <span style={{ color:C.techBlue, fontWeight:600 }}>{pharmFilter}</span>
                  )}
                </p>
              </div>

              <div style={{ display:"flex", gap:9, flexShrink:0 }}>
                {/* Back to all orders — only visible when pharmacy-filtered */}
                {isPharmacyFiltered && (
                  <button onClick={clearPharmacyFilter} style={{
                    padding:"10px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                    border:`1.5px solid ${C.paleSlate}`, background:C.white, color:C.blueSlate,
                    fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
                  >
                    <X size={13} strokeWidth={2.5} />
                    All Orders
                  </button>
                )}
                <button onClick={fetchOrders} style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
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

          {/* ── Pharmacy context banner (shown only when filtered) ── */}
          {isPharmacyFiltered && (
            <div style={{
              padding:"14px 20px", borderRadius:12, marginBottom:22,
              background:"rgba(2,62,138,0.04)", border:`1.5px solid rgba(2,62,138,0.14)`,
              display:"flex", alignItems:"center", gap:14,
              animation:"fadeUp 0.35s ease both",
            }}>
              <div style={{
                width:40, height:40, borderRadius:10, flexShrink:0,
                background:`linear-gradient(135deg, ${C.techBlue}, #3d74c4)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 14px rgba(2,62,138,0.25)",
              }}>
                <Building2 size={18} color={C.snow} strokeWidth={1.8} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontWeight:700, fontSize:14, color:C.blueSlate }}>
                  Filtered to: <span style={{ color:C.techBlue }}>{pharmFilter}</span>
                </p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:C.lilacAsh }}>
                  {filtered.length} order{filtered.length!==1?"s":""} · {stats.pending} pending · {stats.urgent} urgent
                </p>
              </div>
              <button onClick={clearPharmacyFilter} style={{
                padding:"7px 14px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                border:`1.5px solid ${C.paleSlate}`, background:C.white, color:C.blueSlate,
                fontWeight:600, fontSize:12.5, display:"flex", alignItems:"center", gap:5,
                transition:"all 0.2s",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
              >
                <X size={11} strokeWidth={2.5} /> Clear Filter
              </button>
            </div>
          )}

          {/* ── Stats (scoped to current pharmacy or all) ── */}
          <div style={{ display:"flex", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease 0.05s both" }}>
            <StatCard icon={ClipboardList} value={stats.total}      label={isPharmacyFiltered ? "Orders" : "Total Orders"} sub={isPharmacyFiltered ? pharmFilter.split(" ")[0] : "All time"} delay="0.07s" />
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
            <span style={{ fontSize:13, color:C.lilacAsh, fontWeight:500 }}>
              {isPharmacyFiltered ? `Total order value for ${pharmFilter}:` : "Total order value:"}
            </span>
            <span style={{ fontSize:16, fontWeight:800, color:C.techBlue, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
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
                  placeholder={isPharmacyFiltered ? `Search orders in ${pharmFilter}...` : "Search by pharmacy or medicine..."}
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
              <span style={{ fontSize:12, color:C.lilacAsh }}>{filtered.length} of {scopedOrders.length} orders</span>
            </div>

            {showFilters && (
              <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap",
                padding:"14px 16px", borderRadius:10,
                background:C.white, border:`1.5px solid ${C.paleSlate}`,
                boxShadow:"0 2px 12px rgba(2,62,138,0.06)",
                animation:"fadeUp 0.25s ease both" }}>
                {/* Only show pharmacy filter when NOT already filtered from URL */}
                {!isPharmacyFiltered && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    <label style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh, letterSpacing:"0.12em", textTransform:"uppercase" }}>Pharmacy</label>
                    <select value={pharmFilter} onChange={e=>{ setPharmFilter(e.target.value); setPage(1) }} style={{
                      padding:"7px 28px 7px 10px", borderRadius:8,
                      border:`1.5px solid ${C.paleSlate}`, background:C.snow,
                      color:C.blueSlate, fontSize:12.5, outline:"none", fontFamily:"inherit",
                      cursor:"pointer", minWidth:200, appearance:"none", WebkitAppearance:"none",
                      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234C6EF5' stroke-opacity='.5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center" }}>
                      {pharmacies.map(o=><option key={o} value={o}>{o==="All"?"All Pharmacies":o}</option>)}
                    </select>
                  </div>
                )}
                {[
                  { label:"Category", val:catFilter,   set:setCatFilter,   opts:categories },
                  { label:"Priority", val:prioFilter,  set:setPrioFilter,  opts:["All","urgent","normal"] },
                ].map(f=>(
                  <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    <label style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh, letterSpacing:"0.12em", textTransform:"uppercase" }}>{f.label}</label>
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
                  <button onClick={()=>{
                    if (!isPharmacyFiltered) setPharmFilter("All")
                    setCatFilter("All"); setPrioFilter("All"); setStatusFilter("All"); setPage(1)
                  }} style={{
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

          {/* Loading State */}
          {loading && (
            <div style={{ 
              padding:"80px", textAlign:"center", borderRadius:16, 
              background:C.white, border:`1.5px solid ${C.paleSlate}`,
              boxShadow:"0 4px 24px rgba(2,62,138,0.07)",
              animation:"fadeUp 0.4s ease 0.15s both"
            }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                <Loader2 className="animate-spin" size={32} color={C.techBlue} />
                <div>
                  <p style={{ margin:0, fontSize:16, fontWeight:600, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>
                    Loading orders...
                  </p>
                  <p style={{ margin:"4px 0 0", fontSize:13, color:C.lilacAsh }}>
                    Fetching from database
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {fetchError && !loading && (
            <div style={{ 
              padding:"80px", textAlign:"center", borderRadius:16, 
              background:C.white, border:`1.5px solid rgba(192,57,43,0.2)`,
              boxShadow:"0 4px 24px rgba(192,57,43,0.07)",
              animation:"fadeUp 0.4s ease 0.15s both"
            }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                <div style={{ 
                  width:52, height:52, borderRadius:14, background:"rgba(192,57,43,0.08)",
                  border:"1.5px solid rgba(192,57,43,0.22)", display:"flex", alignItems:"center", justifyContent:"center" 
                }}>
                  <AlertTriangle size={24} color={C.danger} />
                </div>
                <div>
                  <p style={{ margin:0, fontSize:16, fontWeight:600, color:C.danger, fontFamily:"'Sora',sans-serif" }}>
                    Failed to load orders
                  </p>
                  <p style={{ margin:"4px 0 0", fontSize:13, color:C.danger, opacity:0.8 }}>
                    {fetchError}
                  </p>
                </div>
                <button onClick={fetchOrders} style={{
                  padding:"10px 20px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  border:"1.5px solid rgba(192,57,43,0.3)", background:"rgba(192,57,43,0.08)",
                  color:C.danger, fontWeight:600, fontSize:13, transition:"all 0.2s",
                  display:"flex", alignItems:"center", gap:7
                }}>
                  <RefreshCw size={14} strokeWidth={2} />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Table - only show when not loading and no error */}
          {!loading && !fetchError && (
            <div style={{ borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.paleSlate}`,
              background:C.white, boxShadow:"0 4px 24px rgba(2,62,138,0.07)",
              animation:"fadeUp 0.4s ease 0.15s both" }}>
              <div style={{ overflowX:"auto" }}>
                <table>
                  <thead>
                    <tr>
                      <ColHead col="pharmacy"  label="Pharmacy" style={{ paddingLeft:22 }} />
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
                      <tr><td colSpan={7} style={{ padding:"64px", textAlign:"center" }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                          <div style={{ width:52, height:52, borderRadius:14, background:C.white,
                            border:`1.5px solid ${C.paleSlate}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <ShoppingCart size={22} color={C.lilacAsh} />
                          </div>
                          <p style={{ margin:0, fontSize:15, fontWeight:600, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>
                            {isPharmacyFiltered ? `No orders found for ${pharmFilter}` : "No orders found"}
                          </p>
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
                      border:`1.5px solid ${C.paleSlate}`, background:C.white, color:page===1?C.paleSlate:C.lilacAsh,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <ChevronLeft size={14} strokeWidth={2.5}/>
                    </button>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                      <button key={p} onClick={()=>setPage(p)} style={{
                        width:32, height:32, borderRadius:8, cursor:"pointer",
                        border:`1.5px solid ${p===page?C.techBlue:C.paleSlate}`,
                        background:p===page?C.techBlue:C.white, color:p===page?C.snow:C.blueSlate,
                        fontWeight:700, fontSize:12.5, fontFamily:"'Sora',sans-serif",
                        boxShadow:p===page?"0 4px 14px rgba(2,62,138,0.25)":"none", transition:"all 0.15s" }}>{p}</button>
                    ))}
                    <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{
                      width:32, height:32, borderRadius:8, cursor:page===totalPages?"not-allowed":"pointer",
                      border:`1.5px solid ${C.paleSlate}`, background:C.white, color:page===totalPages?C.paleSlate:C.lilacAsh,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <ChevronRight size={14} strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showReportGenerator && (
            <div style={{ position:"fixed", inset:0, zIndex:1000,
              background:"rgba(4,18,38,0.55)", backdropFilter:"blur(4px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"fadeUp 0.2s ease both" }}>
              <div style={{ width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto",
                borderRadius:18, background:C.snow, border:`1.5px solid ${C.paleSlate}`,
                boxShadow:"0 32px 80px rgba(2,62,138,0.22)", animation:"fadeUp 0.25s ease both" }}>
                <div style={{ padding:"24px 28px 20px", borderBottom:`1px solid ${C.paleSlate}`,
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`${C.techBlue}15`,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <FileText size={20} color={C.techBlue} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:C.blueSlate }}>Generate Report</h3>
                      <p style={{ margin:"2px 0 0", fontSize:12, color:C.lilacAsh }}>
                        Download order reports in PDF or JSON format
                      </p>
                    </div>
                  </div>
                  <button onClick={()=>setShowReportGenerator(false)} style={{
                    width:32, height:32, borderRadius:8, border:`1.5px solid ${C.paleSlate}`,
                    background:C.white, color:C.lilacAsh, cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.lilacAsh }}
                  ><X size={16} strokeWidth={2} /></button>
                </div>
                <div style={{ padding:"24px 28px" }}>
                  <ReportGenerator
                    type="orders"
                    filters={{
                      pharmacy: isPharmacyFiltered ? pharmFilter : (pharmFilter==="All" ? "" : pharmFilter),
                      status:   statusFilter==="All" ? "" : statusFilter,
                      priority: prioFilter==="All"   ? "" : prioFilter
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && <ConfirmModal modal={modal} onConfirm={handleConfirm} onClose={()=>setModal(null)} />}
      {toast && <Toast toast={toast} onClose={()=>setToast(null)} />}
    </>
  )
}