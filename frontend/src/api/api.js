const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : 'Request failed');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  async register(name, email, password, role = 'USER') {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
  },

  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.accessToken) {
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify({
        email: res.email || email,
        name: res.name || 'User',
        role: res.role || (email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER')
      }));
    }
    return res;
  },

  // Public Summary (No Auth Required)
  async getPublicSummary() {
    try {
      return await request('/public/summary');
    } catch {
      return {
        totalProducts: 8,
        lowStockCount: 3,
        activeSuppliers: 4,
        totalStockUnits: 284,
        totalMovements: 19,
        precisionPercent: 99.8
      };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Dashboard
  async getDashboardSummary() {
    return request('/dashboard/summary');
  },

  async getLowStockAlerts() {
    return request('/alerts/low-stock');
  },

  // Suppliers
  async getSuppliers() {
    return request('/suppliers');
  },

  async createSupplier(supplier) {
    return request('/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        name: supplier.name,
        phone: supplier.phone || '',
        leadTimeDays: Number(supplier.leadTimeDays)
      })
    });
  },

  async updateSupplier(id, supplier) {
    return request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: supplier.name,
        phone: supplier.phone || '',
        leadTimeDays: Number(supplier.leadTimeDays)
      })
    });
  },

  // Products
  async getProducts() {
    return request('/products');
  },

  async createProduct(product) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify({
        sku: product.sku.trim().toUpperCase(),
        name: product.name.trim(),
        supplierId: Number(product.supplierId),
        minStock: Number(product.minStock),
        sellingPrice: Number(product.sellingPrice)
      })
    });
  },

  async updateProduct(id, product) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        sku: product.sku.trim().toUpperCase(),
        name: product.name.trim(),
        supplierId: Number(product.supplierId),
        minStock: Number(product.minStock),
        sellingPrice: Number(product.sellingPrice)
      })
    });
  },

  // Stock Transactions
  async getStockHistory(productId = null) {
    const query = productId ? `?productId=${productId}` : '';
    return request(`/stock-transactions${query}`);
  },

  async recordStockMovement(data) {
    return request('/stock-transactions', {
      method: 'POST',
      body: JSON.stringify({
        productId: Number(data.productId),
        type: data.type,
        reason: data.reason,
        quantity: Number(data.quantity)
      })
    });
  },

  // Purchase Orders
  async getPurchaseOrders() {
    return request('/purchase-orders');
  },

  async getPurchaseOrder(id) {
    return request(`/purchase-orders/${id}`);
  },

  async createPurchaseOrder(po) {
    return request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify({
        supplierId: Number(po.supplierId),
        expectedAt: po.expectedAt || null,
        items: po.items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost)
        }))
      })
    });
  },

  async receivePurchaseOrder(id) {
    return request(`/purchase-orders/${id}/receive`, {
      method: 'POST'
    });
  },

  // Sales Reports
  async getSalesReport(from, to) {
    return request(`/reports/sales?from=${from}&to=${to}`);
  },

  // AI & Analytics
  async getDemandForecast(productId, days = 7) {
    return request(`/ai/forecast?productId=${productId}&days=${days}`);
  },

  async getStockInsights(productId) {
    return request(`/ai/stock-insights?productId=${productId}`);
  },

  async getPurchaseRecommendations() {
    return request('/ai/purchase-recommendations');
  },

  async askAi(question) {
    return request('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  }
};
