import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ShoppingCart, Plus, Minus, X,
  Store, Pill, Clock, CheckCircle, Star,
  ChevronDown, ChevronUp, Package, Heart, Loader2,
  AlertTriangle, ArrowUpRight, Sparkles, Zap, Tag
} from 'lucide-react';
import { medicineAPI, pharmacyAPI } from '../utils/apiEndpoints';

// ── Palette — MediReach brand ─────────────────────────────────────
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


// ── Prescription badge config ────────────────────────────────────
const RX_CFG = {
  required:     { label:"Rx Required",     color:C.techBlue,  bg:"rgba(2,62,138,0.08)",   border:"rgba(2,62,138,0.2)"   },
  "not required": { label:"OTC",           color:C.success,   bg:"rgba(14,124,91,0.08)",  border:"rgba(14,124,91,0.2)"  },
  optional:     { label:"Optional Rx",     color:C.warn,      bg:"rgba(180,83,9,0.08)",   border:"rgba(180,83,9,0.2)"   },
}

// ── Medicine Card ────────────────────────────────────────────────
function MedicineCard({ medicine, onAdd, inCart }) {
  const [hov, setHov] = useState(false);
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const rx = RX_CFG[medicine.mediPrescriptionStatus?.toLowerCase()] || RX_CFG["not required"];
  const isLowStock = medicine.mediStock > 0 && medicine.mediStock <= 50;
  const isOutOfStock = (medicine.mediStock || 0) === 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    setAdding(true);
    onAdd(medicine);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 18,
        background: C.snow,
        border: `1.5px solid ${hov ? C.techBlue : C.paleSlate}`,
        boxShadow: hov
          ? `0 20px 50px rgba(2,62,138,0.14), 0 4px 12px rgba(2,62,138,0.08)`
          : `0 2px 12px rgba(74,85,104,0.06)`,
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        animation: "cardIn 0.5s ease both",
      }}
    >
      {/* Top accent line */}
      <div style={{
        height: 3,
        background: hov
          ? `linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh})`
          : `linear-gradient(90deg, ${C.paleSlate}, ${C.paleSlate})`,
        transition: "background 0.3s",
      }} />

      {/* Image area */}
      <div style={{
        position: "relative",
        background: `linear-gradient(135deg, rgba(2,62,138,0.04) 0%, rgba(76,110,245,0.06) 100%)`,
        padding: "28px 20px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 150,
      }}>
        {/* Decorative dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
          backgroundSize: "16px 16px", opacity: 0.6,
        }} />

        {medicine.mediImage && medicine.mediImage !== "N/A" ? (
          <img
            src={medicine.mediImage}
            alt={medicine.mediName}
            style={{
              height: 110, width: "auto", maxWidth: "100%",
              objectFit: "contain", position: "relative", zIndex: 1,
              filter: "drop-shadow(0 8px 20px rgba(2,62,138,0.15))",
              transition: "transform 0.3s ease",
              transform: hov ? "scale(1.06)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: `linear-gradient(135deg, rgba(2,62,138,0.1), rgba(76,110,245,0.15))`,
            border: `1.5px solid rgba(2,62,138,0.15)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}>
            <Pill size={32} color={C.techBlue} strokeWidth={1.5} style={{ opacity: 0.6 }} />
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setLiked(l => !l)}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 2,
            width: 32, height: 32, borderRadius: "50%",
            background: liked ? "rgba(192,57,43,0.1)" : "rgba(255,255,255,0.9)",
            border: `1.5px solid ${liked ? "rgba(192,57,43,0.3)" : C.paleSlate}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(8px)",
          }}
        >
          <Heart
            size={14}
            color={liked ? C.danger : C.lilacAsh}
            fill={liked ? C.danger : "none"}
            strokeWidth={2}
            style={{ transition: "all 0.2s" }}
          />
        </button>

        {/* Low / Out badge */}
        {(isLowStock || isOutOfStock) && (
          <div style={{
            position: "absolute", top: 12, left: 12, zIndex: 2,
            borderRadius: 99, padding: "3px 9px",
            background: isOutOfStock ? "rgba(192,57,43,0.1)" : "rgba(180,83,9,0.08)",
            border: `1px solid ${isOutOfStock ? "rgba(192,57,43,0.25)" : "rgba(180,83,9,0.22)"}`,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: isOutOfStock ? C.danger : C.warn,
              animation: isOutOfStock ? "none" : "pulse 1.4s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: isOutOfStock ? C.danger : C.warn }}>
              {isOutOfStock ? "Out of Stock" : "Low Stock"}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Category + Rx */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: "rgba(76,110,245,0.08)", color: C.lilacAsh,
            border: "1px solid rgba(76,110,245,0.18)", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {medicine.mediCategory || "Medicine"}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: rx.bg, color: rx.color, border: `1px solid ${rx.border}`,
            letterSpacing: "0.06em",
          }}>
            {rx.label}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          margin: 0, fontSize: 15.5, fontWeight: 700, color: C.blueSlate,
          letterSpacing: "-0.3px", lineHeight: 1.25,
          fontFamily: "'Sora', sans-serif",
          transition: "color 0.2s",
          ...(hov ? { color: C.techBlue } : {}),
        }}>
          {medicine.mediName}
        </h3>

        {/* Manufacturer */}
        <p style={{ margin: 0, fontSize: 11.5, color: C.lilacAsh, fontWeight: 400, lineHeight: 1.4 }}>
          {medicine.mediCompany || "—"}
        </p>

        {/* Stock row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 99, background: C.paleSlate, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${Math.min(((medicine.mediStock || 0) / 500) * 100, 100)}%`,
              background: isOutOfStock ? C.danger : isLowStock ? C.warn : C.success,
              transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: isOutOfStock ? C.danger : isLowStock ? C.warn : C.blueSlate, whiteSpace: "nowrap" }}>
            {medicine.mediStock || 0} units
          </span>
        </div>

        {/* Expiry */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={11} color={C.lilacAsh} strokeWidth={2} />
          <span style={{ fontSize: 11, color: C.lilacAsh }}>
            Expires {new Date(medicine.mediExpiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price + Add */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: C.lilacAsh, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Price</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.techBlue, letterSpacing: "-1px", fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 600, verticalAlign: "super", marginRight: 1 }}>LKR</span>
              {(medicine.mediPrice || 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: adding ? "9px 18px" : "9px 16px",
              borderRadius: 10,
              border: "none",
              background: isOutOfStock
                ? C.paleSlate
                : adding
                ? C.success
                : inCart
                ? `rgba(2,62,138,0.1)`
                : C.techBlue,
              color: isOutOfStock ? C.lilacAsh : adding ? C.snow : inCart ? C.techBlue : C.snow,
              fontWeight: 700, fontSize: 12.5, cursor: isOutOfStock ? "not-allowed" : "pointer",
              transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: isOutOfStock || inCart ? "none" : `0 4px 16px rgba(2,62,138,0.3)`,
              fontFamily: "inherit",
              border: inCart ? `1.5px solid rgba(2,62,138,0.25)` : "none",
            }}
          >
            {adding ? (
              <CheckCircle size={14} strokeWidth={2.5} />
            ) : inCart ? (
              <ShoppingCart size={14} strokeWidth={2.5} />
            ) : (
              <Plus size={14} strokeWidth={2.5} />
            )}
            {adding ? "Added!" : inCart ? "In Cart" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pharmacy Section Header ───────────────────────────────────────
function PharmacySectionHeader({ name, count, index }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      marginBottom: 20, paddingBottom: 16,
      borderBottom: `1.5px solid ${C.paleSlate}`,
      animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `linear-gradient(135deg, ${C.techBlue}, #3d74c4)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.snow, fontWeight: 800, fontSize: 14,
        fontFamily: "'Sora', sans-serif", letterSpacing: "0.5px",
        boxShadow: `0 6px 20px rgba(2,62,138,0.25)`,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{
          margin: 0, fontSize: 19, fontWeight: 700, color: C.blueSlate,
          letterSpacing: "-0.5px", fontFamily: "'Sora', sans-serif",
        }}>
          {name}
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: C.lilacAsh, fontWeight: 400 }}>
          {count} product{count !== 1 ? "s" : ""} available
        </p>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        background: "rgba(14,124,91,0.07)", borderRadius: 99, padding: "5px 13px",
        border: "1px solid rgba(14,124,91,0.2)",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, animation: "pulse 1.4s ease infinite" }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: C.success }}>Online</span>
      </div>
    </div>
  );
}

// ── Cart Item ────────────────────────────────────────────────────
function CartItem({ item, onUpdate, onRemove }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "12px 0",
      borderBottom: `1px solid ${C.paleSlate}`,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, rgba(2,62,138,0.05), rgba(76,110,245,0.08))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1.5px solid ${C.paleSlate}`,
      }}>
        {item.mediImage && item.mediImage !== "N/A" ? (
          <img src={item.mediImage} alt={item.mediName}
            style={{ width: "80%", height: "80%", objectFit: "contain" }} />
        ) : (
          <Pill size={20} color={C.lilacAsh} strokeWidth={1.5} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.blueSlate,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'Sora', sans-serif" }}>{item.mediName}</p>
        <p style={{ margin: "2px 0 6px", fontSize: 11, color: C.lilacAsh }}>{item.Pharmacy}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Qty controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 0,
            border: `1.5px solid ${C.paleSlate}`, borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => onUpdate(item._id, -1)} style={{
              width: 28, height: 26, background: C.white, border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: C.blueSlate, transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.paleSlate}
              onMouseLeave={e => e.currentTarget.style.background = C.white}
            ><Minus size={11} strokeWidth={2.5} /></button>
            <span style={{ width: 28, textAlign: "center", fontSize: 12, fontWeight: 700,
              color: C.blueSlate, fontFamily: "'Sora', sans-serif" }}>{item.quantity}</span>
            <button onClick={() => onUpdate(item._id, 1)} style={{
              width: 28, height: 26, background: C.white, border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: C.blueSlate, transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.paleSlate}
              onMouseLeave={e => e.currentTarget.style.background = C.white}
            ><Plus size={11} strokeWidth={2.5} /></button>
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.techBlue, fontFamily: "'Sora', sans-serif" }}>
            LKR {(item.mediPrice * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
      <button onClick={() => onRemove(item._id)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.lilacAsh, display: "flex", alignItems: "flex-start", padding: "2px 0",
        opacity: 0.5, transition: "opacity 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = C.danger; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = C.lilacAsh; }}
      >
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
const MedicineCardView = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [focusSearch, setFocusSearch] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true); setFetchError(null);
    try {
      const [medRes, pharmRes] = await Promise.all([medicineAPI.getAllMedicines(), pharmacyAPI.getAllPharmacies()]);
      const medData   = medRes.data;
      const pharmData = pharmRes.data;
      
      // Ensure medicines is always an array
      const medicinesArray = Array.isArray(medData) ? medData : 
                            medData?.data?.medicines || 
                            medData?.medicines || 
                            medData?.data || 
                            [];
      
      console.log('Medicines data:', medData);
      console.log('Medicines array:', medicinesArray);
      
      setMedicines(medicinesArray);
      setPharmacies(pharmData.data?.pharmacies || pharmData.pharmacies || []);
    } catch (error) {
      console.error(error);
      setFetchError("Failed to fetch data. Please try again later.");
      setMedicines([]); // Ensure medicines is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(medicines.map(m => m.mediCategory).filter(Boolean))];

  const medicinesByPharmacy = medicines.reduce((acc, medicine) => {
    const pharmacy = medicine.Pharmacy || 'Unknown Pharmacy';
    if (!acc[pharmacy]) acc[pharmacy] = [];
    acc[pharmacy].push(medicine);
    return acc;
  }, {});

  const addToCart = (medicine) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === medicine._id);
      return existing
        ? prev.map(i => i._id === medicine._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...medicine, quantity: 1 }];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
  };

  const updateQuantity = (id, change) => {
    setCart(prev =>
      prev.map(i => i._id === id ? { ...i, quantity: i.quantity + change } : i)
          .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const getTotalItems = () => cart.reduce((s, i) => s + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((s, i) => s + i.mediPrice * i.quantity, 0);

  const handlePlaceOrder = () => {
    if (!cart.length) return;
    localStorage.setItem('mediReach_cart', JSON.stringify(cart));
    navigate('/orderform');
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.snow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: `rgba(2,62,138,0.08)`, border: `1.5px solid rgba(2,62,138,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Loader2 size={26} color={C.techBlue} style={{ animation: "spin 0.9s linear infinite" }} />
        </div>
        <p style={{ margin: 0, fontWeight: 600, color: C.blueSlate, fontFamily: "'Sora', sans-serif" }}>Loading MediReach Shop...</p>
      </div>
    </div>
  );

  if (fetchError) return (
    <div style={{ minHeight: "100vh", background: C.snow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <AlertTriangle size={26} color={C.danger} />
        </div>
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: C.blueSlate, fontSize: 16, fontFamily: "'Sora', sans-serif" }}>Failed to load medicines</p>
        <p style={{ margin: "0 0 20px", color: C.lilacAsh, fontSize: 13 }}>{fetchError}</p>
        <button onClick={fetchData} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.techBlue, color: C.snow, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 18px rgba(2,62,138,0.3)` }}>
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.white, fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.paleSlate}; border-radius: 99px; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn    { from{opacity:0;transform:translateY(18px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideIn   { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes slideOut  { from{transform:translateX(0)} to{transform:translateX(100%)} }
        @keyframes bounce    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.22)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder   { color:${C.lilacAsh}; opacity:0.55; }
        select option        { color:${C.blueSlate}; background:${C.snow}; }
      `}</style>

      {/* ── Top gradient stripe ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200,
        background: `linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh}, ${C.paleSlate}, ${C.snow})` }} />

      {/* ── Fixed dot grid bg ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
        backgroundSize: "28px 28px", opacity: 0.3 }} />

      {/* ── Ambient glow ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(ellipse at 15% 0%, rgba(2,62,138,0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 90% 80%, rgba(76,110,245,0.06) 0%, transparent 40%)
        ` }} />

      {/* ── Sticky Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(247,249,252,0.85)", backdropFilter: "blur(16px)",
        borderBottom: `1.5px solid ${C.paleSlate}`,
        boxShadow: "0 4px 24px rgba(2,62,138,0.06)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 72 }}>
            {/* Logo + breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              <img 
                    src="/logo.png" 
                    alt="MediReach Logo" 
                    width={36} 
                    height={36}
                    className="rounded-[10px]"
                    style={{
                      boxShadow: `0 4px 14px rgba(2,62,138,0.3)`,
                    }}
                />
              <div>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.blueSlate, letterSpacing: "-0.5px", fontFamily: "'Sora', sans-serif" }}>
                  MediReach
                </h1>
                <p style={{ margin: 0, fontSize: 10.5, color: C.lilacAsh, fontWeight: 500 }}>Medicine Shop</p>
              </div>
            </div>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: 460, position: "relative" }}>
              <Search size={15} color={focusSearch ? C.techBlue : C.lilacAsh}
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
              <input
                type="text"
                placeholder="Search medicines, brands, categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setFocusSearch(true)}
                onBlur={() => setFocusSearch(false)}
                style={{
                  width: "100%", padding: "10px 14px 10px 38px",
                  borderRadius: 11,
                  border: `1.5px solid ${focusSearch ? C.techBlue : C.paleSlate}`,
                  background: focusSearch ? C.snow : C.white,
                  fontSize: 13.5, outline: "none", fontFamily: "inherit", color: C.blueSlate,
                  transition: "all 0.2s",
                  boxShadow: focusSearch ? `0 0 0 3px rgba(2,62,138,0.09)` : "none",
                }}
              />
            </div>

            {/* Filters row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <select
                value={selectedPharmacy}
                onChange={e => setSelectedPharmacy(e.target.value)}
                style={{
                  padding: "8px 30px 8px 12px", borderRadius: 9,
                  border: `1.5px solid ${selectedPharmacy !== "All" ? C.techBlue : C.paleSlate}`,
                  background: selectedPharmacy !== "All" ? "rgba(2,62,138,0.06)" : C.snow,
                  color: C.blueSlate, fontSize: 12.5, outline: "none", fontFamily: "inherit",
                  cursor: "pointer", fontWeight: 600,
                  appearance: "none", WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234C6EF5' stroke-opacity='.5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                  transition: "all 0.2s",
                }}
              >
                <option value="All">All Pharmacies</option>
                {pharmacies.filter(p => p.isActive).map(p => (
                  <option key={p._id} value={p.name}>{p.name}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{
                  padding: "8px 30px 8px 12px", borderRadius: 9,
                  border: `1.5px solid ${selectedCategory !== "All" ? C.lilacAsh : C.paleSlate}`,
                  background: selectedCategory !== "All" ? "rgba(76,110,245,0.07)" : C.snow,
                  color: C.blueSlate, fontSize: 12.5, outline: "none", fontFamily: "inherit",
                  cursor: "pointer", fontWeight: 600,
                  appearance: "none", WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234C6EF5' stroke-opacity='.5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                  transition: "all 0.2s",
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                ))}
              </select>

              {/* Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 10, border: "none",
                  background: C.techBlue, color: C.snow,
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.22s",
                  boxShadow: `0 4px 16px rgba(2,62,138,0.28)`,
                  animation: cartBounce ? "bounce 0.35s ease" : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(2,62,138,0.38)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(2,62,138,0.28)"; }}
              >
                <ShoppingCart size={16} strokeWidth={2} />
                Cart
                {getTotalItems() > 0 && (
                  <span style={{
                    position: "absolute", top: -7, right: -7,
                    width: 20, height: 20, borderRadius: "50%",
                    background: C.danger, color: C.snow,
                    fontSize: 10, fontWeight: 800, fontFamily: "'Sora', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${C.snow}`,
                    boxShadow: "0 2px 8px rgba(192,57,43,0.4)",
                  }}>{getTotalItems()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px", position: "relative", zIndex: 1 }}>

        {/* Summary bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20, marginBottom: 36,
          animation: "fadeUp 0.4s ease both",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.blueSlate,
              letterSpacing: "-0.8px", fontFamily: "'Sora', sans-serif" }}>
              Browse Medicines
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.lilacAsh }}>
              {medicines.length.toLocaleString()} products across {Object.keys(medicinesByPharmacy).length} pharmacies
              {(searchTerm || selectedCategory !== "All" || selectedPharmacy !== "All") && (
                <span style={{ color: C.techBlue, fontWeight: 600 }}>
                  {" "}· {medicines.filter(m => {
                    const ms = m.mediName?.toLowerCase().includes(searchTerm.toLowerCase());
                    const mc = selectedCategory === "All" || m.mediCategory === selectedCategory;
                    const mp = selectedPharmacy === "All" || m.Pharmacy === selectedPharmacy;
                    return ms && mc && mp;
                  }).length} shown
                </span>
              )}
            </p>
          </div>

          {/* Active filter chips */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {selectedPharmacy !== "All" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 99,
                background: "rgba(2,62,138,0.07)", border: "1px solid rgba(2,62,138,0.2)",
              }}>
                <Store size={10} color={C.techBlue} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.techBlue }}>{selectedPharmacy}</span>
                <button onClick={() => setSelectedPharmacy("All")} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0, color: C.techBlue,
                  display: "flex", opacity: 0.6, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                ><X size={12} /></button>
              </div>
            )}
            {selectedCategory !== "All" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 99,
                background: "rgba(76,110,245,0.07)", border: "1px solid rgba(76,110,245,0.2)",
              }}>
                <Tag size={10} color={C.lilacAsh} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.lilacAsh }}>{selectedCategory}</span>
                <button onClick={() => setSelectedCategory("All")} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0, color: C.lilacAsh,
                  display: "flex", opacity: 0.6, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                ><X size={12} /></button>
              </div>
            )}
          </div>
        </div>

        {/* ── Pharmacy sections ── */}
        {Object.entries(medicinesByPharmacy).map(([pharmacyName, pharmacyMedicines], sectionIdx) => {
          const filtered = pharmacyMedicines.filter(m => {
            const ms = m.mediName?.toLowerCase().includes(searchTerm.toLowerCase());
            const mc = selectedCategory === "All" || m.mediCategory === selectedCategory;
            const mp = selectedPharmacy === "All" || m.Pharmacy === selectedPharmacy;
            return ms && mc && mp;
          });
          if (filtered.length === 0) return null;

          return (
            <div key={pharmacyName} style={{ marginBottom: 52 }}>
              <PharmacySectionHeader name={pharmacyName} count={filtered.length} index={sectionIdx} />
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(238px, 1fr))",
                gap: 18,
              }}>
                {filtered.map((medicine, idx) => (
                  <div key={medicine._id} style={{ animationDelay: `${idx * 0.05}s` }}>
                    <MedicineCard
                      medicine={medicine}
                      onAdd={addToCart}
                      inCart={cart.some(i => i._id === medicine._id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {Object.entries(medicinesByPharmacy).every(([, meds]) =>
          meds.filter(m => {
            const ms = m.mediName?.toLowerCase().includes(searchTerm.toLowerCase());
            const mc = selectedCategory === "All" || m.mediCategory === selectedCategory;
            const mp = selectedPharmacy === "All" || m.Pharmacy === selectedPharmacy;
            return ms && mc && mp;
          }).length === 0
        ) && (
          <div style={{ textAlign: "center", padding: "80px 24px", animation: "fadeUp 0.4s ease both" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
              background: C.white, border: `1.5px solid ${C.paleSlate}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(2,62,138,0.06)",
            }}>
              <Pill size={30} color={C.lilacAsh} strokeWidth={1.5} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: C.blueSlate, fontFamily: "'Sora', sans-serif" }}>No medicines found</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: C.lilacAsh }}>Try adjusting your search or filters</p>
            <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedPharmacy("All"); }}
              style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: C.techBlue, color: C.snow, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Cart Drawer ── */}
      {isCartOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setIsCartOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(2,62,138,0.15)", backdropFilter: "blur(4px)",
            animation: "fadeUp 0.2s ease both",
          }}
        >
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 400,
            background: C.snow,
            boxShadow: "-24px 0 60px rgba(2,62,138,0.14)",
            display: "flex", flexDirection: "column",
            animation: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1) both",
          }}>
            {/* Top stripe */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.techBlue}, ${C.lilacAsh})` }} />

            {/* Header */}
            <div style={{
              padding: "20px 22px 16px",
              borderBottom: `1.5px solid ${C.paleSlate}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "rgba(2,62,138,0.08)",
                  border: `1.5px solid rgba(2,62,138,0.18)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ShoppingCart size={16} color={C.techBlue} strokeWidth={2} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.blueSlate, fontFamily: "'Sora', sans-serif" }}>Your Cart</h2>
                  <p style={{ margin: 0, fontSize: 11.5, color: C.lilacAsh }}>
                    {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${C.paleSlate}`, background: C.white,
                color: C.lilacAsh, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.techBlue; e.currentTarget.style.color = C.techBlue; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.paleSlate; e.currentTarget.style.color = C.lilacAsh; }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 80 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
                    background: C.white, border: `1.5px solid ${C.paleSlate}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ShoppingCart size={26} color={C.lilacAsh} strokeWidth={1.5} />
                  </div>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, color: C.blueSlate, fontFamily: "'Sora', sans-serif" }}>Cart is empty</p>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.lilacAsh }}>Add medicines to get started</p>
                </div>
              ) : (
                cart.map(item => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdate={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{
                padding: "16px 22px 22px",
                borderTop: `1.5px solid ${C.paleSlate}`,
                background: C.white,
              }}>
                {/* Subtotal */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: C.lilacAsh, fontWeight: 500 }}>Subtotal ({getTotalItems()} items)</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: C.techBlue, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.8px" }}>
                    LKR {getTotalPrice().toLocaleString()}
                  </span>
                </div>
                {/* Place order */}
                <button
                  onClick={handlePlaceOrder}
                  style={{
                    width: "100%", padding: "13px 20px", borderRadius: 11, border: "none",
                    background: C.techBlue, color: C.snow,
                    fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: `0 6px 24px rgba(2,62,138,0.32)`,
                    transition: "all 0.22s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(2,62,138,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(2,62,138,0.32)"; }}
                >
                  Place Order
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </button>
                <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 11, color: C.lilacAsh }}>
                  Prescription verification may be required at checkout
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineCardView;