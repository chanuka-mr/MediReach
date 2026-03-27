import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, ListOrdered, CreditCard } from 'lucide-react';

const Navbar = () => {
    const patientId = localStorage.getItem('mediReach_patientId');
    const avatar = patientId ? patientId.substring(4, 6) : '??';

    const linkStyle = ({ isActive }) =>
        `flex items-center gap-2 font-semibold text-sm px-3 py-2 rounded-lg transition-all duration-200 ${isActive
            ? 'text-primary-light bg-primary-light/10'
            : 'text-text-muted hover:bg-bg-color hover:text-primary-light'
        }`;

    return (
        <nav className="flex items-center justify-between px-8 h-[70px] bg-white border-b border-border-custom sticky top-0 z-[100] shadow-sm">
            <div className="flex items-center gap-3">
                <span className="bg-primary-deep text-white w-[38px] h-[38px] flex items-center justify-center font-extrabold rounded-lg text-lg">MR</span>
                <span className="text-xl font-extrabold text-primary-deep tracking-tighter">MediReach</span>
            </div>
            <div className="flex gap-6">
                <NavLink to="/order-form" className={linkStyle}>
                    <ShoppingBag size={20} />
                    <span>Order Form</span>
                </NavLink>
                <NavLink to="/order-dashboard" className={linkStyle}>
                    <LayoutDashboard size={20} />
                    <span>Admin Dashboard</span>
                </NavLink>
                <NavLink to="/order-details" className={linkStyle}>
                    <ListOrdered size={20} />
                    <span>Order Details</span>
                </NavLink>
                <NavLink to="/payment" className={linkStyle}>
                    <CreditCard size={20} />
                    <span>Payment</span>
                </NavLink>
            </div>
            <div className="flex items-center">
                <div className="bg-primary-light text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer" title={patientId || 'Patient'}>{avatar}</div>
            </div>
        </nav>
    );
};

export default Navbar;
