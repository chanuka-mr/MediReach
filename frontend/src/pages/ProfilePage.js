import { useState, useEffect, useRef } from "react";
import { userAPI } from "../utils/apiEndpoints";
import ForgotPasswordPage from "./ForgotPasswordPage";


// ── Icons ─────────────────────────────────────────────
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const LicenseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const GenderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="11" r="4"/>
    <path d="M12 15v6M9 18h6"/>
    <path d="M19 4l-3.5 3.5M19 4h-4M19 4v4"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
      className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

const INDIGO = "#4C6EF5";
const NAVY   = "#023E8A";
const GREEN  = "#0E7C5B";

function Field({ icon, type = "text", placeholder, value, onChange, fk, focused, setFocused, right, name, disabled }) {
  const isFocused = focused === fk;
  return (
    <div className="flex items-center gap-[9px] rounded-[10px] px-3 transition-all duration-200"
      style={{
        border: `1.5px solid ${disabled ? "#EEF1F6" : isFocused ? INDIGO : "#DDE3ED"}`,
        background: disabled ? "#F4F6FA" : isFocused ? "#F8FAFF" : "#F7F9FC",
        boxShadow: isFocused && !disabled ? "0 0 0 3px rgba(76,110,245,0.1)" : "none",
      }}>
      <span className="flex flex-shrink-0" style={{ color: disabled ? "#C4CEDD" : isFocused ? INDIGO : "#94A3B8" }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => !disabled && setFocused(fk)} onBlur={() => setFocused(null)}
        autoComplete={name} name={name} disabled={disabled}
        className="flex-1 border-none outline-none bg-transparent text-[13px] py-[11px] font-sans"
        style={{ color: disabled ? "#A0AEC0" : "#0F172A", cursor: disabled ? "not-allowed" : "text" }} />
      {right}
    </div>
  );
}

