import React, { useState } from 'react';

export const MostShippedChart = () => {
  const [selectedProduct, setSelectedProduct] = useState('all');

  const days = ['1, Aug', '2, Aug', '3, Aug', '4, Aug', '5, Aug', '6, Aug', '7, Aug', '8, Aug', '9, Aug', '10, Aug', '11, Aug', '12, Aug', '13, Aug', '14, Aug'];

  return (
    <div className="most-shipped-card">
      <div className="chart-header-row">
        <div>
          <h3 className="chart-heading">Most Shipped Products</h3>
          <p className="chart-subheading">Outbound distribution velocity across fulfillment channels</p>
        </div>

        <div className="chart-filters-group">
          <div className="date-range-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>01/7/2026 &nbsp;To&nbsp; 28/8/2026</span>
          </div>

          <select 
            className="chart-product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Top SKUs</option>
            <option value="scanners">Wireless Barcode Scanners</option>
            <option value="labels">Thermal Shipping Labels</option>
            <option value="sensors">IoT Weight Sensors</option>
          </select>
        </div>
      </div>

      <div className="chart-canvas-container">
        {/* SVG Spline Multi-Line Chart */}
        <svg viewBox="0 0 800 240" className="spline-chart-svg" preserveAspectRatio="none">
          <defs>
            {/* Orange Gradient */}
            <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
            {/* Purple Gradient */}
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y-axis labels */}
          {[20, 60, 100, 140, 180, 220].map((y, idx) => (
            <g key={y}>
              <line x1="40" y1={y} x2="790" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
              <text x="15" y={y + 4} fill="#64748b" fontSize="10" fontFamily="'JetBrains Mono', monospace">
                {100 - idx * 20}
              </text>
            </g>
          ))}

          {/* Curve 1: Orange - Wireless Barcode Scanners */}
          {(selectedProduct === 'all' || selectedProduct === 'scanners') && (
            <>
              <path
                d="M 40,220 C 80,180 120,150 180,110 C 220,80 260,115 300,140 C 350,165 400,110 460,75 C 500,60 540,110 580,95 C 640,75 700,50 780,20"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 40,220 C 80,180 120,150 180,110 C 220,80 260,115 300,140 C 350,165 400,110 460,75 C 500,60 540,110 580,95 C 640,75 700,50 780,20 L 780,220 L 40,220 Z"
                fill="url(#orangeGrad)"
              />
            </>
          )}

          {/* Curve 2: Purple - Thermal Shipping Labels */}
          {(selectedProduct === 'all' || selectedProduct === 'labels') && (
            <>
              <path
                d="M 40,220 C 90,175 130,170 180,145 C 230,120 270,160 330,155 C 380,150 430,195 490,130 C 530,90 580,95 630,130 C 680,160 730,120 780,85"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M 40,220 C 90,175 130,170 180,145 C 230,120 270,160 330,155 C 380,150 430,195 490,130 C 530,90 580,95 630,130 C 680,160 730,120 780,85 L 780,220 L 40,220 Z"
                fill="url(#purpleGrad)"
              />
            </>
          )}

          {/* Curve 3: Yellow - Industrial IoT Weight Sensors */}
          {(selectedProduct === 'all' || selectedProduct === 'sensors') && (
            <path
              d="M 40,220 C 90,210 140,200 200,205 C 260,210 320,195 380,210 C 440,220 500,175 550,150 C 600,140 650,185 700,175 C 740,170 760,155 780,140"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* X-axis dates */}
        <div className="chart-x-axis-labels">
          {days.map((d) => (
            <span key={d} className="x-label">{d}</span>
          ))}
        </div>
      </div>

      {/* Legend Indicator Pills */}
      <div className="chart-legend-row">
        <div className="legend-chip">
          <span className="dot dot-orange"></span>
          <span>Wireless Scanners (SKU-BAR-9901)</span>
        </div>
        <div className="legend-chip">
          <span className="dot dot-purple"></span>
          <span>Thermal Labels (SKU-LBL-1020)</span>
        </div>
        <div className="legend-chip">
          <span className="dot dot-yellow"></span>
          <span>IoT Weight Sensors (SKU-SEN-4040)</span>
        </div>
      </div>
    </div>
  );
};
