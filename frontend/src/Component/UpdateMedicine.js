import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, AlertCircle, CheckCircle2,
  Package, FileText, Pill, Building2, Calendar,
  DollarSign, Hash, Tag, Upload, X,
  Loader2, Check, ShieldCheck, ShieldAlert, ShieldOff,
  Barcode, ImagePlus, ClipboardList, Info,
  RefreshCw, Save, PencilLine, Eye, EyeOff,
  AlertTriangle, Undo2
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

const API = "http://localhost:5000/medicines"

const categories = [
  "Antibiotic","Antidiabetic","Cardiovascular","Respiratory",
  "Analgesic","Rehydration","Antiviral","Antifungal",
  "Antihistamine","Supplement","Other"
]

const pharmaciesList = [
  "Kandy Central Pharmacy","Galle Fort MedPoint","Jaffna Community Rx",
  "Matara Rural Clinic","Anuradhapura PharmaCare","Batticaloa MedStore",
  "Kurunegala Health Hub","Trincomalee Bay Pharmacy"
]

const prescriptionStatuses = [
  { key:"Prescription Required", icon:ShieldCheck, color:C.techBlue, bg:"rgba(2,62,138,0.07)",  border:"rgba(2,62,138,0.2)"  },
  { key:"Over The Counter",      icon:ShieldOff,   color:C.success,  bg:"rgba(14,124,91,0.07)", border:"rgba(14,124,91,0.2)" },
  { key:"Controlled Substance",  icon:ShieldAlert, color:C.warn,     bg:"rgba(180,83,9,0.07)",  border:"rgba(180,83,9,0.2)"  },
]

