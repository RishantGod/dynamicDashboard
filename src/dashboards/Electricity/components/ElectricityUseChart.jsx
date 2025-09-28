import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function ElectricityUseChart({ totalElectricity, enabledInterventions, interventionFunding }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
    const margin = { top: 20, right: 20, bottom: 80, left: 20 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Calculate chart dimensions
    const chartSize = Math.min(width, height - 60); // Leave space for legend
    const radius = Math.min(chartSize / 2, 120);

    // Create main group
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top - 20})`);

    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    // Create hover arc generator
    const arcHover = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius + 8);

    // Generate pie data
    const pieData = pie(chartData);

    // Create pie slices
    const slices = g.selectAll('.slice')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'slice');

    // Add paths for slices
    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover);
        
        const percentage = ((d.data.value / totalElectricity) * 100).toFixed(1);
        setTooltip({
          category: d.data.category,
          value: d.data.value,
          percentage: percentage,
          baseLoad: d.data.baseLoad,
          variable: d.data.variable,
          interventions: enabledInterventions,
          funding: interventionFunding
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
        
        setTooltip(null);
      });

    // Add percentage labels
    slices.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => {
        const percentage = ((d.data.value / totalElectricity) * 100);
        return percentage >= 5 ? `${percentage.toFixed(0)}%` : '';
      });

    // Add center text showing total electricity
    const centerGroup = g.append('g')
      .attr('class', 'center-text');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#e74c3c')
      .attr('dy', '-0.3em')
      .text('Total');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('fill', '#666')
      .attr('dy', '1em')
      .text(() => {
        if (totalElectricity >= 1000000) {
          return `${(totalElectricity / 1000000).toFixed(1)}M kWh`;
        } else {
          return `${(totalElectricity / 1000).toFixed(0)}K kWh`;
        }
      });

    // Create legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left}, ${height + margin.top + 20})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${i * (width / chartData.length)}, 0)`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color)
      .attr('rx', 2);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 6)
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .text(d => d.category);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 18)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', '#999')
      .text(d => {
        if (d.value >= 1000000) {
          return `${(d.value / 1000000).toFixed(1)}M kWh`;
        } else {
          return `${(d.value / 1000).toFixed(0)}K kWh`;
        }
      });

  }, [chartData, totalElectricity, interventionFunding]);

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
      onMouseLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setTooltip(null);
        }
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
          Electricity Use Breakdown
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
          left: mousePos.x + 10,
          top: mousePos.y - 10,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#e74c3c' }}>
            {tooltip.category} - {tooltip.percentage}%
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Electricity Use:</strong> {tooltip.value.toLocaleString()} kWh/year
          </div>
          <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#ccc' }}>
            <div>Base Load: {tooltip.baseLoad}% | Variable: {tooltip.variable}%</div>
          </div>
          {tooltip.funding > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#c0392b' }}>
              With {tooltip.funding}% intervention funding
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ElectricityUseChart;