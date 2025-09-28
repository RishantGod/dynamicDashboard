import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function WaterScenarioChart({ interventionFunding, totalWaterUse, enabledInterventions }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [yAxisMetric, setYAxisMetric] = useState('water'); // 'water' or 'cost'

  // Generate scenario data for 2025-2050
  const generateScenarioData = () => {
    const years = [];
    for (let year = 2025; year <= 2050; year++) {
      years.push(year);
    }

    // Calculate effectiveness multiplier based on enabled interventions
    const interventionEffects = {
      rainwaterHarvesting: { waterReduction: 0.12, costReduction: 0.10 },
      greywaterRecycling: { waterReduction: 0.15, costReduction: 0.12 },
      leakDetection: { waterReduction: 0.08, costReduction: 0.08 },
      smartIrrigation: { waterReduction: 0.10, costReduction: 0.06 },
      waterEfficiencyUpgrades: { waterReduction: 0.18, costReduction: 0.15 }
    };

    let totalWaterReduction = 0;
    let totalCostReduction = 0;

    Object.keys(enabledInterventions).forEach(intervention => {
      if (enabledInterventions[intervention] && interventionEffects[intervention]) {
        totalWaterReduction += interventionEffects[intervention].waterReduction;
        totalCostReduction += interventionEffects[intervention].costReduction;
      }
    });

    return years.map(year => {
      const yearIndex = year - 2025;
      const baseWaterUse = totalWaterUse * (1 + yearIndex * 0.020); // 2% annual growth baseline
      
      // Business as usual (0% intervention)
      const bauWaterUse = baseWaterUse;
      const bauCost = baseWaterUse * 2.50; // €2.50 per m³

      // Partial intervention (current slider value scaled by enabled interventions)
      const partialReduction = interventionFunding / 100;
      const partialWaterUse = bauWaterUse * (1 - partialReduction * totalWaterReduction);
      const partialCost = bauCost * (1 - partialReduction * totalCostReduction);

      // Full intervention (100% funding with enabled interventions)
      const fullReduction = 1.0;
      const fullWaterUse = bauWaterUse * (1 - fullReduction * totalWaterReduction);
      const fullCost = bauCost * (1 - fullReduction * totalCostReduction);

      return {
        year,
        businessAsUsual: {
          water: Math.round(bauWaterUse),
          cost: Math.round(bauCost)
        },
        partial: {
          water: Math.round(partialWaterUse),
          cost: Math.round(partialCost)
        },
        fullIntervention: {
          water: Math.round(fullWaterUse),
          cost: Math.round(fullCost)
        }
      };
    });
  };

  const scenarioData = generateScenarioData();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions and use full available space
    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 15, bottom: 10, left: 80 }; // Increased bottom margin for legend
    const width = containerRect.width - margin.left - margin.right - 20;
    const height = containerRect.height - margin.top - margin.bottom - 80;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([2025, 2050])
      .range([0, width]);

    const yExtent = d3.extent(scenarioData.flatMap(d => [
      d.businessAsUsual[yAxisMetric],
      d.partial[yAxisMetric],
      d.fullIntervention[yAxisMetric]
    ]));

    const yScale = d3.scaleLinear()
      .domain([0, yExtent[1] * 1.1])
      .range([height, 0]);

    // Create chart container
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add grid lines
    g.selectAll('.grid-line-y')
      .data(yScale.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e6f3ff')
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7);

    g.selectAll('.grid-line-x')
      .data(xScale.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid-line-x')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#e6f3ff')
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.year))
      .curve(d3.curveMonotoneX);

    // Define line configurations
    const lineConfigs = [
      {
        data: scenarioData,
        getValue: d => d.businessAsUsual[yAxisMetric],
        color: '#95a5a6',
        strokeWidth: 3,
        label: 'Business as Usual (0%)',
        dashArray: 'none'
      },
      {
        data: scenarioData,
        getValue: d => d.partial[yAxisMetric],
        color: '#f39c12',
        strokeWidth: 3,
        label: `Partial Intervention (${interventionFunding}%)`,
        dashArray: 'none'
      },
      {
        data: scenarioData,
        getValue: d => d.fullIntervention[yAxisMetric],
        color: '#3498db',
        strokeWidth: 3,
        label: 'Full Intervention (100%)',
        dashArray: 'none'
      }
    ];

    // Add lines
    lineConfigs.forEach((config, index) => {
      const lineFunction = line.y(d => yScale(config.getValue(d)));
      
      g.append('path')
        .datum(config.data)
        .attr('class', `line-${index}`)
        .attr('fill', 'none')
        .attr('stroke', config.color)
        .attr('stroke-width', config.strokeWidth)
        .attr('stroke-dasharray', config.dashArray)
        .attr('d', lineFunction);

      // Add circles for data points
      g.selectAll(`.circle-${index}`)
        .data(config.data.filter((d, i) => i % 5 === 0)) // Show every 5th point
        .enter()
        .append('circle')
        .attr('class', `circle-${index}`)
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(config.getValue(d)))
        .attr('r', 4)
        .attr('fill', config.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6);
          
          setTooltip({
            year: d.year,
            businessAsUsual: d.businessAsUsual,
            partial: d.partial,
            fullIntervention: d.fullIntervention,
            metric: yAxisMetric,
            interventionLevel: interventionFunding
          });
        })
        .on('mousemove', function(event) {
          setMousePos({ x: event.clientX, y: event.clientY });
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4);
          
          setTooltip(null);
        });
    });

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#666');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => {
        if (yAxisMetric === 'cost') {
          return d >= 1000000 ? `€${(d/1000000).toFixed(1)}M` : `€${(d/1000).toFixed(0)}K`;
        } else {
          return d >= 1000000 ? `${(d/1000000).toFixed(1)}M m³` : `${(d/1000).toFixed(0)}K m³`;
        }
      }))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#666');

    // Add y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3498db')
      .text(yAxisMetric === 'water' ? 'Water Usage (m³/year)' : 'Annual Cost (€)');

    // Add x-axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3498db')
      .text('Year');

    // Add legend below the chart
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width / 2 - 250}, ${height + 60})`);

    lineConfigs.forEach((config, index) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(${index * 160}, 0)`);

      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 15)
        .attr('y1', 5)
        .attr('y2', 5)
        .attr('stroke', config.color)
        .attr('stroke-width', 3);

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 9)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(config.label);
    });

    // Clear tooltip when mouse leaves SVG
    svg.on('mouseleave', function() {
      setTooltip(null);
      // Reset all circles to normal size
      g.selectAll('circle')
        .transition()
        .duration(200)
        .attr('r', 4);
    });

  }, [scenarioData, yAxisMetric, interventionFunding]);

  // Add resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render on window resize
      const svg = d3.select(svgRef.current);
      if (!svg.empty()) {
        // Small delay to ensure container has updated dimensions
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
        // Only clear tooltip if actually leaving the container
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setTooltip(null);
        }
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem',
        padding: '0.5rem 1rem 0 1rem'
      }}>
        <h3 style={{
          margin: 0,
          color: '#333',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          Water Scenario Comparison (2025-2050)
        </h3>
        
        {/* Y-axis toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#f8f9fa',
          padding: '4px',
          borderRadius: '20px'
        }}>
          <button
            onClick={() => setYAxisMetric('water')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: yAxisMetric === 'water' ? '#3498db' : 'transparent',
              color: yAxisMetric === 'water' ? '#fff' : '#666',
              transition: 'all 0.2s ease'
            }}
          >
            Water Use
          </button>
          <button
            onClick={() => setYAxisMetric('cost')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: yAxisMetric === 'cost' ? '#3498db' : 'transparent',
              color: yAxisMetric === 'cost' ? '#fff' : '#666',
              transition: 'all 0.2s ease'
            }}
          >
            Cost
          </button>
        </div>
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
          maxWidth: '250px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#3498db' }}>
            Year {tooltip.year}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#95a5a6' }}>●</span> <strong>Business as Usual:</strong> {' '}
            {tooltip.metric === 'water' 
              ? `${tooltip.businessAsUsual.water.toLocaleString()} m³`
              : `€${tooltip.businessAsUsual.cost.toLocaleString()}`
            }
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#f39c12' }}>●</span> <strong>Partial ({tooltip.interventionLevel}%):</strong> {' '}
            {tooltip.metric === 'water' 
              ? `${tooltip.partial.water.toLocaleString()} m³`
              : `€${tooltip.partial.cost.toLocaleString()}`
            }
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#3498db' }}>●</span> <strong>Full Intervention:</strong> {' '}
            {tooltip.metric === 'water' 
              ? `${tooltip.fullIntervention.water.toLocaleString()} m³`
              : `€${tooltip.fullIntervention.cost.toLocaleString()}`
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default WaterScenarioChart;