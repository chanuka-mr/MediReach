import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

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
    label: "Admin Dashboard",
    path: "/",
    emoji: "🏠",
    tag: "Home",
    desc: "Overview & stats",
  },
  {
    label: "Inventory",
    path: "/inventory",
    emoji: "💊",
    tag: "Stock",
    desc: "Medicines & supplies",
  },
  {
    label: "Pharmacy",
    path: "/pharmacy",
    emoji: "🏥",
    tag: "Network",
    desc: "Connected locations",
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredPath, setHoveredPath] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        .sb-root {
          font-family: 'Outfit', sans-serif;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          z-index: 50;
          transition: width 0.32s cubic-bezier(0.4,0,0.2,1);
          background: linear-gradient(180deg, #03045e 0%, #020348 55%, #010230 100%);
          border-right: 1px solid rgba(0,180,216,0.15);
          box-shadow: 4px 0 28px rgba(3,4,94,0.45);
        }

        .sb-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s ease;
          text-align: left;
          overflow: hidden;
          background: transparent;
        }

        .sb-nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,180,216,0.12), rgba(0,119,182,0.08));
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: 14px;
        }

        .sb-nav-item:hover::before,
        .sb-nav-item.active::before {
          opacity: 1;
        }

        .sb-emoji {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sb-nav-item:hover .sb-emoji,
        .sb-nav-item.active .sb-emoji {
          transform: scale(1.25) rotate(-5deg);
        }

        .sb-toggle-btn {
          background: rgba(144,224,239,0.07);
          border: 1px solid rgba(144,224,239,0.13);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .sb-toggle-btn:hover {
          background: rgba(0,180,216,0.15);
          border-color: rgba(0,180,216,0.3);
        }

        .sb-logout-btn {
          display: flex;
          align-items: center;
          border: 1px solid rgba(239,68,68,0.18);
          background: rgba(239,68,68,0.06);
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
          width: 100%;
          color: rgba(239,68,68,0.7);
        }
        .sb-logout-btn:hover {
          background: rgba(239,68,68,0.14);
          border-color: rgba(239,68,68,0.35);
          color: #ef4444;
          transform: translateX(2px);
        }

        .sb-nav-scroll::-webkit-scrollbar { width: 3px; }
        .sb-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(144,224,239,0.15);
          border-radius: 99px;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }

        @keyframes float-emoji {
          0%, 100% { transform: translateY(0) scale(1.25) rotate(-5deg); }
          50%       { transform: translateY(-3px) scale(1.3) rotate(-8deg); }
        }

        .sb-nav-item.active .sb-emoji {
          animation: float-emoji 2.4s ease-in-out infinite;
        }
      `}</style>

      <div
        className="sb-root"
        style={{ width: collapsed ? 76 : 248 }}
      >

        {/* ═══ Decorative top gradient strip ═══ */}
        <div style={{
          height: 3, flexShrink: 0,
          background: `linear-gradient(90deg, ${C.navy}, ${C.ocean}, ${C.sky}, ${C.mist}, ${C.foam})`,
        }} />

        {/* ═══ Brand Header ═══ */}
        <div style={{
          padding: collapsed ? "16px 0" : "16px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(144,224,239,0.07)",
          flexShrink: 0,
          minHeight: 66,
          gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden", minWidth: 0 }}>
            {/* Animated logo mark */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: `0 4px 14px rgba(0,180,216,0.35)`,
              position: "relative", overflow: "hidden"
            }}>
              💉
              {/* shimmer */}
              <div style={{
                position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                animation: "shimmer 3s infinite",
              }} />
            </div>

            <div style={{
              overflow: "hidden",
              maxWidth: collapsed ? 0 : 130,
              opacity: collapsed ? 0 : 1,
              transition: "max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
              whiteSpace: "nowrap",
            }}>
              <p style={{ margin: 0, color: C.white, fontWeight: 800, fontSize: 16, letterSpacing: "-0.4px" }}>
                MediReach
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#4ade80",
                  animation: "pulse-dot 2s ease infinite",
                  boxShadow: "0 0 6px #4ade80"
                }} />
                <p style={{ margin: 0, color: "rgba(144,224,239,0.45)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em" }}>
                  LIVE SYSTEM
                </p>
              </div>
            </div>
          </div>

          {/* Collapse toggle */}
          {!collapsed && (
            <button className="sb-toggle-btn" onClick={() => setCollapsed(true)}
              style={{ width: 26, height: 26 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(144,224,239,0.6)" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div style={{ padding: "10px 0", display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <button className="sb-toggle-btn" onClick={() => setCollapsed(false)}
              style={{ width: 32, height: 28 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(144,224,239,0.6)" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}

        {/* ═══ Section Label ═══ */}
        {!collapsed && (
          <div style={{ padding: "14px 16px 6px", flexShrink: 0 }}>
            <p style={{
              margin: 0, fontSize: 9.5, fontWeight: 800,
              color: "rgba(144,224,239,0.28)",
              letterSpacing: "0.18em", textTransform: "uppercase"
            }}>⚡ Quick Access</p>
          </div>
        )}

        {/* ═══ Scrollable Nav ═══ */}
        <nav className="sb-nav-scroll" style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "8px 8px" : "4px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            const hovered = hoveredPath === item.path

            return (
              <button
                key={item.path}
                className={`sb-nav-item ${active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                title={collapsed ? item.label : ""}
                style={{
                  borderRadius: 14,
                  padding: collapsed ? "12px 0" : "11px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 12,
                  width: "100%",
                  border: active
                    ? "1px solid rgba(0,180,216,0.2)"
                    : "1px solid transparent",
                }}
              >
                {/* Active left glow bar */}
                {active && (
                  <div style={{
                    position: "absolute", left: 0, top: "15%", bottom: "15%",
                    width: 3, borderRadius: "0 4px 4px 0",
                    background: `linear-gradient(180deg, ${C.sky}, ${C.mist})`,
                    boxShadow: `0 0 10px ${C.sky}`,
                  }} />
                )}

                {/* Emoji in styled bubble */}
                <div
                  className="sb-emoji"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: active
                      ? `linear-gradient(135deg, rgba(0,180,216,0.25), rgba(0,119,182,0.2))`
                      : hovered
                        ? "rgba(144,224,239,0.1)"
                        : "rgba(144,224,239,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                    border: active
                      ? `1px solid rgba(0,180,216,0.3)`
                      : "1px solid rgba(144,224,239,0.08)",
                    transition: "background 0.2s, border 0.2s",
                  }}
                >
                  {item.emoji}
                </div>

                {/* Text block */}
                <div style={{
                  overflow: "hidden",
                  maxWidth: collapsed ? 0 : 160,
                  opacity: collapsed ? 0 : 1,
                  transition: "max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
                  whiteSpace: "nowrap",
                  flex: 1,
                  minWidth: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 14, fontWeight: active ? 700 : 500,
                      color: active ? C.white : "rgba(202,240,248,0.65)",
                      letterSpacing: "-0.2px",
                    }}>{item.label}</span>

                    {/* Tag pill */}
                    {(active || hovered) && (
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        color: active ? C.sky : "rgba(144,224,239,0.5)",
                        background: active ? "rgba(0,180,216,0.15)" : "rgba(144,224,239,0.08)",
                        padding: "1px 6px", borderRadius: 99,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        border: `1px solid ${active ? "rgba(0,180,216,0.25)" : "rgba(144,224,239,0.1)"}`,
                      }}>{item.tag}</span>
                    )}
                  </div>
                  <p style={{
                    margin: 0, fontSize: 11,
                    color: active ? "rgba(144,224,239,0.55)" : "rgba(144,224,239,0.3)",
                    fontWeight: 500, letterSpacing: "0.01em"
                  }}>{item.desc}</p>
                </div>

                {/* Active indicator arrow */}
                {active && !collapsed && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke={C.mist} strokeWidth="2.5" style={{ flexShrink: 0, opacity: 0.6 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </button>
            )
          })}

          {/* ── Divider ── */}
          {!collapsed && (
            <div style={{
              margin: "10px 4px",
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(144,224,239,0.12), transparent)"
            }} />
          )}

        </nav>

        {/* ═══ Bottom: Profile + Logout ═══ */}
        <div style={{
          borderTop: "1px solid rgba(144,224,239,0.07)",
          padding: collapsed ? "12px 8px" : "12px 10px",
          display: "flex", flexDirection: "column", gap: 7,
          flexShrink: 0,
        }}>

          {/* Admin Profile card */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 10,
            padding: collapsed ? "8px 0" : "10px 12px",
            borderRadius: 12,
            justifyContent: collapsed ? "center" : "flex-start",
            background: "rgba(144,224,239,0.05)",
            border: "1px solid rgba(144,224,239,0.09)",
            overflow: "hidden",
            cursor: "default",
          }}>
            {/* Avatar with online ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${C.ocean}, ${C.sky})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
                boxShadow: `0 3px 10px rgba(0,180,216,0.3)`,
              }}>
                👨‍⚕️
              </div>
              {/* Online dot */}
              <div style={{
                position: "absolute", bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: "50%",
                background: "#4ade80",
                border: `2px solid ${C.navy}`,
                boxShadow: "0 0 6px #4ade80",
                animation: "pulse-dot 2s ease infinite",
              }} />
            </div>

            {/* Info */}
            <div style={{
              overflow: "hidden",
              maxWidth: collapsed ? 0 : 130,
              opacity: collapsed ? 0 : 1,
              transition: "max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
              whiteSpace: "nowrap", flex: 1, minWidth: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <p style={{ margin: 0, color: C.white, fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px" }}>
                  Admin User
                </p>
                <span style={{
                  fontSize: 8.5, fontWeight: 800, color: C.sky,
                  background: "rgba(0,180,216,0.15)",
                  padding: "1px 5px", borderRadius: 99,
                  letterSpacing: "0.06em",
                  border: "1px solid rgba(0,180,216,0.2)"
                }}>PRO</span>
              </div>
              <p style={{ margin: 0, color: "rgba(144,224,239,0.38)", fontSize: 11, fontWeight: 500 }}>
                admin@MediReach.lk
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            className="sb-logout-btn"
            onClick={() => console.log("Logout")}
            title={collapsed ? "Log out" : ""}
            style={{
              gap: 10,
              padding: collapsed ? "10px 0" : "10px 14px",
              borderRadius: 12,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <span style={{ fontSize: 17, flexShrink: 0 }}>🚪</span>
            <span style={{
              fontSize: 14, fontWeight: 600,
              whiteSpace: "nowrap", overflow: "hidden",
              maxWidth: collapsed ? 0 : 120,
              opacity: collapsed ? 0 : 1,
              transition: "max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
            }}>
              Log Out
            </span>
          </button>

        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </>
  )
}