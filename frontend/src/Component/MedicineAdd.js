import React, { useState } from 'react'

// ── Color tokens ─────────────────────────────────────────────────
const C = {
  navy:   "#03045e",
  ocean:  "#0077b6",
  sky:    "#00b4d8",
  mist:   "#90e0ef",
  foam:   "#caf0f8",
  white:  "#ffffff",
  danger: "#ef4444",
  warn:   "#f59e0b",
}

const categories = [
  "Antibiotic", "Antidiabetic", "Cardiovascular", "Respiratory",
  "Analgesic", "Rehydration", "Antiviral", "Antifungal",
  "Antihistamine", "Supplement", "Other"
]

const pharmaciesList = [
  "Kandy Central Pharmacy", "Galle Fort MedPoint", "Jaffna Community Rx",
  "Matara Rural Clinic", "Anuradhapura PharmaCare", "Batticaloa MedStore",
  "Kurunegala Health Hub", "Trincomalee Bay Pharmacy"
]

const prescriptionStatuses = ["Prescription Required", "Over The Counter", "Controlled Substance"]

const initialForm = {
  mediName: "", mediPrice: "", mediDescription: "", mediImage: "",
  mediCategory: "", mediStock: "", mediCompany: "",
  mediExpiryDate: "", mediManufactureDate: "", mediPrescriptionStatus: "", Pharmacy: "",
}

