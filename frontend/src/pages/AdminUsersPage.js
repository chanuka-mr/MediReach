import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Shield, Building2, User, Loader2, Activity } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const saved = localStorage.getItem("userInfo");
        const userInfo = saved ? JSON.parse(saved) : null;
        
        if (!userInfo || !userInfo.token) {
          setError("Not authorized");
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:8080/api/users', {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users-container">
      <style>{`
        .admin-users-container {
          padding: 32px 40px;
          min-height: 100vh;
        }
        
        .au-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        
        .au-title-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .au-title-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(244,114,182,0.15) 0%, rgba(244,114,182,0.05) 100%);
          border: 1px solid rgba(244,114,182,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F472B6;
          box-shadow: 0 8px 32px rgba(244,114,182,0.1);
        }
        
        .au-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0F2137;
          margin: 0;
          line-height: 1.2;
        }
        
        .au-subtitle {
          font-size: 14px;
          font-weight: 500;
          color: #64748B;
          margin-top: 4px;
        }
        
        .au-search-box {
          position: relative;
          width: 320px;
        }
        
        .au-search-input {
          width: 100%;
          height: 44px;
          padding: 0 20px 0 44px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 99px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #0F2137;
          transition: all 0.2s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        
        .au-search-input:focus {
          outline: none;
          border-color: #F472B6;
          box-shadow: 0 0 0 4px rgba(244,114,182,0.1);
        }
        
        .au-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }
        
        .au-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        
        .au-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'DM Sans', sans-serif;
        }
        
        .au-th {
          text-align: left;
          padding: 18px 24px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #64748B;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
        }
        
        .au-tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #F1F5F9;
        }
        
        .au-tr:hover {
          background: #F8FAFC;
        }
        
        .au-tr:last-child {
          border-bottom: none;
        }
        
        .au-td {
          padding: 20px 24px;
          vertical-align: middle;
        }
        
        /* User Cell */
        .au-user-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .au-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #38BDF8, #4C6EF5);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .au-avatar-admin { background: linear-gradient(135deg, #A78BFA, #F472B6); }
        .au-avatar-pharmacy { background: linear-gradient(135deg, #34D399, #10B981); }
        
        .au-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #0F2137;
        }
        
        .au-email {
          font-size: 13px;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        
        /* Role Badge */
        .au-badge-wrap {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .au-role-user {
          background: rgba(56,189,248,0.1);
          color: #0284C7;
          border: 1px solid rgba(56,189,248,0.2);
        }
        
        .au-role-admin {
          background: rgba(167,139,250,0.1);
          color: #7C3AED;
          border: 1px solid rgba(167,139,250,0.2);
        }
        
        .au-role-pharmacy {
          background: rgba(52,211,153,0.1);
          color: #059669;
          border: 1px solid rgba(52,211,153,0.2);
        }
        
        /* Contact Info */
        .au-contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
          margin-bottom: 4px;
        }
        
        .au-contact-item:last-child {
          margin-bottom: 0;
        }
        
        .au-empty-state {
          padding: 64px;
          text-align: center;
          color: #64748B;
        }
      `}</style>
      
      <div className="au-header">
        <div className="au-title-wrap">
          <div className="au-title-icon">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="au-title">User Management</h1>
            <div className="au-subtitle">View and manage all registered users in the MediReach network</div>
          </div>
        </div>
        
        <div className="au-search-box">
          <Search className="au-search-icon" size={18} strokeWidth={2} />
          <input 
            type="text" 
            className="au-search-input" 
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="au-card">
        {loading ? (
          <div className="au-empty-state">
            <Loader2 className="animate-spin mx-auto mb-4" size={32} color="#F472B6" />
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="au-empty-state">
            <Shield className="mx-auto mb-4" size={32} color="#EF4444" />
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="au-empty-state">
            <Users className="mx-auto mb-4 opacity-30" size={48} />
            <p className="font-medium text-slate-500">No users found matching your search.</p>
          </div>
        ) : (
          <table className="au-table">
            <thead>
              <tr>
                <th className="au-th">User Details</th>
                <th className="au-th">Role</th>
                <th className="au-th">Contact Info</th>
                <th className="au-th">Additional Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const isPharmacy = user.role?.toLowerCase() === 'pharmacy';
                const isAdmin = user.role?.toLowerCase() === 'admin';
                const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "?";
                
                let avatarClass = "au-avatar";
                if (isAdmin) avatarClass += " au-avatar-admin";
                if (isPharmacy) avatarClass += " au-avatar-pharmacy";
                
                let roleClass = "au-role-user";
                let RoleIcon = User;
                
                if (isAdmin) {
                  roleClass = "au-role-admin";
                  RoleIcon = Shield;
                } else if (isPharmacy) {
                  roleClass = "au-role-pharmacy";
                  RoleIcon = Activity;
                }

                return (
                  <tr key={user._id || user.email} className="au-tr">
                    <td className="au-td">
                      <div className="au-user-cell">
                        <div className={avatarClass}>{initials}</div>
                        <div>
                          <div className="au-name">{user.name || "Unknown"}</div>
                          <div className="au-email">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="au-td">
                      <div className={`au-badge-wrap ${roleClass}`}>
                        <RoleIcon size={12} strokeWidth={2.5} />
                        {user.role || 'user'}
                      </div>
                    </td>
                    <td className="au-td">
                      {user.contactNumber && (
                        <div className="au-contact-item">
                          <Phone size={14} />
                          {user.contactNumber}
                        </div>
                      )}
                      {!user.contactNumber && (
                        <span style={{ color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>Not provided</span>
                      )}
                    </td>
                    <td className="au-td">
                      {isPharmacy && user.pharmacyName ? (
                        <>
                          <div className="au-contact-item" style={{ fontWeight: 600, color: '#0F2137' }}>
                            <Building2 size={14} color="#059669" />
                            {user.pharmacyName}
                          </div>
                          {user.licenseNumber && (
                            <div className="au-contact-item" style={{ fontSize: '11px', marginTop: '2px' }}>
                              License: {user.licenseNumber}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '12px' }}>-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
