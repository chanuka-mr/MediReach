import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Package, Building2, TrendingUp, TrendingDown,
  Activity, AlertCircle, RefreshCw, Wifi, WifiOff,
  AlertTriangle, Clock, CheckCircle, XCircle, Shield,
  User, MapPin, ArrowUpRight, BarChart3, Check,
  ShoppingCart, Loader2
} from 'lucide-react';

// ── Exact same API constants as other dashboards ──────────────────
const PHARMACY_API = 'http://localhost:5000/api/pharmacies';
const MEDICINE_API = 'http://localhost:5000/medicines';
const USERS_API    = 'http://localhost:5000/api/users';
const ROMS_API     = 'http://localhost:5000/api/roms/pharmacy-tasks?pharmacy_id=ALL';

// ── Same color palette used across all pages ─────────────────────
const C = {
  techBlue:  '#023E8A',   // InventoryDashboard
  lilac:     '#4C6EF5',   // InventoryDashboard
  pink:      '#F472B6',   // AdminUsersPage
  emerald:   '#34D399',   // PharmacyManagement / InventoryDashboard
  amber:     '#F59E0B',   // OrderDashboard (warning)
  danger:    '#EF4444',   // AdminUsersPage / OrderDashboard
  success:   '#0E7C5B',   // OrderDashboard
  snow:      '#FFFFFF',
  offWhite:  '#F7F9FC',
  paleSlate: '#DDE3ED',
  slate:     '#4A5568',
  dark:      '#0F2137',   // AdminUsersPage
};

// ── Same getMockData helper as InventoryDashboard ─────────────────
const getMockData = (id) => {
  const sum = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return { syncMin: (sum % 59) + 1, isSlow: sum % 5 === 0, orders: sum % 30 };
};

// ── Animated counter ──────────────────────────────────────────────
function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target || typeof target !== 'number') return;
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

