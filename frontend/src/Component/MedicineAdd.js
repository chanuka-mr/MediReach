import React, { useState } from 'react'

const C = {
  navy:   "#03045e",
  ocean:  "#0077b6",
  sky:    "#00b4d8",
  mist:   "#90e0ef",
  foam:   "#caf0f8",
  white:  "#ffffff",
  warn:   "#f59e0b",
  danger: "#ef4444",
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
  "Prescription Required","Over The Counter","Controlled Substance"
]

const initialForm = {
  mediName:"", mediPrice:"", mediDescription:"", mediImage:"",
  mediCategory:"", mediStock:"", mediCompany:"",
  mediExpiryDate:"", mediManufactureDate:"",
  mediPrescriptionStatus:"", Pharmacy:"",
}

function Field({ label, required, error, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{
        fontSize:11, fontWeight:700, color:C.ocean,
        letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"inherit"
      }}>
        {label}{required && <span style={{ color:C.sky, marginLeft:3 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{
          fontSize:11, color:C.danger, fontWeight:600,
          display:"flex", alignItems:"center", gap:5
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}

export default function MedicineAdd() {
  const [form,         setForm]         = useState(initialForm)
  const [errors,       setErrors]       = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [apiError,     setApiError]     = useState(null)
  const [step,         setStep]         = useState(1)

  const inp = (field) => ({
    padding:"11px 14px", borderRadius:10,
    border:`2px solid ${errors[field] ? "#ef444450" : C.foam}`,
    background:C.white, fontSize:14, outline:"none",
    fontFamily:"inherit", color:C.navy, width:"100%",
    transition:"border-color 0.2s, box-shadow 0.2s",
    boxSizing:"border-box", fontWeight:500,
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
    if (form.mediStock && isNaN(form.mediStock)) errs.mediStock = "Must be a number"
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
      const s1 = ["mediName","mediPrice","mediCategory","mediCompany","mediStock","Pharmacy"]
      setStep(s1.some(f => errs[f]) ? 1 : 2)
      return
    }
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await fetch(API, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          ...form,
          mediPrice: Number(form.mediPrice),
          mediStock: Number(form.mediStock),
        }),
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

  // ─── Success Screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight:"100vh",
        background:`linear-gradient(160deg, ${C.foam} 0%, #eafaff 50%, ${C.foam} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Outfit',sans-serif", padding:24
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

        <div style={{
          background:C.white, borderRadius:28, padding:"56px 52px",
          textAlign:"center", maxWidth:460, width:"100%",
          border:`2px solid ${C.foam}`,
          boxShadow:`0 24px 80px rgba(3,4,94,0.12)`
        }}>
          {/* Success icon */}
          <div style={{
            width:96, height:96,
            background:`linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
            borderRadius:"50%", display:"flex", alignItems:"center",
            justifyContent:"center", margin:"0 auto 28px", fontSize:44,
            boxShadow:`0 12px 40px rgba(3,4,94,0.3)`,
            animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"
          }}>✅</div>

          <h2 style={{
            margin:"0 0 10px", fontSize:30, fontWeight:900,
            letterSpacing:"-1px", color:C.navy
          }}>Medicine Saved!</h2>
          <p style={{ margin:"0 0 8px", color:"#64748b", fontSize:15 }}>
            <strong style={{ color:C.ocean }}>{form.mediName}</strong> has been added to the MediReach database.
          </p>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:C.foam, borderRadius:99, padding:"5px 14px",
            margin:"0 0 36px", border:`1px solid ${C.mist}`
          }}>
            <span style={{ fontSize:13 }}>🏥</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.ocean }}>{form.Pharmacy}</span>
          </div>

          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={handleReset} style={{
              padding:"12px 28px", borderRadius:12,
              border:`2px solid ${C.mist}`, background:"transparent",
              color:C.ocean, fontWeight:700, fontSize:14,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s"
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background=C.foam; e.currentTarget.style.borderColor=C.sky }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=C.mist }}
            >+ Add Another</button>

            <button onClick={()=>window.history.back()} style={{
              padding:"12px 28px", borderRadius:12, border:"none",
              background:`linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
              color:C.white, fontWeight:700, fontSize:14,
              cursor:"pointer", fontFamily:"inherit",
              boxShadow:`0 4px 18px rgba(3,4,94,0.35)`, transition:"all 0.2s"
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`linear-gradient(135deg,${C.ocean},${C.sky})`; e.currentTarget.style.transform="translateY(-2px)" }}
              onMouseLeave={e=>{ e.currentTarget.style.background=`linear-gradient(135deg,${C.navy},${C.ocean})`; e.currentTarget.style.transform="none" }}
            >← Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Form ───────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      background:`linear-gradient(160deg, ${C.foam} 0%, #eafaff 50%, ${C.foam} 100%)`,
      fontFamily:"'Outfit',sans-serif", padding:"40px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }

        input:focus, select:focus, textarea:focus {
          border-color: ${C.sky} !important;
          box-shadow: 0 0 0 4px ${C.foam} !important;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor:pointer; opacity:0.5; filter:hue-rotate(200deg);
        }
        select option { color:${C.navy}; background:${C.white}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.mist}; border-radius:99px; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0.6); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmer {
          0%   { left:-100%; }
          100% { left:200%; }
        }
      `}</style>

      {/* Rainbow top strip */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, height:3, zIndex:99,
        background:`linear-gradient(90deg, ${C.navy}, ${C.ocean}, ${C.sky}, ${C.mist}, ${C.foam})`
      }} />

      <div style={{ maxWidth:820, margin:"0 auto", paddingTop:8 }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom:32, animation:"fadeUp 0.4s ease both" }}>
          <button onClick={()=>window.history.back()} style={{
            background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:7,
            color:C.mist, fontSize:13, fontWeight:600,
            fontFamily:"inherit", marginBottom:20, padding:0, transition:"color 0.2s"
          }}
            onMouseEnter={e=>e.currentTarget.style.color=C.sky}
            onMouseLeave={e=>e.currentTarget.style.color=C.mist}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </button>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{
                  width:32, height:32, borderRadius:9,
                  background:`linear-gradient(135deg,${C.navy},${C.ocean})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16
                }}>💊</div>
                <span style={{ fontSize:11, color:C.sky, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                  MediReach · Medicine Registry
                </span>
              </div>
              <h1 style={{
                margin:0, fontSize:34, fontWeight:900,
                letterSpacing:"-1.5px", color:C.navy, lineHeight:1.1
              }}>Add New Medicine</h1>
              <p style={{ margin:"8px 0 0", color:"#64748b", fontSize:13, fontWeight:500 }}>
                Fill in all required fields to register a medicine across the pharmacy network.
              </p>
            </div>

            {/* Step pill */}
            <div style={{
              background:C.white, borderRadius:99,
              padding:"8px 20px", border:`2px solid ${C.foam}`,
              boxShadow:`0 2px 12px rgba(3,4,94,0.08)`
            }}>
              <span style={{ fontSize:11, color:C.ocean, fontWeight:700, letterSpacing:"0.06em" }}>
                STEP {step} OF 2
              </span>
            </div>
          </div>
        </div>

        {/* ── API Error ── */}
        {apiError && (
          <div style={{
            background:"#fef2f2", border:`2px solid #fca5a5`,
            borderRadius:14, padding:"14px 20px", marginBottom:24,
            display:"flex", alignItems:"center", gap:12,
            animation:"fadeUp 0.3s ease both"
          }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <p style={{ margin:0, fontWeight:700, color:"#dc2626", fontSize:14 }}>Failed to save medicine</p>
              <p style={{ margin:"3px 0 0", color:C.danger, fontSize:12 }}>{apiError}</p>
            </div>
            <button onClick={()=>setApiError(null)} style={{
              marginLeft:"auto", background:"none", border:"none",
              cursor:"pointer", color:"#dc2626", fontSize:20, fontWeight:700
            }}>✕</button>
          </div>
        )}

        {/* ── Step Tabs ── */}
        <div style={{
          display:"flex", gap:6, marginBottom:28,
          background:C.white, borderRadius:16, padding:6,
          border:`2px solid ${C.foam}`, width:"fit-content",
          boxShadow:`0 2px 16px rgba(3,4,94,0.06)`,
          animation:"fadeUp 0.4s ease 0.05s both"
        }}>
          {[
            { num:1, label:"Basic Info",       emoji:"👤" },
            { num:2, label:"Details & Dates",  emoji:"📋" },
          ].map((s,i) => (
            <React.Fragment key={s.num}>
              <button onClick={()=>setStep(s.num)} style={{
                padding:"10px 24px", borderRadius:11, border:"none",
                background: step===s.num
                  ? `linear-gradient(135deg,${C.navy},${C.ocean})`
                  : "transparent",
                color: step===s.num ? C.white : "#94a3b8",
                fontWeight:700, fontSize:13, cursor:"pointer",
                fontFamily:"inherit", transition:"all 0.22s",
                display:"flex", alignItems:"center", gap:8,
                boxShadow: step===s.num ? `0 4px 16px rgba(3,4,94,0.3)` : "none"
              }}>
                <span style={{
                  width:24, height:24, borderRadius:"50%",
                  background: step===s.num ? "rgba(255,255,255,0.18)" : C.foam,
                  color: step===s.num ? C.mist : C.ocean,
                  display:"inline-flex", alignItems:"center",
                  justifyContent:"center", fontSize:11, fontWeight:800
                }}>{s.num}</span>
                {s.emoji} {s.label}
              </button>
              {i===0 && <div style={{ width:1, background:C.foam, alignSelf:"stretch", margin:"4px 0" }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Form Card ── */}
        <div style={{
          background:C.white, borderRadius:24,
          border:`2px solid ${C.foam}`,
          boxShadow:`0 8px 48px rgba(3,4,94,0.09)`,
          overflow:"hidden",
          animation:"fadeUp 0.4s ease 0.1s both"
        }}>

          {/* Card Header */}
          <div style={{
            background:`linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
            padding:"22px 32px", borderBottom:`3px solid ${C.sky}`,
            display:"flex", alignItems:"center", gap:16, position:"relative", overflow:"hidden"
          }}>
            {/* Shimmer sweep */}
            <div style={{
              position:"absolute", top:0, left:"-100%", width:"40%", height:"100%",
              background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
              animation:"shimmer 4s ease-in-out infinite"
            }} />

            {/* Icon */}
            <div style={{
              width:48, height:48,
              background:"rgba(255,255,255,0.12)",
              borderRadius:14, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:22, flexShrink:0,
              border:"1.5px solid rgba(255,255,255,0.18)"
            }}>
              {step===1 ? "👤" : "📋"}
            </div>

            <div style={{ flex:1 }}>
              <p style={{ margin:0, color:C.white, fontWeight:900, fontSize:18, letterSpacing:"-0.4px" }}>
                {step===1 ? "Basic Information" : "Details & Dates"}
              </p>
              <p style={{ margin:"3px 0 0", color:C.mist, fontSize:12, fontWeight:500 }}>
                {step===1
                  ? "Name, price, stock, category and assigned pharmacy"
                  : "Description, dates, prescription status and medicine image"}
              </p>
            </div>

            {/* Progress */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:C.mist, fontWeight:700 }}>
                  {step===1 ? "50%" : "100%"}
                </span>
                {step===2 && (
                  <span style={{
                    fontSize:10, fontWeight:800, color:C.navy,
                    background:C.foam, padding:"2px 8px", borderRadius:99
                  }}>COMPLETE</span>
                )}
              </div>
              <div style={{
                width:120, height:6, borderRadius:99,
                background:"rgba(255,255,255,0.15)", overflow:"hidden"
              }}>
                <div style={{
                  width:step===1?"50%":"100%", height:"100%", borderRadius:99,
                  background:`linear-gradient(90deg, ${C.sky}, ${C.mist})`,
                  transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow:`0 0 10px ${C.sky}80`
                }} />
              </div>
            </div>
          </div>

          {/* ── Form Fields ── */}
          <div style={{ padding:"34px 32px" }}>

            {/* STEP 1 */}
            {step===1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

                <Field label="Medicine Name" required error={errors.mediName}>
                  <input
                    placeholder="e.g. Amoxicillin 500mg"
                    value={form.mediName}
                    onChange={e=>handleChange("mediName",e.target.value)}
                    style={inp("mediName")}
                  />
                </Field>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <Field label="Price (LKR)" required error={errors.mediPrice}>
                    <input
                      placeholder="e.g. 150.00" type="number" min="0"
                      value={form.mediPrice}
                      onChange={e=>handleChange("mediPrice",e.target.value)}
                      style={inp("mediPrice")}
                    />
                  </Field>
                  <Field label="Stock Quantity" required error={errors.mediStock}>
                    <input
                      placeholder="e.g. 500" type="number" min="0"
                      value={form.mediStock}
                      onChange={e=>handleChange("mediStock",e.target.value)}
                      style={inp("mediStock")}
                    />
                  </Field>
                </div>

                <Field label="Category" required error={errors.mediCategory}>
                  <select
                    value={form.mediCategory}
                    onChange={e=>handleChange("mediCategory",e.target.value)}
                    style={{ ...inp("mediCategory"), cursor:"pointer" }}
                  >
                    <option value="">— Select a category —</option>
                    {categories.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Manufacturer / Company" required error={errors.mediCompany}>
                  <input
                    placeholder="e.g. Sun Pharma, Cipla"
                    value={form.mediCompany}
                    onChange={e=>handleChange("mediCompany",e.target.value)}
                    style={inp("mediCompany")}
                  />
                </Field>

                <Field label="Assigned Pharmacy" required error={errors.Pharmacy}>
                  <select
                    value={form.Pharmacy}
                    onChange={e=>handleChange("Pharmacy",e.target.value)}
                    style={{ ...inp("Pharmacy"), cursor:"pointer" }}
                  >
                    <option value="">— Select a pharmacy —</option>
                    {pharmaciesList.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>

              </div>
            )}

            {/* STEP 2 */}
            {step===2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

                <Field label="Description" required error={errors.mediDescription}>
                  <textarea
                    placeholder="Brief description of the medicine, its usage and any important notes..."
                    value={form.mediDescription}
                    onChange={e=>handleChange("mediDescription",e.target.value)}
                    rows={4}
                    style={{ ...inp("mediDescription"), resize:"vertical", minHeight:110, lineHeight:1.7 }}
                  />
                </Field>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <Field label="Manufacture Date" required error={errors.mediManufactureDate}>
                    <input
                      type="date" value={form.mediManufactureDate}
                      onChange={e=>handleChange("mediManufactureDate",e.target.value)}
                      style={inp("mediManufactureDate")}
                    />
                  </Field>
                  <Field label="Expiry Date" required error={errors.mediExpiryDate}>
                    <input
                      type="date" value={form.mediExpiryDate}
                      onChange={e=>handleChange("mediExpiryDate",e.target.value)}
                      style={inp("mediExpiryDate")}
                    />
                  </Field>
                </div>

                {/* Prescription Status */}
                <Field label="Prescription Status" required error={errors.mediPrescriptionStatus}>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    {prescriptionStatuses.map(ps => {
                      const active = form.mediPrescriptionStatus===ps
                      return (
                        <button
                          key={ps} type="button"
                          onClick={()=>handleChange("mediPrescriptionStatus",ps)}
                          style={{
                            flex:1, padding:"13px 14px", borderRadius:12,
                            border:`2px solid ${active ? C.ocean : C.foam}`,
                            background: active
                              ? `linear-gradient(135deg,${C.navy},${C.ocean})`
                              : C.white,
                            color: active ? C.white : "#64748b",
                            fontWeight:700, fontSize:13, cursor:"pointer",
                            fontFamily:"inherit", transition:"all 0.2s",
                            whiteSpace:"nowrap",
                            boxShadow: active ? `0 4px 16px rgba(3,4,94,0.3)` : "none",
                            transform: active ? "translateY(-1px)" : "none"
                          }}
                          onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor=C.mist; e.currentTarget.style.background=C.foam }}}
                          onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor=C.foam; e.currentTarget.style.background=C.white }}}
                        >{ps}</button>
                      )
                    })}
                  </div>
                </Field>

                {/* Image Upload */}
                <Field label="Medicine Image" required error={errors.mediImage}>
                  <label style={{
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:14,
                    border:`2px dashed ${errors.mediImage ? "#ef444460" : imagePreview ? C.sky : C.mist}`,
                    borderRadius:18, padding:"36px 24px", cursor:"pointer",
                    background: imagePreview
                      ? `linear-gradient(135deg,${C.foam},#eafaff)`
                      : `linear-gradient(135deg,#fafeff,${C.foam}50)`,
                    transition:"all 0.25s", minHeight:160,
                  }}
                    onMouseEnter={e=>{ if(!imagePreview) e.currentTarget.style.borderColor=C.sky }}
                    onMouseLeave={e=>{ if(!imagePreview) e.currentTarget.style.borderColor=C.mist }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview"
                        style={{ height:100, borderRadius:12, objectFit:"contain" }} />
                    ) : (
                      <>
                        <div style={{
                          width:62, height:62, fontSize:28,
                          background:`linear-gradient(135deg,${C.foam},${C.mist})`,
                          borderRadius:16, display:"flex", alignItems:"center",
                          justifyContent:"center",
                          border:`2px solid ${C.mist}`,
                          boxShadow:`0 4px 14px rgba(0,180,216,0.15)`
                        }}>🖼️</div>
                        <div style={{ textAlign:"center" }}>
                          <p style={{ margin:0, fontSize:15, color:C.ocean, fontWeight:700 }}>
                            Click to upload image
                          </p>
                          <p style={{ margin:"5px 0 0", fontSize:12, color:C.mist, fontWeight:500 }}>
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
                        color:C.danger, cursor:"pointer",
                        fontFamily:"inherit", fontWeight:700, padding:"4px 0"
                      }}>✕ Remove image</button>
                  )}
                </Field>

              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding:"22px 32px",
            borderTop:`2px solid ${C.foam}`,
            background:`linear-gradient(90deg,${C.foam}40,#eafaff40)`,
            display:"flex", alignItems:"center", justifyContent:"space-between"
          }}>
            {/* Step dots */}
            <div style={{ display:"flex", gap:7, alignItems:"center" }}>
              {[1,2].map(i=>(
                <div key={i} style={{
                  width:i===step?30:9, height:9, borderRadius:99,
                  background: i===step
                    ? `linear-gradient(90deg,${C.navy},${C.sky})`
                    : C.foam,
                  border: i===step ? "none" : `1.5px solid ${C.mist}`,
                  transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: i===step ? `0 0 12px ${C.sky}60` : "none"
                }} />
              ))}
              <span style={{ marginLeft:8, fontSize:12, color:C.mist, fontWeight:700 }}>
                {step===1 ? "Almost there..." : "Final step!"}
              </span>
            </div>

            {/* Nav buttons */}
            <div style={{ display:"flex", gap:10 }}>
              {step>1 && (
                <button type="button" onClick={()=>setStep(1)} style={{
                  padding:"11px 26px", borderRadius:12,
                  border:`2px solid ${C.foam}`, background:C.white,
                  color:C.ocean, fontWeight:700, fontSize:14,
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s"
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.mist; e.currentTarget.style.background=C.foam }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.foam; e.currentTarget.style.background=C.white }}
                >← Back</button>
              )}

              {step===1 ? (
                <button type="button" onClick={()=>setStep(2)} style={{
                  padding:"11px 28px", borderRadius:12, border:"none",
                  background:`linear-gradient(135deg,${C.navy},${C.ocean})`,
                  color:C.white, fontWeight:700, fontSize:14, cursor:"pointer",
                  fontFamily:"inherit", boxShadow:`0 4px 18px rgba(3,4,94,0.32)`,
                  transition:"all 0.22s"
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`linear-gradient(135deg,${C.ocean},${C.sky})`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px rgba(0,119,182,0.4)` }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=`linear-gradient(135deg,${C.navy},${C.ocean})`; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 4px 18px rgba(3,4,94,0.32)` }}
                >Next →</button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding:"11px 28px", borderRadius:12, border:"none",
                    background: submitting
                      ? C.mist
                      : `linear-gradient(135deg,${C.navy},${C.ocean})`,
                    color:C.white, fontWeight:700, fontSize:14,
                    cursor:submitting ? "not-allowed" : "pointer",
                    fontFamily:"inherit",
                    boxShadow: submitting ? "none" : `0 4px 18px rgba(3,4,94,0.32)`,
                    transition:"all 0.22s",
                    display:"flex", alignItems:"center", gap:9
                  }}
                  onMouseEnter={e=>{ if(!submitting){ e.currentTarget.style.background=`linear-gradient(135deg,${C.ocean},${C.sky})`; e.currentTarget.style.transform="translateY(-2px)" }}}
                  onMouseLeave={e=>{ if(!submitting){ e.currentTarget.style.background=`linear-gradient(135deg,${C.navy},${C.ocean})`; e.currentTarget.style.transform="none" }}}
                >
                  {submitting ? (
                    <>
                      <span style={{ display:"inline-block", animation:"spin 0.8s linear infinite", fontSize:16 }}>⏳</span>
                      Saving to database...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Submit Medicine
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom padding */}
        <div style={{ height:40 }} />
      </div>
    </div>
  )
}