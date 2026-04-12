import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { romsAPI, medicineAPI } from '../utils/apiEndpoints'
import {
  Search, Filter, ShoppingCart, Building2,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  ArrowUpDown, RefreshCw, Download,
  AlertTriangle, Truck, CheckCircle2,
  DollarSign, Hash, Calendar, MapPin,
  Pill, TrendingUp, ClipboardList,
  Hourglass, Ban, CircleDot, X,
  SendHorizonal, ThumbsDown,
  ArrowLeft, Building, Loader2
} from 'lucide-react'

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

const STATUS_CFG = {
  pending:    { label:"Pending",    color:"#92400E", bg:"rgba(180,83,9,0.08)",    border:"rgba(180,83,9,0.22)",    icon:Hourglass     },
  processing: { label:"Accepted",   color:C.lilacAsh,bg:"rgba(76,110,245,0.08)", border:"rgba(76,110,245,0.22)", icon:CheckCircle2  },
  in_transit: { label:"Ready",      color:"#5B21B6", bg:"rgba(91,33,182,0.08)",  border:"rgba(91,33,182,0.22)",  icon:Truck         },
  delivered:  { label:"Delivered",  color:C.success, bg:"rgba(14,124,91,0.08)",  border:"rgba(14,124,91,0.22)",  icon:CheckCircle2  },
  cancelled:  { label:"Cancelled",  color:C.danger,  bg:"rgba(192,57,43,0.08)",  border:"rgba(192,57,43,0.22)",  icon:Ban           },
  dispatched: { label:"Dispatched", color:"#065F46", bg:"rgba(6,95,70,0.08)",    border:"rgba(6,95,70,0.22)",    icon:SendHorizonal },
  rejected:   { label:"Rejected",   color:C.danger,  bg:"rgba(192,57,43,0.08)",  border:"rgba(192,57,43,0.22)",  icon:ThumbsDown    },
}

const CAN_ACT    = ["pending","processing","in_transit"]
const fmtDate    = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"
const totalVal   = (o) => o.qty * o.unitPrice

