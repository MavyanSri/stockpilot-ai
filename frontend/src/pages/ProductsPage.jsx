import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Modal } from '../components/Modal';
import { Icon } from '../components/Icons';

export const ProductsPage = ({ onQuickAction, showToast, user }) => {
  const isAdmin = !user?.role || user?.role === 'ADMIN';
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [minStock, setMinStock] = useState('4');
  const [sellingPrice, setSellingPrice] = useState('100');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodList, supList] = await Promise.all([
        api.getProducts(),
        api.getSuppliers()
      ]);
      setProducts(prodList || []);
      setSuppliers(supList || []);
    } catch (err) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setSku('');
    setName('');
    setSupplierId(suppliers.length > 0 ? String(suppliers[0].id) : '');
    setMinStock('5');
    setSellingPrice('100');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setSupplierId(p.supplier ? String(p.supplier.id) : '');
    setMinStock(String(p.minStock));
    setSellingPrice(String(p.sellingPrice));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !supplierId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        supplierId: Number(supplierId),
        minStock: Number(minStock),
        sellingPrice: Number(sellingPrice)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.createProduct(payload);
        showToast('Product added to inventory', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Product Catalog & Inventory</h2>
          <p className="page-subtitle">Manage SKUs, safety thresholds, and track live on-hand quantities</p>
        </div>
        <div className="page-actions">
          {isAdmin ? (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Icon name="plus" size={17} />
              <span>Add New Product</span>
            </button>
          ) : (
            <div className="user-view-pill">
              <span>👤 Catalog Search & Stock Lookup</span>
            </div>
          )}
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-box">
          <Icon name="search" size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by SKU or Product Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-stats">
          Total items: <strong>{filteredProducts.length}</strong>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body no-padding">
          {loading ? (
            <div className="table-loading"><span className="spinner"></span> Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Icon name="box" size={40} color="#64748b" />
              <p>No products found. Add your first product to get started!</p>
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                Create Product
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Supplier</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Min Safety</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.currentStock === 0;
                    const isLowStock = p.currentStock <= p.minStock && !isOutOfStock;
                    return (
                      <tr key={p.id}>
                        <td><span className="sku-badge">{p.sku}</span></td>
                        <td className="font-medium text-slate-100">{p.name}</td>
                        <td>{p.supplier?.name || '-'}</td>
                        <td className="font-semibold text-emerald-400">₹{Number(p.sellingPrice).toFixed(2)}</td>
                        <td>
                          <span className={`stock-number ${isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-slate-100'}`}>
                            {p.currentStock}
                          </span>
                        </td>
                        <td className="text-muted">{p.minStock}</td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="badge badge-warning">Low Stock</span>
                          ) : (
                            <span className="badge badge-success">In Stock</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {isAdmin && (
                              <button
                                className="btn btn-outline btn-xs"
                                onClick={() => openEditModal(p)}
                                title="Edit product (Admin Only)"
                              >
                                <Icon name="edit" size={13} />
                                <span>Edit</span>
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={() => onQuickAction('add-movement', p.id)}
                              title={isAdmin ? "Record stock in/out" : "Request stock movement"}
                            >
                              <span>{isAdmin ? 'Stock Movement' : 'Stock Request'}</span>
                            </button>
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="sku">SKU Code *</label>
              <input
                id="sku"
                type="text"
                placeholder="e.g. CABLE-USBC"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="price">Selling Price (₹) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pname">Product Name *</label>
            <input
              id="pname"
              type="text"
              placeholder="e.g. Braided USB-C Charging Cable 1M"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="supplier">Supplier *</label>
              {suppliers.length === 0 ? (
                <div className="text-warning text-xs">
                  No suppliers found! Please create a supplier first in the Suppliers tab.
                </div>
              ) : (
                <select
                  id="supplier"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.leadTimeDays}d lead)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="minStock">Min Safety Stock *</label>
              <input
                id="minStock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                required
              />
            </div>
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
              disabled={submitting || suppliers.length === 0}
            >
              {submitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
