import React, { useState } from 'react'
import {
  ArrowLeft, ChevronRight, AlertCircle, CheckCircle2,
  Package, FileText, Pill, Building2, Calendar,
  DollarSign, Hash, Tag, Layers, Upload, X,
  Loader2, Check, ShieldCheck, ShieldAlert, ShieldOff,
  Stethoscope, FlaskConical, Barcode, ImagePlus,
  ClipboardList, Info
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
  { key: "Prescription Required",  icon: ShieldCheck, color: C.sky,   bg: "rgba(0,180,216,0.1)",   border: "rgba(0,180,216,0.3)" },
  { key: "Over The Counter",       icon: ShieldOff,   color: C.green, bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)" },
  { key: "Controlled Substance",   icon: ShieldAlert, color: C.warn,  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
]

const initialForm = {
  mediName:"", mediPrice:"", mediDescription:"", mediImage:"",
  mediCategory:"", mediStock:"", mediCompany:"",
  mediExpiryDate:"", mediManufactureDate:"",
  mediPrescriptionStatus:"", Pharmacy:"",
}

// ── Field wrapper ────────────────────────────────────────────
function Field({ label, required, error, icon: Icon, hint, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <label style={{
          display:"flex", alignItems:"center", gap:6,
          fontSize:11, fontWeight:700,
          color: error ? "rgba(239,68,68,0.8)" : "rgba(144,224,239,0.5)",
          letterSpacing:"0.13em", textTransform:"uppercase", fontFamily:"inherit"
        }}>
          {Icon && <Icon size={11} strokeWidth={2} />}
          {label}
          {required && <span style={{ color:C.sky, marginLeft:1 }}>*</span>}
        </label>
        {hint && (
          <span style={{ fontSize:10.5, color:"rgba(144,224,239,0.25)", fontWeight:500, display:"flex", alignItems:"center", gap:3 }}>
            <Info size={9} />
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <span style={{
          fontSize:11, color:"rgba(239,68,68,0.8)", fontWeight:600,
          display:"flex", alignItems:"center", gap:5
        }}>
          <AlertCircle size={11} strokeWidth={2.5} />
          {error}
        </span>
      )}
    </div>
  )
}

// ── Styled input/select base ─────────────────────────────────
const inputBase = (hasError) => ({
  padding:"11px 14px", borderRadius:11,
  border:`1px solid ${hasError ? "rgba(239,68,68,0.4)" : "rgba(144,224,239,0.12)"}`,
  background:"rgba(255,255,255,0.04)",
  fontSize:13.5, outline:"none",
  fontFamily:"inherit",
  color: C.white,
  width:"100%",
  transition:"border-color 0.2s, background 0.2s, box-shadow 0.2s",
  boxSizing:"border-box", fontWeight:400,
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

  const inp = (field) => ({
    ...inputBase(!!errors[field]),
    border:`1px solid ${errors[field] ? "rgba(239,68,68,0.4)" : focused===field ? "rgba(0,180,216,0.45)" : "rgba(144,224,239,0.1)"}`,
    background: focused===field ? "rgba(0,180,216,0.06)" : "rgba(255,255,255,0.03)",
    boxShadow: focused===field ? "0 0 0 3px rgba(0,180,216,0.08)" : "none",
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]:value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]:"" }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      handleChange("mediImage", file.name)
    }
  }

  const validate = () => {
    const errs = {}
    Object.keys(initialForm).forEach(k => {
      if (!form[k]) errs[k] = "This field is required"
    })
    if (form.mediPrice && isNaN(form.mediPrice)) errs.mediPrice = "Must be a number"
    if (form.mediStock && isNaN(form.mediStock))  errs.mediStock = "Must be a number"
    if (form.mediManufactureDate && form.mediExpiryDate) {
      if (new Date(form.mediExpiryDate) <= new Date(form.mediManufactureDate))
        errs.mediExpiryDate = "Expiry must be after manufacture date"
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
      const res = await fetch(API, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, mediPrice:Number(form.mediPrice), mediStock:Number(form.mediStock) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save medicine")
      setSubmitted(true)
    } catch(err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm(initialForm); setErrors({}); setImagePreview(null)
    setSubmitted(false); setApiError(null); setStep(1)
  }

  // ── field input props helpers ─────────────────────────────
  const fp = (field) => ({
    style: inp(field),
    value: form[field],
    onFocus:  () => setFocused(field),
    onBlur:   () => setFocused(null),
    onChange: (e) => handleChange(field, e.target.value),
  })

  // ── Progress ─────────────────────────────────────────────
  const step1Fields = ["mediName","mediPrice","mediCategory","mediCompany","mediStock","Pharmacy"]
  const step2Fields = ["mediDescription","mediManufactureDate","mediExpiryDate","mediPrescriptionStatus","mediImage"]
  const s1Fill = step1Fields.filter(f => form[f]).length / step1Fields.length
  const s2Fill = step2Fields.filter(f => form[f]).length / step2Fields.length

  // ─── Success Screen ──────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight:"100vh", background:"transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif", padding:24,
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          @keyframes popIn { from{opacity:0;transform:scale(0.7) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes checkDraw { from{stroke-dashoffset:30} to{stroke-dashoffset:0} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        <div style={{
          borderRadius:24, padding:"52px 48px", textAlign:"center", maxWidth:460, width:"100%",
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(0,180,216,0.15)",
          boxShadow:"0 32px 80px rgba(0,0,0,0.4)",
          backdropFilter:"blur(20px)",
          animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>
          {/* Success ring */}
          <div style={{
            width:88, height:88, borderRadius:"50%", margin:"0 auto 28px",
            background:"linear-gradient(135deg, rgba(34,197,94,0.15), rgba(0,180,216,0.1))",
            border:"1.5px solid rgba(34,197,94,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 40px rgba(34,197,94,0.15)",
            position:"relative",
          }}>
            <CheckCircle2 size={40} color={C.green} strokeWidth={1.5} />
          </div>

          <h2 style={{
            margin:"0 0 8px", fontSize:28, fontWeight:800,
            color:C.white, letterSpacing:"-1px",
            fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}>Medicine Registered</h2>
          <p style={{ margin:"0 0 6px", color:"rgba(202,240,248,0.6)", fontSize:14 }}>
            <span style={{ color:C.sky, fontWeight:600 }}>{form.mediName}</span> has been added to the MediReach network.
          </p>

          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(0,180,216,0.08)", borderRadius:99, padding:"6px 16px",
            margin:"16px 0 36px", border:"1px solid rgba(0,180,216,0.18)",
          }}>
            <Building2 size={12} color={C.sky} />
            <span style={{ fontSize:12.5, fontWeight:600, color:C.sky }}>{form.Pharmacy}</span>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={handleReset} style={{
              padding:"11px 24px", borderRadius:11,
              border:"1px solid rgba(144,224,239,0.15)", background:"rgba(144,224,239,0.04)",
              color:"rgba(202,240,248,0.7)", fontWeight:600, fontSize:13.5,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:7,
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(0,180,216,0.35)"; e.currentTarget.style.color=C.sky }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.15)"; e.currentTarget.style.color="rgba(202,240,248,0.7)" }}
            >
              <Package size={14} /> Add Another
            </button>
            <button onClick={()=>window.history.back()} style={{
              padding:"11px 24px", borderRadius:11, border:"none",
              background:`linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
              color:C.white, fontWeight:600, fontSize:13.5,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:7,
              boxShadow:"0 6px 22px rgba(0,180,216,0.3)",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(0,180,216,0.4)" }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 6px 22px rgba(0,180,216,0.3)" }}
            >
              <ArrowLeft size={14} /> Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Form ───────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh", background:"transparent",
      fontFamily:"'DM Sans',sans-serif", padding:"36px 32px 56px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }

        .mr-input:focus {
          outline: none !important;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) hue-rotate(170deg);
          cursor:pointer; opacity:0.6;
        }

        select option { color:#03045e; background:#f0faff; }

        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,180,216,0.2); border-radius:99px; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0.6); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
        @keyframes glowPulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(0,180,216,0); }
          50%    { box-shadow:0 0 20px 4px rgba(0,180,216,0.12); }
        }
        @keyframes progressFill {
          from { width:0%; } to { width:100%; }
        }

        input::placeholder, textarea::placeholder { color:rgba(144,224,239,0.2); }
        input[type="date"] { color-scheme:dark; }
      `}</style>

      {/* Top accent bar */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, height:2, zIndex:99,
        background:`linear-gradient(90deg, ${C.navy}, ${C.ocean} 30%, ${C.sky} 60%, ${C.mist} 85%, transparent)`,
      }} />

      <div style={{ maxWidth:780, margin:"0 auto", paddingTop:4 }}>

        {/* ── Back + Header ── */}
        <div style={{ marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
          <button onClick={()=>window.history.back()} style={{
            background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:7,
            color:"rgba(144,224,239,0.35)", fontSize:13, fontWeight:500,
            fontFamily:"inherit", marginBottom:22, padding:0, transition:"color 0.2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.color=C.sky}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(144,224,239,0.35)"}
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Dashboard
          </button>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:20 }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                <div style={{
                  width:28, height:28, borderRadius:8,
                  background:`linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 12px rgba(0,180,216,0.3)",
                }}>
                  <Pill size={14} color="white" strokeWidth={2} />
                </div>
                <span style={{ fontSize:11, color:"rgba(144,224,239,0.3)", fontWeight:500 }}>MediReach</span>
                <ChevronRight size={11} color="rgba(144,224,239,0.15)" />
                <span style={{ fontSize:11, color:"rgba(144,224,239,0.3)", fontWeight:500 }}>Medicine Registry</span>
                <ChevronRight size={11} color="rgba(144,224,239,0.15)" />
                <span style={{
                  fontSize:11, color:C.sky, fontWeight:700,
                  background:"rgba(0,180,216,0.1)", padding:"2px 9px", borderRadius:99,
                  border:"1px solid rgba(0,180,216,0.18)",
                }}>Add Medicine</span>
              </div>

              <h1 style={{
                margin:0, fontSize:30, fontWeight:800,
                color:C.white, letterSpacing:"-1.2px", lineHeight:1.1,
                fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}>Register New Medicine</h1>
              <p style={{ margin:"8px 0 0", color:"rgba(144,224,239,0.3)", fontSize:13.5, fontWeight:400 }}>
                Complete both steps to register a medicine across the network.
              </p>
            </div>

            {/* Step indicator */}
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0,
            }}>
              <div style={{ display:"flex", gap:6 }}>
                {[
                  { num:1, label:"Basic Info",     fill:s1Fill },
                  { num:2, label:"Details",         fill:s2Fill },
                ].map(s => (
                  <button key={s.num} onClick={()=>setStep(s.num)} style={{
                    padding:"8px 14px", borderRadius:9,
                    border:`1px solid ${step===s.num ? "rgba(0,180,216,0.4)" : "rgba(144,224,239,0.08)"}`,
                    background: step===s.num ? "rgba(0,180,216,0.1)" : "rgba(255,255,255,0.02)",
                    cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:7,
                  }}>
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0,
                      background: s.fill===1
                        ? `linear-gradient(135deg, ${C.green}, rgba(34,197,94,0.7))`
                        : step===s.num
                          ? `linear-gradient(135deg, ${C.ocean}, ${C.sky})`
                          : "rgba(144,224,239,0.08)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border:`1px solid ${step===s.num ? "rgba(0,180,216,0.4)" : "rgba(144,224,239,0.12)"}`,
                      boxShadow: step===s.num ? "0 2px 8px rgba(0,180,216,0.2)" : "none",
                      transition:"all 0.3s",
                    }}>
                      {s.fill===1
                        ? <Check size={10} color="white" strokeWidth={3} />
                        : <span style={{ fontSize:10, fontWeight:800, color: step===s.num ? C.white : "rgba(144,224,239,0.3)" }}>{s.num}</span>
                      }
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color: step===s.num ? "rgba(202,240,248,0.8)" : "rgba(144,224,239,0.3)" }}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── API Error ── */}
        {apiError && (
          <div style={{
            background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:12, padding:"13px 18px", marginBottom:22,
            display:"flex", alignItems:"center", gap:12,
            animation:"fadeUp 0.3s ease both",
          }}>
            <AlertCircle size={18} color={C.danger} strokeWidth={2} />
            <div>
              <p style={{ margin:0, fontWeight:600, color:"rgba(239,68,68,0.9)", fontSize:13.5 }}>Failed to save medicine</p>
              <p style={{ margin:"2px 0 0", color:"rgba(239,68,68,0.6)", fontSize:12 }}>{apiError}</p>
            </div>
            <button onClick={()=>setApiError(null)} style={{
              marginLeft:"auto", background:"none", border:"none",
              cursor:"pointer", color:"rgba(239,68,68,0.5)", fontFamily:"inherit",
              display:"flex", alignItems:"center",
            }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Main Form Card ── */}
        <div style={{
          borderRadius:20,
          border:"1px solid rgba(144,224,239,0.08)",
          background:"rgba(255,255,255,0.02)",
          backdropFilter:"blur(12px)",
          boxShadow:"0 12px 50px rgba(0,0,0,0.3)",
          overflow:"hidden",
          animation:"fadeUp 0.4s ease 0.1s both",
        }}>

          {/* Card Header */}
          <div style={{
            padding:"22px 30px",
            borderBottom:"1px solid rgba(144,224,239,0.06)",
            display:"flex", alignItems:"center", gap:16,
            position:"relative", overflow:"hidden",
            background:"rgba(0,180,216,0.03)",
          }}>
            {/* Shimmer */}
            <div style={{
              position:"absolute", top:0, left:"-100%", width:"40%", height:"100%",
              background:"linear-gradient(90deg,transparent,rgba(0,180,216,0.04),transparent)",
              animation:"shimmer 5s ease-in-out infinite",
              pointerEvents:"none",
            }} />

            <div style={{
              width:46, height:46, borderRadius:13, flexShrink:0,
              background: step===1 ? "rgba(0,180,216,0.12)" : "rgba(144,224,239,0.07)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:`1px solid ${step===1 ? "rgba(0,180,216,0.25)" : "rgba(144,224,239,0.1)"}`,
              transition:"all 0.3s",
            }}>
              {step===1
                ? <ClipboardList size={20} color={C.sky} strokeWidth={1.8} />
                : <FileText size={20} color="rgba(144,224,239,0.45)" strokeWidth={1.8} />
              }
            </div>

            <div style={{ flex:1 }}>
              <p style={{ margin:0, color:C.white, fontWeight:700, fontSize:17, letterSpacing:"-0.3px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {step===1 ? "Basic Information" : "Details & Dates"}
              </p>
              <p style={{ margin:"3px 0 0", color:"rgba(144,224,239,0.3)", fontSize:12.5, fontWeight:400 }}>
                {step===1
                  ? "Name, pricing, stock, category and assigned pharmacy"
                  : "Description, validity dates, status and medicine image"}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:"rgba(144,224,239,0.35)", fontWeight:600 }}>
                  {step===1 ? Math.round(s1Fill*100) : Math.round(s2Fill*100)}% filled
                </span>
                {((step===1 && s1Fill===1) || (step===2 && s2Fill===1)) && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:4,
                    background:"rgba(34,197,94,0.1)", borderRadius:99, padding:"2px 8px",
                    border:"1px solid rgba(34,197,94,0.2)",
                  }}>
                    <Check size={9} color={C.green} strokeWidth={3} />
                    <span style={{ fontSize:9.5, fontWeight:800, color:C.green, letterSpacing:"0.08em" }}>DONE</span>
                  </div>
                )}
              </div>
              <div style={{ width:130, height:5, borderRadius:99, background:"rgba(144,224,239,0.07)", overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:99,
                  width:`${(step===1 ? s1Fill : s2Fill)*100}%`,
                  background:`linear-gradient(90deg, ${C.ocean}, ${C.sky})`,
                  boxShadow:`0 0 8px ${C.sky}60`,
                  transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>
          </div>

          {/* ── Fields ── */}
          <div style={{ padding:"30px 30px 28px" }}>

            {/* STEP 1 */}
            {step===1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

                <Field label="Medicine Name" required icon={Pill} error={errors.mediName}>
                  <input className="mr-input"
                    placeholder="e.g. Amoxicillin 500mg"
                    {...fp("mediName")}
                  />
                </Field>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                  <Field label="Price (LKR)" required icon={DollarSign} error={errors.mediPrice}
                    hint="Retail price">
                    <input className="mr-input" type="number" min="0"
                      placeholder="e.g. 150.00" {...fp("mediPrice")} />
                  </Field>
                  <Field label="Stock Quantity" required icon={Hash} error={errors.mediStock}
                    hint="Units in hand">
                    <input className="mr-input" type="number" min="0"
                      placeholder="e.g. 500" {...fp("mediStock")} />
                  </Field>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                  <Field label="Category" required icon={Tag} error={errors.mediCategory}>
                    <select className="mr-input"
                      style={inp("mediCategory")}
                      value={form.mediCategory}
                      onFocus={() => setFocused("mediCategory")}
                      onBlur={() => setFocused(null)}
                      onChange={e=>handleChange("mediCategory",e.target.value)}
                    >
                      <option value="">— Select category —</option>
                      {categories.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Manufacturer" required icon={Barcode} error={errors.mediCompany}>
                    <input className="mr-input"
                      placeholder="e.g. Sun Pharma, Cipla"
                      {...fp("mediCompany")} />
                  </Field>
                </div>

                <Field label="Assigned Pharmacy" required icon={Building2} error={errors.Pharmacy}>
                  <select className="mr-input"
                    style={inp("Pharmacy")}
                    value={form.Pharmacy}
                    onFocus={() => setFocused("Pharmacy")}
                    onBlur={() => setFocused(null)}
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
              <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

                <Field label="Description" required icon={FileText} error={errors.mediDescription}
                  hint="Usage & notes">
                  <textarea className="mr-input"
                    placeholder="Brief description of the medicine, its usage and important notes..."
                    value={form.mediDescription}
                    onFocus={() => setFocused("mediDescription")}
                    onBlur={() => setFocused(null)}
                    onChange={e=>handleChange("mediDescription",e.target.value)}
                    rows={4}
                    style={{ ...inp("mediDescription"), resize:"vertical", minHeight:110, lineHeight:1.7 }}
                  />
                </Field>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                  <Field label="Manufacture Date" required icon={Calendar} error={errors.mediManufactureDate}>
                    <input className="mr-input" type="date"
                      style={inp("mediManufactureDate")}
                      value={form.mediManufactureDate}
                      onFocus={() => setFocused("mediManufactureDate")}
                      onBlur={() => setFocused(null)}
                      onChange={e=>handleChange("mediManufactureDate",e.target.value)}
                    />
                  </Field>
                  <Field label="Expiry Date" required icon={Calendar} error={errors.mediExpiryDate}>
                    <input className="mr-input" type="date"
                      style={inp("mediExpiryDate")}
                      value={form.mediExpiryDate}
                      onFocus={() => setFocused("mediExpiryDate")}
                      onBlur={() => setFocused(null)}
                      onChange={e=>handleChange("mediExpiryDate",e.target.value)}
                    />
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
                            padding:"14px 10px", borderRadius:12,
                            border:`1px solid ${active ? ps.border : "rgba(144,224,239,0.1)"}`,
                            background: active ? ps.bg : "rgba(255,255,255,0.02)",
                            cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                            transform: active ? "translateY(-2px)" : "none",
                            boxShadow: active ? `0 6px 20px ${ps.color}20` : "none",
                          }}
                          onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor=ps.border; e.currentTarget.style.background=ps.bg+"80" }}}
                          onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor="rgba(144,224,239,0.1)"; e.currentTarget.style.background="rgba(255,255,255,0.02)" }}}
                        >
                          <Icon size={20} color={active ? ps.color : "rgba(144,224,239,0.3)"} strokeWidth={1.8} style={{ transition:"color 0.2s" }} />
                          <span style={{
                            fontSize:12, fontWeight:600,
                            color: active ? ps.color : "rgba(144,224,239,0.35)",
                            textAlign:"center", lineHeight:1.3,
                            transition:"color 0.2s",
                          }}>{ps.key}</span>
                        </button>
                      )
                    })}
                  </div>
                </Field>

                {/* Image Upload */}
                <Field label="Medicine Image" required icon={ImagePlus} error={errors.mediImage}>
                  <label style={{
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:12,
                    border:`1.5px dashed ${errors.mediImage ? "rgba(239,68,68,0.35)" : imagePreview ? "rgba(0,180,216,0.4)" : "rgba(144,224,239,0.15)"}`,
                    borderRadius:14, padding:"32px 24px", cursor:"pointer",
                    background: imagePreview
                      ? "rgba(0,180,216,0.04)"
                      : "rgba(255,255,255,0.02)",
                    transition:"all 0.25s", minHeight:150,
                    position:"relative", overflow:"hidden",
                  }}
                    onMouseEnter={e=>{ if(!imagePreview) e.currentTarget.style.borderColor="rgba(0,180,216,0.35)" }}
                    onMouseLeave={e=>{ if(!imagePreview) e.currentTarget.style.borderColor="rgba(144,224,239,0.15)" }}
                    onDragOver={e=>{ e.preventDefault(); e.currentTarget.style.borderColor="rgba(0,180,216,0.5)"; e.currentTarget.style.background="rgba(0,180,216,0.06)" }}
                    onDragLeave={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.15)"; e.currentTarget.style.background="rgba(255,255,255,0.02)" }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview"
                        style={{ height:90, borderRadius:10, objectFit:"contain", opacity:0.9 }} />
                    ) : (
                      <>
                        <div style={{
                          width:52, height:52,
                          background:"rgba(0,180,216,0.08)",
                          borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center",
                          border:"1px solid rgba(0,180,216,0.18)",
                        }}>
                          <Upload size={22} color="rgba(0,180,216,0.5)" strokeWidth={1.8} />
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <p style={{ margin:0, fontSize:14, color:"rgba(202,240,248,0.7)", fontWeight:600 }}>
                            Click or drag to upload
                          </p>
                          <p style={{ margin:"4px 0 0", fontSize:11.5, color:"rgba(144,224,239,0.25)" }}>
                            PNG, JPG up to 5MB
                          </p>
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
                        color:"rgba(239,68,68,0.6)", cursor:"pointer",
                        fontFamily:"inherit", fontWeight:600, padding:"4px 0",
                        display:"flex", alignItems:"center", gap:5, transition:"color 0.2s"
                      }}
                      onMouseEnter={e=>e.currentTarget.style.color=C.danger}
                      onMouseLeave={e=>e.currentTarget.style.color="rgba(239,68,68,0.6)"}
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
            padding:"18px 30px",
            borderTop:"1px solid rgba(144,224,239,0.06)",
            background:"rgba(0,0,0,0.15)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            {/* Step dots */}
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {[1,2].map(i=>(
                <div key={i} style={{
                  width:i===step?26:8, height:8, borderRadius:99,
                  background: i===step
                    ? `linear-gradient(90deg, ${C.ocean}, ${C.sky})`
                    : "rgba(144,224,239,0.1)",
                  boxShadow: i===step ? `0 0 10px ${C.sky}50` : "none",
                  transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
                }} />
              ))}
              <span style={{ marginLeft:10, fontSize:11.5, color:"rgba(144,224,239,0.25)", fontWeight:500 }}>
                Step {step} of 2
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:9 }}>
              {step>1 && (
                <button type="button" onClick={()=>setStep(1)} style={{
                  padding:"10px 20px", borderRadius:10,
                  border:"1px solid rgba(144,224,239,0.12)",
                  background:"rgba(144,224,239,0.04)",
                  color:"rgba(202,240,248,0.55)", fontWeight:600, fontSize:13.5,
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                  display:"flex", alignItems:"center", gap:7,
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.25)"; e.currentTarget.style.color="rgba(202,240,248,0.8)" }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(144,224,239,0.12)"; e.currentTarget.style.color="rgba(202,240,248,0.55)" }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}

              {step===1 ? (
                <button type="button" onClick={()=>setStep(2)} style={{
                  padding:"10px 24px", borderRadius:10, border:"none",
                  background:`linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                  color:C.white, fontWeight:600, fontSize:13.5,
                  cursor:"pointer", fontFamily:"inherit",
                  boxShadow:"0 6px 22px rgba(0,180,216,0.3)",
                  transition:"all 0.22s",
                  display:"flex", alignItems:"center", gap:7,
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(0,180,216,0.4)" }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 6px 22px rgba(0,180,216,0.3)" }}
                >
                  Continue <ChevronRight size={15} strokeWidth={2.5} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting} style={{
                  padding:"10px 24px", borderRadius:10, border:"none",
                  background: submitting
                    ? "rgba(0,180,216,0.15)"
                    : `linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                  color: submitting ? "rgba(144,224,239,0.4)" : C.white,
                  fontWeight:600, fontSize:13.5,
                  cursor:submitting ? "not-allowed" : "pointer",
                  fontFamily:"inherit",
                  boxShadow: submitting ? "none" : "0 6px 22px rgba(0,180,216,0.3)",
                  transition:"all 0.22s",
                  display:"flex", alignItems:"center", gap:8,
                }}
                  onMouseEnter={e=>{ if(!submitting){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(0,180,216,0.4)" }}}
                  onMouseLeave={e=>{ if(!submitting){ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 6px 22px rgba(0,180,216,0.3)" }}}
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