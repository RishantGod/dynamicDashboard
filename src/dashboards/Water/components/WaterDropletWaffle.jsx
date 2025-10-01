import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function WaterDropletWaffle({ percentage, size = 120, animate = true }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate individual water droplet path
  const generateDropletPath = (centerX, centerY, dropletSize) => {
    const width = dropletSize * 0.8;
    const height = dropletSize * 0.9;
    const radius = width / 2;
    const tipHeight = height * 0.35;
    const bulbHeight = height * 0.65;
    
    return `
      M ${centerX} ${centerY - height/2}
      C ${centerX - radius*0.3} ${centerY - height/2 + tipHeight*0.4},
        ${centerX - radius*0.7} ${centerY - height/2 + tipHeight*0.8},
        ${centerX - radius} ${centerY - height/2 + tipHeight + bulbHeight*0.2}
      A ${radius} ${radius} 0 0 0 ${centerX + radius} ${centerY - height/2 + tipHeight + bulbHeight*0.2}
      C ${centerX + radius*0.7} ${centerY - height/2 + tipHeight*0.8},
        ${centerX + radius*0.3} ${centerY - height/2 + tipHeight*0.4},
        ${centerX} ${centerY - height/2}
      Z
    `;
  };

  // Generate 10x10 grid of droplets
  const generateDropletGrid = () => {
    const gridSize = 10;
    const totalDroplets = 100;
    const filledDroplets = Math.floor(percentage);
    const padding = size * 0.05;
    const availableSpace = size - (2 * padding);
    const cellSize = availableSpace / gridSize;
    const droplets = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const x = padding + col * cellSize + cellSize / 2;
        const y = padding + row * cellSize + cellSize / 2;
        
        droplets.push({
          x: x,
          y: y,
          size: cellSize,
          index: index,
          row: row,
          col: col,
          isFilled: index < filledDroplets
        });
      }
    }
    
    return droplets;
  };

  // Ref to track previous percentage for smooth transitions
  const prevPercentageRef = useRef(percentage);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Only initialize once
    if (!isInitializedRef.current) {
      svg.selectAll("*").remove();
      
      // Create gradients for filled and empty droplets
      const defs = svg.append('defs');
      
      // Filled droplet gradient
      const filledGradient = defs.append('linearGradient')
        .attr('id', 'filledDropletGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      filledGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#87ceeb')
        .attr('stop-opacity', 1);

      filledGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#3498db')
        .attr('stop-opacity', 1);

      filledGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2980b9')
        .attr('stop-opacity', 1);

      // Empty droplet gradient
      const emptyGradient = defs.append('linearGradient')
        .attr('id', 'emptyDropletGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      emptyGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#f8f9fa')
        .attr('stop-opacity', 1);

      emptyGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#e9ecef')
        .attr('stop-opacity', 1);

      isInitializedRef.current = true;
    }

    // Generate current droplet grid
    const droplets = generateDropletGrid();
    const prevPercentage = prevPercentageRef.current;
    const currentFilledCount = Math.floor(percentage);
    const prevFilledCount = Math.floor(prevPercentage);

    // Bind data to existing droplets or create new ones
    const dropletElements = svg.selectAll('.droplet')
      .data(droplets, d => d.index);

    // Enter new droplets (first time only)
    const enteringDroplets = dropletElements
      .enter()
      .append('path')
      .attr('class', 'droplet')
      .attr('d', d => generateDropletPath(d.x, d.y, d.size))
      .attr('fill', d => d.isFilled ? 'url(#filledDropletGradient)' : 'url(#emptyDropletGradient)')
      .attr('stroke', d => d.isFilled ? '#2980b9' : '#bdc3c7')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0)
      .style('cursor', 'pointer');

    // Merge enter + update selections
    const allDroplets = enteringDroplets.merge(dropletElements);

    // Initial animation for new droplets only
    if (!isInitializedRef.current || animate) {
      enteringDroplets
        .transition()
        .duration(600)
        .delay((d, i) => Math.floor(i / 10) * 50 + (i % 10) * 20)
        .ease(d3.easeBackOut.overshoot(1.2))
        .attr('opacity', 1);
    } else {
      enteringDroplets.attr('opacity', 1);
    }

    // Instant update for droplets that change state
    if (currentFilledCount !== prevFilledCount) {
      // Update all droplets immediately based on their current state
      allDroplets
        .attr('fill', d => d.isFilled ? 'url(#filledDropletGradient)' : 'url(#emptyDropletGradient)')
        .attr('stroke', d => d.isFilled ? '#2980b9' : '#bdc3c7');
    }

    // Add hover effects to all droplets
    allDroplets
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', `translate(${d.x}, ${d.y}) scale(1.2) translate(${-d.x}, ${-d.y})`)
          .attr('opacity', 1);
        
        setTooltip({
          dropletIndex: d.index + 1,
          totalDroplets: 100,
          isFilled: d.isFilled,
          percentage: percentage,
          position: `Row ${d.row + 1}, Column ${d.col + 1}`
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', `translate(${d.x}, ${d.y}) scale(1) translate(${-d.x}, ${-d.y})`)
          .attr('opacity', 1);
        
        setTooltip(null);
      });

    // No percentage text overlay needed - percentage is shown in BAN

    // Update the previous percentage reference
    prevPercentageRef.current = percentage;

  }, [percentage, size, animate]);

  return (
    <div 
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{
          display: 'block'
        }}
      />
      
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 10,
          top: mousePos.y - 10,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#3498db' }}>
            Droplet {tooltip.dropletIndex} of {tooltip.totalDroplets}
          </div>
          <div style={{ marginBottom: '2px' }}>
            Status: {tooltip.isFilled ? '💧 Recycled Water' : '⭕ Fresh Water'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '2px' }}>
            {tooltip.position}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ccc' }}>
            Overall: {Math.floor(tooltip.percentage)}% recycled
          </div>
        </div>
      )}
    </div>
  );
}

export default WaterDropletWaffle;