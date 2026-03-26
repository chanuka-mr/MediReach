import React, { useState } from 'react'
import {
  ArrowLeft, ChevronRight, AlertCircle, CheckCircle2,
  Package, FileText, Pill, Building2, Calendar,
  DollarSign, Hash, Tag, Layers, Upload, X,
  Loader2, Check, ShieldCheck, ShieldAlert, ShieldOff,
  Stethoscope, FlaskConical, Barcode, ImagePlus,
  ClipboardList, Info, LayoutGrid
} from 'lucide-react'

// ── Palette — matches InventoryDashboard exactly ──────────────────
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
  { key: "required", icon: ShieldCheck, color: C.techBlue,  bg: "rgba(2,62,138,0.07)",   border: "rgba(2,62,138,0.2)"  },
  { key: "not required", icon: ShieldOff,   color: C.success,   bg: "rgba(14,124,91,0.07)",  border: "rgba(14,124,91,0.2)" },
  { key: "optional", icon: ShieldAlert, color: C.warn,      bg: "rgba(180,83,9,0.07)",   border: "rgba(180,83,9,0.2)"  },
]

const initialForm = {
  mediName:"", mediPrice:"", mediDescription:"", mediImage:"",
  mediCategory:"", mediStock:"", mediCompany:"",
  mediExpiryDate:"", mediManufactureDate:"",
  mediPrescriptionStatus:"", Pharmacy:"",
}

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, required, error, icon: Icon, hint, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <label style={{
          display:"flex", alignItems:"center", gap:5,
          fontSize:10.5, fontWeight:700,
          color: error ? C.danger : C.lilacAsh,
          letterSpacing:"0.13em", textTransform:"uppercase",
        }}>
          {Icon && <Icon size={10} strokeWidth={2.2} />}
          {label}
          {required && <span style={{ color:C.techBlue, marginLeft:1 }}>*</span>}
        </label>
        {hint && (
          <span style={{ fontSize:10.5, color:C.lilacAsh, fontWeight:400, opacity:0.6, display:"flex", alignItems:"center", gap:3 }}>
            <Info size={9} />
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <span style={{ fontSize:11, color:C.danger, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
          <AlertCircle size={11} strokeWidth={2.5} />
          {error}
        </span>
      )}
    </div>
  )
}

// ── Input base style ──────────────────────────────────────────────
const inputBase = (hasError, focused) => ({
  padding:"10px 13px",
  borderRadius:9,
  border:`1.5px solid ${hasError ? C.danger : focused ? C.techBlue : C.paleSlate}`,
  background: focused ? C.snow : C.white,
  fontSize:13.5,
  outline:"none",
  fontFamily:"inherit",
  color: C.blueSlate,
  width:"100%",
  transition:"border-color 0.2s, background 0.2s, box-shadow 0.2s",
  boxSizing:"border-box",
  fontWeight:400,
  boxShadow: focused ? `0 0 0 3px rgba(2,62,138,0.08)` : hasError ? `0 0 0 3px rgba(192,57,43,0.07)` : "none",
})

