import React, { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  Info,
  Phone,
  ShoppingBag,
  Building2,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Stethoscope,
  Home,
  History,
} from 'lucide-react'

const generalNavItems = [
  { label: "Home", path: "/user", icon: Home, tag: "Home", desc: "Welcome & overview", accent: "#38BDF8" },
  { label: "About Us", path: "/user/about", icon: Info, tag: "About", desc: "Our mission & story", accent: "#A78BFA" },
  { label: "Contact Us", path: "/user/contact", icon: Phone, tag: "Contact", desc: "Get in touch with us", accent: "#34D399" },
]

const inquiryNavItems = [
  { label: "My Inquiries", path: "/user/inquiries", icon: History, tag: "Trace", desc: "Manage your submissions", accent: "#3B82F6" },
]

const serviceNavItems = [
  { label: "Order Now", path: "/user/order", icon: ShoppingBag, tag: "Order", desc: "Place a medicine order", accent: "#FB923C" },
  { label: "Pharmacies", path: "/user/pharmacies", icon: Building2, tag: "Network", desc: "Find nearby pharmacies", accent: "#F472B6" },
  { label: "Chats", path: "/user/chats", icon: MessageCircle, tag: "Chat", desc: "Message your pharmacy", accent: "#FBBF24" },
]

const navItems = [...generalNavItems, ...inquiryNavItems, ...serviceNavItems]

const bottomNav = [
  { label: "Notifications", path: "/user/notifications", icon: Bell },
  { label: "Settings", path: "/user/settings", icon: Settings },
]

