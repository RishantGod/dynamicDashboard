import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PopulationChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 200 }); // Better initial dimensions
  
  // Use useRef to get container dimensions
  const containerRef = React.useRef();
  
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Leave some padding for the card padding and margins
        setDimensions({
          width: Math.max(clientWidth - 40, 300), // Minimum 300px width
          height: Math.max(clientHeight - 40, 150) // Minimum 150px height
        });
      }
    };
    
    // Initial measurement with a small delay to ensure grid is laid out
    const timer = setTimeout(updateDimensions, 100);
    
    // Also trigger on next frame to catch any late layout changes
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateDimensions);
    });
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [data]); // Add data dependency to recalculate when data changes

  const { width, height } = dimensions;
  // Adjust margins proportionally to container size
  const margin = { 
    top: Math.max(height * 0.08, 10), 
    right: Math.max(width * 0.06, 20), 
    bottom: Math.max(height * 0.15, 20), 
    left: Math.max(width * 0.12, 50) 
  };

  // D3 calculations only
  const { x, y, areaPath, linePath, yTicks, xTicks, currentYearX } = useMemo(() => {
    if (!data || data.length === 0) {
      return { x: () => 0, y: () => 0, areaPath: '', linePath: '', yTicks: [], xTicks: [], currentYearX: 0 };
    }
    const x = d3.scaleLinear()
      .domain([data[0].year, data[data.length - 1].year])
      .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.population) * 1.1])
      .range([height - margin.bottom, margin.top]);

    const areaGen = d3.area()
      .x(d => x(d.year))
      .y0(y(0))
      .y1(d => y(d.population))
      .curve(d3.curveMonotoneX);
    const lineGen = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.population))
      .curve(d3.curveMonotoneX);

    // Axis ticks
    const yTicks = y.ticks(5);
    const xTicks = x.ticks(6).map(t => Math.round(t));

    // Find x position for current year
    const currentYear = new Date().getFullYear();
    const currentYearX = x(currentYear);

    return {
      x,
      y,
      areaPath: areaGen(data),
      linePath: lineGen(data),
      yTicks,
      xTicks,
      currentYearX
    };
  }, [data]);

  return (
    <div className="population-chart-container" ref={containerRef}>
      <div className="population-chart-card">
        <svg width={width} height={height} className="population-chart-svg">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Y Axis */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y(tick)}
              y2={y(tick)}
              className="population-chart-grid-line"
            />
            <text
              x={margin.left - 6}
              y={y(tick) + 3}
              className="population-chart-y-label"
            >
              {tick.toLocaleString()}
            </text>
          </g>
        ))}
        {/* Y Axis Label */}
        <text
          x={margin.left - 35}
          y={(height - margin.bottom + margin.top) / 2}
          className="population-chart-axis-label"
          transform={`rotate(-90, ${margin.left - 35}, ${(height - margin.bottom + margin.top) / 2})`}
        >
          Population
        </text>
        {/* X Axis */}
        {xTicks.map((tick, i) => (
          <g key={i}>
            <line
              y1={height - margin.bottom}
              y2={margin.top}
              x1={x(tick)}
              x2={x(tick)}
              className="population-chart-grid-line"
            />
            <text
              y={height - margin.bottom + 15}
              x={x(tick)}
              className="population-chart-x-label"
            >
              {tick}
            </text>
          </g>
        ))}
        {/* X Axis Label */}
        <text
          x={(margin.left + width - margin.right) / 2}
          y={height - 5}
          className="population-chart-axis-label"
        >
          Year
        </text>
        {/* Area */}
        <path d={areaPath} className="population-chart-area-path" />
        {/* Line */}
        <path d={linePath} className="population-chart-line-path" />
        {/* Vertical line for current year */}
        <line
          x1={currentYearX}
          x2={currentYearX}
          y1={margin.top}
          y2={height - margin.bottom}
          className="population-chart-current-year-line"
        />
        {/* Circles and interactive tooltips */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={x(d.year)}
              cy={y(d.population)}
              r={4}
              className="population-chart-data-point"
              onMouseEnter={e => setTooltip({ x: x(d.year), y: y(d.population), year: d.year, population: d.population })}
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        ))}
        {/* Tooltip overlay (SVG for compatibility) */}
        {tooltip && (() => {
          // Tooltip box size
          const boxWidth = 140;
          const boxHeight = 54;
          const pad = 10;
          // Clamp tooltip x so it doesn't overflow chart
          let boxX = tooltip.x - boxWidth / 2;
          if (boxX < margin.left) boxX = margin.left;
          if (boxX + boxWidth > width - margin.right) boxX = width - margin.right - boxWidth;
          let boxY = tooltip.y - boxHeight - 8;
          if (boxY < margin.top) boxY = margin.top;
          return (
            <g className="population-chart-tooltip">
              <rect
                x={boxX}
                y={boxY}
                width={boxWidth}
                height={boxHeight}
                rx={8}
                className="population-chart-tooltip-rect"
              />
              <text
                x={boxX + boxWidth / 2}
                y={boxY + pad + 14}
                className="population-chart-tooltip-text"
              >
                Year: {tooltip.year}
              </text>
              <text
                x={boxX + boxWidth / 2}
                y={boxY + pad + 32}
                className="population-chart-tooltip-text"
              >
                Population: {tooltip.population.toLocaleString()}
              </text>
            </g>
          );
        })()}
        </svg>
      </div>
    </div>
  );
}

export default PopulationChart;
