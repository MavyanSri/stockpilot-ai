import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { api } from '../api/api';

export const CloudSearchModal = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      // load search cache
      Promise.all([api.getProducts(), api.getSuppliers()])
        .then(([prods, sups]) => {
          setProducts(prods || []);
          setSuppliers(sups || []);
        })
        .catch(() => {});
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedProducts = trimmed ? products.filter(p => 
    p.name.toLowerCase().includes(trimmed) || p.sku.toLowerCase().includes(trimmed)
  ).slice(0, 6) : [];

  const matchedSuppliers = trimmed ? suppliers.filter(s => 
    s.name.toLowerCase().includes(trimmed) || (s.phone && s.phone.includes(trimmed))
  ).slice(0, 3) : [];

  const handleSelect = (tab) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="cloud-search-overlay" onClick={onClose}>
      <div className="cloud-search-container" onClick={(e) => e.stopPropagation()}>
        {/* Josh Comeau Scalloped White Cloud Shape */}
        <div className="josh-cloud-search-card">
          <button className="cloud-search-close-btn" onClick={onClose} aria-label="Close search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="josh-cloud-inner-content">
            <div className="josh-search-input-line">
              <span className="josh-search-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="josh-search-text-input"
                placeholder="Search products, SKUs, warehouses, suppliers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="josh-blue-underline"></div>

            <p className="josh-search-sub-hint">
              Search through all of the products, inventory balances, and supplier records on my site.
            </p>

            {/* Live Instant Search Results */}
            {trimmed && (
              <div className="josh-search-results-list">
                {matchedProducts.length > 0 && (
                  <div className="josh-results-section">
                    <span className="josh-results-title">PRODUCTS & SKUs ({matchedProducts.length})</span>
                    {matchedProducts.map(p => (
                      <div 
                        key={p.id} 
                        className="josh-result-row"
                        onClick={() => handleSelect('products')}
                      >
                        <div className="josh-row-title-area">
                          <span className="josh-row-name">{p.name}</span>
                          <span className="josh-row-sku">{p.sku}</span>
                        </div>
                        <span className="josh-row-stock">{p.currentStock} in stock</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedSuppliers.length > 0 && (
                  <div className="josh-results-section">
                    <span className="josh-results-title">SUPPLIERS ({matchedSuppliers.length})</span>
                    {matchedSuppliers.map(s => (
                      <div 
                        key={s.id} 
                        className="josh-result-row"
                        onClick={() => handleSelect('suppliers')}
                      >
                        <span className="josh-row-name">{s.name}</span>
                        <span className="josh-row-lead">{s.leadTimeDays}d lead-time</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedProducts.length === 0 && matchedSuppliers.length === 0 && (
                  <div className="josh-no-results">
                    No records found matching "{query}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scalloped Pure White Cloud Bottom Edge (Josh Comeau Style) */}
          <div className="josh-scalloped-cloud-edge">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
              <path 
                d="M0,0 
                   Q45,55 90,0 Q135,55 180,0 Q225,55 270,0 Q315,55 360,0 
                   Q405,55 450,0 Q495,55 540,0 Q585,55 630,0 Q675,55 720,0 
                   Q765,55 810,0 Q855,55 900,0 Q945,55 990,0 Q1035,55 1080,0 
                   Q1125,55 1170,0 Q1215,55 1260,0 Q1305,55 1350,0 Q1395,55 1440,0 
                   V0 H0 Z" 
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
