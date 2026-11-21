import React, { useState } from 'react';

export const WarehousePieChart = ({ warehouseData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Default regional data if not supplied
  const data = warehouseData || [
    { name: 'Valencia Warehouse', count: 410419, color: '#38bdf8' },
    { name: 'Florida Warehouse', count: 219613, color: '#10b981' },
    { name: 'Texas Warehouse', count: 206907, color: '#f59e0b' },
    { name: 'Chicago Warehouse', count: 26336, color: '#f97316' },
    { name: 'Brooklyn Warehouse', count: 21475, color: '#a855f7' },
  ];

  const total = data.reduce((acc, item) => acc + item.count, 0);

  // Calculate SVG Pie/Donut Slices
  let accumulatedAngle = 0;
  const radius = 80;
  const strokeWidth = 32;
  const normalizedRadius = radius;
  const circumference = 2 * Math.PI * normalizedRadius;

  return (
    <div className="warehouse-donut-card">
      <div className="donut-card-header">
        <h3 className="donut-card-title">Products by Warehouse</h3>
      </div>

      <div className="donut-chart-layout">
        {/* SVG Donut Visual */}
        <div className="donut-svg-wrapper">
          <svg width="220" height="220" viewBox="0 0 220 220" className="donut-svg">
            <g transform="translate(110, 110) rotate(-90)">
              {data.map((item, index) => {
                const fraction = item.count / total;
                const strokeDasharray = `${fraction * circumference} ${circumference}`;
                const strokeDashoffset = -(accumulatedAngle * circumference);
                accumulatedAngle += fraction;
                const isHovered = hoveredIndex === index;

                return (
                  <circle
                    key={item.name}
                    r={normalizedRadius}
                    cx="0"
                    cy="0"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="donut-slice"
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </g>
          </svg>

          {/* Donut Center Total Label */}
          <div className="donut-center-label">
            <span className="donut-total-title">Total</span>
            <span className="donut-total-number">
              {hoveredIndex !== null 
                ? data[hoveredIndex].count.toLocaleString('en-IN')
                : total.toLocaleString('en-IN')}
            </span>
            <span className="donut-center-sub">
              {hoveredIndex !== null ? data[hoveredIndex].name.split(' ')[0] : 'All Hubs'}
            </span>
          </div>
        </div>

        {/* Legend Breakdown List */}
        <div className="donut-legend-list">
          {data.map((item, index) => {
            const percentage = ((item.count / total) * 100).toFixed(1);
            const isHovered = hoveredIndex === index;

            return (
              <div 
                key={item.name} 
                className={`donut-legend-row ${isHovered ? 'legend-row-hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="legend-color-box" style={{ backgroundColor: item.color }}></div>
                <div className="legend-row-info">
                  <span className="legend-warehouse-name">{item.name}</span>
                  <span className="legend-units-count">{item.count.toLocaleString('en-IN')} units ({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