// ── PDF generation (jsPDF + autotable via CDN) ────────────────────
async function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    if (document.querySelector('script[data-jspdf]')) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.setAttribute('data-jspdf', '1');
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  await new Promise((resolve, reject) => {
    if (document.querySelector('script[data-autotable]')) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
    s.setAttribute('data-autotable', '1');
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

async function generatePharmacyOrdersPDF(orders) {
  const JsPDF = await loadJsPDF();
  const doc   = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const BLUE    = [2, 62, 138];
  const SNOW    = [247, 249, 252];
  const WHITE   = [255, 255, 255];
  const SLATE   = [74, 85, 104];
  const PALE    = [221, 227, 237];
  const SUCCESS = [14, 124, 91];
  const WARN    = [180, 83, 9];
  const DANGER  = [192, 57, 43];
  const PURPLE  = [91, 33, 182];

  function drawHeader() {
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageW, 48, 'F');
    doc.setFillColor(76, 110, 245);
    doc.rect(0, 48, pageW, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 255);
    doc.text('MediReach · Pharmacy Management System', 16, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...WHITE);
    doc.text('Pharmacy Orders Report', 16, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 210, 255);
    doc.text(`Complete order registry across the pharmacy network · ${orders.length} orders`, 16, 41);
    const now = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    doc.text(`Generated: ${now}`, pageW - 16, 41, { align: 'right' });
  }

  function drawFooter(pg, tot) {
    doc.setFillColor(...BLUE);
    doc.rect(0, pageH - 18, pageW, 18, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 255);
    doc.text('MediReach — Confidential Report', 16, pageH - 6);
    doc.text(`Page ${pg} of ${tot}`, pageW - 16, pageH - 6, { align: 'right' });
  }

  drawHeader();

  const total      = orders.length;
  const pending    = orders.filter(o => o.status === 'pending').length;
  const dispatched = orders.filter(o => o.status === 'dispatched').length;
  const rejected   = orders.filter(o => o.status === 'rejected' || o.status === 'cancelled').length;
  const urgent     = orders.filter(o => o.priority === 'urgent').length;

  const boxY = 62, boxH = 36, boxW = (pageW - 32) / 5, boxGap = 6;
  [
    { label: 'Total Orders',           value: String(total),      color: BLUE    },
    { label: 'Pending',                value: String(pending),    color: WARN    },
    { label: 'Dispatched',             value: String(dispatched), color: SUCCESS },
    { label: 'Cancelled / Rejected',   value: String(rejected),   color: DANGER  },
    { label: 'Urgent',                 value: String(urgent),     color: PURPLE  },
  ].forEach((s, i) => {
    const x = 16 + i * (boxW + boxGap);
    doc.setFillColor(...SNOW);
    doc.roundedRect(x, boxY, boxW, boxH, 4, 4, 'F');
    doc.setDrawColor(...PALE);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, boxY, boxW, boxH, 4, 4, 'S');
    doc.setFillColor(...s.color);
    doc.roundedRect(x, boxY, 4, boxH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...s.color);
    doc.text(s.value, x + 14, boxY + 23);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(s.label, x + 14, boxY + 31);
  });

  const STATUS_LABEL = {
    pending: 'Pending', processing: 'Accepted', in_transit: 'Ready',
    delivered: 'Delivered', cancelled: 'Cancelled', dispatched: 'Dispatched', rejected: 'Rejected',
  };
  const STATUS_COLOR = {
    Pending: WARN, Accepted: [76, 110, 245], Ready: PURPLE,
    Delivered: SUCCESS, Cancelled: DANGER, Dispatched: SUCCESS, Rejected: DANGER,
  };

  const rows = orders.map((o, idx) => {
    const medicines = Array.isArray(o.medicines) && o.medicines.length > 0
      ? o.medicines.map(m => `${m.medicine_name} x${m.quantity}`).join('\n')
      : o.medicine || '—';

    const tv = Array.isArray(o.medicines) && o.medicines.length > 0
      ? o.medicines.reduce((s, m) => s + (m.total_price || 0), 0)
      : totalVal(o);

    const orderedDate = o.orderedAt
      ? new Date(o.orderedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
      : '—';

    const statusLabel = STATUS_LABEL[o.status] || o.status || '—';

    return [
      String(idx + 1).padStart(3, '0'),
      o.id || '—',
      medicines,
      o.pharmacy || '—',
      statusLabel,
      o.priority === 'urgent' ? 'URGENT' : 'Normal',
      tv > 0 ? `LKR ${tv.toLocaleString()}` : '—',
      orderedDate,
    ];
  });

  doc.autoTable({
    startY: boxY + boxH + 12,
    head: [['#', 'Order Number', 'Ordered Medicines', 'Ordered Pharmacy Name', 'Status', 'Priority', 'Total Value', 'Order Date']],
    body: rows,
    theme: 'plain',
    headStyles: {
      fillColor: BLUE,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 7, bottom: 7, left: 8, right: 8 },
    },
    alternateRowStyles: { fillColor: SNOW },
    bodyStyles: {
      fontSize: 7.5,
      textColor: SLATE,
      cellPadding: { top: 6, bottom: 6, left: 8, right: 8 },
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 24,  halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 85,  fontStyle: 'bold', textColor: BLUE, fontSize: 7 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 110, fontStyle: 'bold', textColor: BLUE },
      4: { cellWidth: 64,  halign: 'center' },
      5: { cellWidth: 48,  halign: 'center' },
      6: { cellWidth: 70,  halign: 'right', fontStyle: 'bold', textColor: BLUE },
      7: { cellWidth: 65,  halign: 'center' },
    },
    didDrawCell(data) {
      // Status badge
      if (data.section === 'body' && data.column.index === 4) {
        const v   = data.cell.raw;
        const col = STATUS_COLOR[v] || SLATE;
        const { x, y, width, height } = data.cell;
        const pad = 3;
        doc.setFillColor(...col);
        doc.roundedRect(x + pad, y + pad, width - pad * 2, height - pad * 2, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...WHITE);
        doc.text(v, x + width / 2, y + height / 2 + 2.5, { align: 'center' });
      }
      // Priority badge
      if (data.section === 'body' && data.column.index === 5) {
        const v   = data.cell.raw;
        if (v === 'URGENT') {
          const { x, y, width, height } = data.cell;
          const pad = 3;
          doc.setFillColor(...DANGER);
          doc.roundedRect(x + pad, y + pad, width - pad * 2, height - pad * 2, 3, 3, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(...WHITE);
          doc.text(v, x + width / 2, y + height / 2 + 2.5, { align: 'center' });
        }
      }
    },
    didDrawPage() {
      const pg  = doc.internal.getCurrentPageInfo().pageNumber;
      const tot = doc.internal.getNumberOfPages();
      drawFooter(pg, tot);
    },
    margin: { left: 16, right: 16, bottom: 28 },
  });

  const totalPgs = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPgs; p++) {
    doc.setPage(p);
    drawFooter(p, totalPgs);
  }

  doc.save(`MediReach_Orders_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => { const t = setTimeout(onClose,4000); return ()=>clearTimeout(t) },[onClose])
  const isDispatched = toast.type==="dispatched"
  const isAccepted = toast.type==="accepted"
  const isRejected = toast.type==="rejected"
  const isError = toast.type==="error"
  const accent = isError ? C.danger : (isDispatched ? C.success : (isAccepted ? C.lilacAsh : C.danger))
  const Icon   = isError ? AlertTriangle : (isDispatched ? SendHorizonal : (isAccepted ? CheckCircle2 : ThumbsDown))
  return (
    <div style={{
      position:"fixed", bottom:32, right:32, zIndex:1000,
      display:"flex", alignItems:"flex-start", gap:14,
      padding:"16px 20px 18px", borderRadius:14,
      background:C.white, border:"1.5px solid " + (isError ? "rgba(192,57,43,0.3)" : (isDispatched ? "rgba(14,124,91,0.3)" : (isAccepted ? "rgba(76,110,245,0.3)" : "rgba(192,57,43,0.3)"))) + "",
      boxShadow:"0 16px 48px rgba(2,62,138,0.14)",
      minWidth:300, maxWidth:380,
      animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      overflow:"hidden",
    }}>
      <div style={{
        width:40, height:40, borderRadius:"50%", flexShrink:0,
        background: isError ? "rgba(192,57,43,0.1)" : (isDispatched ? "rgba(14,124,91,0.1)" : (isAccepted ? "rgba(76,110,245,0.1)" : "rgba(192,57,43,0.1)")),
        border:`1px solid ${isError ? "rgba(192,57,43,0.25)" : (isDispatched ? "rgba(14,124,91,0.25)" : (isAccepted ? "rgba(76,110,245,0.25)" : "rgba(192,57,43,0.25)"))}`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Icon size={17} color={accent} strokeWidth={2} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>
          {isError ? "Failed to Update Order" : (isDispatched ? "Order Dispatched" : (isAccepted ? "Order Accepted" : "Order Rejected"))}
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
        <div style={{ height:3, background: isAccept
          ? "linear-gradient(90deg, " + C.techBlue + ", " + C.success + ")"
          : "linear-gradient(90deg, " + C.techBlue + ", " + C.danger + ")" }} />
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
            <span style={{ fontSize:11, fontWeight:700, color:st.color }}>
              {order.originalStatus || st.label}
            </span>
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
                {order.prescription_image && (
                  <div style={{ gridColumn:"1/-1", paddingTop:14, borderTop:`1px solid ${C.paleSlate}`,
                    display:"flex", flexDirection:"column", gap:4 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>Prescription</span>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <button
                        onClick={() => {
                          const modal = document.createElement('div');
                          modal.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;`;
                          modal.onclick = () => document.body.removeChild(modal);
                          const img = document.createElement('img');
                          img.src = order.prescription_image;
                          img.style.cssText = `max-width:90%;max-height:90%;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
                          modal.appendChild(img);
                          document.body.appendChild(modal);
                        }}
                        style={{
                          padding:"8px 16px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                          border:`1.5px solid ${C.techBlue}`,
                          background:C.white, color:C.techBlue,
                          fontWeight:600, fontSize:12, transition:"all 0.2s",
                          display:"flex", alignItems:"center", gap:6,
                        }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=C.techBlue; e.currentTarget.style.color=C.snow; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 12px rgba(2,62,138,0.2)"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=C.white; e.currentTarget.style.color=C.techBlue; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
                      >
                        <Eye size={12} strokeWidth={2} />
                        View Prescription
                      </button>
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

  const urlParams        = new URLSearchParams(location.search)
  const urlPharmacy      = urlParams.get("pharmacy") || ""

  const [orderData,    setOrderData]    = useState([])
  const [rawOrders,    setRawOrders]    = useState([])   // for PDF export (unfiltered)
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState(null)
  const [search,       setSearch]       = useState("")
  const [pharmFilter,  setPharmFilter]  = useState(urlPharmacy)
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
  const [exportLoading, setExportLoading] = useState(false)
  const PER_PAGE = 8

  useEffect(() => {
    fetchOrders()
  }, [pharmFilter, fetchOrders])

  const fetchOrders = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Use getAllRequests for the full dataset (needed for PDF export)
      const allData = await romsAPI.getAllRequests()
      const allOrders = allData.data || allData

      // Also fetch pharmacy-filtered view for display
      const data = await romsAPI.getPharmacyTasks(pharmFilter)
      const orders = data.data || data

      // Store raw for PDF
      setRawOrders(allOrders)

      const transformedOrders = await Promise.all(orders.map(async (order) => {
        let routingStatus = null
        try {
          const routingData = await romsAPI.getRoutingStatus(order._id)
          routingStatus = routingData.data.route_status
        } catch (routingError) {
          console.log('Failed to fetch routing status for order:', order._id)
        }

        let medicineDisplay = 'Medication Request'
        let totalQuantity = 1
        let totalValue = 0

        if (order.medicines && order.medicines.length > 0) {
          const medicineNames = order.medicines.map(med => med.medicine_name).join(', ')
          medicineDisplay = medicineNames
          totalQuantity = order.medicines.reduce((sum, med) => sum + med.quantity, 0)
          totalValue = order.medicines.reduce((sum, med) => sum + med.total_price, 0)
        } else if (order.notes && order.notes.trim()) {
          medicineDisplay = order.notes.split(' - ')[0].trim()
        } else if (order.patient_id) {
          medicineDisplay = `Prescription for ${order.patient_id}`
        }

        return {
          id: order._id || `ORD-${order.patient_id}`,
          pharmacy: order.pharmacy_id || 'Unknown Pharmacy',
          location: 'Sri Lanka',
          medicine: medicineDisplay,
          category: 'Prescription',
          qty: totalQuantity,
          unitPrice: totalValue / totalQuantity || 0,
          status: routingStatus ? mapRoutingStatus(routingStatus) : mapStatus(order.status),
          originalStatus: order.status,
          priority: mapPriority(order.priority_level),
          orderedAt: order.createdAt || order.request_date,
          deliveredAt: null,
          notes: order.notes || '',
          patient_id: order.patient_id,
          expiry_time: order.expiry_time,
          prescription_image: order.prescription_image,
          medicines: order.medicines || []
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

  const mapStatus = (status) => {
    switch (status) {
      case 'Pending': return 'pending'
      case 'Accepted': return 'processing'
      case 'Approved': return 'processing'
      case 'Ready': return 'in_transit'
      case 'Rejected': return 'rejected'
      case 'Cancelled': return 'cancelled'
      case 'Dispatched': return 'dispatched'
      case 'VerificationPending': return 'processing'
      case 'Payment-Verified': return 'processing'
      default: return 'pending'
    }
  }

  const mapRoutingStatus = (routingStatus) => {
    switch (routingStatus) {
      case 'Pending': return 'pending'
      case 'Accepted': return 'processing'
      case 'Dispatched': return 'dispatched'
      case 'Rejected': return 'rejected'
      default: return 'pending'
    }
  }

  const mapPriority = (priority) => {
    switch (priority) {
      case 'Emergency': return 'urgent'
      case 'Urgent': return 'urgent'
      case 'Normal': return 'normal'
      default: return 'normal'
    }
  }

  useEffect(() => {
    setPharmFilter(urlPharmacy)
    setPage(1)
  }, [urlPharmacy])

  // ── Export PDF using getAllRequests data ───────────────────────────
  const handleExportPDF = async () => {
    setExportLoading(true)
    try {
      // Build PDF-ready order objects from raw API data
      const pdfOrders = orderData // use current transformed data
      await generatePharmacyOrdersPDF(pdfOrders)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF: ' + err.message)
    } finally {
      setExportLoading(false)
    }
  }

  const pharmacies = ["All", ...new Set(orderData.map(o => o.pharmacy))]
  const categories = ["All", ...new Set(orderData.map(o => o.category))]

  const handleSort    = (key) => { if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(key); setSortDir("asc") } }
  const handleAction  = (order,action) => setModal({order,action})
  const handleConfirm = async (reason) => {
    const { order, action } = modal
    console.log('handleConfirm called with action:', action, 'order:', order.id)

    try {
      if (action === "accept") {
        try {
          if (order.medicines && order.medicines.length > 0) {
            for (const medicineItem of order.medicines) {
              const medicineId = medicineItem.medicine_id
              const quantity = medicineItem.quantity
              const medicineName = medicineItem.medicine_name

              if (medicineId && quantity) {
                const stockUpdateResponse = await medicineAPI.updateStock({
                  medicineId: medicineId,
                  quantity: quantity
                })
                if (stockUpdateResponse.ok) {
                  const stockResult = await stockUpdateResponse.json()
                  console.log('Medicine stock updated:', stockResult)
                } else {
                  console.error('Failed to update medicine stock')
                }
              }
            }
          } else {
            try {
              const medicinesResponse = await medicineAPI.getAllMedicines()
              const medicines = medicinesResponse.data
              const medicineArray = Array.isArray(medicines) ? medicines : (medicines.medicines || [])
              const targetMedicine = medicineArray.find(med =>
                med.mediName === order.medicine || med.name === order.medicine
              )
              if (targetMedicine) {
                const currentStock = Number(targetMedicine.mediStock) || 0
                const orderQuantity = Number(order.qty) || 0
                const newStock = Math.max(0, currentStock - orderQuantity)
                await medicineAPI.updateMedicine(targetMedicine._id, { mediStock: newStock })
              }
            } catch (error) {
              console.error('Error updating stock (fallback):', error)
            }
          }
        } catch (stockError) {
          console.error('Error updating stock:', stockError)
        }

        const response = await romsAPI.processRequest(order.id, {
          action: 'accept',
          pharmacy_id: order.pharmacy_id,
          notes: 'Order accepted by pharmacy'
        })

        if (!response || !response.status || response.status < 200 || response.status >= 300) {
          throw new Error(`Failed to accept order: ${response?.data?.message || 'Unknown error'}`)
        }

        setOrderData(prev => prev.map(o =>
          o.id === order.id ? { ...o, status: mapStatus('Accepted') } : o
        ))
        setToast({ type: "accepted", orderId: order.id, medicine: order.medicine, pharmacy: order.pharmacy })
        setModal(null)
        return
      }

      const backendAction = action === 'reject' ? 'Reject' : action === 'dispatch' ? 'dispatch' : action
      const response = await romsAPI.processRequest(order.id, {
        action: backendAction,
        pharmacy_id: order.pharmacy_id,
        rejectionReason: action === 'reject' ? reason : undefined,
        notes: action === 'dispatch' ? 'Order dispatched by pharmacy' : undefined
      })

      if (!response || !response.status || response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to update order: ${response?.data?.message || 'Unknown error'}`)
      }

      const newStatus = action === "dispatch" ? "dispatched" : action === "reject" ? "Rejected" : order.status
      setOrderData(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: mapStatus(newStatus), rejectionReason: action === "reject" ? reason : undefined } : o
      ))
      setToast({ type: action === "dispatch" ? "dispatched" : (action === "reject" ? "rejected" : "accepted"), orderId: order.id, medicine: order.medicine, pharmacy: order.pharmacy })
      setModal(null)
    } catch (error) {
      console.error('Error updating order:', error)
      setToast({ type: "error", orderId: order.id, medicine: order.medicine, pharmacy: order.pharmacy })
      setModal(null)
    }
  }

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
          @keyframes spin { to{transform:rotate(360deg)} }
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

                {/* ── Export PDF Button ── */}
                <button
                  onClick={handleExportPDF}
                  disabled={exportLoading || loading}
                  style={{ padding:"10px 18px", borderRadius:10,
                    cursor: exportLoading||loading ? "not-allowed" : "pointer",
                    fontFamily:"inherit", border:"none",
                    background: exportLoading||loading ? "rgba(2,62,138,0.5)" : C.techBlue,
                    color:C.snow, fontWeight:600, fontSize:13,
                    display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
                    boxShadow: exportLoading||loading ? "none" : "0 4px 18px rgba(2,62,138,0.28)" }}
                  onMouseEnter={e=>{ if(!exportLoading&&!loading){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 26px rgba(2,62,138,0.38)" }}}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=exportLoading||loading?"none":"0 4px 18px rgba(2,62,138,0.28)" }}
                >
                  {exportLoading
                    ? <><Loader2 size={13} style={{ animation:"spin 0.9s linear infinite" }}/> Generating...</>
                    : <><Download size={13} strokeWidth={2}/> Export PDF</>
                  }
                </button>
              </div>
            </div>
          </div>

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

          <div style={{ display:"flex", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease 0.05s both" }}>
            <StatCard icon={ClipboardList} value={stats.total}      label={isPharmacyFiltered ? "Orders" : "Total Orders"} sub={isPharmacyFiltered ? pharmFilter.split(" ")[0] : "All time"} delay="0.07s" />
            <StatCard icon={Hourglass}     value={stats.pending}    label="Pending"      sub="Awaiting action" delay="0.1s"  />
            <StatCard icon={Truck}         value={stats.inTransit}  label="In Transit"   sub="On the way"      delay="0.13s" />
            <StatCard icon={SendHorizonal} value={stats.dispatched} label="Dispatched"   sub="Confirmed"       delay="0.16s" />
            <StatCard icon={AlertTriangle} value={stats.urgent}     label="Urgent"       sub="Need attention"  delay="0.19s" />
          </div>

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

          {loading && (
            <div style={{
              padding:"80px", textAlign:"center", borderRadius:16,
              background:C.white, border:`1.5px solid ${C.paleSlate}`,
              boxShadow:"0 4px 24px rgba(2,62,138,0.07)",
              animation:"fadeUp 0.4s ease 0.15s both"
            }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                <Loader2 size={32} color={C.techBlue} style={{ animation:"spin 0.9s linear infinite" }} />
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
        </div>
      </div>

      {modal && <ConfirmModal modal={modal} onConfirm={handleConfirm} onClose={()=>setModal(null)} />}
      {toast && <Toast toast={toast} onClose={()=>setToast(null)} />}
    </>
  )
}