function Field({ label, required, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700,
        color: C.ocean,
        letterSpacing: "0.09em", textTransform: "uppercase",
        fontFamily: "inherit"
      }}>
        {label}{required && <span style={{ color: C.sky, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{
          fontSize: 11, color: C.danger, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 4
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}

export default function MedicineAdd() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(1)

  const baseInput = (field) => ({
    padding: "11px 14px",
    borderRadius: 10,
    border: `2px solid ${errors[field] ? "#ef444440" : C.foam}`,
    background: C.white,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    color: C.navy,
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontWeight: 500,
  })

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

  const validate = () => {
    const errs = {}
    Object.keys(initialForm).forEach(key => {
      if (!form[key]) errs[key] = "This field is required"
    })
    if (form.mediPrice && isNaN(form.mediPrice)) errs.mediPrice = "Must be a number"
    if (form.mediStock && isNaN(form.mediStock)) errs.mediStock = "Must be a number"
    if (form.mediManufactureDate && form.mediExpiryDate) {
      if (new Date(form.mediExpiryDate) <= new Date(form.mediManufactureDate))
        errs.mediExpiryDate = "Expiry must be after manufacture date"
    }
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const step1Fields = ["mediName", "mediPrice", "mediCategory", "mediCompany", "mediStock", "Pharmacy"]
      setStep(step1Fields.some(f => errs[f]) ? 1 : 2)
      return
    }
    console.log("Submitting:", form)
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(initialForm); setErrors({})
    setImagePreview(null); setSubmitted(false); setStep(1)
  }

  // ── Success Screen ────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, #e8f8fd, #f0faff, #e0f4fb)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Outfit', sans-serif", padding: 24
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

        <div style={{
          background: C.white, borderRadius: 24, padding: "52px 48px",
          textAlign: "center", maxWidth: 440, width: "100%",
          border: `2px solid ${C.foam}`,
          boxShadow: `0 20px 60px ${C.navy}12`
        }}>
          <div style={{
            width: 90, height: 90,
            background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px",
            boxShadow: `0 8px 32px ${C.navy}35`
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.mist} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{
            margin: "0 0 10px", fontSize: 28, fontWeight: 800,
            letterSpacing: "-1px", color: C.navy
          }}>Medicine Registered!</h2>
          <p style={{ margin: "0 0 6px", color: "#90a4ae", fontSize: 15 }}>
            <strong style={{ color: C.ocean }}>{form.mediName}</strong> has been added to the inventory.
          </p>
          <p style={{ margin: "0 0 36px", color: C.mist, fontSize: 13, fontWeight: 600 }}>
            Assigned to {form.Pharmacy}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={handleReset} style={{
              padding: "12px 28px", borderRadius: 10,
              border: `2px solid ${C.ocean}`, background: "transparent",
              color: C.ocean, fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.foam }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
            >
              + Add Another
            </button>
            <button onClick={() => window.history.back()} style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
              color: C.white, fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 4px 16px ${C.navy}35`
            }}>
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Form ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #e8f8fd 0%, #f0faff 50%, #e0f4fb 100%)`,
      fontFamily: "'Outfit', sans-serif",
      padding: "40px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus {
          border-color: ${C.sky} !important;
          box-shadow: 0 0 0 3px ${C.foam} !important;
        }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.4; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.mist}; border-radius: 99px; }
        select option { color: ${C.navy}; }
      `}</style>

      {/* Decorative top strip */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 4, zIndex: 99,
        background: `linear-gradient(90deg, ${C.navy}, ${C.ocean}, ${C.sky}, ${C.mist})`
      }} />

      <div style={{ maxWidth: 800, margin: "0 auto", paddingTop: 8 }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              color: "#90a4ae", fontSize: 13, fontWeight: 600,
              fontFamily: "inherit", marginBottom: 20, padding: 0,
              transition: "color 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.ocean}
            onMouseLeave={e => e.currentTarget.style.color = "#90a4ae"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </button>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <p style={{
                margin: "0 0 4px", fontSize: 11, fontWeight: 700,
                color: C.sky, letterSpacing: "0.12em", textTransform: "uppercase"
              }}>Medicine Registry</p>
              <h1 style={{
                margin: 0, fontSize: 32, fontWeight: 800,
                letterSpacing: "-1.2px", color: C.navy, lineHeight: 1.1
              }}>Add New Medicine</h1>
              <p style={{ margin: "7px 0 0", color: "#90a4ae", fontSize: 13, fontWeight: 500 }}>
                Fill in all required fields to register a medicine across the pharmacy network.
              </p>
            </div>

            {/* Step pill */}
            <div style={{
              background: C.foam, borderRadius: 99, padding: "6px 16px",
              border: `1.5px solid ${C.mist}`,
              fontSize: 13, fontWeight: 700, color: C.ocean
            }}>
              Step {step} of 2
            </div>
          </div>
        </div>

        {/* ── Step Tabs ── */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 28,
          background: C.white, borderRadius: 14, padding: 6,
          border: `2px solid ${C.foam}`, width: "fit-content",
          boxShadow: `0 2px 12px ${C.navy}08`
        }}>
          {[
            { num: 1, label: "Basic Info", icon: "👤" },
            { num: 2, label: "Details & Dates", icon: "📋" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                style={{
                  padding: "9px 22px", borderRadius: 10, border: "none",
                  background: step === s.num
                    ? `linear-gradient(135deg, ${C.navy}, ${C.ocean})`
                    : "transparent",
                  color: step === s.num ? C.white : "#90a4ae",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: step === s.num ? `0 4px 14px ${C.navy}30` : "none"
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: step === s.num ? "rgba(255,255,255,0.2)" : C.foam,
                  color: step === s.num ? C.mist : C.ocean,
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 800
                }}>{s.num}</span>
                {s.label}
              </button>
              {i === 0 && <div style={{ width: 1, background: C.foam, alignSelf: "stretch" }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Form Card ── */}
        <div style={{
          background: C.white,
          borderRadius: 22,
          border: `2px solid ${C.foam}`,
          boxShadow: `0 8px 40px ${C.navy}0c`,
          overflow: "hidden"
        }}>

          {/* Card header */}
          <div style={{
            background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
            padding: "20px 28px",
            borderBottom: `3px solid ${C.sky}`,
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{
              width: 42, height: 42,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12, display: "flex", alignItems: "center",
              justifyContent: "center", border: `1.5px solid rgba(255,255,255,0.2)`
            }}>
              {step === 1 ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C.mist} strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C.mist} strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              )}
            </div>
            <div>
              <p style={{ margin: 0, color: C.white, fontWeight: 800, fontSize: 17, letterSpacing: "-0.4px" }}>
                {step === 1 ? "Basic Information" : "Details & Dates"}
              </p>
              <p style={{ margin: 0, color: C.mist, fontSize: 12, fontWeight: 500 }}>
                {step === 1
                  ? "Name, price, stock, category and pharmacy"
                  : "Description, dates, prescription status and image"}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
              <span style={{ fontSize: 11, color: C.mist, fontWeight: 600 }}>{step === 1 ? "50%" : "100%"}</span>
              <div style={{ width: 100, height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99 }}>
                <div style={{
                  width: step === 1 ? "50%" : "100%",
                  height: "100%", borderRadius: 99,
                  background: `linear-gradient(90deg, ${C.sky}, ${C.mist})`,
                  transition: "width 0.4s ease"
                }} />
              </div>
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: "32px 28px" }}>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                <Field label="Medicine Name" required error={errors.mediName}>
                  <input
                    placeholder="e.g. Amoxicillin 500mg"
                    value={form.mediName}
                    onChange={e => handleChange("mediName", e.target.value)}
                    style={baseInput("mediName")}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Field label="Price (LKR)" required error={errors.mediPrice}>
                    <input
                      placeholder="e.g. 150.00" type="number" min="0"
                      value={form.mediPrice}
                      onChange={e => handleChange("mediPrice", e.target.value)}
                      style={baseInput("mediPrice")}
                    />
                  </Field>
                  <Field label="Stock Quantity" required error={errors.mediStock}>
                    <input
                      placeholder="e.g. 500" type="number" min="0"
                      value={form.mediStock}
                      onChange={e => handleChange("mediStock", e.target.value)}
                      style={baseInput("mediStock")}
                    />
                  </Field>
                </div>

                <Field label="Category" required error={errors.mediCategory}>
                  <select
                    value={form.mediCategory}
                    onChange={e => handleChange("mediCategory", e.target.value)}
                    style={{ ...baseInput("mediCategory"), cursor: "pointer" }}
                  >
                    <option value="">— Select a category —</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Manufacturer / Company" required error={errors.mediCompany}>
                  <input
                    placeholder="e.g. Sun Pharma, Cipla"
                    value={form.mediCompany}
                    onChange={e => handleChange("mediCompany", e.target.value)}
                    style={baseInput("mediCompany")}
                  />
                </Field>

                <Field label="Assigned Pharmacy" required error={errors.Pharmacy}>
                  <select
                    value={form.Pharmacy}
                    onChange={e => handleChange("Pharmacy", e.target.value)}
                    style={{ ...baseInput("Pharmacy"), cursor: "pointer" }}
                  >
                    <option value="">— Select a pharmacy —</option>
                    {pharmaciesList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>

              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                <Field label="Description" required error={errors.mediDescription}>
                  <textarea
                    placeholder="Brief description of the medicine, its usage and any important notes..."
                    value={form.mediDescription}
                    onChange={e => handleChange("mediDescription", e.target.value)}
                    rows={4}
                    style={{ ...baseInput("mediDescription"), resize: "vertical", minHeight: 100, lineHeight: 1.7 }}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Field label="Manufacture Date" required error={errors.mediManufactureDate}>
                    <input
                      type="date" value={form.mediManufactureDate}
                      onChange={e => handleChange("mediManufactureDate", e.target.value)}
                      style={baseInput("mediManufactureDate")}
                    />
                  </Field>
                  <Field label="Expiry Date" required error={errors.mediExpiryDate}>
                    <input
                      type="date" value={form.mediExpiryDate}
                      onChange={e => handleChange("mediExpiryDate", e.target.value)}
                      style={baseInput("mediExpiryDate")}
                    />
                  </Field>
                </div>

                <Field label="Prescription Status" required error={errors.mediPrescriptionStatus}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {prescriptionStatuses.map(ps => {
                      const active = form.mediPrescriptionStatus === ps
                      return (
                        <button
                          key={ps} type="button"
                          onClick={() => handleChange("mediPrescriptionStatus", ps)}
                          style={{
                            flex: 1, padding: "12px 14px", borderRadius: 10,
                            border: `2px solid ${active ? C.ocean : C.foam}`,
                            background: active
                              ? `linear-gradient(135deg, ${C.navy}, ${C.ocean})`
                              : C.white,
                            color: active ? C.white : "#90a4ae",
                            fontWeight: 700, fontSize: 13, cursor: "pointer",
                            fontFamily: "inherit", transition: "all 0.18s",
                            whiteSpace: "nowrap",
                            boxShadow: active ? `0 4px 14px ${C.navy}30` : "none"
                          }}
                        >{ps}</button>
                      )
                    })}
                  </div>
                </Field>

                {/* Image Upload */}
                <Field label="Medicine Image" required error={errors.mediImage}>
                  <label style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 12,
                    border: `2px dashed ${errors.mediImage ? "#ef444450" : imagePreview ? C.sky : C.mist}`,
                    borderRadius: 16, padding: "32px 20px", cursor: "pointer",
                    background: imagePreview ? C.foam : `linear-gradient(135deg, #f8feff, ${C.foam}40)`,
                    transition: "all 0.2s", minHeight: 150,
                  }}
                    onMouseEnter={e => { if (!imagePreview) e.currentTarget.style.borderColor = C.sky }}
                    onMouseLeave={e => { if (!imagePreview) e.currentTarget.style.borderColor = C.mist }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={{ height: 90, borderRadius: 10, objectFit: "contain" }} />
                    ) : (
                      <>
                        <div style={{
                          width: 56, height: 56,
                          background: `linear-gradient(135deg, ${C.foam}, ${C.mist})`,
                          borderRadius: 16, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          border: `1.5px solid ${C.mist}`
                        }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.ocean} strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 14, color: C.ocean, fontWeight: 700 }}>Click to upload image</p>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.mist, fontWeight: 500 }}>PNG, JPG up to 5MB</p>
                        </div>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); handleChange("mediImage", "") }}
                      style={{
                        background: "none", border: "none", fontSize: 12,
                        color: C.danger, cursor: "pointer",
                        fontFamily: "inherit", fontWeight: 700, padding: "4px 0"
                      }}
                    >✕ Remove image</button>
                  )}
                </Field>

              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "20px 28px",
            borderTop: `2px solid ${C.foam}`,
            background: `linear-gradient(135deg, #f8feff, ${C.foam}60)`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  width: i === step ? 28 : 8, height: 8, borderRadius: 99,
                  background: i === step
                    ? `linear-gradient(90deg, ${C.navy}, ${C.sky})`
                    : C.mist,
                  transition: "all 0.3s"
                }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, color: C.mist, fontWeight: 700 }}>
                {step === 1 ? "Almost there..." : "Final step!"}
              </span>
            </div>

            {/* Nav Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: "11px 24px", borderRadius: 10,
                    border: `2px solid ${C.mist}`, background: C.white,
                    color: C.ocean, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.background = C.foam }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.mist; e.currentTarget.style.background = C.white }}
                >← Back</button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    padding: "11px 28px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
                    color: C.white, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                    boxShadow: `0 4px 16px ${C.navy}30`
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.ocean}, ${C.sky})`; e.currentTarget.style.transform = "translateY(-1px)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.navy}, ${C.ocean})`; e.currentTarget.style.transform = "none" }}
                >Next →</button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    padding: "11px 28px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
                    color: C.white, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: `0 4px 18px ${C.navy}40`, transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 8
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.ocean}, ${C.sky})`; e.currentTarget.style.transform = "translateY(-1px)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.navy}, ${C.ocean})`; e.currentTarget.style.transform = "none" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Submit Medicine
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}