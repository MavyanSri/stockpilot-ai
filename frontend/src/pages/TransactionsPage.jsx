import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Modal } from '../components/Modal';
import { Icon } from '../components/Icons';

export const TransactionsPage = ({ initialProductId = null, showToast }) => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductFilter, setSelectedProductFilter] = useState(initialProductId ? String(initialProductId) : '');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('OUT');
  const [reason, setReason] = useState('SALE');
  const [quantity, setQuantity] = useState('1');

  const loadData = async (prodId = selectedProductFilter) => {
    try {
      setLoading(true);
      const [hist, prodList] = await Promise.all([
        api.getStockHistory(prodId ? Number(prodId) : null),
        api.getProducts()
      ]);
      setMovements(hist || []);
      setProducts(prodList || []);
    } catch (err) {
      showToast(err.message || 'Failed to load stock movements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedProductFilter);
  }, [selectedProductFilter]);

  const openRecordModal = (prefillProdId = null) => {
    setProductId(prefillProdId ? String(prefillProdId) : (products.length > 0 ? String(products[0].id) : ''));
    setType('OUT');
    setReason('SALE');
    setQuantity('1');
    setModalOpen(true);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'IN') {
      setReason('OPENING');
    } else {
      setReason('SALE');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) <= 0) {
      showToast('Please enter valid product and quantity', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.recordStockMovement({
        productId: Number(productId),
        type,
        reason,
        quantity: Number(quantity)
      });
      showToast(`Stock movement recorded! New balance: ${res.currentStock} units`, 'success');
      setModalOpen(false);
      loadData(selectedProductFilter);
    } catch (err) {
      showToast(err.message || 'Stock transaction failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Stock Movements & Transactions</h2>
          <p className="page-subtitle">Track every unit change (Sales, Restocks, Damages, and Deliveries)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => openRecordModal()}>
            <Icon name="plus" size={17} />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="filter-group">
          <label htmlFor="filter-prod" className="filter-label">Filter by Product:</label>
          <select
            id="filter-prod"
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name} (Stock: {p.currentStock})
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-stats">
          Total movements: <strong>{movements.length}</strong>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body no-padding">
          {loading ? (
            <div className="table-loading"><span className="spinner"></span> Loading history...</div>
          ) : movements.length === 0 ? (
            <div className="empty-state">
              <Icon name="transactions" size={40} color="#64748b" />
              <p>No transactions found for this selection.</p>
              <button className="btn btn-primary btn-sm" onClick={() => openRecordModal()}>
                Record First Transaction
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Date & Time</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Quantity</th>
                    <th>Unit Sale Price</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="text-muted">#{m.id}</td>
                      <td className="text-muted text-xs">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="font-medium text-slate-100">{m.product?.name || '-'}</td>
                      <td>
                        <span className={`badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                          {m.type === 'IN' ? '▲ IN' : '▼ OUT'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-subtle ${m.reason === 'SALE' ? 'badge-success' : m.reason === 'PURCHASE' ? 'badge-info' : m.reason === 'DAMAGE' ? 'badge-danger' : 'badge-muted'}`}>
                          {m.reason}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-100">
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} units
                      </td>
                      <td>
                        {m.unitSalePrice ? (
                          <span className="text-emerald-400 font-medium">₹{Number(m.unitSalePrice).toFixed(2)}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Movement Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Stock Movement"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="tx-prod">Select Product *</label>
            <select
              id="tx-prod"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Choose product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} (Current Stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Movement Type *</label>
              <div className="radio-pill-group">
                <button
                  type="button"
                  className={`radio-pill ${type === 'OUT' ? 'active pill-out' : ''}`}
                  onClick={() => handleTypeChange('OUT')}
                >
                  ▼ OUT (Deduction)
                </button>
                <button
                  type="button"
                  className={`radio-pill ${type === 'IN' ? 'active pill-in' : ''}`}
                  onClick={() => handleTypeChange('IN')}
                >
                  ▲ IN (Addition)
                </button>
              </div>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="tx-reason">Reason Code *</label>
              <select
                id="tx-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                {type === 'IN' ? (
                  <option value="OPENING">OPENING (Initial / Adjustment)</option>
                ) : (
                  <>
                    <option value="SALE">SALE (Customer Order)</option>
                    <option value="DAMAGE">DAMAGE (Scrapped / Broken)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tx-qty">Quantity to Move *</label>
            <input
              id="tx-qty"
              type="number"
              min="1"
              max="1000000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {type === 'OUT' && (
              <span className="input-hint text-xs text-muted">
                Deductions verify sufficient on-hand inventory automatically.
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Recording...' : 'Confirm Stock Movement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