// ── Stat Card — same hover-fill style as InventoryDashboard ───────
function StatCard({ title, value, icon: Icon, accent, subtitle, trend, delay = '0s', loading }) {
  const [hov, setHov] = useState(false);
  const animated = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16, padding: '22px 20px', position: 'relative',
        overflow: 'hidden', cursor: 'default',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        background: hov ? accent : C.snow,
        border: `1.5px solid ${hov ? accent : C.paleSlate}`,
        boxShadow: hov ? `0 16px 40px ${accent}33` : '0 2px 12px rgba(91,97,106,0.07)',
        transform: hov ? 'translateY(-3px)' : 'none',
        animation: `fadeUp 0.5s ease ${delay} both`,
      }}
    >
      {hov && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: '0 0 8px', fontSize: 10.5, fontWeight: 700,
            color: hov ? 'rgba(255,255,255,0.65)' : accent,
            letterSpacing: '0.13em', textTransform: 'uppercase',
          }}>{title}</p>
          {loading
            ? <div style={{ width: 72, height: 38, borderRadius: 8, background: hov ? 'rgba(255,255,255,0.2)' : C.paleSlate, animation: 'pulse 1.5s ease infinite' }} />
            : <p style={{
                margin: 0, fontSize: 38, fontWeight: 800, lineHeight: 1,
                letterSpacing: '-1.8px', fontFamily: "'Sora',sans-serif",
                color: hov ? C.snow : C.dark, transition: 'color 0.28s',
              }}>
                {typeof value === 'number' ? animated.toLocaleString() : (value ?? '—')}
              </p>
          }
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
            {trend != null && !loading && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 3,
                background: hov ? 'rgba(255,255,255,0.2)' : `${accent}18`,
                borderRadius: 99, padding: '2px 8px',
                border: hov ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${accent}33`,
              }}>
                {trend >= 0 ? <TrendingUp size={9} color={hov ? C.snow : accent} /> : <TrendingDown size={9} color={hov ? C.snow : accent} />}
                <span style={{ fontSize: 10, fontWeight: 700, color: hov ? C.snow : accent }}>{Math.abs(trend)}%</span>
              </div>
            )}
            {subtitle && <p style={{ margin: 0, fontSize: 11.5, color: hov ? 'rgba(255,255,255,0.55)' : C.slate }}>{subtitle}</p>}
          </div>
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: hov ? 'rgba(255,255,255,0.18)' : `${accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${hov ? 'rgba(255,255,255,0.28)' : `${accent}30`}`,
          transition: 'all 0.28s',
        }}>
          <Icon size={21} color={hov ? C.snow : accent} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

// ── Stock bar — same as InventoryDashboard StockBar ───────────────
function StockBar({ value }) {
  const color = value >= 80 ? '#2d7a4f' : value >= 55 ? '#7a5a1a' : '#8a3030';
  const bg    = value >= 80 ? '#eaf6f0' : value >= 55 ? '#fdf4e3' : '#fdeaea';
  return (
    <div style={{ width: 78, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ height: 5, borderRadius: 99, background: bg, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, borderRadius: 99, background: color, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 10.5, fontWeight: 600, color, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

// ── Role badge — same style as AdminUsersPage ─────────────────────
function RoleBadge({ role }) {
  const map = {
    admin:    { bg: 'rgba(167,139,250,0.1)', color: '#7C3AED', border: 'rgba(167,139,250,0.2)', icon: Shield },
    pharmacy: { bg: 'rgba(52,211,153,0.1)',  color: '#059669', border: 'rgba(52,211,153,0.2)',  icon: Building2 },
    user:     { bg: 'rgba(56,189,248,0.1)',  color: '#0284C7', border: 'rgba(56,189,248,0.2)',  icon: User },
  };
  const r = map[role?.toLowerCase()] || map.user;
  const Icon = r.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: r.bg, color: r.color, border: `1px solid ${r.border}`,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      <Icon size={11} strokeWidth={2.5} />{role || 'user'}
    </span>
  );
}

// ── Order status color — same logic as OrderDashboard ────────────
function getStatusStyle(status, expiry_time) {
  const isExpired = status === 'Pending' && expiry_time && new Date(expiry_time) < new Date();
  if (isExpired || status === 'Expired')
    return { bg: 'rgba(192,57,43,0.1)', color: '#c0392b', label: 'Expired' };
  const map = {
    Pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#B45309',  label: 'Pending' },
    Approved:  { bg: 'rgba(76,110,245,0.1)',  color: '#023E8A',  label: 'Approved' },
    Ready:     { bg: 'rgba(14,124,91,0.1)',   color: '#0E7C5B',  label: 'Ready' },
    Rejected:  { bg: 'rgba(192,57,43,0.1)',   color: '#c0392b',  label: 'Rejected' },
    Cancelled: { bg: 'rgba(100,116,139,0.1)', color: '#64748b',  label: 'Cancelled' },
  };
  return map[status] || { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: status };
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines,  setMedicines]  = useState([]);
  const [users,      setUsers]      = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [errors,     setErrors]     = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab,  setActiveTab]  = useState('pharmacies');

  // Same token logic as AdminUsersPage
  const token = useMemo(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved)?.token : null;
    } catch { return null; }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const errs = {};

    // Same fetch pattern as InventoryDashboard (Promise.all)
    const [pharmRes, medRes, usersRes, romsRes] = await Promise.allSettled([
      fetch(PHARMACY_API),
      fetch(MEDICINE_API),
      fetch(USERS_API, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      fetch(ROMS_API,  { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
    ]);

    if (pharmRes.status === 'fulfilled' && pharmRes.value.ok) {
      const d = await pharmRes.value.json();
      setPharmacies(d.data?.pharmacies || d.pharmacies || (Array.isArray(d) ? d : []));
    } else errs.pharmacies = 'Failed to fetch pharmacies';

    if (medRes.status === 'fulfilled' && medRes.value.ok) {
      const d = await medRes.value.json();
      setMedicines(Array.isArray(d) ? d : (d.medicines || []));
    } else errs.medicines = 'Failed to fetch medicines';

    if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
      const d = await usersRes.value.json();
      setUsers(Array.isArray(d) ? d : (d.data || d.users || []));
    } else errs.users = 'Failed to fetch users';

    if (romsRes.status === 'fulfilled' && romsRes.value.ok) {
      const d = await romsRes.value.json();
      setOrders(Array.isArray(d) ? d : (d.data || []));
    } else errs.orders = 'Failed to fetch orders';

    setErrors(errs);
    setLastUpdated(new Date());
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Same derived stats as InventoryDashboard ───────────────────
  const derived = useMemo(() => {
    const activePharms = pharmacies.filter(p => p.isActive).length;

    // Same buildPharmacyList logic from InventoryDashboard
    const pharmacyRows = pharmacies.map(p => {
      const mock   = getMockData(p._id);
      const status = !p.isActive ? 'offline' : mock.isSlow ? 'warning' : 'active';
      const pharMeds   = medicines.filter(m => (m.Pharmacy || m.pharmacy) === p.name);
      const maxPossible = pharMeds.length * 1300;
      const totalStock  = pharMeds.reduce((s, m) => s + (Number(m.mediStock) || 0), 0);
      const stockPct    = maxPossible > 0 ? Math.min(Math.round((totalStock / maxPossible) * 100), 99) : 0;
      return { ...p, status, stockPct, orderCount: p.isActive ? mock.orders : 0, lastSync: p.isActive ? `${mock.syncMin} min ago` : '2 days ago' };
    });

    const lowStock  = medicines.filter(m => { const q = Number(m.mediStock) || 0; return q > 0 && q <= 50; }).length;
    const outOfStock = medicines.filter(m => (Number(m.mediStock) || 0) === 0).length;

    // Same role counting as AdminUsersPage
    const roleCounts = users.reduce((acc, u) => {
      const r = (u.role || 'user').toLowerCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});

    // Same order stats as OrderDashboard
    const pendingOrders   = orders.filter(o => o.status === 'Pending').length;
    const readyOrders     = orders.filter(o => o.status === 'Ready').length;
    const approvedOrders  = orders.filter(o => o.status === 'Approved').length;

    return { activePharms, pharmacyRows, lowStock, outOfStock, roleCounts, pendingOrders, readyOrders, approvedOrders };
  }, [pharmacies, medicines, users, orders]);

  const hasError = Object.keys(errors).length > 0;
  const STATUS_MAP = {
    active:  { label: 'Online',    color: '#2d7a4f', bg: '#eaf6f0', border: '#b3dfc8', icon: Wifi },
    warning: { label: 'Slow Sync', color: '#7a5a1a', bg: '#fdf4e3', border: '#e8d19a', icon: AlertTriangle },
    offline: { label: 'Offline',   color: '#8a3030', bg: '#fdeaea', border: '#e8b3b3', icon: WifiOff },
  };

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${C.paleSlate};border-radius:99px}
      `}</style>

      {/* Top rainbow bar — same gradient concept as InventoryDashboard top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.techBlue}, ${C.lilac}, ${C.pink}, ${C.emerald}, ${C.amber})` }} />

      {/* Dot grid — same as InventoryDashboard */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, ${C.paleSlate} 1px, transparent 1px)`,
        backgroundSize: '28px 28px', opacity: 0.35,
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(circle at 5% 5%, ${C.techBlue}08 0%, transparent 40%),
          radial-gradient(circle at 95% 90%, ${C.pink}08 0%, transparent 40%),
          radial-gradient(circle at 85% 10%, ${C.emerald}06 0%, transparent 35%)`,
      }} />

      <div style={{ padding: '36px 40px 60px', position: 'relative', zIndex: 1, maxWidth: 1440, margin: '0 auto' }}>

        {/* ── Header — same breadcrumb style as InventoryDashboard ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, animation: 'fadeUp 0.4s ease both' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: C.techBlue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${C.techBlue}44`,
              }}>
                <BarChart3 size={14} color={C.snow} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 12, color: C.slate, fontWeight: 400 }}>MediReach</span>
              <span style={{ fontSize: 11, color: C.paleSlate }}>›</span>
              <span style={{
                fontSize: 11.5, color: C.techBlue, fontWeight: 600,
                background: `${C.techBlue}12`, padding: '2px 10px', borderRadius: 99,
                border: `1px solid ${C.techBlue}20`,
              }}>Admin</span>
            </div>
            <h1 style={{
              margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-1.4px',
              color: C.dark, lineHeight: 1.1, fontFamily: "'Sora',sans-serif",
            }}>Admin Dashboard</h1>
            <p style={{ margin: '7px 0 0', color: C.slate, fontSize: 14 }}>
              Real-time overview across the MediReach platform
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          <button
            onClick={fetchAll} disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 10, fontFamily: 'inherit',
              border: `1.5px solid ${C.paleSlate}`, background: C.snow,
              color: loading ? C.paleSlate : C.dark, fontWeight: 600, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = C.techBlue; e.currentTarget.style.color = C.techBlue; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.paleSlate; e.currentTarget.style.color = C.dark; }}
          >
            <RefreshCw size={13} strokeWidth={2} style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* ── Error banner ── */}
        {hasError && (
          <div style={{
            padding: '13px 18px', borderRadius: 10, marginBottom: 22,
            background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.22)',
            display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp 0.3s ease both',
          }}>
            <AlertTriangle size={16} color={C.danger} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, color: C.danger, fontSize: 13 }}>Some data failed to load</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: C.danger, opacity: 0.7 }}>
                {Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(' · ')}
              </p>
            </div>
            <button onClick={fetchAll} style={{
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              border: '1.5px solid rgba(192,57,43,0.3)', background: 'rgba(192,57,43,0.08)',
              color: C.danger, fontWeight: 600, fontSize: 12,
            }}>Retry</button>
          </div>
        )}

        {/* ── Stat Cards Row 1: from pharmacies + medicines (InventoryDashboard data) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          <StatCard title="Total Pharmacies"  value={pharmacies.length}           accent={C.techBlue}  icon={Building2}    subtitle={`${derived.activePharms} active`}    delay="0.07s" loading={loading} />
          <StatCard title="Active Pharmacies" value={derived.activePharms}        accent={C.emerald}   icon={Wifi}         subtitle="Currently online"                     delay="0.11s" loading={loading} />
          <StatCard title="Total Medicines"   value={medicines.length}            accent={C.lilac}     icon={Package}      subtitle="In network"                           delay="0.15s" loading={loading} />
          <StatCard title="Low Stock Items"   value={derived.lowStock}            accent={C.amber}     icon={AlertCircle}  subtitle="≤50 units remaining"                  delay="0.19s" loading={loading} />
        </div>

        {/* ── Stat Cards Row 2: from users (AdminUsersPage) + orders (OrderDashboard) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard title="Total Users"       value={users.length}               accent={C.pink}      icon={Users}        subtitle="Registered accounts"                  delay="0.23s" loading={loading} />
          <StatCard title="Total Orders"      value={orders.length}              accent={C.techBlue}  icon={ShoppingCart} subtitle="All pharmacy tasks"                   delay="0.27s" loading={loading} />
          <StatCard title="Pending Orders"    value={derived.pendingOrders}      accent={C.amber}     icon={Clock}        subtitle="Awaiting processing"                  delay="0.31s" loading={loading} />
          <StatCard title="Out of Stock"      value={derived.outOfStock}         accent={C.danger}    icon={AlertCircle}  subtitle="Zero units"                           delay="0.35s" loading={loading} />
        </div>

        {/* ── Status summary — same chips as InventoryDashboard ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', animation: 'fadeUp 0.4s ease 0.37s both' }}>
          {[
            { label: 'Online',    count: derived.pharmacyRows.filter(p=>p.status==='active').length,  color:'#2d7a4f', bg:'#eaf6f0', border:'#b3dfc8', icon: Wifi },
            { label: 'Slow Sync', count: derived.pharmacyRows.filter(p=>p.status==='warning').length, color:'#7a5a1a', bg:'#fdf4e3', border:'#e8d19a', icon: AlertTriangle },
            { label: 'Offline',   count: derived.pharmacyRows.filter(p=>p.status==='offline').length, color:'#8a3030', bg:'#fdeaea', border:'#e8b3b3', icon: WifiOff },
          ].map(s => { const SI = s.icon; return (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10, background:s.bg, border:`1px solid ${s.border}` }}>
              <SI size={11} color={s.color} strokeWidth={2} />
              <span style={{ fontSize:12.5, fontWeight:700, color:s.color }}>{s.count}</span>
              <span style={{ fontSize:11.5, color:s.color, opacity:0.75 }}>{s.label}</span>
            </div>
          ); })}

          {/* Order status chips — same as OrderDashboard summary cards */}
          {[
            { label:'Pending',  count: derived.pendingOrders,  color: '#B45309', bg:'#fdf4e3', border:'#e8d19a' },
            { label:'Approved', count: derived.approvedOrders, color: '#023E8A', bg:'#eff6ff', border:'#bfdbfe' },
            { label:'Ready',    count: derived.readyOrders,    color: '#0E7C5B', bg:'#eaf6f0', border:'#b3dfc8' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10, background:s.bg, border:`1px solid ${s.border}` }}>
              <span style={{ fontSize:12.5, fontWeight:700, color:s.color }}>{s.count}</span>
              <span style={{ fontSize:11.5, color:s.color, opacity:0.75 }}>{s.label}</span>
            </div>
          ))}

          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10, background:C.snow, border:`1px solid ${C.paleSlate}` }}>
            <RefreshCw size={11} color={C.slate} />
            <span style={{ fontSize:11.5, color:C.slate }}>{loading ? 'Refreshing...' : `Refreshed at ${lastUpdated?.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) || '—'}`}</span>
          </div>
        </div>

        {/* ── Tabs: Pharmacies | Users | Orders ── */}
        <div style={{
          background: C.snow, borderRadius: 18,
          border: `1.5px solid ${C.paleSlate}`,
          boxShadow: '0 4px 24px rgba(91,97,106,0.08)',
          overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.4s both',
        }}>
          {/* Tab bar */}
          <div style={{ display:'flex', alignItems:'center', padding:'16px 24px 0', borderBottom:`1.5px solid ${C.offWhite}`, gap:4 }}>
            {[
              { key:'pharmacies', label:'Pharmacy Network', color: C.techBlue, count: pharmacies.length },
              { key:'users',      label:'Users',            color: C.pink,     count: users.length },
              { key:'orders',     label:'Pharmacy Tasks',   color: C.lilac,    count: orders.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding:'9px 18px', borderRadius:'9px 9px 0 0', border:'none',
                cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13,
                transition:'all 0.2s', display:'flex', alignItems:'center', gap:7,
                background: activeTab===tab.key ? C.offWhite : 'transparent',
                color: activeTab===tab.key ? tab.color : C.slate,
                borderBottom: activeTab===tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
              }}>
                {tab.label}
                <span style={{
                  fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99,
                  background: activeTab===tab.key ? `${tab.color}18` : C.paleSlate,
                  color: activeTab===tab.key ? tab.color : C.slate,
                }}>{loading ? '…' : tab.count}</span>
              </button>
            ))}
          </div>

          {/* ── PHARMACIES TAB — same columns as InventoryDashboard PharmacyRow ── */}
          {activeTab === 'pharmacies' && (
            <div style={{ overflowX: 'auto' }}>
              {/* Column headers — same as InventoryDashboard */}
              <div style={{ display:'flex', alignItems:'center', padding:'11px 22px', background:C.offWhite, borderBottom:`1.5px solid ${C.paleSlate}` }}>
                {[
                  { label:'#',         w:32  },
                  { label:'',          w:54  },
                  { label:'Pharmacy',  flex:1 },
                  { label:'Status',    w:120 },
                  { label:'Last Sync', w:100, right:true },
                  { label:'Stock',     w:110, right:true },
                  { label:'Orders',    w:70,  center:true },
                ].map((col, i) => (
                  <span key={i} style={{
                    ...(col.flex ? { flex:1 } : { width:col.w, flexShrink:0 }),
                    fontSize:9.5, fontWeight:700, letterSpacing:'0.13em',
                    textTransform:'uppercase', color:C.slate,
                    textAlign: col.right ? 'right' : col.center ? 'center' : 'left',
                  }}>{col.label}</span>
                ))}
              </div>

              {loading ? (
                <div style={{ padding:60, textAlign:'center' }}>
                  <Loader2 size={28} color={C.techBlue} style={{ animation:'spin 0.9s linear infinite', display:'block', margin:'0 auto 12px' }} />
                  <p style={{ margin:0, color:C.slate, fontSize:13 }}>Loading pharmacy data...</p>
                </div>
              ) : derived.pharmacyRows.length === 0 ? (
                <div style={{ padding:60, textAlign:'center', color:C.slate }}>
                  <Building2 size={36} color={C.paleSlate} style={{ display:'block', margin:'0 auto 12px' }} />
                  <p style={{ margin:0, fontSize:14, fontWeight:600 }}>No pharmacies registered yet</p>
                </div>
              ) : derived.pharmacyRows.map((p, index) => {
                const st = STATUS_MAP[p.status] || STATUS_MAP.active;
                const StIcon = st.icon;
                const initials = p.name.split(' ').slice(0,2).map(w=>w[0]).join('');
                return (
                  <div key={p._id} style={{
                    display:'flex', alignItems:'center', padding:'13px 22px',
                    borderBottom: index < derived.pharmacyRows.length-1 ? `1px solid ${C.offWhite}` : 'none',
                    transition:'background 0.18s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.techBlue}04`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ width:32, flexShrink:0, fontSize:11.5, fontWeight:600, color:C.paleSlate, fontFamily:"'Sora',sans-serif" }}>
                      {String(index+1).padStart(2,'0')}
                    </span>
                    <div style={{
                      width:40, height:40, borderRadius:11, flexShrink:0, marginRight:14,
                      background:`linear-gradient(135deg, ${C.techBlue}, ${C.lilac})`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:C.snow, fontWeight:700, fontSize:12, fontFamily:"'Sora',sans-serif",
                    }}>{initials}</div>
                    <div style={{ flex:1, minWidth:0, marginRight:16 }}>
                      <p style={{ margin:0, fontWeight:600, fontSize:14, color:C.dark, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                        <MapPin size={10} color={C.slate} />
                        <p style={{ margin:0, fontSize:11.5, color:C.slate }}>{p.district}, Sri Lanka</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, background:st.bg, borderRadius:99, padding:'4px 11px', marginRight:24, flexShrink:0, border:`1px solid ${st.border}` }}>
                      <StIcon size={10} color={st.color} strokeWidth={2.5} />
                      <span style={{ fontSize:11, fontWeight:600, color:st.color }}>{st.label}</span>
                    </div>
                    <div style={{ width:100, textAlign:'right', marginRight:24, flexShrink:0 }}>
                      <span style={{ fontSize:11.5, color:C.slate }}>{p.lastSync}</span>
                    </div>
                    <div style={{ marginRight:24, flexShrink:0 }}>
                      <StockBar value={p.stockPct} />
                    </div>
                    <div style={{ width:70, textAlign:'center', flexShrink:0 }}>
                      <span style={{ fontSize:15, fontWeight:700, color: p.orderCount > 0 ? C.techBlue : C.paleSlate, fontFamily:"'Sora',sans-serif" }}>{p.orderCount}</span>
                      <p style={{ margin:0, fontSize:9.5, color:C.slate, textTransform:'uppercase', letterSpacing:'0.08em' }}>orders</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── USERS TAB — same table as AdminUsersPage ── */}
          {activeTab === 'users' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:"'DM Sans',sans-serif" }}>
                <thead>
                  <tr style={{ background: C.offWhite }}>
                    {['User Details', 'Role', 'Contact Info', 'Additional Info'].map(h => (
                      <th key={h} style={{
                        textAlign:'left', padding:'14px 24px',
                        fontSize:11, fontWeight:700, letterSpacing:'0.1em',
                        textTransform:'uppercase', color:C.slate,
                        borderBottom:`1.5px solid ${C.paleSlate}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        {[180, 90, 120, 100].map((w, j) => (
                          <td key={j} style={{ padding:'18px 24px', borderBottom:`1px solid ${C.offWhite}` }}>
                            <div style={{ height:13, width:w, borderRadius:6, background:C.paleSlate, animation:'pulse 1.5s ease infinite' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding:48, textAlign:'center', color:C.slate, fontSize:13 }}>
                      No users found
                    </td></tr>
                  ) : users.map((u, i) => {
                    const isAdmin = u.role?.toLowerCase() === 'admin';
                    const isPharm = u.role?.toLowerCase() === 'pharmacy';
                    const initials = (u.name || '?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
                    const avatarBg = isAdmin
                      ? 'linear-gradient(135deg,#A78BFA,#F472B6)'
                      : isPharm
                        ? 'linear-gradient(135deg,#34D399,#10B981)'
                        : `linear-gradient(135deg,#38BDF8,${C.lilac})`;
                    return (
                      <tr key={u._id || i}
                        style={{ borderBottom:`1px solid ${C.offWhite}`, transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = C.offWhite}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* User details — same as AdminUsersPage au-user-cell */}
                        <td style={{ padding:'18px 24px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <div style={{
                              width:42, height:42, borderRadius:12, flexShrink:0,
                              background:avatarBg, display:'flex', alignItems:'center', justifyContent:'center',
                              color:C.snow, fontWeight:700, fontSize:15, fontFamily:"'Sora',sans-serif",
                            }}>{initials}</div>
                            <div>
                              <p style={{ margin:0, fontWeight:700, fontSize:14, color:C.dark, fontFamily:"'Sora',sans-serif" }}>{u.name || 'Unknown'}</p>
                              <p style={{ margin:'2px 0 0', fontSize:12.5, color:C.slate }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'18px 24px' }}><RoleBadge role={u.role} /></td>
                        <td style={{ padding:'18px 24px', fontSize:13, color:C.slate }}>
                          {u.contactNumber || <span style={{ color:C.paleSlate, fontStyle:'italic', fontSize:12 }}>Not provided</span>}
                        </td>
                        <td style={{ padding:'18px 24px' }}>
                          {isPharm && u.pharmacyName
                            ? <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.dark }}>{u.pharmacyName}</p>
                            : <span style={{ color:C.paleSlate, fontSize:12 }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ORDERS TAB — same table as OrderDashboard ── */}
          {activeTab === 'orders' && (
            <div style={{ overflowX:'auto' }}>
              {/* Same 3-stat summary cards as OrderDashboard */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, padding:'20px 24px', borderBottom:`1px solid ${C.offWhite}` }}>
                {[
                  { label:'Total Orders',    value: orders.length,              color: C.techBlue, icon: ShoppingCart },
                  { label:'Pending Tasks',   value: derived.pendingOrders,      color: C.amber,    icon: Clock },
                  { label:'Ready Today',     value: derived.readyOrders,        color: C.success,  icon: CheckCircle },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} style={{
                      background:C.offWhite, padding:'16px 20px', borderRadius:12,
                      border:`1px solid ${C.paleSlate}`, display:'flex', justifyContent:'space-between', alignItems:'center',
                    }}>
                      <div>
                        <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:600, color:C.slate }}>{s.label}</p>
                        <p style={{ margin:0, fontSize:28, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif", letterSpacing:'-1px' }}>
                          {loading ? '—' : s.value}
                        </p>
                      </div>
                      <div style={{ width:44, height:44, borderRadius:11, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon size={20} color={s.color} strokeWidth={1.8} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:C.offWhite }}>
                    {['Order ID','Patient ID','Date','Priority','Status','Expiry'].map(h => (
                      <th key={h} style={{
                        textAlign:'left', padding:'13px 24px',
                        fontSize:10.5, fontWeight:700, color:C.slate,
                        letterSpacing:'0.1em', textTransform:'uppercase',
                        borderBottom:`1.5px solid ${C.paleSlate}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        {[100,90,80,60,70,80].map((w,j) => (
                          <td key={j} style={{ padding:'16px 24px', borderBottom:`1px solid ${C.offWhite}` }}>
                            <div style={{ height:12, width:w, borderRadius:6, background:C.paleSlate, animation:'pulse 1.5s ease infinite' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding:48, textAlign:'center', color:C.slate, fontSize:13 }}>No pharmacy tasks found</td></tr>
                  ) : orders.map((order, i) => {
                    const isExpired = order.status === 'Pending' && order.expiry_time && new Date(order.expiry_time) < new Date();
                    const st = getStatusStyle(isExpired ? 'Expired' : order.status, order.expiry_time);
                    const pColor = order.priority_level === 'Emergency' ? C.danger : order.priority_level === 'Urgent' ? C.amber : C.slate;
                    return (
                      <tr key={order._id || i}
                        style={{ borderBottom:`1px solid ${C.offWhite}`, transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = C.offWhite}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Same styling as OrderDashboard rows */}
                        <td style={{ padding:'14px 24px', fontSize:13, fontWeight:700, color:C.lilac, fontFamily:"'Sora',sans-serif" }}>
                          #{String(order._id||'').slice(-8).toUpperCase()}
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, background:`${C.offWhite}`, color:C.techBlue, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, border:`1px solid ${C.paleSlate}` }}>
                              {(order.patient_id||'??').substring(0,2).toUpperCase()}
                            </div>
                            <span style={{ fontSize:13, color:C.dark, fontWeight:500 }}>{order.patient_id || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.dark }}>
                            {order.request_date ? new Date(order.request_date).toLocaleDateString() : '—'}
                          </p>
                          <p style={{ margin:'2px 0 0', fontSize:11, color:C.slate }}>
                            {order.request_date ? new Date(order.request_date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
                          </p>
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <span style={{ fontSize:12, fontWeight:800, color:pColor }}>{order.priority_level || 'Normal'}</span>
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11.5, fontWeight:700, background:st.bg, color:st.color, display:'inline-block' }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding:'14px 24px', fontSize:12.5, color:C.slate }}>
                          {order.expiry_time ? new Date(order.expiry_time).toLocaleString('en-US',{hour:'2-digit',minute:'2-digit',month:'short',day:'numeric'}) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Role breakdown — same style as AdminUsersPage role badges ── */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:20,
          animation:'fadeUp 0.5s ease 0.5s both',
        }}>
          {[
            { key:'user',     label:'Patients / Users', color: C.lilac,   icon: User,      gradient:`linear-gradient(135deg,${C.lilac},#818CF8)` },
            { key:'pharmacy', label:'Pharmacy Staff',   color: C.emerald,  icon: Building2,  gradient:`linear-gradient(135deg,#059669,${C.emerald})` },
            { key:'admin',    label:'Administrators',   color: '#A78BFA',  icon: Shield,     gradient:`linear-gradient(135deg,#A78BFA,${C.pink})` },
          ].map((r, i) => {
            const Icon = r.icon;
            const count = derived.roleCounts[r.key] || 0;
            const pct   = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
            return (
              <div key={r.key} style={{
                borderRadius:16, padding:'22px', position:'relative', overflow:'hidden',
                background: r.gradient, color:C.snow,
                boxShadow:`0 8px 24px ${r.color}44`,
                transition:'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 16px 36px ${r.color}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 8px 24px ${r.color}44`; }}
              >
                <div style={{ position:'absolute', right:-16, top:-16, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                      <Icon size={18} color={C.snow} strokeWidth={1.8} />
                    </div>
                    <p style={{ margin:'0 0 2px', fontSize:11, fontWeight:700, opacity:0.7, textTransform:'uppercase', letterSpacing:'0.1em' }}>{r.label}</p>
                    <p style={{ margin:0, fontSize:36, fontWeight:800, fontFamily:"'Sora',sans-serif", letterSpacing:'-1.5px' }}>
                      {loading ? '—' : count}
                    </p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ margin:'0 0 6px', fontSize:11, opacity:0.65 }}>of total users</p>
                    <p style={{ margin:0, fontSize:22, fontWeight:700, fontFamily:"'Sora',sans-serif" }}>{loading ? '—' : `${pct}%`}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop:16, height:5, borderRadius:99, background:'rgba(255,255,255,0.2)' }}>
                  <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:'rgba(255,255,255,0.85)', transition:'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}