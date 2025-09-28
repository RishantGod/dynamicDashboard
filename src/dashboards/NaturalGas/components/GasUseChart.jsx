import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function GasUseChart({ totalGasUse, enabledInterventions, interventionFunding }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Base gas distribution across categories (percentages)
  const baseDistribution = {
    spaceHeating: 70,
    domesticHotWater: 20,
    processOther: 10
  };

  // Intervention effects on different categories
  const interventionEffects = {
    fabricUpgrades: {
      spaceHeating: 0.75, domesticHotWater: 0.95, processOther: 0.90
    },
    controls: {
      spaceHeating: 0.92, domesticHotWater: 0.90, processOther: 0.85
    },
    setpointsScheduling: {
      spaceHeating: 0.88, domesticHotWater: 0.85, processOther: 0.90
    },
    highEfficiencyBoilers: {
      spaceHeating: 0.85, domesticHotWater: 0.80, processOther: 0.82
    },
    heatPumpConversion: {
      spaceHeating: 0.70, domesticHotWater: 0.75, processOther: 0.95
    },
    dhwEfficiency: {
      spaceHeating: 0.98, domesticHotWater: 0.70, processOther: 0.85
    }
  };

  // Calculate adjusted gas use for each category
  const calculateGasDistribution = () => {
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
      result[category] = Math.round((adjustedDistribution[category] / total) * totalGasUse);
    });

    return result;
  };

  const gasData = calculateGasDistribution();

  // Prepare data for D3
  const chartData = [
    { 
      category: 'Space Heating', 
      value: gasData.spaceHeating, 
      color: '#17a2b8',
      description: 'Building heating systems and radiators'
    },
    { 
      category: 'Domestic Hot Water (DHW)', 
      value: gasData.domesticHotWater, 
      color: '#20c997',
      description: 'Hot water for taps, showers, and washing'
    },
    { 
      category: 'Process/Other', 
      value: gasData.processOther, 
      color: '#138496',
      description: 'Laboratory equipment and other processes'
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
        
        const percentage = ((d.data.value / totalGasUse) * 100).toFixed(1);
        setTooltip({
          category: d.data.category,
          value: d.data.value,
          percentage: percentage,
          description: d.data.description,
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
        const percentage = ((d.data.value / totalGasUse) * 100);
        return percentage >= 5 ? `${percentage.toFixed(0)}%` : '';
      });

    // Add center text showing total gas use
    const centerGroup = g.append('g')
      .attr('class', 'center-text');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#17a2b8')
      .attr('dy', '-0.3em')
      .text('Total');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('fill', '#666')
      .attr('dy', '1em')
      .text(() => {
        if (totalGasUse >= 1000000) {
          return `${(totalGasUse / 1000000).toFixed(1)}M kWh`;
        } else {
          return `${(totalGasUse / 1000).toFixed(0)}K kWh`;
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
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(d => d.category);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 18)
      .attr('dy', '0.35em')
      .attr('font-size', '9px')
      .attr('fill', '#999')
      .text(d => {
        if (d.value >= 1000000) {
          return `${(d.value / 1000000).toFixed(1)}M kWh`;
        } else {
          return `${(d.value / 1000).toFixed(0)}K kWh`;
        }
      });

  }, [chartData, totalGasUse, interventionFunding]);

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
          Space Heat vs DHW Breakdown
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
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#17a2b8' }}>
            {tooltip.category} - {tooltip.percentage}%
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Gas Use:</strong> {tooltip.value.toLocaleString()} kWh/year
          </div>
          <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#ccc' }}>
            {tooltip.description}
          </div>
          {tooltip.funding > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#20c997' }}>
              With {tooltip.funding}% intervention funding
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GasUseChart;