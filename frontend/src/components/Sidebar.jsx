import React from 'react';
import { Icon } from './Icons';

export const Sidebar = ({ activeTab, onSelectTab, alertsCount = 0, user = null }) => {
  const isAdmin = !user?.role || user?.role === 'ADMIN';

  const allNavItems = [
    { id: 'dashboard', label: 'Overview', icon: 'dashboard', adminOnly: false },
    { id: 'products', label: 'Catalog & Inventory', icon: 'products', adminOnly: false },
    { id: 'transactions', label: 'Stock Movement', icon: 'transactions', adminOnly: false },
    { id: 'ai', label: 'AI Decision Engine', icon: 'ai', isAi: true, adminOnly: false },
    { id: 'suppliers', label: 'Suppliers Directory', icon: 'suppliers', adminOnly: true },
    { id: 'orders', label: 'Purchase Orders', icon: 'orders', adminOnly: true },
    { id: 'reports', label: 'Financial & Sales', icon: 'reports', adminOnly: true },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section-title">
          {isAdmin ? 'ADMINISTRATIVE SUITE' : 'OPERATOR PORTAL'}
        </div>

        {allNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const isLocked = item.adminOnly && !isAdmin;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''} ${item.isAi ? 'nav-item-ai' : ''} ${isLocked ? 'nav-item-locked' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={isLocked ? 'Administrator Access Required' : item.label}
            >
              <span className="nav-icon">
                <Icon 
                  name={item.icon} 
                  size={19} 
                  color={isLocked ? '#64748b' : (item.isAi ? '#f43f5e' : (isActive ? '#38bdf8' : '#94a3b8'))} 
                />
              </span>
              <span className="nav-label">{item.label}</span>
              
              {isLocked && (
                <span className="badge badge-locked nav-badge">
                  Admin
                </span>
              )}

              {!isLocked && item.id === 'dashboard' && alertsCount > 0 && (
                <span className="badge badge-warning nav-badge">
                  {alertsCount}
                </span>
              )}

              {!isLocked && item.isAi && (
                <span className="badge badge-ai nav-badge">
                  PRO
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Profile Card (Replaces developer backend badges) */}
      <div className="sidebar-footer">
        <div className="user-role-card">
          <div className="user-avatar-circle">
            {isAdmin ? '👑' : '👤'}
          </div>
          <div className="user-role-info">
            <span className="user-role-name">{user?.name || (isAdmin ? 'Admin' : 'Operator')}</span>
            <span className={`user-role-badge ${isAdmin ? 'badge-admin-role' : 'badge-staff-role'}`}>
              {isAdmin ? 'Administrator' : 'Warehouse Staff'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
