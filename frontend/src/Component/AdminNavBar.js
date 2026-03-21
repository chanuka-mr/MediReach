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
  Activity,
  Shield,
  Bell,
  Settings,
  Stethoscope,
} from 'lucide-react'

const C = {
  navy:  "#03045e",
  ocean: "#0077b6",
  sky:   "#00b4d8",
  mist:  "#90e0ef",
  foam:  "#caf0f8",
  white: "#ffffff",
}

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    tag: "Home",
    desc: "Overview & analytics",
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package2,
    tag: "Stock",
    desc: "Medicines & supplies",
  },
  {
    label: "Pharmacy Network",
    path: "/pharmacy",
    icon: Building2,
    tag: "Network",
    desc: "Connected locations",
  },
  {
    label: "Orders",
    path: "/order",
    icon: ShoppingCart,
    tag: "Orders",
    desc: "Pharmacy order requests",
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

  const W = collapsed ? 72 : 260

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mr-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: #020a1a;
        }

        /* ── Sidebar ── */
        .mr-sidebar {
          position: relative;
          height: 100vh;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          z-index: 50;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        /* Multi-layer background */
        .mr-sidebar-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 40% at 50% -10%, rgba(0,119,182,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 100% 80%, rgba(0,180,216,0.08) 0%, transparent 60%),
            linear-gradient(180deg,
              #030b1f 0%,
              #020e28 30%,
              #011025 65%,
              #010c1e 100%
            );
          border-right: 1px solid rgba(0,180,216,0.1);
          box-shadow: 6px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(0,180,216,0.06);
        }

        /* Subtle grid overlay */
        .mr-sidebar-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,180,216,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,180,216,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .mr-sidebar-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Top accent line */
        .mr-top-accent {
          height: 2px;
          flex-shrink: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            #0077b6 20%,
            #00b4d8 50%,
            #90e0ef 75%,
            transparent 100%
          );
          opacity: 0.9;
        }

        /* Brand header */
        .mr-brand {
          padding: 18px 14px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(0,180,216,0.07);
          flex-shrink: 0;
          min-height: 68px;
          overflow: hidden;
        }

        .mr-logo-wrap {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: linear-gradient(135deg, #0077b6 0%, #00b4d8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 18px rgba(0,180,216,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          position: relative;
          overflow: hidden;
        }

        .mr-logo-shimmer {
          position: absolute;
          top: -50%;
          left: -75%;
          width: 50%;
          height: 200%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: logoShimmer 4s infinite;
        }

        @keyframes logoShimmer {
          0%   { left: -75%; }
          100% { left: 150%; }
        }

        .mr-brand-text {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          transition: opacity 0.25s, max-width 0.35s cubic-bezier(0.4,0,0.2,1);
        }

        .mr-brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          white-space: nowrap;
        }

        .mr-brand-status {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 1px;
        }

        .mr-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
          animation: pulseDot 2.2s ease infinite;
          flex-shrink: 0;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        .mr-live-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: rgba(144,224,239,0.4);
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Section label */
        .mr-section-label {
          padding: 14px 18px 5px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: rgba(144,224,239,0.22);
          text-transform: uppercase;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s;
        }

        /* Nav scroll area */
        .mr-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mr-nav::-webkit-scrollbar { width: 2px; }
        .mr-nav::-webkit-scrollbar-thumb {
          background: rgba(0,180,216,0.15);
          border-radius: 99px;
        }

        /* Nav item */
        .mr-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          transition: all 0.22s ease;
          text-align: left;
          color: inherit;
          width: 100%;
        }

        .mr-nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(0,180,216,0.1), rgba(0,119,182,0.06));
          opacity: 0;
          transition: opacity 0.22s;
        }

        .mr-nav-item:hover::before { opacity: 1; }
        .mr-nav-item.active::before { opacity: 1; }

        .mr-nav-item.active {
          border-color: rgba(0,180,216,0.18);
          box-shadow: 0 2px 12px rgba(0,180,216,0.08), inset 0 1px 0 rgba(0,180,216,0.06);
        }

        .mr-active-bar {
          position: absolute;
          left: 0; top: 18%; bottom: 18%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #00b4d8, #90e0ef);
          box-shadow: 0 0 12px rgba(0,180,216,0.7);
        }

        .mr-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.22s, border 0.22s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          border: 1px solid rgba(144,224,239,0.07);
          background: rgba(144,224,239,0.04);
          position: relative;
          z-index: 1;
        }

        .mr-nav-item:hover .mr-icon-wrap,
        .mr-nav-item.active .mr-icon-wrap {
          transform: scale(1.1);
        }

        .mr-nav-item.active .mr-icon-wrap {
          background: linear-gradient(135deg, rgba(0,180,216,0.2), rgba(0,119,182,0.15));
          border-color: rgba(0,180,216,0.28);
          box-shadow: 0 3px 10px rgba(0,180,216,0.2);
        }

        .mr-item-text {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          transition: opacity 0.22s, max-width 0.35s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          z-index: 1;
        }

        .mr-item-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .mr-item-label {
          font-size: 13.5px;
          font-weight: 500;
          white-space: nowrap;
          transition: color 0.2s, font-weight 0.2s;
        }

        .mr-item-tag {
          font-size: 8.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 99px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          border: 1px solid;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }

        .mr-item-desc {
          font-size: 11px;
          font-weight: 400;
          white-space: nowrap;
          margin-top: 1px;
          transition: color 0.2s;
        }

        .mr-chevron {
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          opacity: 0.45;
          transition: opacity 0.2s;
        }

        /* Divider */
        .mr-divider {
          margin: 8px 4px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,180,216,0.1), transparent);
          flex-shrink: 0;
        }

        /* Bottom section */
        .mr-bottom {
          border-top: 1px solid rgba(0,180,216,0.07);
          padding: 10px 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        /* Profile card */
        .mr-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0,180,216,0.04);
          border: 1px solid rgba(0,180,216,0.08);
          overflow: hidden;
          cursor: default;
        }

        .mr-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0077b6, #00b4d8);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(0,180,216,0.28);
          position: relative;
          font-size: 15px;
          font-weight: 800;
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.5px;
        }

        .mr-online-dot {
          position: absolute;
          bottom: -2px; right: -2px;
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #4ade80;
          border: 2px solid #010c1e;
          box-shadow: 0 0 6px #4ade80;
          animation: pulseDot 2.2s ease infinite;
        }

        .mr-profile-info {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          transition: opacity 0.22s, max-width 0.35s cubic-bezier(0.4,0,0.2,1);
          white-space: nowrap;
        }

        .mr-profile-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.3px;
        }

        .mr-profile-email {
          font-size: 10.5px;
          color: rgba(144,224,239,0.35);
          font-weight: 400;
          margin-top: 1px;
        }

        .mr-pro-badge {
          font-size: 8px;
          font-weight: 800;
          color: #00b4d8;
          background: rgba(0,180,216,0.12);
          border: 1px solid rgba(0,180,216,0.2);
          padding: 1px 5px;
          border-radius: 99px;
          letter-spacing: 0.06em;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        /* Logout btn */
        .mr-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 12px;
          border: 1px solid rgba(239,68,68,0.14);
          background: rgba(239,68,68,0.04);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          width: 100%;
          color: rgba(239,68,68,0.6);
          overflow: hidden;
        }

        .mr-logout:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.28);
          color: #f87171;
          transform: translateX(2px);
        }

        .mr-logout-label {
          font-size: 13.5px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.22s, max-width 0.35s cubic-bezier(0.4,0,0.2,1);
        }

        /* Collapse toggle button */
        .mr-collapse-btn {
          position: absolute;
          right: -14px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #011025;
          border: 1px solid rgba(0,180,216,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,180,216,0.08);
          transition: all 0.2s;
          color: rgba(144,224,239,0.5);
        }

        .mr-collapse-btn:hover {
          background: #0077b6;
          border-color: rgba(0,180,216,0.5);
          color: white;
          box-shadow: 0 4px 16px rgba(0,180,216,0.3);
        }

        /* Main content */
        .mr-main {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          height: 100vh;
          background:
            radial-gradient(ellipse 70% 50% at 80% 20%, rgba(0,119,182,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(0,180,216,0.04) 0%, transparent 60%),
            #020a1a;
        }

        .mr-main::-webkit-scrollbar { width: 4px; }
        .mr-main::-webkit-scrollbar-thumb {
          background: rgba(0,180,216,0.15);
          border-radius: 99px;
        }

        /* Collapsed tooltip */
        .mr-tooltip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #011830;
          border: 1px solid rgba(0,180,216,0.2);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(202,240,248,0.85);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          font-family: 'DM Sans', sans-serif;
          z-index: 200;
        }

        .mr-nav-item:hover .mr-tooltip { opacity: 1; }
      `}</style>

      <div className="mr-layout">
        {/* ══════════ SIDEBAR ══════════ */}
        <div className="mr-sidebar" style={{ width: W }}>

          {/* Layered background */}
          <div className="mr-sidebar-bg" />
          <div className="mr-sidebar-grid" />

          <div className="mr-sidebar-content">
            {/* Top accent */}
            <div className="mr-top-accent" />

            {/* Brand */}
            <div className="mr-brand" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <div className="mr-logo-wrap">
                <Stethoscope size={19} color="white" strokeWidth={2} />
                <div className="mr-logo-shimmer" />
              </div>

              {!collapsed && (
                <div className="mr-brand-text">
                  <div className="mr-brand-name">MediReach</div>
                  <div className="mr-brand-status">
                    <div className="mr-live-dot" />
                    <span className="mr-live-label">Live System</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section label */}
            {!collapsed && (
              <div className="mr-section-label">Navigation</div>
            )}

            {/* Nav items */}
            <nav className="mr-nav" style={{ padding: collapsed ? '4px 9px 8px' : '4px 10px 8px' }}>
              {navItems.map((item) => {
                const active = location.pathname === item.path
                const hovered = hoveredPath === item.path
                const Icon = item.icon

                return (
                  <button
                    key={item.path}
                    className={`mr-nav-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                      padding: collapsed ? '10px 0' : '10px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    {active && <div className="mr-active-bar" />}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="mr-tooltip">{item.label}</div>
                    )}

                    <div
                      className="mr-icon-wrap"
                      style={active ? {} : hovered ? { background: 'rgba(144,224,239,0.08)', borderColor: 'rgba(144,224,239,0.12)' } : {}}
                    >
                      <Icon
                        size={17}
                        color={active ? '#00b4d8' : hovered ? 'rgba(144,224,239,0.75)' : 'rgba(144,224,239,0.45)'}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                    </div>

                    {!collapsed && (
                      <div className="mr-item-text" style={{ maxWidth: collapsed ? 0 : 180 }}>
                        <div className="mr-item-row">
                          <span className="mr-item-label" style={{
                            color: active ? '#ffffff' : hovered ? 'rgba(202,240,248,0.8)' : 'rgba(202,240,248,0.5)',
                            fontWeight: active ? 600 : 400,
                          }}>
                            {item.label}
                          </span>
                          {(active || hovered) && (
                            <span className="mr-item-tag" style={{
                              color: active ? '#00b4d8' : 'rgba(144,224,239,0.45)',
                              background: active ? 'rgba(0,180,216,0.12)' : 'rgba(144,224,239,0.06)',
                              borderColor: active ? 'rgba(0,180,216,0.22)' : 'rgba(144,224,239,0.1)',
                            }}>
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <div className="mr-item-desc" style={{
                          color: active ? 'rgba(144,224,239,0.5)' : 'rgba(144,224,239,0.25)',
                        }}>
                          {item.desc}
                        </div>
                      </div>
                    )}

                    {active && !collapsed && (
                      <ChevronRight size={13} className="mr-chevron" color="#90e0ef" strokeWidth={2.5} />
                    )}
                  </button>
                )
              })}

              {!collapsed && <div className="mr-divider" />}

              {/* Bottom utility nav */}
              {bottomNav.map((item) => {
                const active = location.pathname === item.path
                const hovered = hoveredPath === item.path
                const Icon = item.icon

                return (
                  <button
                    key={item.path}
                    className={`mr-nav-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                      padding: collapsed ? '9px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    {collapsed && <div className="mr-tooltip">{item.label}</div>}
                    <div
                      className="mr-icon-wrap"
                      style={{ width: 32, height: 32, borderRadius: 8, ...(active ? {} : hovered ? { background: 'rgba(144,224,239,0.06)' } : {}) }}
                    >
                      <Icon
                        size={15}
                        color={active ? '#00b4d8' : hovered ? 'rgba(144,224,239,0.65)' : 'rgba(144,224,239,0.3)'}
                        strokeWidth={1.8}
                      />
                    </div>
                    {!collapsed && (
                      <span style={{
                        fontSize: 13,
                        color: active ? '#fff' : hovered ? 'rgba(202,240,248,0.7)' : 'rgba(202,240,248,0.38)',
                        fontWeight: active ? 600 : 400,
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Bottom: Profile + Logout */}
            <div className="mr-bottom">
              <div className="mr-profile" style={{
                padding: collapsed ? '9px 0' : '10px 12px',
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
                <LogOut size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span className="mr-logout-label" style={{ maxWidth: collapsed ? 0 : 120, opacity: collapsed ? 0 : 1 }}>
                    Log Out
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Floating collapse toggle */}
          <button
            className="mr-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={13} strokeWidth={2.5} />
              : <ChevronLeft  size={13} strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="mr-main">
          <Outlet />
        </div>
      </div>
    </>
  )
}