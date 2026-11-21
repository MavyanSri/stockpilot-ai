import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { StatCard } from '../components/StatCard';
import { Icon } from '../components/Icons';
import { WarehousePieChart } from '../components/WarehousePieChart';
import { MostShippedChart } from '../components/MostShippedChart';

export const DashboardPage = ({ onNavigate, onQuickAction, showToast, user }) => {
  const isAdmin = !user?.role || user?.role === 'ADMIN';
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [publicData, setPublicData] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const subTabs = [
    { id: 'overview', label: 'Stock Overview' },
    { id: 'all', label: 'All' },
    { id: 'components', label: 'Components' },
    { id: 'kitted', label: 'Kitted' },
    { id: 'serialized', label: 'Serialized' },
    { id: 'arriving', label: 'Arriving Soon' },
    { id: 'reorder', label: 'Reorder Soon' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, pubData, alertsData, movesData] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getPublicSummary().catch(() => null),
        api.getLowStockAlerts().catch(() => []),
        api.getStockHistory().catch(() => [])
      ]);
      setSummary(sumData);
      setPublicData(pubData);
      setLowStockProducts(alertsData || []);
      setRecentMovements((movesData || []).slice(0, 5));
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubTabClick = (id) => {
    setActiveSubTab(id);
    if (id === 'all' || id === 'components' || id === 'kitted' || id === 'serialized') {
      onNavigate('products');
    } else if (id === 'arriving') {
      onNavigate('orders');
    }
  };

  // Build warehouse data from backend if available
  const warehouseData = publicData?.warehouseDistribution ? [
    { name: 'Valencia Warehouse', count: publicData.warehouseDistribution['Valencia Warehouse'] || 410419, color: '#38bdf8' },
    { name: 'Florida Warehouse', count: publicData.warehouseDistribution['Florida Warehouse'] || 219613, color: '#10b981' },
    { name: 'Texas Warehouse', count: publicData.warehouseDistribution['Texas Warehouse'] || 206907, color: '#f59e0b' },
    { name: 'Chicago Warehouse', count: publicData.warehouseDistribution['Chicago Warehouse'] || 26336, color: '#f97316' },
    { name: 'Brooklyn Warehouse', count: publicData.warehouseDistribution['Brooklyn Warehouse'] || 21475, color: '#a855f7' },
  ] : null;

  return (
    <div className="page-container haptic-dashboard-container">
      {/* 1. Header with Title & Action */}
      <div className="page-header">
        <div>
          <h2 className="page-title">{isAdmin ? 'Inventory Executive Dashboard' : 'Warehouse Operations Dashboard'}</h2>
          <p className="page-subtitle">Real-time multi-warehouse stock levels, order fulfillments, and distribution analytics</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading}>
            <Icon name="transactions" size={15} />
            <span>Refresh Live Data</span>
          </button>
          <button className="btn btn-ai btn-sm" onClick={() => onNavigate('ai')}>
            <Icon name="sparkles" size={15} color="#ec4899" />
            <span>AI Decision Hub</span>
          </button>
        </div>
      </div>

      {/* 2. Haptic-Style Sub-Navigation Tabs (Image 10 Reference) */}
      <div className="haptic-subtabs-bar">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            className={`haptic-subtab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => handleSubTabClick(tab.id)}
          >
            {tab.label}
            {tab.id === 'reorder' && lowStockProducts.length > 0 && (
              <span className="tab-counter-badge">{lowStockProducts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Top Overview Badges (Image 10 Reference) */}
      <div className="haptic-overview-cards-grid">
        <div className="haptic-stat-card card-pink" onClick={() => onNavigate('orders')}>
          <div className="haptic-stat-icon-wrap icon-pink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div className="haptic-stat-content">
            <span className="haptic-stat-label">Product Arriving Soon</span>
            <span className="haptic-stat-value">{publicData?.arrivingSoon ?? 135}</span>
            <span className="haptic-stat-sub">Across active purchase orders</span>
          </div>
        </div>

        <div className="haptic-stat-card card-teal" onClick={() => onNavigate('products')}>
          <div className="haptic-stat-icon-wrap icon-teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div className="haptic-stat-content">
            <span className="haptic-stat-label">Products in Inventory</span>
            <span className="haptic-stat-value">{summary?.productCount ?? publicData?.totalProducts ?? 16}</span>
            <span className="haptic-stat-sub">Active monitored SKUs</span>
          </div>
        </div>

        <div className="haptic-stat-card card-blue" onClick={() => onNavigate('products')}>
          <div className="haptic-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 14l2 2 4-4"></path>
            </svg>
          </div>
          <div className="haptic-stat-content">
            <span className="haptic-stat-label">Product Variants in Inventory</span>
            <span className="haptic-stat-value">{publicData?.productVariants ?? 206}</span>
            <span className="haptic-stat-sub">Across 5 distribution centers</span>
          </div>
        </div>

        {isAdmin && (
          <div className="haptic-stat-card card-emerald" onClick={() => onNavigate('reports')}>
            <div className="haptic-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="haptic-stat-content">
              <span className="haptic-stat-label">Today's Sales Revenue</span>
              <span className="haptic-stat-value">₹{Number(summary?.todayRevenue || 0).toLocaleString('en-IN')}</span>
              <span className="haptic-stat-sub">{summary?.todayUnitsSold ?? 0} units cleared</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Charts Row: Products by Warehouse (Donut) & Most Shipped Products (Line Chart) */}
      <div className="haptic-charts-grid">
        <WarehousePieChart warehouseData={warehouseData} />
        <MostShippedChart />
      </div>

      {/* 5. Operational Tables (Alerts & Movements) */}
      <div className="dashboard-grid-2">
        {/* Low Stock Alerts */}
        <div className="card dashboard-card">
          <div className="card-header">
            <div className="card-header-left">
              <Icon name="alert" size={18} color="#f43f5e" />
              <h3 className="card-title">Critical Threshold Alerts ({lowStockProducts.length})</h3>
            </div>
            {isAdmin && (
              <button 
                className="btn btn-primary btn-xs"
                onClick={() => onQuickAction('add-movement')}
              >
                + Restock Batch
              </button>
            )}
          </div>
          <div className="card-body no-padding">
            {loading ? (
              <div className="table-loading"><span className="spinner"></span> Loading alerts...</div>
            ) : lowStockProducts.length === 0 ? (
              <div className="empty-state-mini">
                <Icon name="checkCircle" size={28} color="#10b981" />
                <p>All stock levels are above safety buffers.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>On Hand</th>
                      <th>Min Safety</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td><code>{p.sku}</code></td>
                        <td><span className="badge badge-danger">{p.currentStock} units</span></td>
                        <td>{p.minStock} units</td>
                        <td>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => onQuickAction('add-movement', p.id)}
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Stock Movement Audit */}
        <div className="card dashboard-card">
          <div className="card-header">
            <div className="card-header-left">
              <Icon name="transactions" size={18} color="#38bdf8" />
              <h3 className="card-title">Recent Stock Ledger Entries</h3>
            </div>
            <button 
              className="btn btn-ghost btn-xs"
              onClick={() => onNavigate('transactions')}
            >
              View Full Audit &rarr;
            </button>
          </div>
          <div className="card-body no-padding">
            {loading ? (
              <div className="table-loading"><span className="spinner"></span> Loading ledger...</div>
            ) : recentMovements.length === 0 ? (
              <div className="empty-state-mini">
                <Icon name="transactions" size={28} color="#64748b" />
                <p>No recent transactions recorded.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMovements.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <span className={`badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                            {m.type === 'IN' ? '↓ INBOUND' : '↑ OUTBOUND'}
                          </span>
                        </td>
                        <td>{m.product?.name || `SKU #${m.product?.id}`}</td>
                        <td><strong>{m.quantity}</strong></td>
                        <td><span className="text-dim">{m.reason}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