export default function UserNavBar() {
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

        .ul-layout {
          display: flex; height: 100vh; width: 100vw; overflow: hidden;
          font-family: 'DM Sans', sans-serif; background: #F0F4FF;
        }

        /* ══ SIDEBAR ══ */
        .ul-sidebar {
          position: relative; height: 100vh; display: flex;
          flex-direction: column; flex-shrink: 0; z-index: 50; overflow: hidden;
          transition: width 0.38s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Deep charcoal-teal base */
        .ul-sidebar-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 110% 55% at 60% -10%, rgba(56,189,248,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 80%  50% at -10% 60%, rgba(167,139,250,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 70%  40% at 110% 90%, rgba(52,211,153,0.08) 0%, transparent 50%),
            linear-gradient(160deg, #0D1B2A 0%, #0F2137 35%, #0C1E35 65%, #091829 100%);
          box-shadow: 8px 0 40px rgba(0,0,0,0.35);
        }

        /* Diagonal stripe texture */
        .ul-sidebar-texture {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px,
            transparent 1px, transparent 12px
          );
        }

        /* Right border — teal → violet → emerald gradient */
        .ul-sidebar-border {
          position: absolute; top: 0; right: 0; bottom: 0; width: 2px;
          background: linear-gradient(180deg,
            transparent 0%, #38BDF8 15%, #A78BFA 50%, #34D399 82%, transparent 100%
          );
          opacity: 0.55;
        }

        .ul-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; height: 100%;
        }

        /* ── Brand ── */
        .ul-brand {
          padding: 20px 16px 16px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0; min-height: 72px; overflow: hidden; position: relative;
        }

        .ul-brand::after {
          content: '';
          position: absolute; bottom: 0; left: 16px; right: 16px; height: 1px;
          background: linear-gradient(90deg, #38BDF8 0%, #A78BFA 50%, transparent 100%);
          opacity: 0.3;
        }

        /* Asymmetric logo shape */
        .ul-logo-wrap {
          width: 40px; height: 40px;
          border-radius: 14px 6px 14px 6px;
          background: linear-gradient(135deg, #38BDF8 0%, #A78BFA 100%);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow:
            0 0 0 3px rgba(56,189,248,0.18),
            0 6px 24px rgba(56,189,248,0.32),
            inset 0 1px 0 rgba(255,255,255,0.25);
          position: relative; overflow: hidden;
        }

        .ul-logo-pulse {
          position: absolute; inset: -4px;
          border: 1.5px solid rgba(56,189,248,0.4);
          border-radius: 14px 6px 14px 6px;
          animation: ulLogoPulse 3s ease infinite;
        }

        @keyframes ulLogoPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.18); opacity: 0;   }
        }

        /* Gradient text brand name */
        .ul-brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px; font-weight: 800; letter-spacing: -0.6px;
          white-space: nowrap;
          background: linear-gradient(90deg, #38BDF8 0%, #e0f2ff 55%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ul-brand-sub {
          font-size: 9.5px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(167,139,250,0.5);
          margin-top: 2px; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
        }

        .ul-live-pip {
          width: 5px; height: 5px; border-radius: 50%;
          background: #34D399; box-shadow: 0 0 8px #34D399;
          animation: ulPipPulse 2s ease infinite; flex-shrink: 0;
        }

        @keyframes ulPipPulse {
          0%, 100% { box-shadow: 0 0 5px #34D399; }
          50%       { box-shadow: 0 0 14px #34D399, 0 0 28px rgba(52,211,153,0.4); }
        }

        /* ── Section label ── */
        .ul-section-label {
          padding: 18px 20px 6px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          color: rgba(167,139,250,0.3); text-transform: uppercase;
          flex-shrink: 0; white-space: nowrap; overflow: hidden;
        }

        /* ── Nav ── */
        .ul-nav {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          display: flex; flex-direction: column; gap: 3px;
        }

        .ul-nav::-webkit-scrollbar { width: 2px; }
        .ul-nav::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 99px; }

        /* Nav item — card style */
        .ul-nav-item {
          position: relative; display: flex; align-items: center; gap: 12px;
          border-radius: 14px; border: 1px solid transparent;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          background: transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left; color: inherit; width: 100%; overflow: hidden;
        }

        .ul-nav-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
        }

        .ul-nav-item.active {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.25);
        }

        /* Per-item accent left strip */
        .ul-active-strip {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; border-radius: 0 2px 2px 0;
        }

        /* Soft glow blob behind icon */
        .ul-item-glow {
          position: absolute; left: 8px; top: 50%;
          transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          opacity: 0.18; filter: blur(10px); pointer-events: none;
        }

        /* Icon box */
        .ul-icon-wrap {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.05);
          position: relative; z-index: 1;
        }

        .ul-nav-item.active .ul-icon-wrap { transform: scale(1.08); }
        .ul-nav-item:hover:not(.active) .ul-icon-wrap {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
          transform: scale(1.05);
        }

        /* Text */
        .ul-item-body { flex: 1; min-width: 0; overflow: hidden; position: relative; z-index: 1; }
        .ul-item-label { font-size: 13.5px; font-weight: 500; white-space: nowrap; transition: color 0.2s; display: block; }
        .ul-item-desc  { font-size: 10.5px; white-space: nowrap; margin-top: 1px; transition: color 0.2s; display: block; }

        /* Badge */
        .ul-item-badge {
          font-size: 8px; font-weight: 800; padding: 2px 7px;
          border-radius: 99px; letter-spacing: 0.08em; text-transform: uppercase;
          border: 1px solid; white-space: nowrap; flex-shrink: 0;
          position: relative; z-index: 1; transition: all 0.2s;
        }

        /* Divider */
        .ul-divider {
          margin: 5px 8px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.18), transparent);
          flex-shrink: 0;
        }

        /* Utility items */
        .ul-util-item {
          display: flex; align-items: center; gap: 12px;
          border-radius: 10px; border: 1px solid transparent;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          background: transparent; transition: all 0.2s;
          text-align: left; color: rgba(255,255,255,0.38); width: 100%;
        }

        .ul-util-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.72);
        }

        .ul-util-item.active { color: #38BDF8; }

        /* Bottom */
        .ul-bottom {
          padding: 10px 12px 16px;
          display: flex; flex-direction: column; gap: 8px;
          flex-shrink: 0; border-top: 1px solid rgba(167,139,250,0.12);
        }

        /* Profile card with rainbow top bar */
        .ul-profile {
          display: flex; align-items: center; gap: 10px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden; cursor: default; position: relative;
        }

        .ul-profile::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #38BDF8, #A78BFA, #F472B6, #34D399, #FBBF24);
          border-radius: 99px 99px 0 0;
        }

        .ul-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #38BDF8, #A78BFA);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 3px 14px rgba(56,189,248,0.3);
          position: relative; font-size: 13px; font-weight: 800; color: white;
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.5px;
        }

        .ul-online-dot {
          position: absolute; bottom: -2px; right: -2px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #34D399; border: 2px solid #0D1B2A;
          box-shadow: 0 0 8px #34D399; animation: ulPipPulse 2s ease infinite;
        }

        .ul-profile-name {
          font-size: 13px; font-weight: 700; color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.3px;
        }

        .ul-profile-email { font-size: 10px; color: rgba(255,255,255,0.32); margin-top: 1px; }

        .ul-user-badge {
          font-size: 7.5px; font-weight: 800; color: #A78BFA;
          background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.3);
          padding: 2px 6px; border-radius: 99px; letter-spacing: 0.07em; flex-shrink: 0;
        }

        /* Logout */
        .ul-logout {
          display: flex; align-items: center; gap: 10px;
          border-radius: 10px; border: 1px solid rgba(192,57,43,0.15);
          background: transparent; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.22s; width: 100%; color: rgba(255,120,100,0.55); overflow: hidden;
        }

        .ul-logout:hover {
          background: rgba(192,57,43,0.1); border-color: rgba(192,57,43,0.35);
          color: #ff8a7a; transform: translateX(3px);
        }

        /* Collapse btn — diamond */
        .ul-collapse-btn {
          position: absolute; right: -13px; top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 26px; height: 26px;
          background: #0F2137; border: 1.5px solid rgba(56,189,248,0.35);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.1);
          transition: all 0.22s; color: rgba(56,189,248,0.6);
        }

        .ul-collapse-btn:hover {
          background: #38BDF8; border-color: #38BDF8; color: #0D1B2A;
          box-shadow: 0 4px 20px rgba(56,189,248,0.45);
        }

        .ul-collapse-btn > svg { transform: rotate(-45deg); }

        /* Main */
        .ul-main {
          flex: 1; overflow-y: auto; overflow-x: hidden; height: 100vh;
          background:
            radial-gradient(ellipse 60% 40% at 85% 10%, rgba(56,189,248,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 10% 90%, rgba(167,139,250,0.05) 0%, transparent 50%),
            #F0F4FF;
        }

        .ul-main::-webkit-scrollbar { width: 4px; }
        .ul-main::-webkit-scrollbar-thumb { background: #DDE3ED; border-radius: 99px; }

        /* Tooltip with arrow */
        .ul-tooltip {
          position: absolute; left: calc(100% + 14px); top: 50%; transform: translateY(-50%);
          background: #0F2137; border: 1px solid rgba(56,189,248,0.22);
          border-radius: 10px; padding: 6px 12px;
          font-size: 12px; font-weight: 600; color: #e0f2ff;
          white-space: nowrap; pointer-events: none; opacity: 0;
          transition: opacity 0.15s;
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
          font-family: 'DM Sans', sans-serif; z-index: 200;
        }

        .ul-tooltip::before {
          content: ''; position: absolute; left: -5px; top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px; height: 8px; background: #0F2137;
          border-left: 1px solid rgba(56,189,248,0.22);
          border-bottom: 1px solid rgba(56,189,248,0.22);
        }

        .ul-nav-item:hover .ul-tooltip,
        .ul-util-item:hover .ul-tooltip { opacity: 1; }
      `}</style>

      <div className="ul-layout">

        {/* ══════════ SIDEBAR ══════════ */}
        <div className="ul-sidebar" style={{ width: W }}>
          <div className="ul-sidebar-bg" />
          <div className="ul-sidebar-texture" />
          <div className="ul-sidebar-border" />

          <div className="ul-content">

            {/* Brand */}
            <div className="ul-brand" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <div className="ul-logo-wrap">
                <Stethoscope size={20} color="white" strokeWidth={2.2} />
                <div className="ul-logo-pulse" />
              </div>
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div className="ul-brand-name">MediReach</div>
                  <div className="ul-brand-sub">
                    <div className="ul-live-pip" />
                    Patient Portal
                  </div>
                </div>
              )}
            </div>

            {!collapsed && <div className="ul-section-label">Main Menu</div>}

            {/* Nav */}
            <nav className="ul-nav" style={{ padding: collapsed ? '6px 10px 8px' : '6px 12px 8px' }}>
              {navItems.map((item, index) => {
                const active = location.pathname === item.path
                const hovered = hoveredPath === item.path
                const Icon = item.icon
                const accent = item.accent

                // Insert section dividers
                const isFirstInquiry = item.path === '/user/inquiries'
                const isFirstService = item.path === '/user/order'

                return (
                  <React.Fragment key={item.path}>
                    {isFirstInquiry && (
                      <div style={{
                        margin: '8px 4px',
                        padding: collapsed ? '0' : '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        {!collapsed && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'rgba(59,130,246,0.6)',
                            whiteSpace: 'nowrap',
                          }}>My Submissions</span>
                        )}
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                      </div>
                    )}

                    {isFirstService && (
                      <div style={{
                        margin: '8px 4px',
                        padding: collapsed ? '0' : '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        {!collapsed && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'rgba(167,139,250,0.6)',
                            whiteSpace: 'nowrap',
                          }}>Medical Services</span>
                        )}
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                      </div>
                    )}

                    <button
                      className={`ul-nav-item ${active ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredPath(item.path)}
                      onMouseLeave={() => setHoveredPath(null)}
                      style={{
                        padding: collapsed ? '11px 0' : '9px 12px 9px 14px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                      }}
                    >
                      {active && (
                        <div className="ul-active-strip"
                          style={{ background: `linear-gradient(180deg, ${accent}, ${accent}88)` }}
                        />
                      )}
                      {active && (
                        <div className="ul-item-glow" style={{ background: accent }} />
                      )}
                      {collapsed && <div className="ul-tooltip">{item.label}</div>}

                      <div className="ul-icon-wrap" style={active ? {
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
                        <div className="ul-item-body">
                          <span className="ul-item-label" style={{
                            color: active ? '#ffffff' : hovered ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.5)',
                            fontWeight: active ? 600 : 400,
                          }}>
                            {item.label}
                          </span>
                          <span className="ul-item-desc" style={{
                            color: active ? `${accent}99` : 'rgba(255,255,255,0.22)',
                          }}>
                            {item.desc}
                          </span>
                        </div>
                      )}

                      {!collapsed && active && (
                        <span className="ul-item-badge" style={{
                          color: accent,
                          background: `${accent}18`,
                          borderColor: `${accent}40`,
                        }}>
                          {item.tag}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                )
              })}

              {!collapsed && <div className="ul-divider" />}

              {/* Utility nav */}
              {bottomNav.map((item) => {
                const active = location.pathname === item.path
                const hovered = hoveredPath === item.path
                const Icon = item.icon

                return (
                  <button
                    key={item.path}
                    className={`ul-util-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                      padding: collapsed ? '10px 0' : '9px 14px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    {collapsed && <div className="ul-tooltip">{item.label}</div>}
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
                      <span style={{
                        fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Profile + Logout */}
            <div className="ul-bottom">
              <div className="ul-profile" style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}>
                <div className="ul-avatar">
                  JD
                  <div className="ul-online-dot" />
                </div>
                {!collapsed && (
                  <>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      <div className="ul-profile-name">John Doe</div>
                      <div className="ul-profile-email">user@medireach.lk</div>
                    </div>
                    <span className="ul-user-badge">USER</span>
                  </>
                )}
              </div>

              <button
                className="ul-logout"
                onClick={() => console.log('Logout')}
                title={collapsed ? 'Log out' : ''}
                style={{
                  padding: collapsed ? '9px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <LogOut size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Log Out
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Diamond collapse button */}
          <button
            className="ul-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={12} strokeWidth={2.5} />
              : <ChevronLeft size={12} strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="ul-main">
          <Outlet />
        </div>

      </div>
    </>
  )
}