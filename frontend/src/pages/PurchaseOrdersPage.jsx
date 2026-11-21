import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Modal } from '../components/Modal';
import { Icon } from '../components/Icons';

export const PurchaseOrdersPage = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Create PO Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState(null);

  // Form Fields
  const [supplierId, setSupplierId] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: '10', unitCost: '50' }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderList, supList, prodList] = await Promise.all([
        api.getPurchaseOrders(),
        api.getSuppliers(),
        api.getProducts()
      ]);
      setOrders(orderList || []);
      setSuppliers(supList || []);
      setProducts(prodList || []);
    } catch (err) {
      showToast(err.message || 'Failed to load purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    const defaultSup = suppliers.length > 0 ? String(suppliers[0].id) : '';
    setSupplierId(defaultSup);
    setExpectedAt('');
    // prefill first product for this supplier if any
    const supProds = products.filter(p => p.supplier?.id === Number(defaultSup));
    setItems([{
      productId: supProds.length > 0 ? String(supProds[0].id) : '',
      quantity: '10',
      unitCost: '50'
    }]);
    setCreateModalOpen(true);
  };

  const handleSupplierChange = (supId) => {
    setSupplierId(supId);
    const supProds = products.filter(p => p.supplier?.id === Number(supId));
    setItems([{
      productId: supProds.length > 0 ? String(supProds[0].id) : '',
      quantity: '10',
      unitCost: '50'
    }]);
  };

  const addItemRow = () => {
    const supProds = products.filter(p => p.supplier?.id === Number(supplierId));
    setItems([...items, {
      productId: supProds.length > 0 ? String(supProds[0].id) : '',
      quantity: '10',
      unitCost: '50'
    }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      showToast('Please select a supplier', 'error');
      return;
    }

    for (const it of items) {
      if (!it.productId || !it.quantity || Number(it.quantity) <= 0) {
        showToast('Please specify valid product and quantity for all items', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        expectedAt: expectedAt || null,
        items: items.map(it => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
          unitCost: Number(it.unitCost || 0)
        }))
      };
      await api.createPurchaseOrder(payload);
      showToast('Purchase Order created successfully!', 'success');
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to place purchase order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    if (!window.confirm(`Confirm full physical receipt of Order #${orderId}? This will automatically add items to inventory.`)) {
      return;
    }

    setReceivingId(orderId);
    try {
      await api.receivePurchaseOrder(orderId);
      showToast(`Order #${orderId} received! Inventory balances updated.`, 'success');
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setDetailsModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to receive order', 'error');
    } finally {
      setReceivingId(null);
    }
  };

  const openOrderDetails = async (order) => {
    try {
      const full = await api.getPurchaseOrder(order.id);
      setSelectedOrder(full);
      setDetailsModalOpen(true);
    } catch (err) {
      showToast(err.message || 'Failed to fetch order details', 'error');
    }
  };

  // Products belonging to currently selected supplier in modal
  const supplierProducts = products.filter(p => p.supplier?.id === Number(supplierId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Purchase Orders & Receipts</h2>
          <p className="page-subtitle">Draft supplier orders, track delivery ETA, and record warehouse physical receipts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icon name="plus" size={17} />
            <span>Place Supplier Order</span>
          </button>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body no-padding">
          {loading ? (
            <div className="table-loading"><span className="spinner"></span> Loading purchase orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <Icon name="orders" size={40} color="#64748b" />
              <p>No purchase orders found. Place an order with your supplier to replenish stock!</p>
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                Place New Order
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO #</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Ordered Date</th>
                    <th>Expected Delivery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-semibold text-slate-100">PO-{o.id}</td>
                      <td className="font-medium">{o.supplier?.name || '-'}</td>
                      <td>
                        <span className={`badge ${o.status === 'RECEIVED' ? 'badge-success' : 'badge-info'}`}>
                          {o.status === 'RECEIVED' ? '✓ RECEIVED' : '● ORDERED'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-subtle">
                          {o.items?.length || 0} line items
                        </span>
                      </td>
                      <td className="text-muted text-xs">
                        {o.orderedAt ? new Date(o.orderedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-muted text-xs">
                        {o.expectedAt ? o.expectedAt : 'Auto (Lead Time)'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => openOrderDetails(o)}
                            title="View order lines"
                          >
                            Details
                          </button>
                          {o.status === 'ORDERED' && (
                            <button
                              className="btn btn-success btn-xs"
                              onClick={() => handleReceiveOrder(o.id)}
                              disabled={receivingId === o.id}
                              title="Mark received and update stock"
                            >
                              {receivingId === o.id ? 'Receiving...' : 'Receive Full'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedOrder ? `Purchase Order PO-${selectedOrder.id}` : 'Order Details'}
        maxWidth="650px"
      >
        {selectedOrder && (
          <div className="order-details-view">
            <div className="order-meta-grid">
              <div>
                <span className="text-muted text-xs">Supplier</span>
                <div className="font-semibold">{selectedOrder.supplier?.name}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Status</span>
                <div>
                  <span className={`badge ${selectedOrder.status === 'RECEIVED' ? 'badge-success' : 'badge-info'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted text-xs">Expected Delivery</span>
                <div>{selectedOrder.expectedAt || 'Standard'}</div>
              </div>
            </div>

            <div className="order-items-table-wrapper">
              <h4>Ordered Products</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="font-medium text-slate-100">{item.product?.name}</td>
                      <td><span className="sku-badge">{item.product?.sku}</span></td>
                      <td>{item.quantity} units</td>
                      <td>₹{Number(item.unitCost).toFixed(2)}</td>
                      <td className="font-semibold text-emerald-400">
                        ₹{(item.quantity * item.unitCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </button>
              {selectedOrder.status === 'ORDERED' && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleReceiveOrder(selectedOrder.id)}
                  disabled={receivingId === selectedOrder.id}
                >
                  {receivingId === selectedOrder.id ? 'Receiving...' : 'Confirm Receipt & Update Stock'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Place Supplier Purchase Order"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateOrder} className="modal-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="po-sup">Supplier *</label>
              <select
                id="po-sup"
                value={supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.leadTimeDays}d lead)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="po-date">Expected Delivery Date</label>
              <input
                id="po-date"
                type="date"
                value={expectedAt}
                onChange={(e) => setExpectedAt(e.target.value)}
                placeholder="Defaults to supplier lead time"
              />
            </div>
          </div>

          <div className="po-line-items-section">
            <div className="section-header-inline">
              <label>Order Line Items (Products from selected supplier)</label>
              <button
                type="button"
                className="btn btn-link btn-xs"
                onClick={addItemRow}
                disabled={supplierProducts.length === 0}
              >
                + Add Another Product
              </button>
            </div>

            {supplierProducts.length === 0 ? (
              <div className="empty-warning text-xs">
                No products are currently mapped to this supplier. Please add products assigned to this supplier first.
              </div>
            ) : (
              items.map((row, idx) => (
                <div key={idx} className="po-item-row">
                  <div className="flex-2">
                    <select
                      value={row.productId}
                      onChange={(e) => updateItemRow(idx, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Choose item...</option>
                      {supplierProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Cost ₹"
                      value={row.unitCost}
                      onChange={(e) => updateItemRow(idx, 'unitCost', e.target.value)}
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon delete-btn"
                      onClick={() => removeItemRow(idx)}
                      title="Remove row"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || supplierProducts.length === 0}
            >
              {submitting ? 'Placing Order...' : 'Submit Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
