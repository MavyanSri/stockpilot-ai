import React, { useState, useEffect } from 'react';
import { api } from './api/api';
import { IntroSplash } from './components/IntroSplash';
import { CloudSearchModal } from './components/CloudSearchModal';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { SalesReportPage } from './pages/SalesReportPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import './App.css';

function App() {
  // 1. Splash Screen Intro State (Plays on initial browser visit)
  const [showSplash, setShowSplash] = useState(true);

  // 2. Navigation View State: 'landing' or 'dashboard'
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');

  // 3. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [user, setUser] = useState(api.getUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState('dashboard');
  const isAdmin = !user?.role || user?.role === 'ADMIN';

  // 4. Search Modal State (Josh Comeau style cloud search)
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // 5. Toast Notifications
  const [toast, setToast] = useState(null);
  const [alertsCount, setAlertsCount] = useState(0);

  // 6. Quick Action Modals
  const [quickMovementOpen, setQuickMovementOpen] = useState(false);
  const [quickProductOpen, setQuickProductOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);

  // Quick Movement Form
  const [mProdId, setMProdId] = useState('');
  const [mType, setMType] = useState('OUT');
  const [mReason, setMReason] = useState('SALE');
  const [mQty, setMQty] = useState('1');
  const [submittingMovement, setSubmittingMovement] = useState(false);

  // Quick Product Form
  const [pSku, setPSku] = useState('');
  const [pName, setPName] = useState('');
  const [pSupId, setPSupId] = useState('');
  const [pMinStock, setPMinStock] = useState('5');
  const [pPrice, setPPrice] = useState('100');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('landing');
    showToast('Signed out successfully', 'info');
  };

  const refreshAlerts = async () => {
    if (!api.isAuthenticated()) return;
    try {
      const alerts = await api.getLowStockAlerts();
      setAlertsCount(alerts?.length || 0);
    } catch {
      // ignore
    }
  };

  const loadQuickData = async () => {
    try {
      const [prods, sups] = await Promise.all([
        api.getProducts(),
        api.getSuppliers()
      ]);
      setProductsList(prods || []);
      setSuppliersList(sups || []);
      if (prods?.length > 0 && !mProdId) setMProdId(String(prods[0].id));
      if (sups?.length > 0 && !pSupId) setPSupId(String(sups[0].id));
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut: '/' opens the Josh Comeau cloud search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
      setCurrentView('landing');
      showToast('Session expired. Please log in again.', 'warning');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setUser(api.getUser());
      refreshAlerts();
      loadQuickData();
    }
  }, [isAuthenticated, activeTab]);

  const handleQuickAction = (action, payload = null) => {
    if (action === 'ask-ai') {
      setCurrentView('dashboard');
      setActiveTab('ai');
    } else if (action === 'add-movement') {
      loadQuickData();
      if (payload) setMProdId(String(payload));
      setQuickMovementOpen(true);
    } else if (action === 'add-product') {
      loadQuickData();
      setQuickProductOpen(true);
    }
  };

  const submitQuickMovement = async (e) => {
    e.preventDefault();
    if (!mProdId || !mQty) return;
    setSubmittingMovement(true);
    try {
      const res = await api.recordStockMovement({
        productId: Number(mProdId),
        type: mType,
        reason: mReason,
        quantity: Number(mQty)
      });
      showToast(`Stock updated! New balance: ${res.currentStock} units`, 'success');
      setQuickMovementOpen(false);
      refreshAlerts();
    } catch (err) {
      showToast(err.message || 'Movement failed', 'error');
    } finally {
      setSubmittingMovement(false);
    }
  };

  const submitQuickProduct = async (e) => {
    e.preventDefault();
    if (!pSku || !pName || !pSupId) return;
    setSubmittingProduct(true);
    try {
      await api.createProduct({
        sku: pSku.trim().toUpperCase(),
        name: pName.trim(),
        supplierId: Number(pSupId),
        minStock: Number(pMinStock),
        sellingPrice: Number(pPrice)
      });
      showToast('Product created successfully!', 'success');
      setQuickProductOpen(false);
      loadQuickData();
      refreshAlerts();
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleOpenDashboardFromLanding = (tab = 'dashboard') => {
    if (isAuthenticated) {
      setActiveTab(tab);
      setCurrentView('dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleSearchNavigate = (tab) => {
    if (isAuthenticated) {
      setActiveTab(tab);
      setCurrentView('dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="app-root">
      {/* 1. Cinematic Opening Intro Animation (Airtribe video style) */}
      {showSplash && (
        <IntroSplash onComplete={() => setShowSplash(false)} />
      )}

      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Josh Comeau Scalloped Cloud Search Modal */}
      <CloudSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleSearchNavigate}
      />

      {/* MediFlow Glassmorphism Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          const currentUser = api.getUser();
          setUser(currentUser);
          setCurrentView('dashboard');
          setActiveTab(pendingTab || 'dashboard');
        }}
        showToast={showToast}
      />

      {/* 2. Main View Switcher: Landing Page vs Dashboard */}
      {currentView === 'landing' ? (
        <LandingPage
          isAuthenticated={isAuthenticated}
          user={user}
          onOpenAuth={(tab) => {
            setPendingTab(tab || 'dashboard');
            setAuthModalOpen(true);
          }}
          onOpenDashboard={handleOpenDashboardFromLanding}
          onOpenSearch={() => setSearchModalOpen(true)}
          onReplayIntro={() => setShowSplash(true)}
        />
      ) : (
        <div className="app-layout">
          <Navbar
            user={user}
            onLogout={handleLogout}
            onQuickAction={handleQuickAction}
            onGoHome={() => setCurrentView('landing')}
            onOpenSearch={() => setSearchModalOpen(true)}
          />

          <div className="app-body">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              alertsCount={alertsCount}
              user={user}
            />

            <main className="main-content">
              {!isAdmin && ['suppliers', 'orders', 'reports'].includes(activeTab) ? (
                <div className="page-container admin-locked-container">
                  <div className="admin-lock-card">
                    <div className="lock-icon-wrap">🛡️</div>
                    <h2>Administrator Access Required</h2>
                    <p>
                      The <strong>{activeTab === 'suppliers' ? 'Suppliers Directory' : activeTab === 'orders' ? 'Purchase Orders' : 'Financial Sales Reports'}</strong> module is restricted to Administrator accounts.
                    </p>
                    <p className="admin-lock-sub">
                      As a Warehouse Staff member, you have full access to Product Catalog, Stock Lookups, Stock Requests, and AI Querying.
                    </p>
                    <div className="admin-lock-actions">
                      <button className="btn btn-primary" onClick={() => setActiveTab('products')}>
                        Go to Inventory Catalog &rarr;
                      </button>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => {
                          api.logout();
                          setIsAuthenticated(false);
                          setUser(null);
                          setAuthModalOpen(true);
                        }}
                      >
                        Switch to Admin Account
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <DashboardPage
                      onNavigate={setActiveTab}
                      onQuickAction={handleQuickAction}
                      showToast={showToast}
                      user={user}
                    />
                  )}

                  {activeTab === 'products' && (
                    <ProductsPage
                      onQuickAction={handleQuickAction}
                      showToast={showToast}
                      user={user}
                    />
                  )}

                  {activeTab === 'suppliers' && (
                    <SuppliersPage
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'transactions' && (
                    <TransactionsPage
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'orders' && (
                    <PurchaseOrdersPage
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'reports' && (
                    <SalesReportPage
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'ai' && (
                    <AiAssistantPage
                      onNavigate={setActiveTab}
                      showToast={showToast}
                    />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Quick Movement Modal */}
      <Modal
        isOpen={quickMovementOpen}
        onClose={() => setQuickMovementOpen(false)}
        title="Quick Stock Movement"
      >
        <form onSubmit={submitQuickMovement} className="modal-form">
          <div className="form-group">
            <label htmlFor="qm-p">Product</label>
            <select
              id="qm-p"
              value={mProdId}
              onChange={(e) => setMProdId(e.target.value)}
              required
            >
              <option value="">Select product...</option>
              {productsList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} (Stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Type</label>
              <div className="radio-pill-group">
                <button
                  type="button"
                  className={`radio-pill ${mType === 'OUT' ? 'active pill-out' : ''}`}
                  onClick={() => {
                    setMType('OUT');
                    setMReason('SALE');
                  }}
                >
                  ▼ OUT
                </button>
                <button
                  type="button"
                  className={`radio-pill ${mType === 'IN' ? 'active pill-in' : ''}`}
                  onClick={() => {
                    setMType('IN');
                    setMReason('OPENING');
                  }}
                >
                  ▲ IN
                </button>
              </div>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="qm-r">Reason</label>
              <select
                id="qm-r"
                value={mReason}
                onChange={(e) => setMReason(e.target.value)}
                required
              >
                {mType === 'IN' ? (
                  <option value="OPENING">OPENING</option>
                ) : (
                  <>
                    <option value="SALE">SALE</option>
                    <option value="DAMAGE">DAMAGE</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="qm-q">Quantity</label>
            <input
              id="qm-q"
              type="number"
              min="1"
              value={mQty}
              onChange={(e) => setMQty(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setQuickMovementOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingMovement}
            >
              {submittingMovement ? 'Recording...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Quick Product Modal */}
      <Modal
        isOpen={quickProductOpen}
        onClose={() => setQuickProductOpen(false)}
        title="Quick Add Product"
      >
        <form onSubmit={submitQuickProduct} className="modal-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="qp-sku">SKU Code *</label>
              <input
                id="qp-sku"
                type="text"
                placeholder="e.g. CABLE-01"
                value={pSku}
                onChange={(e) => setPSku(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="qp-price">Price (₹) *</label>
              <input
                id="qp-price"
                type="number"
                step="0.01"
                min="0"
                value={pPrice}
                onChange={(e) => setPPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="qp-name">Product Name *</label>
            <input
              id="qp-name"
              type="text"
              placeholder="e.g. Type-C Fast Cable"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="qp-sup">Supplier *</label>
              <select
                id="qp-sup"
                value={pSupId}
                onChange={(e) => setPSupId(e.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliersList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label htmlFor="qp-min">Min Safety *</label>
              <input
                id="qp-min"
                type="number"
                min="0"
                value={pMinStock}
                onChange={(e) => setPMinStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setQuickProductOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingProduct || suppliersList.length === 0}
            >
              {submittingProduct ? 'Saving...' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
