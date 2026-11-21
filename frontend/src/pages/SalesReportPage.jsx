import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { StatCard } from '../components/StatCard';
import { Icon } from '../components/Icons';

export const SalesReportPage = ({ showToast }) => {
  const getFormattedDate = (d) => d.toISOString().split('T')[0];

  const todayStr = getFormattedDate(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = getFormattedDate(sevenDaysAgo);

  const [from, setFrom] = useState(sevenDaysAgoStr);
  const [to, setTo] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async (fromDate = from, toDate = to) => {
    try {
      setLoading(true);
      const data = await api.getSalesReport(fromDate, toDate);
      setReport(data);
    } catch (err) {
      showToast(err.message || 'Failed to generate sales report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    if (new Date(to) < new Date(from)) {
      showToast('End date cannot be earlier than start date', 'error');
      return;
    }
    loadReport(from, to);
  };

  const setPreset = (type) => {
    const now = new Date();
    const end = getFormattedDate(now);
    let start = end;

    if (type === 'today') {
      start = end;
    } else if (type === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      start = getFormattedDate(d);
    } else if (type === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      start = getFormattedDate(d);
    } else if (type === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = getFormattedDate(d);
    }

    setFrom(start);
    setTo(end);
    loadReport(start, end);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales & Revenue Reports</h2>
          <p className="page-subtitle">Track revenue generated, quantity velocity, and top selling inventory</p>
        </div>
      </div>

      <div className="card filter-card">
        <form onSubmit={handleApplyFilter} className="date-filter-form">
          <div className="filter-presets">
            <button
              type="button"
              className={`preset-btn ${from === todayStr && to === todayStr ? 'active' : ''}`}
              onClick={() => setPreset('today')}
            >
              Today
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setPreset('7days')}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setPreset('30days')}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setPreset('month')}
            >
              This Month
            </button>
          </div>

          <div className="date-inputs">
            <div className="date-field">
              <label htmlFor="from">From:</label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>
            <div className="date-field">
              <label htmlFor="to">To:</label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <Icon name="search" size={15} />
              <span>Apply Range</span>
            </button>
          </div>
        </form>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Units Sold"
          value={loading ? '...' : (report?.unitsSold ?? 0)}
          subtitle={`From ${from} to ${to}`}
          icon="box"
          color="blue"
        />
        <StatCard
          title="Total Gross Revenue"
          value={loading ? '...' : `₹${Number(report?.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Customer sales value"
          icon="dollar"
          color="emerald"
        />
        <StatCard
          title="Active Contributing SKUs"
          value={loading ? '...' : (report?.products?.length ?? 0)}
          subtitle="Distinct products with sales"
          icon="trendingUp"
          color="amber"
        />
      </div>

      {/* Product Contribution Table */}
      <div className="card table-card">
        <div className="card-header">
          <div className="card-header-left">
            <Icon name="reports" size={18} color="#38bdf8" />
            <h3>Product Revenue Breakdown</h3>
          </div>
          <span className="text-muted text-xs">Sorted by units sold (highest first)</span>
        </div>

        <div className="card-body no-padding">
          {loading ? (
            <div className="table-loading"><span className="spinner"></span> Generating report...</div>
          ) : !report?.products || report.products.length === 0 ? (
            <div className="empty-state">
              <Icon name="reports" size={40} color="#64748b" />
              <p>No sales recorded in the selected date range ({from} to {to}).</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Units Sold</th>
                    <th>Revenue Contributed</th>
                    <th>Share of Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {report.products.map((row) => {
                    const totalRev = Number(report.revenue || 1);
                    const share = totalRev > 0 ? ((Number(row.revenue) / totalRev) * 100).toFixed(1) : 0;
                    return (
                      <tr key={row.productId}>
                        <td className="text-muted">#{row.productId}</td>
                        <td className="font-medium text-slate-100">{row.name}</td>
                        <td className="font-semibold text-slate-100">{row.units} units</td>
                        <td className="font-semibold text-emerald-400">₹{Number(row.revenue).toFixed(2)}</td>
                        <td>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(5, share))}%` }}></div>
                            <span className="progress-text">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
