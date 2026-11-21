import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Modal } from '../components/Modal';
import { Icon } from '../components/Icons';

export const SuppliersPage = ({ showToast }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('5');

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setLeadTimeDays('5');
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSupplier(s);
    setName(s.name);
    setPhone(s.phone || '');
    setLeadTimeDays(String(s.leadTimeDays || 5));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !leadTimeDays) {
      showToast('Please enter supplier name and lead time', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        leadTimeDays: Number(leadTimeDays)
      };

      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, payload);
        showToast('Supplier updated successfully', 'success');
      } else {
        await api.createSupplier(payload);
        showToast('Supplier created successfully', 'success');
      }
      setModalOpen(false);
      loadSuppliers();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Supplier Management</h2>
          <p className="page-subtitle">Configure vendors, contact information, and delivery lead times</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Icon name="plus" size={17} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body no-padding">
          {loading ? (
            <div className="table-loading"><span className="spinner"></span> Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="empty-state">
              <Icon name="suppliers" size={40} color="#64748b" />
              <p>No suppliers registered yet. Create one to link with your products and purchase orders!</p>
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                Create Supplier
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Supplier Name</th>
                    <th>Phone / Contact</th>
                    <th>Lead Time</th>
                    <th>Fulfillment Speed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td className="text-muted">#{s.id}</td>
                      <td className="font-medium text-slate-100">{s.name}</td>
                      <td>{s.phone ? s.phone : <span className="text-muted">Not specified</span>}</td>
                      <td>
                        <span className="badge badge-subtle">
                          {s.leadTimeDays} days
                        </span>
                      </td>
                      <td>
                        {s.leadTimeDays <= 3 ? (
                          <span className="badge badge-success">Fast (1-3d)</span>
                        ) : s.leadTimeDays <= 7 ? (
                          <span className="badge badge-info">Standard (4-7d)</span>
                        ) : (
                          <span className="badge badge-warning">Extended (&gt;7d)</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => openEditModal(s)}
                          title="Edit supplier"
                        >
                          <Icon name="edit" size={13} />
                          <span>Edit</span>
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

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Register New Supplier'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="sname">Supplier / Vendor Name *</label>
            <input
              id="sname"
              type="text"
              placeholder="e.g. City Electronics & Hardware Co."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="sphone">Contact Phone</label>
              <input
                id="sphone"
                type="text"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="slead">Lead Time (Days) *</label>
              <input
                id="slead"
                type="number"
                min="1"
                max="365"
                placeholder="e.g. 5"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
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
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingSupplier ? 'Save Changes' : 'Register Supplier')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
