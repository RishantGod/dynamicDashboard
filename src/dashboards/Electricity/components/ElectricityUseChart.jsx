import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function ElectricityUseChart({ totalElectricity, enabledInterventions, interventionFunding, campusFootfall }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Energy source mix data for grid electricity
  const gridEnergyMix = {
    coal: { percentage: 35, color: '#8B4513' },
    naturalGas: { percentage: 30, color: '#4169E1' },
    nuclear: { percentage: 15, color: '#FF4500' },
    hydroelectric: { percentage: 8, color: '#00CED1' },
    wind: { percentage: 7, color: '#32CD32' },
    solar: { percentage: 3, color: '#FFD700' },
    other: { percentage: 2, color: '#708090' }
  };

  // Solar production data
  const solarData = {
    capacity: '500 kW',
    dailyProduction: '2,400 kWh',
    efficiency: '18.5%',
    co2Saved: '1.2 tons/day',
    panels: 2000,
    area: '3,200 m²'
  };

  // Calculate solar and grid contributions
  const solarContribution = Math.min(totalElectricity * 0.15, 500 * 24 * 365); // Max 15% or solar capacity
  const gridContribution = totalElectricity - solarContribution;

  // Base electricity distribution across categories (percentages)
  const baseDistribution = {
    labs: 35,
    accommodation: 25,
    admin: 15,
    teaching: 15,
    itServers: 10
  };

  // Base load vs Variable load distribution for each category
  const loadCharacteristics = {
    labs: { baseLoad: 70, variable: 30 },
    accommodation: { baseLoad: 60, variable: 40 },
    admin: { baseLoad: 55, variable: 45 },
    teaching: { baseLoad: 40, variable: 60 },
    itServers: { baseLoad: 85, variable: 15 }
  };

  // Intervention effects on different categories
  const interventionEffects = {
    ledRetrofits: {
      labs: 0.88, accommodation: 0.85, admin: 0.87, teaching: 0.86, itServers: 0.90
    },
    smartControls: {
      labs: 0.85, accommodation: 0.82, admin: 0.83, teaching: 0.78, itServers: 0.88
    },
    behavioralCampaigns: {
      labs: 0.92, accommodation: 0.88, admin: 0.90, teaching: 0.85, itServers: 0.95
    },
    onsiteRenewables: {
      labs: 0.80, accommodation: 0.85, admin: 0.85, teaching: 0.85, itServers: 0.80
    },
    demandSideManagement: {
      labs: 0.90, accommodation: 0.88, admin: 0.89, teaching: 0.86, itServers: 0.92
    }
  };

  // Calculate adjusted electricity use for each category
  const calculateElectricityDistribution = () => {
    let adjustedDistribution = { ...baseDistribution };
    
    // Apply intervention effects
    Object.keys(enabledInterventions).forEach(intervention => {
      if (enabledInterventions[intervention] && interventionEffects[intervention]) {
        Object.keys(adjustedDistribution).forEach(category => {
          const effect = interventionEffects[intervention][category];
          const reductionFactor = 1 - ((1 - effect) * (interventionFunding / 100));
          adjustedDistribution[category] *= reductionFactor;
        });
      }
    });

    // Convert to absolute values
    const total = Object.values(adjustedDistribution).reduce((sum, val) => sum + val, 0);
    const result = {};
    Object.keys(adjustedDistribution).forEach(category => {
      result[category] = Math.round((adjustedDistribution[category] / total) * totalElectricity);
    });

    return result;
  };

  const electricityData = calculateElectricityDistribution();

  // Prepare data for D3
  const chartData = [
    { 
      category: 'Labs', 
      value: electricityData.labs, 
      color: '#e74c3c',
      baseLoad: loadCharacteristics.labs.baseLoad,
      variable: loadCharacteristics.labs.variable
    },
    { 
      category: 'Accommodation', 
      value: electricityData.accommodation, 
      color: '#c0392b',
      baseLoad: loadCharacteristics.accommodation.baseLoad,
      variable: loadCharacteristics.accommodation.variable
    },
    { 
      category: 'Admin', 
      value: electricityData.admin, 
      color: '#a93226',
      baseLoad: loadCharacteristics.admin.baseLoad,
      variable: loadCharacteristics.admin.variable
    },
    { 
      category: 'Teaching', 
      value: electricityData.teaching, 
      color: '#922b21',
      baseLoad: loadCharacteristics.teaching.baseLoad,
      variable: loadCharacteristics.teaching.variable
    },
    { 
      category: 'IT/Servers', 
      value: electricityData.itServers, 
      color: '#7b241c',
      baseLoad: loadCharacteristics.itServers.baseLoad,
      variable: loadCharacteristics.itServers.variable
    }
  ];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions
    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Set up SVG
    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
       .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Circle positions and properties
    const circleRadius = Math.min(width, height) * 0.12;
    const circles = [
      { 
        id: 'grid', 
        x: width * 0.15, 
        y: height * 0.80, 
        radius: 50, 
        color: '#c0392b', 
        icon: 'grid',
        label: 'Grid Supply',
        value: gridContribution
      },
      { 
        id: 'solar', 
        x: width * 0.15, 
        y: width * 0.15, 
        radius: 50, 
        color: '#f9ca24', 
        icon: 'solar',
        label: 'Solar Generation',
        value: solarContribution
      },
      { 
        id: 'university', 
        x: width * 0.85, 
        y: height * 0.50, 
        radius: 50, 
        color: '#e74c3c', 
        icon: 'university',
        label: 'University Consumption',
        value: totalElectricity
      }
    ];    // Create gradients for circles
    const defs = svg.append('defs');
    
    circles.forEach((circle, index) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${circle.id}`)
        .attr('cx', '30%')
        .attr('cy', '30%')
        .attr('r', '80%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(circle.color).brighter(0.3))
        .attr('stop-opacity', 1);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', circle.color)
        .attr('stop-opacity', 1);
    });

    // Draw connection lines
    const gridCircle = circles.find(c => c.id === 'grid');
    const solarCircle = circles.find(c => c.id === 'solar');
    const universityCircle = circles.find(c => c.id === 'university');
    
    const connections = [
      { from: gridCircle, to: universityCircle, color: gridCircle.color },
      { from: solarCircle, to: universityCircle, color: solarCircle.color }
    ];

    connections.forEach((conn, index) => {
      // Calculate connection points (edge of circles)
      const dx = conn.to.x - conn.from.x;
      const dy = conn.to.y - conn.from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const fromX = conn.from.x + (dx / distance) * conn.from.radius;
      const fromY = conn.from.y + (dy / distance) * conn.from.radius;
      const toX = conn.to.x - (dx / distance) * conn.to.radius;
      const toY = conn.to.y - (dy / distance) * conn.to.radius;

      // Create straight line path
      const pathData = `M ${fromX} ${fromY} L ${toX} ${toY}`;
      
      // Draw connection line
      g.append('line')
        .attr('x1', fromX)
        .attr('y1', fromY)
        .attr('x2', toX)
        .attr('y2', toY)
        .attr('stroke', conn.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);


      // Calculate flow rate based on energy contribution and factors
      let flowRate;
      const dotSize = 4; // Fixed dot size for all flows
      
      if (conn.from.id === 'grid') {
        // Grid flow increases with campus footfall and decreases with intervention funding
        const footfallFactor = (campusFootfall || 100) / 100; // Default to 100% if not provided
        const interventionReduction = (interventionFunding || 0) / 100 * 0.3; // Max 30% reduction
        flowRate = Math.max(0.3, 1 * footfallFactor * (1 - interventionReduction));
      } else if (conn.from.id === 'solar') {
        // Solar flow increases with intervention funding (more solar capacity)
        const interventionBoost = (interventionFunding || 0) / 100 * 2; // Up to 2x boost
        flowRate = Math.max(0.2, 0.4 + interventionBoost);
      }
      
      // Duration inversely proportional to flow rate (faster flow = shorter duration)
      const baseDuration = 4000;
      const duration = baseDuration / flowRate;
      
      // Interval between dots (higher flow = more frequent dots)
      const dotInterval = Math.max(800, 2000 / flowRate);
      
      // Create consistent flow animation
      const createFlowDot = () => {
        const dot = g.append('circle')
          .attr('r', dotSize)
          .attr('fill', conn.color)
          .attr('opacity', 0)
          .attr('cx', fromX)
          .attr('cy', fromY);

        // Fade in
        dot.transition()
          .duration(200)
          .attr('opacity', 0.8)
          .on('end', () => {
            // Move along the line
            dot.transition()
              .duration(duration)
              .ease(d3.easeLinear)
              .attr('cx', toX)
              .attr('cy', toY)
              .on('end', () => {
                // Fade out and remove
                dot.transition()
                  .duration(200)
                  .attr('opacity', 0)
                  .on('end', () => {
                    dot.remove();
                  });
              });
          });
      };
      
      // Start the continuous flow
      const startFlow = () => {
        createFlowDot();
        setTimeout(startFlow, dotInterval);
      };
      
      // Initial delay based on connection index to stagger different flows
      setTimeout(startFlow, index * 300);
    });

    // Draw circles
    circles.forEach((circle, index) => {
      
      // Circle background
      const circleGroup = g.append('g')
        .attr('class', `circle-${circle.id}`)
        .style('cursor', 'pointer');

      // Main circle - outline only
      circleGroup.append('circle')
        .attr('cx', circle.x)
        .attr('cy', circle.y)
        .attr('r', circle.radius)
        .attr('fill', 'none')
        .attr('stroke', circle.color)
        .attr('stroke-width', 4);

      // Icon
      const iconSize = circle.radius * 1;
      const iconGroup = circleGroup.append('g')
        .attr('transform', `translate(${circle.x - iconSize/2}, ${circle.y - iconSize/2 - 15})`); // Moved icon higher

      if (circle.icon === 'grid') {
        // Electrical grid/transmission tower icon - improved design
        // Main tower structure
        iconGroup.append('path')
          .attr('d', `M ${iconSize*0.5} ${iconSize*0.05} 
                     L ${iconSize*0.35} ${iconSize*0.25}
                     L ${iconSize*0.45} ${iconSize*0.25}
                     L ${iconSize*0.4} ${iconSize*0.45}
                     L ${iconSize*0.3} ${iconSize*0.45}
                     L ${iconSize*0.25} ${iconSize*0.65}
                     L ${iconSize*0.2} ${iconSize*0.95}
                     M ${iconSize*0.5} ${iconSize*0.05}
                     L ${iconSize*0.65} ${iconSize*0.25}
                     L ${iconSize*0.55} ${iconSize*0.25}
                     L ${iconSize*0.6} ${iconSize*0.45}
                     L ${iconSize*0.7} ${iconSize*0.45}
                     L ${iconSize*0.75} ${iconSize*0.65}
                     L ${iconSize*0.8} ${iconSize*0.95}`)
          .attr('stroke', circle.color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        
        // Power lines
        iconGroup.append('line')
          .attr('x1', iconSize * 0.05)
          .attr('y1', iconSize * 0.3)
          .attr('x2', iconSize * 0.95)
          .attr('y2', iconSize * 0.3)
          .attr('stroke', circle.color)
          .attr('stroke-width', 1.5);
          
        iconGroup.append('line')
          .attr('x1', iconSize * 0.1)
          .attr('y1', iconSize * 0.5)
          .attr('x2', iconSize * 0.9)
          .attr('y2', iconSize * 0.5)
          .attr('stroke', circle.color)
          .attr('stroke-width', 1.5);
          
        // Insulators
        for (let i = 0; i < 3; i++) {
          iconGroup.append('circle')
            .attr('cx', iconSize * (0.3 + i * 0.2))
            .attr('cy', iconSize * 0.3)
            .attr('r', iconSize * 0.02)
            .attr('fill', circle.color);
        }
      } else if (circle.icon === 'solar') {
        // Solar panel icon
        iconGroup.append('rect')
          .attr('x', iconSize * 0.1)
          .attr('y', iconSize * 0.3)
          .attr('width', iconSize * 0.8)
          .attr('height', iconSize * 0.5)
          .attr('stroke', circle.color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        
        // Grid lines on solar panel
        for (let i = 1; i < 4; i++) {
          iconGroup.append('line')
            .attr('x1', iconSize * 0.1 + (iconSize * 0.8 / 4) * i)
            .attr('y1', iconSize * 0.3)
            .attr('x2', iconSize * 0.1 + (iconSize * 0.8 / 4) * i)
            .attr('y2', iconSize * 0.8)
            .attr('stroke', circle.color)
            .attr('stroke-width', 1);
        }
        for (let i = 1; i < 3; i++) {
          iconGroup.append('line')
            .attr('x1', iconSize * 0.1)
            .attr('y1', iconSize * 0.3 + (iconSize * 0.5 / 3) * i)
            .attr('x2', iconSize * 0.9)
            .attr('y2', iconSize * 0.3 + (iconSize * 0.5 / 3) * i)
            .attr('stroke', circle.color)
            .attr('stroke-width', 1);
        }
      } else if (circle.icon === 'university') {
        // University building icon - improved design
        // Main building base
        iconGroup.append('rect')
          .attr('x', iconSize * 0.15)
          .attr('y', iconSize * 0.5)
          .attr('width', iconSize * 0.7)
          .attr('height', iconSize * 0.4)
          .attr('stroke', circle.color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        
        // Dome/cupola on top
        iconGroup.append('path')
          .attr('d', `M ${iconSize*0.35} ${iconSize*0.5} 
                     Q ${iconSize*0.5} ${iconSize*0.25} ${iconSize*0.65} ${iconSize*0.5}`)
          .attr('stroke', circle.color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
          
        // Spire on dome
        iconGroup.append('line')
          .attr('x1', iconSize * 0.5)
          .attr('y1', iconSize * 0.25)
          .attr('x2', iconSize * 0.5)
          .attr('y2', iconSize * 0.15)
          .attr('stroke', circle.color)
          .attr('stroke-width', 2);
        
        // Classical columns
        for (let i = 0; i < 4; i++) {
          const colX = iconSize * (0.22 + i * 0.14);
          iconGroup.append('line')
            .attr('x1', colX)
            .attr('y1', iconSize * 0.5)
            .attr('x2', colX)
            .attr('y2', iconSize * 0.75)
            .attr('stroke', circle.color)
            .attr('stroke-width', 3);
            
          // Column capitals
          iconGroup.append('line')
            .attr('x1', colX - iconSize * 0.02)
            .attr('y1', iconSize * 0.5)
            .attr('x2', colX + iconSize * 0.02)
            .attr('y2', iconSize * 0.5)
            .attr('stroke', circle.color)
            .attr('stroke-width', 2);
        }
        
        // Steps
        iconGroup.append('rect')
          .attr('x', iconSize * 0.1)
          .attr('y', iconSize * 0.85)
          .attr('width', iconSize * 0.8)
          .attr('height', iconSize * 0.05)
          .attr('stroke', circle.color)
          .attr('stroke-width', 1)
          .attr('fill', 'none');
          
        // Main entrance
        iconGroup.append('path')
          .attr('d', `M ${iconSize*0.45} ${iconSize*0.85} 
                     L ${iconSize*0.45} ${iconSize*0.75}
                     Q ${iconSize*0.5} ${iconSize*0.7} ${iconSize*0.55} ${iconSize*0.75}
                     L ${iconSize*0.55} ${iconSize*0.85}`)
          .attr('stroke', circle.color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
      }

      // Value text
      circleGroup.append('text')
        .attr('x', circle.x)
        .attr('y', circle.y + 28) // Moved text lower for more space
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', circle.color)
        .text(() => {
          const value = circle.value;
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M kWh`;
          } else {
            return `${(value / 1000).toFixed(0)}K kWh`;
          }
        });

      // Label
      g.append('text')
        .attr('x', circle.x)
        .attr('y', circle.id === 'solar' ? circle.y - circle.radius - 10 : circle.y + circle.radius + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', '#666')
        .text(circle.label);

      // Add hover interactions
      circleGroup
        .on('mouseenter', function(event) {
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', circle.radius * 1.1);

          // Set tooltip based on circle type
          if (circle.id === 'grid') {
            setTooltip({
              type: 'grid',
              title: 'Grid Energy Sources',
              energyMix: gridEnergyMix,
              totalValue: gridContribution
            });
          } else if (circle.id === 'solar') {
            setTooltip({
              type: 'solar',
              title: 'Solar Energy Production',
              solarData: solarData,
              totalValue: solarContribution
            });
          } else if (circle.id === 'university') {
            setTooltip({
              type: 'university',
              title: 'University Energy Consumption',
              breakdown: chartData,
              totalValue: totalElectricity
            });
          }
        })
        .on('mousemove', function(event) {
          // Get the SVG container's position relative to the viewport
          const svgRect = svgRef.current.getBoundingClientRect();
          // Position tooltip above the circle
          setMousePos({ 
            x: svgRect.left + circle.x + margin.left, 
            y: svgRect.top + circle.y + margin.top - circle.radius - 20
          });
        })
        .on('mouseleave', function(event) {
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', circle.radius);
          
          // Clear tooltip with a small delay to prevent flickering
          setTimeout(() => {
            setTooltip(null);
          }, 50);
        });
    });

  }, [totalElectricity, gridContribution, solarContribution, chartData, campusFootfall, interventionFunding]);

  // Add resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const svg = d3.select(svgRef.current);
      if (!svg.empty()) {
        setTimeout(() => {
          const event = new Event('resize');
          window.dispatchEvent(event);
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      setTooltip(null);
    };
  }, []);

  return (
    <div 
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseLeave={() => {
        setTooltip(null);
      }}
    >
      <div style={{ 
        padding: '1rem 1rem 0.5rem 1rem',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <h3 style={{
          margin: 0,
          color: '#333',
          fontSize: '1.1rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Energy Flow Visualization
        </h3>
      </div>
      
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <svg 
          ref={svgRef}
          style={{
            width: '100%',
            height: '100%'
          }}
        ></svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: mousePos.x - 150, // Center the tooltip (assuming max width of 300px)
          top: mousePos.y - 200,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#3498db' }}>
            {tooltip.title}
          </div>
          
          {tooltip.type === 'grid' && (
            <div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Total from Grid:</strong> {tooltip.totalValue.toLocaleString()} kWh/year
              </div>
              <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                Energy Source Breakdown:
              </div>
              {Object.entries(tooltip.energyMix).map(([source, data]) => (
                <div key={source} style={{ marginBottom: '2px', fontSize: '0.8rem' }}>
                  <span style={{ color: data.color }}>●</span> {source.charAt(0).toUpperCase() + source.slice(1).replace(/([A-Z])/g, ' $1')}: {data.percentage}%
                </div>
              ))}
            </div>
          )}

          {tooltip.type === 'solar' && (
            <div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Solar Generation:</strong> {tooltip.totalValue.toLocaleString()} kWh/year
              </div>
              <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                Solar Installation Details:
              </div>
              {Object.entries(tooltip.solarData).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '2px', fontSize: '0.8rem' }}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {value}
                </div>
              ))}
            </div>
          )}

          {tooltip.type === 'university' && (
            <div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Total Consumption:</strong> {tooltip.totalValue.toLocaleString()} kWh/year
              </div>
              <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                Usage Breakdown:
              </div>
              {tooltip.breakdown.map(item => {
                const percentage = ((item.value / tooltip.totalValue) * 100).toFixed(1);
                return (
                  <div key={item.category} style={{ marginBottom: '2px', fontSize: '0.8rem' }}>
                    <span style={{ color: item.color }}>●</span> {item.category}: {percentage}% ({item.value.toLocaleString()} kWh)
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ElectricityUseChart;