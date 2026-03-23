import React, { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package2,
  Building2,
  ShoppingCart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Stethoscope,
} from 'lucide-react'


const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    tag: "Home",
    desc: "Overview & analytics",
    accent: "#38BDF8",
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package2,
    tag: "Stock",
    desc: "Medicines & supplies",
    accent: "#34D399",
  },
  {
    label: "Pharmacy Network",
    path: "/pharmacy",
    icon: Building2,
    tag: "Network",
    desc: "Connected locations",
    accent: "#A78BFA",
  },
  {
    label: "Orders",
    path: "/order",
    icon: ShoppingCart,
    tag: "Orders",
    desc: "Pharmacy order requests",
    accent: "#FB923C",
  },
]

const bottomNav = [
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredPath, setHoveredPath] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const W = collapsed ? 76 : 272

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mr-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: #F0F4FF;
        }

        /* ══ SIDEBAR ══ */
        .mr-sidebar {
          position: relative;
          height: 100vh;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          z-index: 50;
          transition: width 0.38s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        /* Deep charcoal-teal — nothing like navy */
        .mr-sidebar-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 110% 55% at 60% -10%, rgba(56,189,248,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 80%  50% at -10% 60%, rgba(76,110,245,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 70%  40% at 110% 90%, rgba(52,211,153,0.08) 0%, transparent 50%),
            linear-gradient(160deg, #0D1B2A 0%, #0F2137 35%, #0C1E35 65%, #091829 100%);
          box-shadow: 8px 0 40px rgba(0,0,0,0.35);
        }

        /* Diagonal stripe texture */
        .mr-sidebar-texture {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px,
            transparent 1px, transparent 12px
          );
          pointer-events: none;
        }

        /* Right border — vivid teal-indigo-emerald gradient line */
        .mr-sidebar-border {
          position: absolute; top: 0; right: 0; bottom: 0; width: 2px;
          background: linear-gradient(180deg,
            transparent 0%, #38BDF8 20%, #4C6EF5 55%, #34D399 80%, transparent 100%
          );
          opacity: 0.55;
        }

        .mr-sidebar-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; height: 100%;
        }

        /* ── Brand ── */
        .mr-brand {
          padding: 20px 16px 16px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0; min-height: 72px; overflow: hidden; position: relative;
        }

        .mr-brand::after {
          content: '';
          position: absolute; bottom: 0; left: 16px; right: 16px; height: 1px;
          background: linear-gradient(90deg, #38BDF8 0%, #4C6EF5 50%, transparent 100%);
          opacity: 0.3;
        }

        /* Asymmetric logo shape */
        .mr-logo-wrap {
          width: 40px; height: 40px;
          border-radius: 14px 6px 14px 6px;
          background: linear-gradient(135deg, #38BDF8 0%, #4C6EF5 100%);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.18), 0 6px 24px rgba(56,189,248,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          position: relative; overflow: hidden;
        }

        .mr-logo-pulse {
          position: absolute; inset: -4px;
          border: 1.5px solid rgba(56,189,248,0.4);
          border-radius: 14px 6px 14px 6px;
          animation: logoPulse 3s ease infinite;
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.18); opacity: 0; }
        }

        .mr-brand-text { flex: 1; min-width: 0; overflow: hidden; }

        /* Gradient text brand name */
        .mr-brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px; font-weight: 800; letter-spacing: -0.6px;
          white-space: nowrap;
          background: linear-gradient(90deg, #38BDF8 0%, #e0f2ff 55%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mr-brand-sub {
          font-size: 9.5px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(56,189,248,0.45);
          margin-top: 2px; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
        }

        .mr-live-pip {
          width: 5px; height: 5px; border-radius: 50%;
          background: #34D399; box-shadow: 0 0 8px #34D399;
          animation: pipPulse 2s ease infinite; flex-shrink: 0;
        }

        @keyframes pipPulse {
          0%, 100% { box-shadow: 0 0 5px #34D399; }
          50%       { box-shadow: 0 0 14px #34D399, 0 0 28px rgba(52,211,153,0.4); }
        }

        /* ── Section label ── */
        .mr-section-label {
          padding: 18px 20px 6px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          color: rgba(56,189,248,0.3); text-transform: uppercase;
          flex-shrink: 0; white-space: nowrap; overflow: hidden;
        }

        /* ── Nav ── */
        .mr-nav {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          display: flex; flex-direction: column; gap: 4px;
        }

        .mr-nav::-webkit-scrollbar { width: 2px; }
        .mr-nav::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 99px; }

        /* Nav item — card style */
        .mr-nav-item {
          position: relative;
          display: flex; align-items: center; gap: 12px;
          border-radius: 14px; border: 1px solid transparent;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          background: transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left; color: inherit; width: 100%; overflow: hidden;
        }

        .mr-nav-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
        }

        .mr-nav-item.active {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.25);
        }

        /* Per-item accent left strip */
        .mr-active-strip {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; border-radius: 0 2px 2px 0;
        }

        /* Soft glow behind icon */
        .mr-item-glow {
          position: absolute; left: 8px; top: 50%;
          transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          opacity: 0.18; filter: blur(10px); pointer-events: none;
        }

        /* Icon box */
        .mr-icon-wrap {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.05);
          position: relative; z-index: 1;
        }

        .mr-nav-item.active .mr-icon-wrap { transform: scale(1.08); }
        .mr-nav-item:hover:not(.active) .mr-icon-wrap {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
          transform: scale(1.05);
        }

        /* Text */
        .mr-item-body { flex: 1; min-width: 0; overflow: hidden; position: relative; z-index: 1; }
        .mr-item-label { font-size: 13.5px; font-weight: 500; white-space: nowrap; transition: color 0.2s; display: block; }
        .mr-item-desc  { font-size: 10.5px; white-space: nowrap; margin-top: 1px; transition: color 0.2s; display: block; }

        /* Badge */
        .mr-item-badge {
          font-size: 8px; font-weight: 800; padding: 2px 7px;
          border-radius: 99px; letter-spacing: 0.08em; text-transform: uppercase;
          border: 1px solid; white-space: nowrap; flex-shrink: 0;
          position: relative; z-index: 1; transition: all 0.2s;
        }

        /* Divider */
        .mr-divider {
          margin: 6px 8px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent);
          flex-shrink: 0;
        }

        /* Utility items */
        .mr-util-item {
          display: flex; align-items: center; gap: 12px;
          border-radius: 10px; border: 1px solid transparent;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          background: transparent; transition: all 0.2s;
          text-align: left; color: rgba(255,255,255,0.38); width: 100%;
        }

        .mr-util-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.72);
        }

        .mr-util-item.active { color: #38BDF8; }

        /* Bottom */
        .mr-bottom {
          padding: 10px 12px 16px;
          display: flex; flex-direction: column; gap: 8px;
          flex-shrink: 0; border-top: 1px solid rgba(56,189,248,0.1);
        }

        /* Profile card with rainbow top bar */
        .mr-profile {
          display: flex; align-items: center; gap: 10px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden; cursor: default; position: relative;
        }

        .mr-profile::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #38BDF8, #4C6EF5, #A78BFA, #34D399);
          border-radius: 99px 99px 0 0;
        }

        .mr-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #38BDF8, #4C6EF5);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 3px 14px rgba(56,189,248,0.35);
          position: relative; font-size: 14px; font-weight: 800; color: white;
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.5px;
        }

        .mr-online-dot {
          position: absolute; bottom: -2px; right: -2px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #34D399; border: 2px solid #0D1B2A;
          box-shadow: 0 0 8px #34D399; animation: pipPulse 2s ease infinite;
        }

        .mr-profile-info { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; }

        .mr-profile-name {
          font-size: 13px; font-weight: 700; color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.3px;
        }

        .mr-profile-email { font-size: 10px; color: rgba(255,255,255,0.32); margin-top: 1px; }

        .mr-pro-badge {
          font-size: 7.5px; font-weight: 800; color: #34D399;
          background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3);
          padding: 2px 6px; border-radius: 99px; letter-spacing: 0.07em; flex-shrink: 0;
        }

        /* Logout */
        .mr-logout {
          display: flex; align-items: center; gap: 10px;
          border-radius: 10px; border: 1px solid rgba(192,57,43,0.15);
          background: transparent; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.22s; width: 100%; color: rgba(255,120,100,0.55); overflow: hidden;
        }

        .mr-logout:hover {
          background: rgba(192,57,43,0.1); border-color: rgba(192,57,43,0.35);
          color: #ff8a7a; transform: translateX(3px);
        }

        .mr-logout-label { font-size: 13px; font-weight: 500; white-space: nowrap; }

        /* Collapse btn — diamond */
        .mr-collapse-btn {
          position: absolute; right: -13px; top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 26px; height: 26px;
          background: #0F2137; border: 1.5px solid rgba(56,189,248,0.35);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.1);
          transition: all 0.22s; color: rgba(56,189,248,0.6);
        }

        .mr-collapse-btn:hover {
          background: #38BDF8; border-color: #38BDF8; color: #0D1B2A;
          box-shadow: 0 4px 20px rgba(56,189,248,0.45);
        }

        .mr-collapse-btn > svg { transform: rotate(-45deg); }

        /* Main */
        .mr-main {
          flex: 1; overflow-y: auto; overflow-x: hidden; height: 100vh;
          background:
            radial-gradient(ellipse 60% 40% at 85% 10%, rgba(56,189,248,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 10% 90%, rgba(76,110,245,0.05) 0%, transparent 50%),
            #F0F4FF;
        }

        .mr-main::-webkit-scrollbar { width: 4px; }
        .mr-main::-webkit-scrollbar-thumb { background: #DDE3ED; border-radius: 99px; }

        /* Tooltip */
        .mr-tooltip {
          position: absolute; left: calc(100% + 14px); top: 50%;
          transform: translateY(-50%);
          background: #0F2137; border: 1px solid rgba(56,189,248,0.22);
          border-radius: 10px; padding: 6px 12px;
          font-size: 12px; font-weight: 600; color: #e0f2ff;
          white-space: nowrap; pointer-events: none; opacity: 0;
          transition: opacity 0.15s;
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
          font-family: 'DM Sans', sans-serif; z-index: 200;
        }

        .mr-tooltip::before {
          content: ''; position: absolute; left: -5px; top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px; height: 8px; background: #0F2137;
          border-left: 1px solid rgba(56,189,248,0.22);
          border-bottom: 1px solid rgba(56,189,248,0.22);
        }

        .mr-nav-item:hover .mr-tooltip,
        .mr-util-item:hover .mr-tooltip { opacity: 1; }
      `}</style>

      <div className="mr-layout">
        <div className="mr-sidebar" style={{ width: W }}>
          <div className="mr-sidebar-bg" />
          <div className="mr-sidebar-texture" />
          <div className="mr-sidebar-border" />

          <div className="mr-sidebar-content">

            {/* Brand */}
            <div className="mr-brand" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <div className="mr-logo-wrap" style={{ background: 'white', padding: '4px' }}>
                <img src="/logo.png" alt="MediReach Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div className="mr-logo-pulse" />
              </div>
              {!collapsed && (
                <div className="mr-brand-text">
                  <div className="mr-brand-name">MediReach</div>
                  <div className="mr-brand-sub">
                    <div className="mr-live-pip" />
                    Remote Pharmacy
                  </div>
                </div>
              )}
            </div>

            {!collapsed && <div className="mr-section-label">Main Menu</div>}

            {/* Nav */}
            <nav className="mr-nav" style={{ padding: collapsed ? '6px 10px 8px' : '6px 12px 8px' }}>
              {navItems.map((item) => {
                const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')) || (item.path !== '/' && location.pathname === item.path)
                const hovered = hoveredPath === item.path
                const Icon = item.icon
                const accent = item.accent

                return (
                  <button
                    key={item.path}
                    className={`mr-nav-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                      padding: collapsed ? '11px 0' : '10px 12px 10px 14px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    {active && (
                      <div className="mr-active-strip"
                        style={{ background: `linear-gradient(180deg, ${accent}, ${accent}88)` }}
                      />
                    )}
                    {active && (
                      <div className="mr-item-glow" style={{ background: accent }} />
                    )}
                    {collapsed && <div className="mr-tooltip">{item.label}</div>}

                    <div className="mr-icon-wrap" style={active ? {
                      background: `${accent}22`,
                      borderColor: `${accent}44`,
                      boxShadow: `0 3px 14px ${accent}28`,
                    } : {}}>
                      <Icon
                        size={17}
                        color={active ? accent : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.38)'}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                    </div>

                    {!collapsed && (
                      <div className="mr-item-body">
                        <span className="mr-item-label" style={{
                          color: active ? '#ffffff' : hovered ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.5)',
                          fontWeight: active ? 600 : 400,
                        }}>
                          {item.label}
                        </span>
                        <span className="mr-item-desc" style={{
                          color: active ? `${accent}99` : 'rgba(255,255,255,0.22)',
                        }}>
                          {item.desc}
                        </span>
                      </div>
                    )}

                    {!collapsed && active && (
                      <span className="mr-item-badge" style={{
                        color: accent,
                        background: `${accent}18`,
                        borderColor: `${accent}40`,
                      }}>
                        {item.tag}
                      </span>
                    )}
                  </button>
                )
              })}

              {!collapsed && <div className="mr-divider" />}

              {bottomNav.map((item) => {
                const active = location.pathname === item.path
                const hovered = hoveredPath === item.path
                const Icon = item.icon

                return (
                  <button
                    key={item.path}
                    className={`mr-util-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                      padding: collapsed ? '10px 0' : '9px 14px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    {collapsed && <div className="mr-tooltip">{item.label}</div>}
                    <div style={{
                      width: 30, height: 30, borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      background: hovered ? 'rgba(56,189,248,0.08)' : 'transparent',
                      transition: 'background 0.2s',
                    }}>
                      <Icon
                        size={15}
                        color={active ? '#38BDF8' : hovered ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.35)'}
                        strokeWidth={1.8}
                      />
                    </div>
                    {!collapsed && (
                      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Profile + Logout */}
            <div className="mr-bottom">
              <div className="mr-profile" style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}>
                <div className="mr-avatar">
                  AU
                  <div className="mr-online-dot" />
                </div>
                {!collapsed && (
                  <>
                    <div className="mr-profile-info">
                      <div className="mr-profile-name">Admin User</div>
                      <div className="mr-profile-email">admin@medireach.lk</div>
                    </div>
                    <span className="mr-pro-badge">PRO</span>
                  </>
                )}
              </div>

              <button
                className="mr-logout"
                onClick={() => console.log('Logout')}
                title={collapsed ? 'Log out' : ''}
                style={{
                  padding: collapsed ? '9px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <LogOut size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {!collapsed && <span className="mr-logout-label">Log Out</span>}
              </button>
            </div>
          </div>

          {/* Diamond collapse button */}
          <button
            className="mr-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={12} strokeWidth={2.5} />
              : <ChevronLeft  size={12} strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* Main content */}
        <div className="mr-main">
          <Outlet />
        </div>
      </div>
    </>
  )
}