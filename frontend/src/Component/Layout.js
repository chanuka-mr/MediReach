import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './AdminNavBar'

export default function Layout() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",       // ← add this
      overflow: "hidden",
      margin: 0,            // ← add this
      padding: 0,           // ← add this
      fontFamily: "'Outfit', sans-serif",
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        height: "100vh",
      }}>
        <Outlet />
      </div>
    </div>
  )
}