function Select({ icon, value, onChange, options, fk, focused, setFocused, disabled }) {
  const isFocused = focused === fk;
  return (
    <div className="flex items-center gap-[9px] rounded-[10px] px-3 transition-all duration-200"
      style={{
        border: `1.5px solid ${disabled ? "#EEF1F6" : isFocused ? INDIGO : "#DDE3ED"}`,
        background: disabled ? "#F4F6FA" : isFocused ? "#F8FAFF" : "#F7F9FC",
        boxShadow: isFocused && !disabled ? "0 0 0 3px rgba(76,110,245,0.1)" : "none",
      }}>
      <span className="flex flex-shrink-0" style={{ color: disabled ? "#C4CEDD" : isFocused ? INDIGO : "#94A3B8" }}>{icon}</span>
      <select value={value} onChange={onChange}
        onFocus={() => !disabled && setFocused(fk)} onBlur={() => setFocused(null)}
        disabled={disabled}
        className="flex-1 border-none outline-none bg-transparent text-[13px] py-[11px] font-sans appearance-none"
        style={{ color: value ? (disabled ? "#A0AEC0" : "#0F172A") : "#A0AEC0", cursor: disabled ? "not-allowed" : "pointer" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-[11.5px] font-semibold text-[#374151] mb-[6px] tracking-[0.2px]">{children}</label>;
}

function SectionCard({ children, accent }) {
  return (
    <div className="bg-white rounded-[14px] p-6"
      style={{ border: `1.5px solid ${accent ? accent + "30" : "#EEF1F7"}`, boxShadow: `0 2px 12px ${accent ? accent + "08" : "rgba(0,0,0,0.04)"}` }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle, accent }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 rounded-full" style={{ background: accent || INDIGO }} />
        <h3 className="text-[14px] font-bold text-[#0F172A] tracking-[-0.2px]">{title}</h3>
      </div>
      {subtitle && <p className="text-[11.5px] text-[#94A3B8] pl-3">{subtitle}</p>}
    </div>
  );
}

function AddressCard({ addr, index, onSetDefault, onRemove }) {
  return (
    <div className="rounded-[10px] p-3.5 transition-all duration-200 relative"
      style={{ border: `1.5px solid ${addr.isDefault ? INDIGO : "#DDE3ED"}`, background: addr.isDefault ? "#F0F4FF" : "#F7F9FC" }}>
      {addr.isDefault && (
        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ background: `${INDIGO}20`, color: INDIGO }}>
          <StarIcon /> Default
        </span>
      )}
      <div className="text-[12.5px] font-semibold text-[#0F172A] mb-0.5">{addr.street || "—"}</div>
      <div className="text-[11.5px] text-[#64748B]">{[addr.city, addr.postalCode].filter(Boolean).join(", ") || "—"}</div>
      <div className="flex items-center gap-2 mt-3">
        {!addr.isDefault && (
          <button type="button" onClick={() => onSetDefault(index)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-[6px] transition-colors duration-150 cursor-pointer border-none"
            style={{ color: INDIGO, background: `${INDIGO}15` }}>
            Set as Default
          </button>
        )}
        <button type="button" onClick={() => onRemove(index)}
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer border-none"
          style={{ color: "#EF4444", background: "#FEF2F2" }}>
          <TrashIcon /> Remove
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const label = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const color = ["", "#EF4444", "#F59E0B", "#3B82F6", GREEN][strength];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-[3px] rounded-full transition-all duration-300"
            style={{ background: i <= strength ? color : "#E2E8F0" }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function Toast({ message, type, visible }) {
  return (
    <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-[10px] flex items-center gap-2.5 text-white text-[13px] font-semibold shadow-lg transition-all duration-300"
      style={{
        background: type === "success" ? `linear-gradient(135deg, ${GREEN}, #12A07A)` : "#EF4444",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        pointerEvents: "none",
      }}>
      {type === "success" ? <CheckIcon /> : <XIcon />}
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const [mounted, setMounted]   = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [showForgot, setShowForgot] = useState(false);
  const [savedUser, setSavedUser] = useState({});

  // Load user data from localStorage
  const [name, setName]           = useState("Guest User");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [gender, setGender]       = useState("");
  const [dob, setDob]             = useState("");
  const [role, setRole]           = useState("user");
  const [pharmacyName, setPharmacyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr]   = useState({ street: "", city: "", postalCode: "" });
  const [addingAddr, setAddingAddr] = useState(false);
  
  const [cities, setCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confPass, setConfPass]       = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [passError, setPassError]     = useState("");

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      const u = parsed.user || parsed;
      setSavedUser(u);
      if (u.name) setName(u.name);
      if (u.email) setEmail(u.email);
      if (u.contactNumber) setPhone(u.contactNumber);
      if (u.role) setRole(u.role);
      if (u.pharmacyName) setPharmacyName(u.pharmacyName);
      if (u.licenseNumber) setLicenseNumber(u.licenseNumber);
      if (u.gender) setGender(u.gender);
      if (u.dateOfBirth) {
        setDob(new Date(u.dateOfBirth).toISOString().split('T')[0]);
      }
      if (u.addresses) setAddresses(u.addresses);
    }

    fetch("https://slcities.live/api/cities")
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error("Failed to fetch cities:", err));

    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem("userInfo");
      if (!saved) throw new Error("Not logged in");
      const parsed = JSON.parse(saved);
      const token = parsed.token;

      const payload = {
        name,
        email,
        contactNumber: phone,
        addresses
      };
      if (role === 'pharmacy') {
        payload.pharmacyName = pharmacyName;
        payload.licenseNumber = licenseNumber;
      } else {
        payload.gender = gender;
        payload.dateOfBirth = dob || undefined;
      }

      const res = await userAPI.updateProfile(payload);
      const data = res.data;

      
      localStorage.setItem("userInfo", JSON.stringify({ ...parsed, user: data, ...data, token: token }));
      
      setSavedUser(data);
      setEditMode(false);
      showToast("Profile updated successfully!");
    } catch (err) { 
      showToast(err.message || "Failed to save changes.", "error"); 
    }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confPass) { setPassError("Please fill all fields."); return; }
    if (newPass.length < 6) { setPassError("Password must be at least 6 characters."); return; }
    if (newPass !== confPass) { setPassError("Passwords do not match."); return; }
    setPassError("");
    setLoading(true);
    try {
      const saved = localStorage.getItem("userInfo");
      if (!saved) throw new Error("Not logged in");
      const token = JSON.parse(saved).token;

      // Without a currentPassword check in the backend, we only submit newPassword via the same PUT profile endpoint
      // Adjust if backend introduces a separate change-password route
      const res = await userAPI.updateProfile({ password: newPass });
      const data = res.data;


      setCurrentPass(""); setNewPass(""); setConfPass("");
      showToast("Password changed successfully!");
    } catch (err) { 
      showToast(err.message || "Failed to update password.", "error"); 
    }
    finally { setLoading(false); }
  };

  const syncAddresses = async (updatedAddresses) => {
    try {
      const saved = localStorage.getItem("userInfo");
      if (!saved) throw new Error("Not logged in");
      const parsed = JSON.parse(saved);
      const res = await userAPI.updateProfile({ addresses: updatedAddresses });
      const data = res.data;

      
      setAddresses(data.addresses || updatedAddresses);
      localStorage.setItem("userInfo", JSON.stringify({ ...parsed, user: data, ...data, token: parsed.token }));
      return true;
    } catch (err) {
      showToast(err.message || "Failed to save address", "error");
      return false;
    }
  };

  const handleAddAddress = async () => {
    if (!newAddr.street || !newAddr.city) return;
    setLoading(true);
    const updated = [...addresses, { ...newAddr, isDefault: addresses.length === 0 }];
    const success = await syncAddresses(updated);
    if (success) {
      setNewAddr({ street: "", city: "", postalCode: "" });
      setAddingAddr(false);
      showToast("Address added!");
    }
    setLoading(false);
  };

  const handleSetDefault = async (idx) => {
    setLoading(true);
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
    const success = await syncAddresses(updated);
    if (success) showToast("Default address updated.");
    setLoading(false);
  };
  
  const handleRemoveAddress = async (idx) => {
    setLoading(true);
    const updated = addresses.filter((_, i) => i !== idx);
    if (addresses[idx].isDefault && updated.length > 0) updated[0].isDefault = true;
    const success = await syncAddresses(updated);
    if (success) showToast("Address removed.");
    setLoading(false);
  };

  const roleBadge = {
    admin:    { label: "Admin",    bg: "#7C3AED22", color: "#7C3AED" },
    pharmacy: { label: "Pharmacy", bg: `${INDIGO}22`, color: INDIGO },
    user:     { label: "Customer", bg: `${GREEN}22`,  color: GREEN },
  }[role] || { label: role, bg: "#E2E8F0", color: "#64748B" };

  const initials = (savedUser.name || name).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      className="flex items-center bg-transparent border-none cursor-pointer p-0.5" style={{ color: "#94A3B8" }}>
      <EyeIcon open={show} />
    </button>
  );

  const tabs = [
    { key: "profile",   label: "Profile Info" },
    { key: "addresses", label: "Addresses" },
    { key: "security",  label: "Security" },
  ];

  if (showForgot) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgot(false)} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F7F9FC" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        select option { color: #0F172A; }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="absolute -top-[100px] -left-[80px] w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(76,110,245,0.055) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-[80px] right-1/4 w-[360px] h-[360px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,124,91,0.04) 0%, transparent 70%)" }} />
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.22]">
          <defs>
            <pattern id="dots2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.2" fill="#DDE3ED" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots2)" />
        </svg>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* TOP NAVY HEADER */}
      <div className="w-full flex-shrink-0"
        style={{
          background: "linear-gradient(145deg, #011f54 0%, #023E8A 50%, #034fa6 100%)",
          position: "relative", zIndex: 1,
        }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <svg width="100%" height="100%" className="opacity-[0.05]">
            <defs>
              <pattern id="pgrid2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0L0 0 0 60" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pgrid2)" />
          </svg>
        </div>
        <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(76,110,245,0.2) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-[40px] left-[10%] w-[160px] h-[160px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(14,124,91,0.15) 0%, transparent 70%)" }} />

        <div className="relative z-10 w-full px-8 py-4 max-w-[1200px] mx-auto">
          {/* Top row: Logo and Shield */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                    src="/logo.png" 
                    alt="MediReach Logo" 
                    width={32} 
                    height={32}
                    className="rounded-[8px] scale-[0.8]"
                />
              <span className="text-white text-[17px] font-bold tracking-[-0.3px]">MediReach</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[rgba(255,255,255,0.6)] text-[11px]">
              <ShieldIcon /><span>256-bit encrypted · HIPAA compliant</span>
            </div>
          </div>

          {/* Profile Info Row + Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[19px] font-bold text-white relative flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${INDIGO} 0%, ${NAVY} 100%)`,
                  boxShadow: "0 8px 24px rgba(76,110,245,0.35)",
                  border: "3px solid rgba(255,255,255,0.15)",
                }}>
                {initials}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#12A07A", border: "2px solid #023E8A" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="text-white text-[20px] font-bold tracking-[-0.5px] leading-none">{savedUser.name || name}</div>
                  <div className="px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.5px] uppercase border border-[rgba(255,255,255,0.1)] w-fit flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }}>
                    {roleBadge.label}
                  </div>
                </div>
                <div className="text-[rgba(255,255,255,0.6)] text-[13px] mt-1.5">{savedUser.email || email}</div>
              </div>
            </div>

            <nav className="flex gap-2 bg-[rgba(255,255,255,0.06)] p-1.5 rounded-[12px] border border-[rgba(255,255,255,0.1)] overflow-x-auto">
              {tabs.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="px-5 py-2 rounded-[8px] text-[13px] font-semibold transition-all duration-200 border-none cursor-pointer whitespace-nowrap"
                    style={{
                      background: active ? "rgba(255,255,255,0.15)" : "transparent",
                      color: active ? "white" : "rgba(255,255,255,0.6)",
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                    }}>
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease", zIndex: 2, position: "relative" }}>
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "1px solid #EEF1F7", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}>
          <div>
            <h1 className="text-[20px] font-extrabold text-[#0F172A] tracking-[-0.5px]">Account Settings</h1>
            <p className="text-[12.5px] text-[#94A3B8] mt-0.5">Manage your profile and preferences</p>
          </div>

          {activeTab === "profile" && (
            <div className="flex items-center gap-2.5">
              {editMode ? (
                <>
                  <button onClick={() => {
                      setEditMode(false);
                      if (savedUser.name) setName(savedUser.name);
                      if (savedUser.email) setEmail(savedUser.email);
                      if (savedUser.contactNumber) setPhone(savedUser.contactNumber);
                      if (savedUser.pharmacyName) setPharmacyName(savedUser.pharmacyName);
                      if (savedUser.licenseNumber) setLicenseNumber(savedUser.licenseNumber);
                      if (savedUser.gender) setGender(savedUser.gender);
                      if (savedUser.dateOfBirth) setDob(new Date(savedUser.dateOfBirth).toISOString().split('T')[0]);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[12.5px] font-semibold transition-all duration-200 cursor-pointer"
                    style={{ background: "#F1F5F9", color: "#64748B", border: "1.5px solid #DDE3ED" }}>
                    <XIcon /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[12.5px] font-bold text-white transition-all duration-200 cursor-pointer border-none"
                    style={{
                      background: loading ? "#7B96D8" : `linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`,
                      boxShadow: loading ? "none" : "0 4px 14px rgba(2,62,138,0.25)",
                    }}>
                    {loading ? <><Spinner /> Saving...</> : <><SaveIcon /> Save Changes</>}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[12.5px] font-semibold transition-all duration-200 cursor-pointer border-none text-white"
                  style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`, boxShadow: "0 4px 14px rgba(2,62,138,0.25)" }}>
                  <EditIcon /> Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[700px] mx-auto space-y-6">

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <>


                <SectionCard>
                  <SectionHeader title="Personal Information" subtitle="Your basic account details" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Field icon={<UserIcon />} placeholder="John Silva" value={name} onChange={e => setName(e.target.value)}
                        fk="name" focused={focused} setFocused={setFocused} name="name" disabled={!editMode} />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Field icon={<PhoneIcon />} type="tel" placeholder="+94 77 123 4567" value={phone} onChange={e => setPhone(e.target.value)}
                        fk="phone" focused={focused} setFocused={setFocused} name="tel" disabled={!editMode} />
                    </div>
                    <div className="col-span-2">
                      <Label>Email Address</Label>
                      <Field icon={<MailIcon />} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                        fk="email" focused={focused} setFocused={setFocused} name="email" disabled={!editMode} />
                    </div>
                    {role !== 'pharmacy' && (
                      <>
                        <div>
                          <Label>Gender</Label>
                          <Select icon={<GenderIcon />} value={gender} onChange={e => setGender(e.target.value)}
                            fk="gender" focused={focused} setFocused={setFocused} disabled={!editMode}
                            options={[
                              { value: "", label: "Select gender" },
                              { value: "male", label: "Male" },
                              { value: "female", label: "Female" },
                              { value: "other", label: "Other" },
                              { value: "prefer_not_to_say", label: "Prefer not to say" },
                            ]} />
                        </div>
                        <div>
                          <Label>Date of Birth</Label>
                          <Field icon={<CalendarIcon />} type="date" value={dob} onChange={e => setDob(e.target.value)}
                            fk="dob" focused={focused} setFocused={setFocused} name="bday" disabled={!editMode} />
                        </div>
                      </>
                    )}
                  </div>
                </SectionCard>

                <SectionCard>
                  <SectionHeader title="Account Role" subtitle="Your assigned role in the MediReach network" />
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold"
                    style={{ background: roleBadge.bg, color: roleBadge.color }}>
                    <ShieldIcon /> {roleBadge.label}
                  </div>
                  <p className="text-[11.5px] text-[#94A3B8] mt-2">Role changes require administrator approval.</p>
                </SectionCard>

                {role === "pharmacy" && (
                  <SectionCard accent={INDIGO}>
                    <SectionHeader title="Pharmacy Details" subtitle="Information about your registered pharmacy" accent={INDIGO} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pharmacy Name</Label>
                        <Field icon={<BuildingIcon />} placeholder="City MedPlus" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)}
                          fk="pharmacyName" focused={focused} setFocused={setFocused} name="pharmacy-name" disabled={!editMode} />
                      </div>
                      <div>
                        <Label>License Number</Label>
                        <Field icon={<LicenseIcon />} placeholder="PH-2024-00123" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                          fk="licenseNumber" focused={focused} setFocused={setFocused} name="license" disabled={!editMode} />
                      </div>
                    </div>
                  </SectionCard>
                )}
              </>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === "addresses" && (
              <SectionCard>
                <div className="flex items-start justify-between mb-5">
                  <SectionHeader title="Saved Addresses" subtitle="Manage your delivery and pickup locations" accent={GREEN} />
                  <button type="button" onClick={() => setAddingAddr(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[12px] font-semibold border-none cursor-pointer text-white"
                    style={{ background: `linear-gradient(135deg, ${GREEN}, #12A07A)`, boxShadow: "0 3px 12px rgba(14,124,91,0.25)" }}>
                    <PlusIcon /> Add Address
                  </button>
                </div>
                <div className="space-y-3">
                  {addresses.map((addr, i) => (
                    <AddressCard key={i} addr={addr} index={i} onSetDefault={handleSetDefault} onRemove={handleRemoveAddress} />
                  ))}
                  {addresses.length === 0 && (
                    <div className="text-center py-8 text-[#94A3B8] text-[13px]">No addresses saved yet.</div>
                  )}
                </div>
                {addingAddr && (
                  <div className="mt-4 p-4 rounded-[12px]" style={{ border: `1.5px dashed ${GREEN}60`, background: `${GREEN}06` }}>
                    <div className="text-[12.5px] font-bold text-[#0F172A] mb-3">New Address</div>
                    <div className="space-y-3">
                      <div>
                        <Label>Street</Label>
                        <Field icon={<MapPinIcon />} placeholder="45 Galle Road" value={newAddr.street}
                          onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
                          fk="nstreet" focused={focused} setFocused={setFocused} name="street-address" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative" ref={cityDropdownRef}>
                          <Label>City</Label>
                          <div onClick={() => setShowCityDropdown(true)}>
                            <Field icon={<MapPinIcon />} placeholder="Colombo" value={newAddr.city}
                              onChange={e => {
                                setNewAddr({ ...newAddr, city: e.target.value });
                                setShowCityDropdown(true);
                              }}
                              fk="ncity" focused={focused} setFocused={setFocused} name="city" />
                          </div>
                          
                          {showCityDropdown && newAddr.city && (
                            <div className="absolute top-[100%] left-0 w-full bg-white border border-[#EEF1F6] rounded-[10px] mt-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 max-h-[180px] overflow-y-auto">
                              {cities.filter(c => c.city_name_en.toLowerCase().includes(newAddr.city.toLowerCase())).slice(0, 8).map(c => (
                                <div key={c.city_id} 
                                  className="px-3 py-2.5 text-[12.5px] hover:bg-[#F8FAFF] cursor-pointer text-[#0F172A] border-b border-[#EEF1F6] last:border-0 transition-colors"
                                  onClick={() => {
                                    setNewAddr({ ...newAddr, city: c.city_name_en, postalCode: c.postcode });
                                    setShowCityDropdown(false);
                                  }}
                                >
                                  <div className="font-semibold">{c.city_name_en}</div>
                                  <div className="text-[11px] text-[#64748B]">{c.district_name_en} District • {c.postcode}</div>
                                </div>
                              ))}
                              {cities.filter(c => c.city_name_en.toLowerCase().includes(newAddr.city.toLowerCase())).length === 0 && (
                                <div className="px-3 py-3 text-[12px] text-[#94A3B8] text-center">No cities found</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>Postal Code</Label>
                          <Field icon={<MapPinIcon />} placeholder="00300" value={newAddr.postalCode}
                            onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                            fk="npostal" focused={focused} setFocused={setFocused} name="postal-code" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button type="button" onClick={handleAddAddress}
                        className="px-4 py-2 rounded-[9px] text-[12.5px] font-bold text-white border-none cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${GREEN}, #12A07A)` }}>
                        Save Address
                      </button>
                      <button type="button" onClick={() => { setAddingAddr(false); setNewAddr({ street: "", city: "", postalCode: "" }); }}
                        className="px-4 py-2 rounded-[9px] text-[12.5px] font-semibold cursor-pointer border-none"
                        style={{ background: "#F1F5F9", color: "#64748B" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
              <>
                <SectionCard>
                  <SectionHeader title="Change Password" subtitle="Update your password to keep your account secure" accent="#7C3AED" />
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label>Current Password</Label>
                      <Field icon={<LockIcon />} type={showCurrent ? "text" : "password"}
                        placeholder="Enter current password" value={currentPass}
                        onChange={e => { setCurrentPass(e.target.value); setPassError(""); }}
                        fk="currentPass" focused={focused} setFocused={setFocused} name="current-password"
                        right={eyeBtn(showCurrent, () => setShowCurrent(!showCurrent))} />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Field icon={<LockIcon />} type={showNew ? "text" : "password"}
                        placeholder="Create new password" value={newPass}
                        onChange={e => { setNewPass(e.target.value); setPassError(""); }}
                        fk="newPass" focused={focused} setFocused={setFocused} name="new-password"
                        right={eyeBtn(showNew, () => setShowNew(!showNew))} />
                      <PasswordStrength password={newPass} />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Field icon={<LockIcon />} type={showConf ? "text" : "password"}
                        placeholder="Repeat new password" value={confPass}
                        onChange={e => { setConfPass(e.target.value); setPassError(""); }}
                        fk="confPass" focused={focused} setFocused={setFocused} name="confirm-password"
                        right={eyeBtn(showConf, () => setShowConf(!showConf))} />
                    </div>
                    {passError && <p className="text-[12px] text-red-500">{passError}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 border-none rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 font-sans tracking-[0.3px] transition-all duration-200 text-white"
                      style={{
                        background: loading ? "#7B96D8" : `linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`,
                        boxShadow: loading ? "none" : "0 4px 18px rgba(2,62,138,0.3)",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}>
                      {loading ? <><Spinner /> Updating...</> : <>Update Password</>}
                    </button>
                    <div className="text-center mt-4">
                      <button type="button" onClick={() => setShowForgot(true)}
                        className="text-[12.5px] font-semibold bg-transparent border-none cursor-pointer transition-colors"
                        style={{ color: INDIGO }}>
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </SectionCard>

                <div className="rounded-[12px] p-5"
                  style={{ background: "linear-gradient(135deg, #F0F4FF, #F8F9FF)", border: `1.5px solid ${INDIGO}20` }}>
                  <div className="text-[12.5px] font-bold text-[#374151] mb-3 flex items-center gap-2">
                    <ShieldIcon /> Password Tips
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      "At least 8 characters long",
                      "Include uppercase and lowercase letters",
                      "Add numbers and special characters",
                      "Avoid reusing previous passwords",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11.5px] text-[#64748B]">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${INDIGO}15`, color: INDIGO }}>
                          <CheckIcon />
                        </div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
