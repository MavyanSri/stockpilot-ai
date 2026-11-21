import React from 'react';
import { Icon } from './Icons';

export const Navbar = ({ user, onLogout, onQuickAction, onGoHome, onOpenSearch }) => {
  const isAdmin = !user?.role || user?.role === 'ADMIN';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div 
          className="navbar-logo cursor-pointer" 
          onClick={onGoHome}
          title="Return to Landing Page"
        >
          <div className="logo-icon-pulse">
            <Icon name="box" size={22} color="#38bdf8" />
          </div>
          <div className="logo-text">
            <span className="brand-name">StockPilot</span>
            <span className="brand-badge">AI</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Search trigger icon (Josh Comeau Style) */}
        <button 
          className="btn-icon nav-search-trigger-icon"
          onClick={onOpenSearch}
          title="Search products, SKUs, warehouses (Press /)"
        >
          <Icon name="search" size={18} color="#94a3b8" />
        </button>

        <div className="quick-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onQuickAction('add-movement')}
            title={isAdmin ? "Record Stock In / Out" : "Request Stock Movement"}
          >
            <Icon name="transactions" size={15} />
            <span>{isAdmin ? 'Record Movement' : 'Stock Request'}</span>
          </button>
          
          {isAdmin && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onQuickAction('add-product')}
              title="Add New Product (Admin)"
            >
              <Icon name="plus" size={15} />
              <span>Add Product</span>
            </button>
          )}

          <button 
            className="btn btn-ai btn-sm"
            onClick={() => onQuickAction('ask-ai')}
            title="Ask AI Assistant"
          >
            <Icon name="sparkles" size={15} color="#ec4899" />
            <span>AI Assistant</span>
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {isAdmin ? '👑' : '👤'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || (isAdmin ? 'Admin' : 'Operator')}</span>
            <span className={`user-role ${isAdmin ? 'role-admin' : 'role-user'}`}>
              {isAdmin ? 'Administrator' : 'Warehouse Staff'}
            </span>
          </div>
          <button 
            onClick={onLogout} 
            className="btn-icon logout-btn" 
            title="Sign out of StockPilot"
          >
            <Icon name="logout" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
