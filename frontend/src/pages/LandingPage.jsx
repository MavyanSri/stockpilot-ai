import React, { useState } from 'react';
import { Icon } from '../components/Icons';
import warehouseHeroImg from '../assets/warehouse-hero.jpg';

export const LandingPage = ({ 
  isAuthenticated, 
  user, 
  onOpenAuth, 
  onOpenDashboard, 
  onOpenSearch, 
  onReplayIntro 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navMenuItems = [
    { id: 'dashboard', label: 'Executive Overview', desc: 'Real-time KPIs & alerts' },
    { id: 'products', label: 'Inventory Catalog', desc: 'SKUs, stock counts & pricing' },
    { id: 'suppliers', label: 'Suppliers Directory', desc: 'Lead-time tracking & vendors' },
    { id: 'transactions', label: 'Stock Movement', desc: 'Inbound, outbound & adjustments' },
    { id: 'orders', label: 'Purchase Orders', desc: 'Procurement & auto-reorder' },
    { id: 'reports', label: 'Financial & Sales', desc: 'Margin reports & revenue analytics' },
    { id: 'ai', label: 'AI Forecasting Engine', desc: 'Demand prediction & assistant' },
  ];

  const handleMenuClick = (tabId) => {
    setMenuOpen(false);
    if (isAuthenticated) {
      onOpenDashboard(tabId);
    } else {
      onOpenAuth(tabId);
    }
  };

  const handleActionClick = (targetTab = 'dashboard') => {
    if (isAuthenticated) {
      onOpenDashboard(targetTab);
    } else {
      onOpenAuth(targetTab);
    }
  };

  return (
    <div className="landing-single-shade-container">
      {/* 1. Josh Comeau Style Navbar (Image 2 Match: Links in center, Search icon on right) */}
      <header className="landing-navbar-josh-style">
        <div className="landing-nav-left">
          <div className="landing-brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-logo-icon">
              <Icon name="box" size={22} color="#38bdf8" />
            </div>
            <span className="brand-title-text">StockPilot</span>
            <span className="brand-ai-badge">AI</span>
          </div>
        </div>

        {/* Center Links matching Josh Comeau's Categories, Courses, Goodies, About */}
        <nav className="landing-nav-center-links">
          <button className="nav-text-link" onClick={() => handleActionClick('products')}>
            Inventory
          </button>
          <button className="nav-text-link" onClick={() => handleActionClick('transactions')}>
            Movements
          </button>
          <button className="nav-text-link" onClick={() => handleActionClick('orders')}>
            Orders
          </button>
          <button className="nav-text-link" onClick={() => handleActionClick('ai')}>
            AI Forecast
          </button>
          <button className="nav-text-link" onClick={() => {
            document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            About
          </button>
        </nav>

        <div className="landing-nav-right">
          {/* Josh Comeau Search Icon (Image 2 Match: Just the clean round icon, NO bulky text input!) */}
          <button 
            className="nav-search-icon-btn"
            onClick={onOpenSearch}
            title="Search products, SKUs, warehouses (Press /)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Professional Menu Button */}
          <button 
            className={`landing-menu-btn ${menuOpen ? 'menu-active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            title="Open platform menu"
          >
            <span className="menu-hamburger-icon">
              <span></span>
              <span></span>
            </span>
            <span className="menu-btn-label">Menu</span>
          </button>

          {/* Sign In / Dashboard CTA */}
          {isAuthenticated ? (
            <button 
              className="landing-auth-btn auth-btn-active"
              onClick={() => onOpenDashboard('dashboard')}
            >
              <span>Dashboard ({user?.name?.split(' ')[0] || 'User'})</span>
              <span className="btn-arrow-icon">&rarr;</span>
            </button>
          ) : (
            <button 
              className="landing-auth-btn"
              onClick={() => onOpenAuth('dashboard')}
            >
              <span>Sign In / Register</span>
              <span className="btn-arrow-icon">&rarr;</span>
            </button>
          )}
        </div>
      </header>

      {/* Professional Slide-Out Mega Menu Drawer (Ultra-Modern Glassmorphic CSS) */}
      {menuOpen && (
        <div className="menu-dropdown-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-dropdown-card-pro" onClick={(e) => e.stopPropagation()}>
            <div className="menu-dropdown-header-pro">
              <div className="menu-header-badge">
                <span className="menu-glow-dot"></span>
                <span>PLATFORM MODULES</span>
              </div>
              <button className="menu-close-btn-pro" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="menu-items-list-pro">
              {navMenuItems.map((item, index) => (
                <button
                  key={item.id}
                  className="menu-item-card-pro"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <div className="menu-card-indicator"></div>
                  <div className="menu-item-text-group">
                    <span className="menu-item-title-pro">{item.label}</span>
                    <span className="menu-item-desc-pro">{item.desc}</span>
                  </div>
                  <span className="menu-item-arrow-pro">&rarr;</span>
                </button>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="menu-pro-footer">
                <div className="menu-footer-auth-box">
                  <p>Access live database records, purchase orders & inventory telemetry</p>
                  <button className="btn-menu-sign-in" onClick={() => { setMenuOpen(false); onOpenAuth('dashboard'); }}>
                    Sign In to Workspace &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Full-Container 3D Warehouse Hero Section with Cloud Waves & Slow Motion Entrance */}
      <section className="landing-hero-full-container">
        {/* Full background 3D warehouse image */}
        <div className="hero-full-bg-layer">
          <img 
            src={warehouseHeroImg} 
            alt="StockPilot 3D Warehouse" 
            className="hero-full-bg-image"
          />
          <div className="hero-left-ambient-scrim"></div>
        </div>

        {/* Hero Text Content on the Left with Slow Motion Stagger Animation */}
        <div className="hero-left-content-wrapper slow-motion-entrance">
          <h1 className="hero-main-title-cinematic">
            Your Stock.<br />
            <span className="hero-gradient-text">Our Priority.</span>
          </h1>

          <p className="hero-lead-text-cinematic">
            Seamless stock tracking, predictive AI demand forecasting, supplier lead-time intelligence, and automated purchase orders &mdash; all in one place.
          </p>

          <div className="hero-cta-group-cinematic">
            <button 
              className="btn-hero-primary-cinematic"
              onClick={() => handleActionClick('dashboard')}
            >
              <span>{isAuthenticated ? 'Open Executive Dashboard' : 'Launch Dashboard'}</span>
              <span className="cta-arrow-symbol">&rarr;</span>
            </button>

            <button 
              className="btn-hero-secondary-cinematic"
              onClick={() => handleActionClick('products')}
            >
              <span>Explore Inventory</span>
            </button>
          </div>
        </div>

        {/* Cloud Wave Bottom Border across the entire Hero section */}
        <div className="hero-cloud-bottom-waves">
          <svg className="cloud-wave-back" viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C240,15 480,75 720,35 C960,5 1200,65 1440,25 L1440,90 L0,90 Z" fill="#0b1328" opacity="0.6"/>
          </svg>
          <svg className="cloud-wave-front" viewBox="0 0 1440 70" preserveAspectRatio="none">
            <path d="M0,30 C300,5 600,60 900,20 C1140,-5 1320,40 1440,15 L1440,70 L0,70 Z" fill="#080d1a"/>
          </svg>
        </div>
      </section>

      {/* 3. "Engineered for Flawless Warehouse Control" Section: Logos & Database-Backed Click Functionality */}
      <section className="landing-cards-section">
        <div className="section-header-centered">
          <span className="section-eyebrow-tag">ENTERPRISE SUPPLY INTELLIGENCE</span>
          <h2 className="section-heading-white">Engineered for Flawless Warehouse Control</h2>
          <p className="section-subtext-muted">
            High-precision stock tracking, automated supplier cycles, and predictive neural demand intelligence.
          </p>
        </div>

        <div className="codecademy-cards-grid">
          {/* Card 1: Precision Stock Ledger (Click -> Products Catalog) */}
          <div className="neo-codecademy-card" onClick={() => handleActionClick('products')}>
            <div className="card-top-logo-row">
              <div className="tech-logo-container logo-amber">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
            </div>
            <h3 className="card-main-title">
              Real-Time SKU Velocity & Safety Buffer
            </h3>
            <p className="card-body-description">
              Tracks on-hand inventory across multiple bins in real-time. Automatically computes dynamic safety thresholds based on 7-day movement velocity to eliminate stockouts.
            </p>
            <div className="card-bottom-metadata">
              <span className="meta-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
                Precision Ledger
              </span>
              <span className="meta-right">&lt; 50ms Sync</span>
            </div>
          </div>

          {/* Card 2: Neural AI Forecast (Click -> AI Forecasting) */}
          <div className="neo-codecademy-card" onClick={() => handleActionClick('ai')}>
            <div className="card-top-logo-row">
              <div className="tech-logo-container logo-emerald">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
            </div>
            <h3 className="card-main-title">
              Predictive Demand & Reorder AI
            </h3>
            <p className="card-body-description">
              Machine learning forecasting models predict daily consumption spikes, supplier lead times, and seasonal variance to recommend exact reorder quantities.
            </p>
            <div className="card-bottom-metadata">
              <span className="meta-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                Neural Modeling
              </span>
              <span className="meta-right">99.8% Accuracy</span>
            </div>
          </div>

          {/* Card 3: Autonomous Procurement (Click -> Purchase Orders) */}
          <div className="neo-codecademy-card" onClick={() => handleActionClick('orders')}>
            <div className="card-top-logo-row">
              <div className="tech-logo-container logo-sky">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
            </div>
            <h3 className="card-main-title">
              Autonomous Purchase Order Lifecycle
            </h3>
            <p className="card-body-description">
              Generates zero-deficit purchase orders when stock approaches minimum levels. Tracks supplier fulfillment status from creation to dockside physical receiving.
            </p>
            <div className="card-bottom-metadata">
              <span className="meta-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Zero Deficit
              </span>
              <span className="meta-right">Auto-Trigger</span>
            </div>
          </div>

          {/* Card 4: Financial Ledger (Click -> Sales Reports) */}
          <div className="neo-codecademy-card" onClick={() => handleActionClick('reports')}>
            <div className="card-top-logo-row">
              <div className="tech-logo-container logo-rose">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
            </div>
            <h3 className="card-main-title">
              Financial Ledger & Sales Intelligence
            </h3>
            <p className="card-body-description">
              Real-time visibility into sales velocity, unit gross margins, and inventory valuation. Full immutable audit trail of every stock in, out, and adjustment transaction.
            </p>
            <div className="card-bottom-metadata">
              <span className="meta-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Audit Trail
              </span>
              <span className="meta-right">100% Traceable</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comprehensive About Section */}
      <section className="landing-about-section" id="about-section">
        <div className="about-inner-container">
          <div className="about-header-text">
            <span className="section-eyebrow-tag">ABOUT STOCKPILOT AI</span>
            <h2 className="about-main-heading">
              The Intelligent Operating System for Modern Logistics
            </h2>
            <p className="about-sub-description">
              StockPilot AI bridges physical warehouse dock operations and automated financial procurement. By unifying real-time barcode telemetry, multi-supplier lead forecasting, and algorithmic safety thresholding, we eliminate stockouts before they occur.
            </p>
          </div>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <div className="pillar-num">01</div>
              <h4>Distributed Fulfillment</h4>
              <p>
                Seamlessly balance stock quantities across regional fulfillment hubs (Valencia, Florida, Texas, Chicago, Brooklyn).
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="pillar-num">02</div>
              <h4>Predictive Purchasing</h4>
              <p>
                Dynamic lead-time intelligence automatically accounts for vendor manufacturing times, creating purchase orders at the optimal replenishment window.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="pillar-num">03</div>
              <h4>Role-Based Security</h4>
              <p>
                Granular separation of authority: warehouse floor personnel execute rapid scanning and stock disbursements, while executives manage suppliers and financial margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cloud Design Footer (Cloud top wave, no operational button) */}
      <footer className="landing-cloud-footer">
        {/* Scalloped Cloud Top Wave Border */}
        <div className="footer-cloud-top-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path 
              d="M0,35 
                 Q45,0 90,35 Q135,0 180,35 Q225,0 270,35 Q315,0 360,35 
                 Q405,0 450,35 Q495,0 540,35 Q585,0 630,35 Q675,0 720,35 
                 Q765,0 810,35 Q855,0 900,35 Q945,0 990,35 Q1035,0 1080,35 
                 Q1125,0 1170,35 Q1215,0 1260,35 Q1305,0 1350,35 Q1395,0 1440,35 
                 V60 H0 Z" 
              fill="#060913"
            />
          </svg>
        </div>

        <div className="footer-cloud-content-container">
          <div className="footer-top-columns">
            <div className="footer-col footer-col-brand">
              <div className="landing-brand-logo">
                <div className="brand-logo-icon">
                  <Icon name="box" size={20} color="#38bdf8" />
                </div>
                <span className="brand-title-text">StockPilot AI</span>
              </div>
              <p className="footer-brand-motto">
                Next-generation autonomous warehouse orchestration and inventory intelligence platform.
              </p>
            </div>

            <div className="footer-col">
              <h5 className="footer-col-title">Capabilities</h5>
              <ul className="footer-links">
                <li><button onClick={() => handleActionClick('products')}>Real-Time SKU Ledger</button></li>
                <li><button onClick={() => handleActionClick('transactions')}>Inbound & Outbound Audit</button></li>
                <li><button onClick={() => handleActionClick('orders')}>Autonomous Reorder Engine</button></li>
                <li><button onClick={() => handleActionClick('ai')}>AI Demand Forecasting</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5 className="footer-col-title">Regional Hubs</h5>
              <ul className="footer-links">
                <li><span>Valencia Warehouse</span></li>
                <li><span>Florida Fulfillment Hub</span></li>
                <li><span>Texas Logistics Center</span></li>
                <li><span>Chicago Distribution Center</span></li>
                <li><span>Brooklyn Express Dock</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5 className="footer-col-title">Portals</h5>
              <ul className="footer-links">
                <li><button onClick={() => onOpenAuth('dashboard')}>Administrator Sign In</button></li>
                <li><button onClick={() => onOpenAuth('products')}>Warehouse Staff Workspace</button></li>
                <li><button onClick={onReplayIntro}>Replay Intro Animation</button></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <span className="footer-copy-text">&copy; 2026 StockPilot AI Inc. All rights reserved.</span>
            <div className="footer-bottom-badges">
              <span>SOC-2 Type II Certified</span>
              <span>&bull;</span>
              <span>Enterprise SLA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