export default function MedicineAdd() {
  const [form,         setForm]         = useState(initialForm)
  const [errors,       setErrors]       = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [apiError,     setApiError]     = useState(null)
  const [step,         setStep]         = useState(1)
  const [focused,      setFocused]      = useState(null)

  const inp = (field) => inputBase(!!errors[field], focused === field)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      handleChange("mediImage", file.name)
    }
  }

  const imageRequired = form.mediPrescriptionStatus === "required"

  const validate = () => {
    const errs = {}
    // Check all fields except mediImage
    const requiredFields = Object.keys(initialForm).filter(k => k !== "mediImage")
    requiredFields.forEach(k => {
      if (!form[k] || (typeof form[k] === "string" && !form[k].trim())) {
        errs[k] = "This field is required"
      }
    })
    // mediImage: only required for required prescription status
    if (imageRequired && !form.mediImage) {
      errs.mediImage = "Image is required for prescription medicines"
    }
    
    // mediName validation (backend: 2-100 characters)
    if (form.mediName && form.mediName.trim().length < 2) {
      errs.mediName = "Medicine name must be at least 2 characters"
    } else if (form.mediName && form.mediName.trim().length > 100) {
      errs.mediName = "Medicine name must not exceed 100 characters"
    }
    
    // mediDescription validation (backend: required, max 1000 characters)
    if (form.mediDescription && form.mediDescription.trim().length > 1000) {
      errs.mediDescription = "Description must not exceed 1000 characters"
    }
    
    // Numeric checks (backend: non-negative for price, non-negative integer for stock)
    if (form.mediPrice && isNaN(Number(form.mediPrice))) errs.mediPrice = "Must be a valid number"
    else if (form.mediPrice && Number(form.mediPrice) < 0) errs.mediPrice = "Price must be non-negative"
    
    if (form.mediStock && isNaN(Number(form.mediStock))) errs.mediStock = "Must be a valid number"
    else if (form.mediStock && !Number.isInteger(Number(form.mediStock))) errs.mediStock = "Must be an integer"
    else if (form.mediStock && Number(form.mediStock) < 0) errs.mediStock = "Stock cannot be negative"
    
    // Date validation (backend: expiry must be future, manufacture must be past)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to midnight for fair comparison
    
    if (form.mediExpiryDate) {
      const expiryDate = new Date(form.mediExpiryDate)
      if (isNaN(Date.parse(form.mediExpiryDate))) {
        errs.mediExpiryDate = "Must be a valid date"
      } else if (expiryDate <= today) {
        errs.mediExpiryDate = "Expiry date must be in the future"
      }
    }
    
    if (form.mediManufactureDate) {
      const manufactureDate = new Date(form.mediManufactureDate)
      if (isNaN(Date.parse(form.mediManufactureDate))) {
        errs.mediManufactureDate = "Must be a valid date"
      } else if (manufactureDate > today) {
        errs.mediManufactureDate = "Manufacture date cannot be in the future"
      }
    }
    
    // Cross-field date validation
    if (form.mediManufactureDate && form.mediExpiryDate) {
      const manufactureDate = new Date(form.mediManufactureDate)
      const expiryDate = new Date(form.mediExpiryDate)
      
      if (!isNaN(Date.parse(form.mediManufactureDate)) && !isNaN(Date.parse(form.mediExpiryDate))) {
        if (manufactureDate >= expiryDate) {
          errs.mediExpiryDate = "Manufacture date must be before expiry date"
        }
      }
    }
    
    // Prescription status validation (backend: specific values allowed)
    const validStatuses = ['required', 'not required', 'optional']
    if (form.mediPrescriptionStatus && !validStatuses.includes(form.mediPrescriptionStatus.toLowerCase())) {
      errs.mediPrescriptionStatus = "Invalid prescription status"
    }
    
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const s1Fields = ["mediName","mediPrice","mediCategory","mediCompany","mediStock","Pharmacy"]
      setStep(s1Fields.some(f => errs[f]) ? 1 : 2)
      return
    }
    setSubmitting(true); setApiError(null)
    try {
      // Build payload — mediImage defaults to "N/A" when not required and not uploaded
      const payload = {
        mediName:               form.mediName.trim(),
        mediPrice:              Number(form.mediPrice),
        mediDescription:        form.mediDescription.trim(),
        mediImage:              form.mediImage || "N/A",
        mediCategory:           form.mediCategory,
        mediStock:              Number(form.mediStock),
        mediCompany:            form.mediCompany.trim(),
        mediExpiryDate:         form.mediExpiryDate,
        mediManufactureDate:    form.mediManufactureDate,
        mediPrescriptionStatus: form.mediPrescriptionStatus,
        Pharmacy:               form.Pharmacy,
      }

      console.log("Submitting medicine:", payload)   // helpful for debugging

      const res = await fetch(API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })

      let data = {}
      try { data = await res.json() } catch(_) {}

      if (!res.ok) {
        // Show the exact server error message if available
        const msg = data.message || data.error || `Server error ${res.status}`
        throw new Error(msg)
      }
      setSubmitted(true)
    } catch(err) {
      // Distinguish network errors from server errors
      if (err.name === "TypeError") {
        setApiError("Cannot reach the server. Make sure the backend is running on http://localhost:5000")
      } else {
        setApiError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm(initialForm); setErrors({}); setImagePreview(null)
    setSubmitted(false); setApiError(null); setStep(1)
  }

  const fp = (field) => ({
    style: inp(field),
    value: form[field],
    onFocus:  () => setFocused(field),
    onBlur:   () => setFocused(null),
    onChange: (e) => handleChange(field, e.target.value),
  })

  const step1Fields = ["mediName","mediPrice","mediCategory","mediCompany","mediStock","Pharmacy"]
  const step2Fields = ["mediDescription","mediManufactureDate","mediExpiryDate","mediPrescriptionStatus","mediImage"]
  const s1Fill = step1Fields.filter(f => form[f]).length / step1Fields.length
  const s2Fill = step2Fields.filter(f => form[f]).length / step2Fields.length

  // ── Success Screen ────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight:"100vh", background:C.snow,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif", padding:24,
        position:"relative",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          @keyframes popIn { from{opacity:0;transform:scale(0.75) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        {/* Dot grid bg */}
        <div style={{
          position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
          backgroundImage:`radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
          backgroundSize:"28px 28px", opacity:0.4,
        }} />

        <div style={{
          borderRadius:24, padding:"52px 48px", textAlign:"center", maxWidth:460, width:"100%",
          background:C.white,
          border:`1.5px solid ${C.paleSlate}`,
          boxShadow:"0 24px 64px rgba(2,62,138,0.1)",
          animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          position:"relative", zIndex:1,
        }}>
          {/* Success ring */}
          <div style={{
            width:86, height:86, borderRadius:"50%", margin:"0 auto 28px",
            background:`rgba(14,124,91,0.08)`,
            border:`1.5px solid rgba(14,124,91,0.25)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 32px rgba(14,124,91,0.12)",
          }}>
            <CheckCircle2 size={40} color={C.success} strokeWidth={1.5} />
          </div>

          <h2 style={{
            margin:"0 0 8px", fontSize:28, fontWeight:800,
            color:C.blueSlate, letterSpacing:"-1px",
            fontFamily:"'Sora',sans-serif",
          }}>Medicine Registered</h2>
          <p style={{ margin:"0 0 6px", color:C.lilacAsh, fontSize:14 }}>
            <span style={{ color:C.techBlue, fontWeight:600 }}>{form.mediName}</span> has been added to the MediReach network.
          </p>

          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(2,62,138,0.07)", borderRadius:99, padding:"6px 16px",
            margin:"16px 0 36px", border:`1px solid rgba(2,62,138,0.15)`,
          }}>
            <Building2 size={12} color={C.techBlue} />
            <span style={{ fontSize:12.5, fontWeight:600, color:C.techBlue }}>{form.Pharmacy}</span>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={handleReset} style={{
              padding:"11px 22px", borderRadius:9,
              border:`1.5px solid ${C.paleSlate}`, background:C.white,
              color:C.blueSlate, fontWeight:600, fontSize:13.5,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:7,
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
            >
              <Package size={14} /> Add Another
            </button>
            <button onClick={()=>window.history.back()} style={{
              padding:"11px 22px", borderRadius:9, border:"none",
              background:C.techBlue,
              color:C.snow, fontWeight:600, fontSize:13.5,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:7,
              boxShadow:`0 6px 22px rgba(2,62,138,0.28)`,
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 10px 30px rgba(2,62,138,0.38)` }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 6px 22px rgba(2,62,138,0.28)` }}
            >
              <ArrowLeft size={14} /> Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Form ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      background: C.snow,
      fontFamily:"'DM Sans',sans-serif",
      padding:"36px 40px 64px",
      position:"relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }

        input::placeholder, textarea::placeholder { color:${C.lilacAsh}; opacity:0.55; }
        input[type="date"] { color-scheme:light; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: none; cursor:pointer; opacity:0.5;
        }
        select option { color:${C.blueSlate}; background:${C.snow}; }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.paleSlate}; border-radius:99px; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Top palette stripe */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, height:3, zIndex:99,
        background:`linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh}, ${C.paleSlate}, ${C.snow})`,
      }} />

      {/* Dot grid bg */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
        backgroundSize:"28px 28px", opacity:0.35,
      }} />

      {/* Radial bg accents */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`
          radial-gradient(circle at 5% 5%, rgba(2,62,138,0.05) 0%, transparent 40%),
          radial-gradient(circle at 95% 90%, rgba(76,110,245,0.06) 0%, transparent 40%)
        `,
      }} />

      <div style={{ maxWidth:780, margin:"0 auto", position:"relative", zIndex:1, paddingTop:4 }}>

        {/* ── Back + Header ── */}
        <div style={{ marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
          <button onClick={()=>window.history.back()} style={{
            background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
            color:C.lilacAsh, fontSize:13, fontWeight:500,
            fontFamily:"inherit", marginBottom:22, padding:0, transition:"color 0.2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.color=C.techBlue}
            onMouseLeave={e=>e.currentTarget.style.color=C.lilacAsh}
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Dashboard
          </button>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:20 }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                <div style={{
                  width:30, height:30, borderRadius:8,
                  background:C.techBlue,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 4px 12px rgba(2,62,138,0.28)`,
                }}>
                  <Pill size={14} color={C.snow} strokeWidth={2} />
                </div>
                <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:400 }}>MediReach</span>
                <ChevronRight size={11} color={C.paleSlate} />
                <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:400 }}>Medicine Registry</span>
                <ChevronRight size={11} color={C.paleSlate} />
                <span style={{
                  fontSize:11.5, color:C.techBlue, fontWeight:700,
                  background:"rgba(2,62,138,0.08)", padding:"2px 10px", borderRadius:99,
                  border:`1px solid rgba(2,62,138,0.15)`,
                }}>Add Medicine</span>
              </div>

              <h1 style={{
                margin:0, fontSize:32, fontWeight:700,
                letterSpacing:"-1.4px", color:C.blueSlate, lineHeight:1.1,
                fontFamily:"'Sora',sans-serif",
              }}>Register New Medicine</h1>
              <p style={{ margin:"7px 0 0", color:C.lilacAsh, fontSize:14, fontWeight:400 }}>
                Complete both steps to register a medicine across the network.
              </p>
            </div>

            {/* Step tabs */}
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              {[
                { num:1, label:"Basic Info", fill:s1Fill },
                { num:2, label:"Details",    fill:s2Fill },
              ].map(s => (
                <button key={s.num} onClick={()=>setStep(s.num)} style={{
                  padding:"8px 16px", borderRadius:9,
                  border:`1.5px solid ${step===s.num ? C.techBlue : C.paleSlate}`,
                  background: step===s.num ? C.techBlue : C.white,
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                  display:"flex", alignItems:"center", gap:8,
                  boxShadow: step===s.num ? `0 4px 16px rgba(2,62,138,0.22)` : "none",
                }}>
                  <div style={{
                    width:20, height:20, borderRadius:"50%", flexShrink:0,
                    background: s.fill===1
                      ? `linear-gradient(135deg, ${C.success}, rgba(14,124,91,0.7))`
                      : step===s.num
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(2,62,138,0.08)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    border:`1px solid ${step===s.num ? "rgba(255,255,255,0.3)" : C.paleSlate}`,
                    transition:"all 0.3s",
                  }}>
                    {s.fill===1
                      ? <Check size={10} color={C.snow} strokeWidth={3} />
                      : <span style={{ fontSize:10, fontWeight:800, color: step===s.num ? C.snow : C.lilacAsh }}>{s.num}</span>
                    }
                  </div>
                  <span style={{ fontSize:12.5, fontWeight:600, color: step===s.num ? C.snow : C.blueSlate }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── API Error ── */}
        {apiError && (
          <div style={{
            background:"rgba(192,57,43,0.06)", border:`1.5px solid rgba(192,57,43,0.28)`,
            borderRadius:12, padding:"16px 20px", marginBottom:22,
            animation:"fadeUp 0.3s ease both",
          }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div style={{
                width:36, height:36, borderRadius:"50%", flexShrink:0,
                background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <AlertCircle size={17} color={C.danger} strokeWidth={2} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ margin:"0 0 4px", fontWeight:700, color:C.danger, fontSize:14 }}>
                  Failed to save medicine
                </p>
                <p style={{ margin:0, color:C.danger, fontSize:12.5, opacity:0.8, lineHeight:1.5 }}>
                  {apiError}
                </p>
                <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8,
                  background:"rgba(192,57,43,0.05)", border:"1px solid rgba(192,57,43,0.15)" }}>
                  <p style={{ margin:0, fontSize:11, color:C.danger, opacity:0.6, fontWeight:500 }}>
                    Checklist: ① Backend running on port 5000 &nbsp;·&nbsp; ② CORS enabled &nbsp;·&nbsp; ③ MongoDB connected &nbsp;·&nbsp; ④ All required fields filled
                  </p>
                </div>
              </div>
              <button onClick={()=>setApiError(null)} style={{
                background:"none", border:"none", cursor:"pointer",
                color:C.danger, opacity:0.5, flexShrink:0,
                display:"flex", alignItems:"center", padding:0,
              }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Main Form Card ── */}
        <div style={{
          borderRadius:16,
          border:`1.5px solid ${C.paleSlate}`,
          background:C.white,
          boxShadow:"0 4px 24px rgba(2,62,138,0.07)",
          overflow:"hidden",
          animation:"fadeUp 0.4s ease 0.1s both",
        }}>

          {/* Card Header */}
          <div style={{
            padding:"20px 28px",
            borderBottom:`1.5px solid ${C.paleSlate}`,
            display:"flex", alignItems:"center", gap:16,
            background:C.snow,
            position:"relative", overflow:"hidden",
          }}>
            {/* Shimmer */}
            <div style={{
              position:"absolute", top:0, left:"-100%", width:"40%", height:"100%",
              background:`linear-gradient(90deg,transparent,rgba(2,62,138,0.03),transparent)`,
              animation:"shimmer 5s ease-in-out infinite", pointerEvents:"none",
            }} />

            <div style={{
              width:44, height:44, borderRadius:11, flexShrink:0,
              background: step===1 ? `rgba(2,62,138,0.08)` : "rgba(76,110,245,0.07)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:`1.5px solid ${step===1 ? `rgba(2,62,138,0.18)` : C.paleSlate}`,
              transition:"all 0.3s",
            }}>
              {step===1
                ? <ClipboardList size={20} color={C.techBlue} strokeWidth={1.8} />
                : <FileText      size={20} color={C.lilacAsh}  strokeWidth={1.8} />
              }
            </div>

            <div style={{ flex:1 }}>
              <p style={{ margin:0, color:C.blueSlate, fontWeight:700, fontSize:17, letterSpacing:"-0.4px", fontFamily:"'Sora',sans-serif" }}>
                {step===1 ? "Basic Information" : "Details & Dates"}
              </p>
              <p style={{ margin:"3px 0 0", color:C.lilacAsh, fontSize:12.5, fontWeight:400 }}>
                {step===1
                  ? "Name, pricing, stock, category and assigned pharmacy"
                  : "Description, validity dates, status and medicine image"}
              </p>
            </div>

            {/* Progress */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:C.lilacAsh, fontWeight:600 }}>
                  {step===1 ? Math.round(s1Fill*100) : Math.round(s2Fill*100)}% filled
                </span>
                {((step===1 && s1Fill===1)||(step===2 && s2Fill===1)) && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:4,
                    background:"rgba(14,124,91,0.08)", borderRadius:99, padding:"2px 8px",
                    border:`1px solid rgba(14,124,91,0.2)`,
                  }}>
                    <Check size={9} color={C.success} strokeWidth={3} />
                    <span style={{ fontSize:9.5, fontWeight:800, color:C.success, letterSpacing:"0.08em" }}>DONE</span>
                  </div>
                )}
              </div>
              <div style={{ width:130, height:5, borderRadius:99, background:C.paleSlate, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:99,
                  width:`${(step===1?s1Fill:s2Fill)*100}%`,
                  background:C.techBlue,
                  boxShadow:`0 0 8px rgba(2,62,138,0.4)`,
                  transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>
          </div>

          {/* ── Fields ── */}
          <div style={{ padding:"28px 28px 26px" }}>

            {/* STEP 1 */}
            {step===1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                <Field label="Medicine Name" required icon={Pill} error={errors.mediName}>
                  <input className="mr-input" placeholder="e.g. Amoxicillin 500mg" {...fp("mediName")} />
                </Field>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <Field label="Price (LKR)" required icon={DollarSign} error={errors.mediPrice} hint="Retail price">
                    <input className="mr-input" type="number" min="0" placeholder="e.g. 150.00" {...fp("mediPrice")} />
                  </Field>
                  <Field label="Stock Quantity" required icon={Hash} error={errors.mediStock} hint="Units in hand">
                    <input className="mr-input" type="number" min="0" placeholder="e.g. 500" {...fp("mediStock")} />
                  </Field>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <Field label="Category" required icon={Tag} error={errors.mediCategory}>
                    <select style={inp("mediCategory")}
                      value={form.mediCategory}
                      onFocus={()=>setFocused("mediCategory")}
                      onBlur={()=>setFocused(null)}
                      onChange={e=>handleChange("mediCategory",e.target.value)}
                    >
                      <option value="">— Select category —</option>
                      {categories.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Manufacturer" required icon={Barcode} error={errors.mediCompany}>
                    <input placeholder="e.g. Sun Pharma, Cipla" {...fp("mediCompany")} />
                  </Field>
                </div>

                <Field label="Assigned Pharmacy" required icon={Building2} error={errors.Pharmacy}>
                  <select style={inp("Pharmacy")}
                    value={form.Pharmacy}
                    onFocus={()=>setFocused("Pharmacy")}
                    onBlur={()=>setFocused(null)}
                    onChange={e=>handleChange("Pharmacy",e.target.value)}
                  >
                    <option value="">— Select a pharmacy —</option>
                    {pharmaciesList.map(p=><option key={p}>{p}</option>)}
                  </select>
                </Field>

              </div>
            )}

            {/* STEP 2 */}
            {step===2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                <Field label="Description" required icon={FileText} error={errors.mediDescription} hint="Usage & notes">
                  <textarea
                    placeholder="Brief description of the medicine, its usage and important notes..."
                    value={form.mediDescription}
                    onFocus={()=>setFocused("mediDescription")}
                    onBlur={()=>setFocused(null)}
                    onChange={e=>handleChange("mediDescription",e.target.value)}
                    rows={4}
                    style={{ ...inp("mediDescription"), resize:"vertical", minHeight:110, lineHeight:1.7 }}
                  />
                </Field>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  {/* Manufacture Date — max is yesterday (cannot pick today or future) */}
                  <Field label="Manufacture Date" required icon={Calendar} error={errors.mediManufactureDate}
                    hint="Must be a past date">
                    <input type="date"
                      style={inp("mediManufactureDate")}
                      value={form.mediManufactureDate}
                      max={(() => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().split("T")[0] })()}
                      onFocus={()=>setFocused("mediManufactureDate")}
                      onBlur={()=>setFocused(null)}
                      onChange={e => {
                        handleChange("mediManufactureDate", e.target.value)
                        // Clear expiry if it's now invalid relative to new mfg date
                        if (form.mediExpiryDate && e.target.value && new Date(form.mediExpiryDate) <= new Date(e.target.value)) {
                          handleChange("mediExpiryDate", "")
                        }
                      }}
                    />
                  </Field>

                  {/* Expiry Date — disabled until manufacture date chosen; min = day after manufacture date */}
                  <Field label="Expiry Date" required icon={Calendar} error={errors.mediExpiryDate}
                    hint={form.mediManufactureDate ? "Must be after manufacture date" : "Select manufacture date first"}>
                    <div style={{ position:"relative" }}>
                      <input type="date"
                        style={{
                          ...inp("mediExpiryDate"),
                          opacity: form.mediManufactureDate ? 1 : 0.45,
                          cursor:  form.mediManufactureDate ? "pointer" : "not-allowed",
                          background: form.mediManufactureDate ? (focused==="mediExpiryDate" ? C.snow : C.white) : C.paleSlate,
                        }}
                        value={form.mediExpiryDate}
                        disabled={!form.mediManufactureDate}
                        min={(() => {
                          if (!form.mediManufactureDate) return ""
                          const d = new Date(form.mediManufactureDate)
                          d.setDate(d.getDate() + 1)
                          return d.toISOString().split("T")[0]
                        })()}
                        onFocus={()=>setFocused("mediExpiryDate")}
                        onBlur={()=>setFocused(null)}
                        onChange={e=>handleChange("mediExpiryDate",e.target.value)}
                      />
                      {/* Lock overlay when disabled */}
                      {!form.mediManufactureDate && (
                        <div style={{
                          position:"absolute", inset:0, borderRadius:9,
                          display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                          pointerEvents:"none",
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke={C.lilacAsh} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ opacity:0.5 }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          <span style={{ fontSize:12, color:C.lilacAsh, fontWeight:600, opacity:0.6 }}>
                            Enter manufacture date first
                          </span>
                        </div>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Prescription Status */}
                <Field label="Prescription Status" required icon={ShieldCheck} error={errors.mediPrescriptionStatus}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                    {prescriptionStatuses.map(ps => {
                      const active = form.mediPrescriptionStatus === ps.key
                      const Icon = ps.icon
                      return (
                        <button
                          key={ps.key} type="button"
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
                          <Icon size={20} color={active ? ps.color : C.lilacAsh} strokeWidth={1.8} style={{ transition:"color 0.2s" }} />
                          <span style={{
                            fontSize:11.5, fontWeight:600,
                            color: active ? ps.color : C.blueSlate,
                            textAlign:"center", lineHeight:1.3, transition:"color 0.2s",
                          }}>{ps.key}</span>
                        </button>
                      )
                    })}
                  </div>
                </Field>

                {/* Image Upload */}
                <Field label="Medicine Image" required={imageRequired} icon={ImagePlus} error={errors.mediImage}
                  hint={imageRequired ? "Required for Rx medicines" : "Optional for OTC / Controlled"}>
                  <label style={{
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:12,
                    border:`1.5px dashed ${errors.mediImage ? C.danger : imagePreview ? C.techBlue : imageRequired ? C.lilacAsh : C.paleSlate}`,
                    borderRadius:12, padding:"32px 24px", cursor:"pointer",
                    background: imagePreview ? "rgba(2,62,138,0.03)" : imageRequired ? "rgba(76,110,245,0.02)" : C.white,
                    transition:"all 0.25s", minHeight:150,
                    position:"relative", overflow:"hidden",
                  }}
                    onMouseEnter={e=>{ if(!imagePreview) e.currentTarget.style.borderColor=C.techBlue }}
                    onMouseLeave={e=>{ if(!imagePreview) e.currentTarget.style.borderColor=C.paleSlate }}
                    onDragOver={e=>{ e.preventDefault(); e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.background="rgba(2,62,138,0.04)" }}
                    onDragLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.background=C.white }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview"
                        style={{ height:90, borderRadius:10, objectFit:"contain", opacity:0.9 }} />
                    ) : (
                      <>
                        <div style={{
                          width:52, height:52,
                          background:"rgba(2,62,138,0.07)",
                          borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
                          border:`1.5px solid rgba(2,62,138,0.15)`,
                        }}>
                          <Upload size={22} color={C.techBlue} strokeWidth={1.8} />
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <p style={{ margin:0, fontSize:14, color:C.blueSlate, fontWeight:600 }}>
                            Click or drag to upload
                          </p>
                          <p style={{ margin:"4px 0 0", fontSize:11.5, color:C.lilacAsh }}>
                            PNG, JPG up to 5MB
                          </p>
                          {!imageRequired && (
                            <p style={{ margin:"8px 0 0", fontSize:11, color:C.lilacAsh, opacity:0.6,
                              display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                              <ShieldOff size={10} strokeWidth={2} />
                              Optional — not required for this status
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display:"none" }} />
                  </label>
                  {imagePreview && (
                    <button type="button"
                      onClick={()=>{ setImagePreview(null); handleChange("mediImage","") }}
                      style={{
                        background:"none", border:"none", fontSize:12,
                        color:C.danger, cursor:"pointer",
                        fontFamily:"inherit", fontWeight:600, padding:"4px 0",
                        display:"flex", alignItems:"center", gap:5, transition:"opacity 0.2s",
                        opacity:0.7,
                      }}
                      onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}
                    >
                      <X size={13} /> Remove image
                    </button>
                  )}
                </Field>

              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding:"16px 28px",
            borderTop:`1.5px solid ${C.paleSlate}`,
            background:C.snow,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            {/* Step dots */}
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {[1,2].map(i=>(
                <div key={i} style={{
                  width:i===step?24:8, height:8, borderRadius:99,
                  background: i===step ? C.techBlue : C.paleSlate,
                  boxShadow: i===step ? `0 0 10px rgba(2,62,138,0.35)` : "none",
                  transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
                }} />
              ))}
              <span style={{ marginLeft:10, fontSize:11.5, color:C.lilacAsh, fontWeight:500 }}>
                Step {step} of 2
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:8 }}>
              {step>1 && (
                <button type="button" onClick={()=>setStep(1)} style={{
                  padding:"9px 20px", borderRadius:9,
                  border:`1.5px solid ${C.paleSlate}`,
                  background:C.white,
                  color:C.blueSlate, fontWeight:600, fontSize:13.5,
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                  display:"flex", alignItems:"center", gap:6,
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.techBlue; e.currentTarget.style.color=C.techBlue }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.paleSlate; e.currentTarget.style.color=C.blueSlate }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}

              {step===1 ? (
                <button type="button" onClick={()=>setStep(2)} style={{
                  padding:"9px 24px", borderRadius:9, border:"none",
                  background:C.techBlue,
                  color:C.snow, fontWeight:600, fontSize:13.5,
                  cursor:"pointer", fontFamily:"inherit",
                  boxShadow:`0 4px 18px rgba(2,62,138,0.28)`,
                  transition:"all 0.22s",
                  display:"flex", alignItems:"center", gap:7,
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px rgba(2,62,138,0.38)` }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 4px 18px rgba(2,62,138,0.28)` }}
                >
                  Continue <ChevronRight size={15} strokeWidth={2.5} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting} style={{
                  padding:"9px 24px", borderRadius:9, border:"none",
                  background: submitting ? C.paleSlate : C.techBlue,
                  color: submitting ? C.lilacAsh : C.snow,
                  fontWeight:600, fontSize:13.5,
                  cursor:submitting ? "not-allowed" : "pointer",
                  fontFamily:"inherit",
                  boxShadow: submitting ? "none" : `0 4px 18px rgba(2,62,138,0.28)`,
                  transition:"all 0.22s",
                  display:"flex", alignItems:"center", gap:8,
                }}
                  onMouseEnter={e=>{ if(!submitting){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px rgba(2,62,138,0.38)` }}}
                  onMouseLeave={e=>{ if(!submitting){ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 4px 18px rgba(2,62,138,0.28)` }}}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} style={{ animation:"spin 0.8s linear infinite" }} />
                      Saving to database...
                    </>
                  ) : (
                    <>
                      <Check size={15} strokeWidth={2.5} />
                      Submit Medicine
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ height:48 }} />
      </div>
    </div>
  )
}