const emptyForm = {
  mediName:"", mediPrice:"", mediDescription:"", mediImage:"",
  mediCategory:"", mediStock:"", mediCompany:"",
  mediExpiryDate:"", mediManufactureDate:"",
  mediPrescriptionStatus:"", Pharmacy:"",
}

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, required, error, icon:Icon, hint, changed, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <label style={{
          display:"flex", alignItems:"center", gap:5,
          fontSize:10.5, fontWeight:700,
          color: error ? C.danger : changed ? C.lilacAsh : C.lilacAsh,
          letterSpacing:"0.13em", textTransform:"uppercase",
        }}>
          {Icon && <Icon size={10} strokeWidth={2.2} />}
          {label}
          {required && <span style={{ color:C.techBlue, marginLeft:1 }}>*</span>}
          {changed && (
            <span style={{
              fontSize:8, fontWeight:800, padding:"1px 6px", borderRadius:99,
              background:"rgba(76,110,245,0.12)", color:C.lilacAsh,
              border:"1px solid rgba(76,110,245,0.25)", letterSpacing:"0.06em",
              marginLeft:4,
            }}>EDITED</span>
          )}
        </label>
        {hint && (
          <span style={{ fontSize:10.5, color:C.lilacAsh, opacity:0.6, display:"flex", alignItems:"center", gap:3 }}>
            <Info size={9} />{hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <span style={{ fontSize:11, color:C.danger, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
          <AlertCircle size={11} strokeWidth={2.5} />{error}
        </span>
      )}
    </div>
  )
}

// ── Input style ───────────────────────────────────────────────────
const inp = (hasError, isFocused, isChanged) => ({
  padding:"10px 13px", borderRadius:9,
  border:`1.5px solid ${hasError ? C.danger : isFocused ? C.techBlue : isChanged ? C.lilacAsh : C.paleSlate}`,
  background: isFocused ? C.snow : isChanged ? "rgba(76,110,245,0.03)" : C.white,
  fontSize:13.5, outline:"none", fontFamily:"inherit",
  color:C.blueSlate, width:"100%", transition:"all 0.2s",
  boxSizing:"border-box", fontWeight:400,
  boxShadow: isFocused ? `0 0 0 3px rgba(2,62,138,0.08)` : hasError ? `0 0 0 3px rgba(192,57,43,0.07)` : "none",
})

// ── Change summary badge ──────────────────────────────────────────
function ChangeBadge({ count }) {
  if (!count) return null
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:6,
      padding:"6px 14px", borderRadius:99,
      background:"rgba(76,110,245,0.1)", border:"1px solid rgba(76,110,245,0.25)",
    }}>
      <PencilLine size={12} color={C.lilacAsh} />
      <span style={{ fontSize:12, fontWeight:700, color:C.lilacAsh }}>
        {count} field{count > 1 ? "s" : ""} edited
      </span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function MedicineUpdate() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [original,     setOriginal]     = useState(null)
  const [form,         setForm]         = useState(emptyForm)
  const [errors,       setErrors]       = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [focused,      setFocused]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [submitting,   setSubmitting]   = useState(false)
  const [apiError,     setApiError]     = useState(null)
  const [saved,        setSaved]        = useState(false)
  const [showPreview,  setShowPreview]  = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  // ── Fetch existing medicine data ──────────────────────────────
  useEffect(() => {
    const fetchMedicine = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${API}/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Medicine not found")
        // API returns { medicine: {...} } — extract the object
        const m = data.medicine || data
        const loaded = {
          mediName:               m.mediName               || "",
          mediPrice:              m.mediPrice              ? String(m.mediPrice) : "",
          mediDescription:        m.mediDescription        || "",
          mediImage:              m.mediImage              || "",
          mediCategory:           m.mediCategory           || "",
          mediStock:              m.mediStock              ? String(m.mediStock) : "",
          mediCompany:            m.mediCompany            || "",
          mediExpiryDate:         m.mediExpiryDate         ? m.mediExpiryDate.split("T")[0] : "",
          mediManufactureDate:    m.mediManufactureDate    ? m.mediManufactureDate.split("T")[0] : "",
          mediPrescriptionStatus: m.mediPrescriptionStatus || "",
          Pharmacy:               m.Pharmacy               || "",
        }
        setOriginal(loaded)
        setForm(loaded)
        if (m.mediImage && m.mediImage.startsWith("http")) {
          setImagePreview(m.mediImage)
        }
      } catch (err) {
        setApiError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMedicine()
  }, [id])

  // ── Changed fields detection ──────────────────────────────────
  const changedFields = original
    ? Object.keys(form).filter(k => form[k] !== original[k])
    : []

  const isChanged = (field) => original && form[field] !== original[field]

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
    setSaved(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      handleChange("mediImage", file.name)
    }
  }

  const handleResetField = (field) => {
    if (original) {
      setForm(prev => ({ ...prev, [field]: original[field] }))
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleResetAll = () => {
    if (original) {
      setForm(original)
      setErrors({})
      setConfirmReset(false)
      setSaved(false)
    }
  }

  const validate = () => {
    const errs = {}
    Object.keys(emptyForm).forEach(k => { if (!form[k]) errs[k] = "This field is required" })
    if (form.mediPrice && isNaN(form.mediPrice)) errs.mediPrice = "Must be a number"
    if (form.mediStock  && isNaN(form.mediStock))  errs.mediStock  = "Must be a number"
    if (form.mediManufactureDate && form.mediExpiryDate) {
      if (new Date(form.mediExpiryDate) <= new Date(form.mediManufactureDate))
        errs.mediExpiryDate = "Expiry must be after manufacture date"
    }
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true); setApiError(null)
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          ...form,
          mediPrice: Number(form.mediPrice),
          mediStock: Number(form.mediStock),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update medicine")
      setOriginal({ ...form })
      setSaved(true)
      // Navigate to inventory after 1.5s so toast is visible
      // Navigate to the specific pharmacy's inventory page after save
      setTimeout(() => navigate(`/medicineInventory?pharmacy=${encodeURIComponent(form.Pharmacy)}`), 1500)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fp = (field) => ({
    style: inp(!!errors[field], focused===field, isChanged(field)),
    value: form[field],
    onFocus:  () => setFocused(field),
    onBlur:   () => setFocused(null),
    onChange: (e) => handleChange(field, e.target.value),
  })

  // ── Loading state ─────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.snow, display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{
          width:52, height:52, borderRadius:14,
          background:`rgba(2,62,138,0.07)`, border:`1.5px solid rgba(2,62,138,0.15)`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Loader2 size={24} color={C.techBlue} style={{ animation:"spin 0.9s linear infinite" }} />
        </div>
        <p style={{ margin:0, fontSize:14, color:C.lilacAsh, fontWeight:500 }}>Loading medicine details...</p>
      </div>
    </div>
  )

  // ── Success toast ─────────────────────────────────────────────
  const SavedToast = () => saved ? (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:999,
      display:"flex", alignItems:"center", gap:12,
      padding:"13px 20px", borderRadius:12,
      background:C.snow, border:`1.5px solid rgba(14,124,91,0.3)`,
      boxShadow:"0 12px 40px rgba(2,62,138,0.14)",
      animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
    }}>
      <div style={{ width:34, height:34, borderRadius:"50%",
        background:"rgba(14,124,91,0.1)", border:"1px solid rgba(14,124,91,0.25)",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Check size={16} color={C.success} strokeWidth={2.5} />
      </div>
      <div>
        <p style={{ margin:"0 0 2px", fontSize:13.5, fontWeight:700, color:C.blueSlate, fontFamily:"'Sora',sans-serif" }}>Medicine Updated</p>
        <p style={{ margin:0, fontSize:11.5, color:C.success, fontWeight:500 }}>{form.mediName} saved successfully</p>
      </div>
    </div>
  ) : null

  // ── Reset confirm modal ───────────────────────────────────────
  const ResetModal = () => confirmReset ? (
    <div onClick={e=>{ if(e.target===e.currentTarget) setConfirmReset(false) }} style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(2,62,138,0.14)", backdropFilter:"blur(5px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      animation:"fadeIn 0.2s ease both",
    }}>
      <div style={{
        width:"100%", maxWidth:400, borderRadius:18,
        background:C.snow, border:`1.5px solid ${C.paleSlate}`,
        boxShadow:"0 24px 64px rgba(2,62,138,0.14)",
        overflow:"hidden", animation:"modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <div style={{ height:3, background:`linear-gradient(90deg, ${C.techBlue}, ${C.warn})` }} />
        <div style={{ padding:"28px 26px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:20 }}>
            <div style={{ width:46, height:46, borderRadius:12, flexShrink:0,
              background:"rgba(180,83,9,0.08)", border:"1.5px solid rgba(180,83,9,0.22)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Undo2 size={22} color={C.warn} strokeWidth={1.8} />
            </div>
            <div>
              <h3 style={{ margin:"0 0 5px", fontSize:18, fontWeight:800, color:C.blueSlate,
                fontFamily:"'Sora',sans-serif", letterSpacing:"-0.4px" }}>Reset All Changes?</h3>
              <p style={{ margin:0, fontSize:13, color:C.lilacAsh, lineHeight:1.5 }}>
                This will revert all <strong style={{ color:C.warn }}>{changedFields.length} edited field{changedFields.length>1?"s":""}</strong> back to the original saved values.
              </p>
            </div>
          </div>
          <div style={{ display:"flex", gap:9, justifyContent:"flex-end" }}>
            <button onClick={()=>setConfirmReset(false)} style={{
              padding:"9px 18px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
              border:`1.5px solid ${C.paleSlate}`, background:C.white,
              color:C.blueSlate, fontWeight:600, fontSize:13, transition:"all 0.2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
            >Cancel</button>
            <button onClick={handleResetAll} style={{
              padding:"9px 18px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
              border:"none", background:C.warn, color:C.snow,
              fontWeight:700, fontSize:13, transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:6,
              boxShadow:"0 4px 16px rgba(180,83,9,0.3)",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(180,83,9,0.38)" }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 16px rgba(180,83,9,0.3)" }}
            >
              <Undo2 size={14} strokeWidth={2.2} /> Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div style={{ minHeight:"100vh", background:C.snow, fontFamily:"'DM Sans',sans-serif",
      padding:"36px 40px 80px", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        input::placeholder, textarea::placeholder { color:${C.lilacAsh}; opacity:0.45; }
        input[type="date"] { color-scheme:light; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.5; }
        select option { background:${C.snow}; color:${C.blueSlate}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.paleSlate}; border-radius:99px; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes modalIn  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes shimmer  { 0%{left:-100%} 100%{left:200%} }
      `}</style>

      {/* Top palette stripe */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3, zIndex:99,
        background:`linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh}, ${C.paleSlate}, ${C.snow})` }} />

      {/* Dot grid bg */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
        backgroundSize:"28px 28px", opacity:0.35 }} />

      {/* Radial accents */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`
          radial-gradient(circle at 5% 5%, rgba(2,62,138,0.05) 0%, transparent 40%),
          radial-gradient(circle at 95% 90%, rgba(76,110,245,0.06) 0%, transparent 40%)
        ` }} />

      <div style={{ maxWidth:820, margin:"0 auto", position:"relative", zIndex:1, paddingTop:4 }}>

        {/* ── API Error ── */}
        {apiError && (
          <div style={{ background:"rgba(192,57,43,0.06)", border:`1px solid rgba(192,57,43,0.22)`,
            borderRadius:10, padding:"13px 18px", marginBottom:22,
            display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.3s ease both" }}>
            <AlertCircle size={18} color={C.danger} strokeWidth={2} />
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontWeight:600, color:C.danger, fontSize:13.5 }}>Error</p>
              <p style={{ margin:"2px 0 0", color:C.danger, fontSize:12, opacity:0.75 }}>{apiError}</p>
            </div>
            <button onClick={()=>setApiError(null)} style={{ background:"none", border:"none",
              cursor:"pointer", color:C.danger, opacity:0.5 }}><X size={16}/></button>
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
          <button onClick={()=>navigate(-1)} style={{
            background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6, color:C.lilacAsh,
            fontSize:13, fontWeight:500, fontFamily:"inherit",
            marginBottom:22, padding:0, transition:"color 0.2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.color=C.techBlue}
            onMouseLeave={e=>e.currentTarget.style.color=C.lilacAsh}
          >
            <ArrowLeft size={15} strokeWidth={2} /> Back
          </button>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:C.techBlue,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 4px 12px rgba(2,62,138,0.28)` }}>
                  <Pill size={14} color={C.snow} strokeWidth={2} />
                </div>
                <span style={{ fontSize:12, color:C.lilacAsh }}>MediReach</span>
                <ChevronRight size={11} color={C.paleSlate} />
                <span style={{ fontSize:12, color:C.lilacAsh }}>Medicine Registry</span>
                <ChevronRight size={11} color={C.paleSlate} />
                <span style={{ fontSize:11.5, color:C.techBlue, fontWeight:700,
                  background:"rgba(2,62,138,0.08)", padding:"2px 10px", borderRadius:99,
                  border:`1px solid rgba(2,62,138,0.15)` }}>Edit Medicine</span>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div>
                  <h1 style={{ margin:0, fontSize:30, fontWeight:700, letterSpacing:"-1.2px",
                    color:C.blueSlate, lineHeight:1.1, fontFamily:"'Sora',sans-serif" }}>
                    Update Medicine
                  </h1>
                  <p style={{ margin:"6px 0 0", color:C.lilacAsh, fontSize:13.5 }}>
                    {original?.mediName
                      ? <><span style={{ color:C.techBlue, fontWeight:600 }}>{original.mediName}</span> — edit and save changes below</>
                      : "Edit the medicine details below"}
                  </p>
                </div>
              </div>
            </div>

            {/* Header right: change count + actions */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10, flexShrink:0 }}>
              <ChangeBadge count={changedFields.length} />
              <div style={{ display:"flex", gap:8 }}>
                {changedFields.length > 0 && (
                  <button onClick={()=>setConfirmReset(true)} style={{
                    padding:"9px 16px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                    border:`1.5px solid rgba(180,83,9,0.25)`, background:"rgba(180,83,9,0.06)",
                    color:C.warn, fontWeight:600, fontSize:13, transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:6,
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(180,83,9,0.12)"; e.currentTarget.style.borderColor=C.warn }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="rgba(180,83,9,0.06)"; e.currentTarget.style.borderColor="rgba(180,83,9,0.25)" }}
                  ><Undo2 size={14} strokeWidth={2}/> Reset</button>
                )}
                <button onClick={()=>setShowPreview(p=>!p)} style={{
                  padding:"9px 16px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                  border:`1.5px solid ${showPreview ? C.techBlue : C.paleSlate}`,
                  background:showPreview ? "rgba(2,62,138,0.07)" : C.white,
                  color:showPreview ? C.techBlue : C.blueSlate, fontWeight:600, fontSize:13,
                  transition:"all 0.2s", display:"flex", alignItems:"center", gap:6,
                }}>
                  {showPreview ? <EyeOff size={14}/> : <Eye size={14}/>}
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Preview Panel ── */}
        {showPreview && (
          <div style={{
            borderRadius:14, padding:"20px 24px", marginBottom:22,
            background:C.white, border:`1.5px solid ${C.paleSlate}`,
            boxShadow:"0 4px 20px rgba(2,62,138,0.07)",
            animation:"fadeUp 0.3s ease both",
          }}>
            <p style={{ margin:"0 0 14px", fontSize:10.5, fontWeight:700, color:C.lilacAsh,
              letterSpacing:"0.14em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
              <Eye size={11}/> Current Values Preview
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                { label:"Medicine Name",       value:form.mediName },
                { label:"Price",               value:form.mediPrice ? `LKR ${form.mediPrice}` : "—" },
                { label:"Stock",               value:form.mediStock ? `${form.mediStock} units` : "—" },
                { label:"Category",            value:form.mediCategory || "—" },
                { label:"Manufacturer",        value:form.mediCompany || "—" },
                { label:"Pharmacy",            value:form.Pharmacy || "—" },
                { label:"Manufacture Date",    value:form.mediManufactureDate || "—" },
                { label:"Expiry Date",         value:form.mediExpiryDate || "—" },
                { label:"Prescription Status", value:form.mediPrescriptionStatus || "—" },
              ].map((d,i) => {
                const fieldKey = Object.keys(emptyForm)[i]
                const changed  = original && form[Object.keys(emptyForm)[i]] !== original[Object.keys(emptyForm)[i]]
                return (
                  <div key={i} style={{ display:"flex", flexDirection:"column", gap:3,
                    padding:"10px 12px", borderRadius:9,
                    background: changed ? "rgba(76,110,245,0.05)" : C.snow,
                    border:`1px solid ${changed ? "rgba(76,110,245,0.2)" : C.paleSlate}`,
                    transition:"all 0.2s",
                  }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color: changed ? C.lilacAsh : C.lilacAsh,
                      letterSpacing:"0.1em", textTransform:"uppercase", opacity: changed ? 1 : 0.7 }}>
                      {d.label}
                      {changed && " ✦"}
                    </span>
                    <span style={{ fontSize:13, fontWeight:600, color: changed ? C.techBlue : C.blueSlate }}>
                      {d.value}
                    </span>
                  </div>
                )
              })}
            </div>
            {form.mediDescription && (
              <div style={{ marginTop:12, padding:"10px 12px", borderRadius:9,
                background: isChanged("mediDescription") ? "rgba(76,110,245,0.05)" : C.snow,
                border:`1px solid ${isChanged("mediDescription") ? "rgba(76,110,245,0.2)" : C.paleSlate}` }}>
                <span style={{ fontSize:9.5, fontWeight:700, color:C.lilacAsh,
                  letterSpacing:"0.1em", textTransform:"uppercase", opacity:0.7 }}>Description</span>
                <p style={{ margin:"4px 0 0", fontSize:13, color:C.blueSlate, lineHeight:1.6 }}>{form.mediDescription}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Main Form Card ── */}
        <div style={{
          borderRadius:16, border:`1.5px solid ${C.paleSlate}`,
          background:C.white, boxShadow:"0 4px 24px rgba(2,62,138,0.07)",
          overflow:"hidden", animation:"fadeUp 0.4s ease 0.1s both",
        }}>

          {/* Card header */}
          <div style={{
            padding:"20px 28px", borderBottom:`1.5px solid ${C.paleSlate}`,
            display:"flex", alignItems:"center", gap:16,
            background:C.snow, position:"relative", overflow:"hidden",
          }}>
            {/* Shimmer */}
            <div style={{ position:"absolute", top:0, left:"-100%", width:"40%", height:"100%",
              background:`linear-gradient(90deg,transparent,rgba(2,62,138,0.03),transparent)`,
              animation:"shimmer 5s ease-in-out infinite", pointerEvents:"none" }} />

            <div style={{ width:44, height:44, borderRadius:11, flexShrink:0,
              background:"rgba(76,110,245,0.08)", border:"1.5px solid rgba(76,110,245,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <PencilLine size={20} color={C.lilacAsh} strokeWidth={1.8} />
            </div>

            <div style={{ flex:1 }}>
              <p style={{ margin:0, color:C.blueSlate, fontWeight:700, fontSize:17,
                letterSpacing:"-0.4px", fontFamily:"'Sora',sans-serif" }}>
                Edit Medicine Details
              </p>
              <p style={{ margin:"3px 0 0", color:C.lilacAsh, fontSize:12.5 }}>
                Fields with an <span style={{ color:C.lilacAsh, fontWeight:700 }}>EDITED</span> badge have unsaved changes
              </p>
            </div>

            {/* Progress */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
              <span style={{ fontSize:11, color:C.lilacAsh, fontWeight:600 }}>
                {Object.keys(emptyForm).filter(k => form[k]).length} / {Object.keys(emptyForm).length} fields filled
              </span>
              <div style={{ width:130, height:5, borderRadius:99, background:C.paleSlate, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:99, background:C.techBlue,
                  width:`${(Object.keys(emptyForm).filter(k=>form[k]).length / Object.keys(emptyForm).length)*100}%`,
                  boxShadow:`0 0 8px rgba(2,62,138,0.4)`,
                  transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>
          </div>

          {/* ── SECTION 1: Basic Info ── */}
          <div style={{ padding:"28px 28px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:3, height:18, borderRadius:99, background:C.techBlue }} />
              <span style={{ fontSize:11, fontWeight:700, color:C.techBlue,
                letterSpacing:"0.16em", textTransform:"uppercase" }}>Basic Information</span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Medicine Name */}
              <Field label="Medicine Name" required icon={Pill} error={errors.mediName}
                changed={isChanged("mediName")}>
                <div style={{ position:"relative" }}>
                  <input placeholder="e.g. Amoxicillin 500mg" {...fp("mediName")} />
                  {isChanged("mediName") && (
                    <button onClick={()=>handleResetField("mediName")} title="Revert to original"
                      style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                        background:"none", border:"none", cursor:"pointer", color:C.lilacAsh, opacity:0.6,
                        display:"flex", padding:0, transition:"opacity 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}
                    ><Undo2 size={13} strokeWidth={2}/></button>
                  )}
                </div>
              </Field>

              {/* Price + Stock */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Field label="Price (LKR)" required icon={DollarSign} error={errors.mediPrice}
                  hint="Retail price" changed={isChanged("mediPrice")}>
                  <div style={{ position:"relative" }}>
                    <input type="number" min="0" placeholder="e.g. 150.00" {...fp("mediPrice")} />
                    {isChanged("mediPrice") && (
                      <button onClick={()=>handleResetField("mediPrice")} title="Revert"
                        style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                          background:"none", border:"none", cursor:"pointer", color:C.lilacAsh, opacity:0.6,
                          display:"flex", padding:0 }}
                        onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                        onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}
                      ><Undo2 size={13}/></button>
                    )}
                  </div>
                </Field>
                <Field label="Stock Quantity" required icon={Hash} error={errors.mediStock}
                  hint="Units in hand" changed={isChanged("mediStock")}>
                  <div style={{ position:"relative" }}>
                    <input type="number" min="0" placeholder="e.g. 500" {...fp("mediStock")} />
                    {isChanged("mediStock") && (
                      <button onClick={()=>handleResetField("mediStock")} title="Revert"
                        style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                          background:"none", border:"none", cursor:"pointer", color:C.lilacAsh, opacity:0.6,
                          display:"flex", padding:0 }}
                        onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                        onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}
                      ><Undo2 size={13}/></button>
                    )}
                  </div>
                </Field>
              </div>

              {/* Category + Manufacturer */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Field label="Category" required icon={Tag} error={errors.mediCategory} changed={isChanged("mediCategory")}>
                  <select style={inp(!!errors.mediCategory, focused==="mediCategory", isChanged("mediCategory"))}
                    value={form.mediCategory}
                    onFocus={()=>setFocused("mediCategory")} onBlur={()=>setFocused(null)}
                    onChange={e=>handleChange("mediCategory",e.target.value)}>
                    <option value="">— Select category —</option>
                    {categories.map(c=><option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Manufacturer" required icon={Barcode} error={errors.mediCompany} changed={isChanged("mediCompany")}>
                  <div style={{ position:"relative" }}>
                    <input placeholder="e.g. Sun Pharma, Cipla" {...fp("mediCompany")} />
                    {isChanged("mediCompany") && (
                      <button onClick={()=>handleResetField("mediCompany")} title="Revert"
                        style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                          background:"none", border:"none", cursor:"pointer", color:C.lilacAsh, opacity:0.6,
                          display:"flex", padding:0 }}
                        onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                        onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}
                      ><Undo2 size={13}/></button>
                    )}
                  </div>
                </Field>
              </div>

              {/* Pharmacy */}
              <Field label="Assigned Pharmacy" required icon={Building2} error={errors.Pharmacy} changed={isChanged("Pharmacy")}>
                <select style={inp(!!errors.Pharmacy, focused==="Pharmacy", isChanged("Pharmacy"))}
                  value={form.Pharmacy}
                  onFocus={()=>setFocused("Pharmacy")} onBlur={()=>setFocused(null)}
                  onChange={e=>handleChange("Pharmacy",e.target.value)}>
                  <option value="">— Select a pharmacy —</option>
                  {pharmaciesList.map(p=><option key={p}>{p}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Divider */}
          <div style={{ margin:"28px 28px 0", height:"1.5px", background:C.paleSlate }} />

          {/* ── SECTION 2: Details ── */}
          <div style={{ padding:"24px 28px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:3, height:18, borderRadius:99, background:C.lilacAsh }} />
              <span style={{ fontSize:11, fontWeight:700, color:C.lilacAsh,
                letterSpacing:"0.16em", textTransform:"uppercase" }}>Details & Dates</span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Description */}
              <Field label="Description" required icon={FileText} error={errors.mediDescription}
                hint="Usage & notes" changed={isChanged("mediDescription")}>
                <textarea
                  placeholder="Brief description of the medicine, its usage and important notes..."
                  value={form.mediDescription}
                  onFocus={()=>setFocused("mediDescription")} onBlur={()=>setFocused(null)}
                  onChange={e=>handleChange("mediDescription",e.target.value)}
                  rows={4}
                  style={{ ...inp(!!errors.mediDescription, focused==="mediDescription", isChanged("mediDescription")),
                    resize:"vertical", minHeight:110, lineHeight:1.7 }}
                />
              </Field>

              {/* Dates */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Field label="Manufacture Date" required icon={Calendar} error={errors.mediManufactureDate} changed={isChanged("mediManufactureDate")}>
                  <input type="date"
                    style={inp(!!errors.mediManufactureDate, focused==="mediManufactureDate", isChanged("mediManufactureDate"))}
                    value={form.mediManufactureDate}
                    onFocus={()=>setFocused("mediManufactureDate")} onBlur={()=>setFocused(null)}
                    onChange={e=>handleChange("mediManufactureDate",e.target.value)}
                  />
                </Field>
                <Field label="Expiry Date" required icon={Calendar} error={errors.mediExpiryDate} changed={isChanged("mediExpiryDate")}>
                  <input type="date"
                    style={inp(!!errors.mediExpiryDate, focused==="mediExpiryDate", isChanged("mediExpiryDate"))}
                    value={form.mediExpiryDate}
                    onFocus={()=>setFocused("mediExpiryDate")} onBlur={()=>setFocused(null)}
                    onChange={e=>handleChange("mediExpiryDate",e.target.value)}
                  />
                </Field>
              </div>

              {/* Prescription Status */}
              <Field label="Prescription Status" required icon={ShieldCheck} error={errors.mediPrescriptionStatus} changed={isChanged("mediPrescriptionStatus")}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {prescriptionStatuses.map(ps=>{
                    const active = form.mediPrescriptionStatus===ps.key
                    const Icon   = ps.icon
                    return (
                      <button key={ps.key} type="button"
                        onClick={()=>handleChange("mediPrescriptionStatus",ps.key)}
                        style={{
                          padding:"14px 10px", borderRadius:10,
                          border:`1.5px solid ${active ? ps.border : C.paleSlate}`,
                          background: active ? ps.bg : C.white,
                          cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                          display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                          transform: active ? "translateY(-2px)" : "none",
                          boxShadow: active ? `0 6px 20px ${ps.color}18` : "0 2px 8px rgba(2,62,138,0.04)",
                        }}
                        onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor=ps.border; e.currentTarget.style.background=ps.bg }}}
                        onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.background=C.white }}}
                      >
                        <Icon size={20} color={active ? ps.color : C.lilacAsh} strokeWidth={1.8} />
                        <span style={{ fontSize:11.5, fontWeight:600, textAlign:"center", lineHeight:1.3,
                          color: active ? ps.color : C.blueSlate, transition:"color 0.2s" }}>{ps.key}</span>
                      </button>
                    )
                  })}
                </div>
              </Field>

              {/* Image Upload */}
              <Field label="Medicine Image" required icon={ImagePlus} error={errors.mediImage} changed={isChanged("mediImage")}>
                <label style={{
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:12,
                  border:`1.5px dashed ${errors.mediImage ? C.danger : imagePreview ? C.techBlue : C.paleSlate}`,
                  borderRadius:12, padding:"28px 24px", cursor:"pointer",
                  background: imagePreview ? "rgba(2,62,138,0.03)" : C.white,
                  transition:"all 0.25s", minHeight:140, position:"relative", overflow:"hidden",
                }}
                  onMouseEnter={e=>{ if(!imagePreview) e.currentTarget.style.borderColor=C.techBlue }}
                  onMouseLeave={e=>{ if(!imagePreview) e.currentTarget.style.borderColor=C.paleSlate }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview"
                      style={{ height:80, borderRadius:8, objectFit:"contain", opacity:0.9 }} />
                  ) : (
                    <>
                      <div style={{ width:48, height:48, background:"rgba(2,62,138,0.07)",
                        borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
                        border:`1.5px solid rgba(2,62,138,0.15)` }}>
                        <Upload size={20} color={C.techBlue} strokeWidth={1.8} />
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <p style={{ margin:0, fontSize:13.5, color:C.blueSlate, fontWeight:600 }}>Click or drag to replace</p>
                        <p style={{ margin:"3px 0 0", fontSize:11.5, color:C.lilacAsh }}>PNG, JPG up to 5MB</p>
                      </div>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display:"none" }} />
                </label>
                {imagePreview && (
                  <button type="button"
                    onClick={()=>{ setImagePreview(null); handleChange("mediImage","") }}
                    style={{ background:"none", border:"none", fontSize:12, color:C.danger, cursor:"pointer",
                      fontFamily:"inherit", fontWeight:600, padding:"4px 0", opacity:0.7,
                      display:"flex", alignItems:"center", gap:5, transition:"opacity 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}
                  >
                    <X size={13}/> Remove image
                  </button>
                )}
              </Field>

            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            margin:"28px 0 0",
            padding:"18px 28px",
            borderTop:`1.5px solid ${C.paleSlate}`,
            background:C.snow,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            {/* Left: change summary */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {changedFields.length > 0 ? (
                <div style={{ display:"flex", alignItems:"center", gap:7,
                  padding:"6px 14px", borderRadius:99,
                  background:"rgba(76,110,245,0.07)", border:"1px solid rgba(76,110,245,0.2)" }}>
                  <PencilLine size={12} color={C.lilacAsh} />
                  <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:600 }}>
                    {changedFields.length} unsaved change{changedFields.length>1?"s":""}
                  </span>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:7,
                  padding:"6px 14px", borderRadius:99,
                  background:"rgba(14,124,91,0.07)", border:"1px solid rgba(14,124,91,0.18)" }}>
                  <Check size={12} color={C.success} strokeWidth={2.5} />
                  <span style={{ fontSize:12, color:C.success, fontWeight:600 }}>No changes</span>
                </div>
              )}
            </div>

            {/* Right: action buttons */}
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={()=>navigate(-1)} style={{
                padding:"10px 20px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                border:`1.5px solid ${C.paleSlate}`, background:C.white,
                color:C.blueSlate, fontWeight:600, fontSize:13.5, transition:"all 0.2s",
                display:"flex", alignItems:"center", gap:6,
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
              >
                <X size={14} /> Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || changedFields.length===0}
                style={{
                  padding:"10px 26px", borderRadius:9, border:"none",
                  background: (submitting||changedFields.length===0) ? C.paleSlate : C.techBlue,
                  color: (submitting||changedFields.length===0) ? C.lilacAsh : C.snow,
                  fontWeight:700, fontSize:13.5,
                  cursor:(submitting||changedFields.length===0)?"not-allowed":"pointer",
                  fontFamily:"inherit",
                  boxShadow:(submitting||changedFields.length===0)?"none":`0 4px 18px rgba(2,62,138,0.3)`,
                  transition:"all 0.22s",
                  display:"flex", alignItems:"center", gap:8,
                }}
                onMouseEnter={e=>{ if(!submitting&&changedFields.length>0){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(2,62,138,0.38)" }}}
                onMouseLeave={e=>{ if(!submitting&&changedFields.length>0){ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 18px rgba(2,62,138,0.3)" }}}
              >
                {submitting ? (
                  <><Loader2 size={15} style={{ animation:"spin 0.8s linear infinite" }}/> Saving changes...</>
                ) : (
                  <><Save size={15} strokeWidth={2.2}/> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={{ height:48 }} />
      </div>

      <SavedToast />
      <ResetModal />
    </div>
  )
}