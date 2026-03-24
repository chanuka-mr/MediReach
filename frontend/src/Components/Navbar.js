import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, ListOrdered, CreditCard } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const patientId = localStorage.getItem('mediReach_patientId');
    const avatar = patientId ? patientId.substring(4, 6) : '??';

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <span className="logo-icon">MR</span>
                <span className="logo-text">MediReach</span>
            </div>
            <div className="navbar-links">
                <NavLink to="/order-form" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <ShoppingBag size={20} />
                    <span>Order Form</span>
                </NavLink>
                <NavLink to="/order-dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <LayoutDashboard size={20} />
                    <span>Admin Dashboard</span>
                </NavLink>
                <NavLink to="/order-details" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <ListOrdered size={20} />
                    <span>Order Details</span>
                </NavLink>
                <NavLink to="/payment" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <CreditCard size={20} />
                    <span>Payment</span>
                </NavLink>
            </div>
            <div className="navbar-user">
                <div className="avatar" title={patientId || 'Patient'}>{avatar}</div>
            </div>
        </nav>
    );
};

export default Navbar;
