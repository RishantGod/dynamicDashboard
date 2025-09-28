import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function GasScenarioChart({ enabledInterventions, interventionFunding, heatingDemandIndex }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Base scenario parameters
  const baselineData = {
    2025: { gasUse: 2100000, cost: 126000, carbon: 378000 }, // kWh, £, kgCO2
    2030: { gasUse: 2180000, cost: 152000, carbon: 392400 },
    2035: { gasUse: 2260000, cost: 180000, carbon: 406800 },
    2040: { gasUse: 2340000, cost: 211000, carbon: 421200 },
    2045: { gasUse: 2420000, cost: 245000, carbon: 435600 },
    2050: { gasUse: 2500000, cost: 285000, carbon: 450000 }
  };

  // Calculate intervention effects over time
  const calculateScenarios = () => {
    const years = Object.keys(baselineData);
    
    // Baseline scenario (no interventions)
    const baseline = years.map(year => ({
      year: parseInt(year),
      gasUse: baselineData[year].gasUse,
      cost: baselineData[year].cost,
      carbon: baselineData[year].carbon,
      scenario: 'baseline'
    }));

    // Calculate intervention scenario
    const interventionScenario = years.map((year, index) => {
      const yearNum = parseInt(year);
      const baseYear = baselineData[year];
      
      // Intervention effects compound over time
      const timeMultiplier = Math.min(1.0, (yearNum - 2025) / 10); // Full effect by 2035
      
      // Calculate reduction factors for each intervention
      let gasReduction = 1.0;
      let costReduction = 1.0;
      let carbonReduction = 1.0;
      
      if (enabledInterventions.fabricUpgrades) {
        const effect = (0.25 * (interventionFunding / 100) * timeMultiplier);
        gasReduction *= (1 - effect);
        carbonReduction *= (1 - effect * 0.8);
        costReduction *= (1 - effect * 0.9); // Cost savings lag slightly
      }
      
      if (enabledInterventions.controls) {
        const effect = (0.12 * (interventionFunding / 100) * timeMultiplier);
        gasReduction *= (1 - effect);
        carbonReduction *= (1 - effect * 0.75);
        costReduction *= (1 - effect * 0.85);
      }
      
      if (enabledInterventions.setpointsScheduling) {
        const effect = (0.15 * (interventionFunding / 100) * timeMultiplier);
        gasReduction *= (1 - effect);
        carbonReduction *= (1 - effect * 0.7);
        costReduction *= (1 - effect * 0.8);
      }
      
      if (enabledInterventions.highEfficiencyBoilers) {
        const effect = (0.18 * (interventionFunding / 100) * timeMultiplier);
        gasReduction *= (1 - effect);
        carbonReduction *= (1 - effect * 0.8);
        costReduction *= (1 - effect * 0.85);
      }
      
      if (enabledInterventions.heatPumpConversion) {
        // Heat pumps have increasing effect over time due to grid decarbonization
        const baseEffect = 0.35 * (interventionFunding / 100) * timeMultiplier;
        const gridDecarbMultiplier = 1 + ((yearNum - 2025) / 25) * 0.3; // 30% additional benefit by 2050
        const totalEffect = Math.min(0.6, baseEffect * gridDecarbMultiplier);
        
        gasReduction *= (1 - totalEffect);
        carbonReduction *= (1 - totalEffect * 1.2); // Greater carbon benefit
        costReduction *= (1 - totalEffect * 0.7); // Lower cost benefit initially
      }
      
      if (enabledInterventions.dhwEfficiency) {
        const effect = (0.22 * (interventionFunding / 100) * timeMultiplier);
        gasReduction *= (1 - effect);
        carbonReduction *= (1 - effect * 0.75);
        costReduction *= (1 - effect * 0.8);
      }

      // Apply heating demand index multiplier
      const demandMultiplier = heatingDemandIndex / 100;
      
      return {
        year: yearNum,
        gasUse: Math.round(baseYear.gasUse * gasReduction * demandMultiplier),
        cost: Math.round(baseYear.cost * costReduction * demandMultiplier),
        carbon: Math.round(baseYear.carbon * carbonReduction * demandMultiplier),
        scenario: 'intervention'
      };
    });

    return { baseline, interventionScenario };
  };

  const { baseline, interventionScenario } = calculateScenarios();
  const allData = [...baseline, ...interventionScenario];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions
    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 100, bottom: 60, left: 80 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([2025, 2050])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allData, d => Math.max(d.gasUse / 1000, d.cost, d.carbon / 1000)) * 1.1])
      .range([height, 0]);

    // Create main group
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add background grid
    const xTicks = xScale.ticks(6);
    const yTicks = yScale.ticks(6);

    g.selectAll('.grid-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-x')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#f0f0f0')
      .attr('stroke-width', 1);

    g.selectAll('.grid-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-y')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#f0f0f0')
      .attr('stroke-width', 1);

    // Define line generator
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.gasUse / 1000)) // Convert to thousands
      .curve(d3.curveMonotoneX);

    const costLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    // Add lines for gas use
    g.append('path')
      .datum(baseline)
      .attr('fill', 'none')
      .attr('stroke', '#dc3545')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')
      .attr('d', line);

    g.append('path')
      .datum(interventionScenario)
      .attr('fill', 'none')
      .attr('stroke', '#17a2b8')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add lines for cost
    g.append('path')
      .datum(baseline)
      .attr('fill', 'none')
      .attr('stroke', '#fd7e14')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', costLine);

    g.append('path')
      .datum(interventionScenario)
      .attr('fill', 'none')
      .attr('stroke', '#20c997')
      .attr('stroke-width', 2)
      .attr('d', costLine);

    // Add interactive circles for data points
    const gasCircles = g.selectAll('.gas-circle')
      .data(allData)
      .enter()
      .append('circle')
      .attr('class', 'gas-circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.gasUse / 1000))
      .attr('r', 4)
      .attr('fill', d => d.scenario === 'baseline' ? '#dc3545' : '#17a2b8')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    const costCircles = g.selectAll('.cost-circle')
      .data(allData)
      .enter()
      .append('circle')
      .attr('class', 'cost-circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.cost))
      .attr('r', 3)
      .attr('fill', d => d.scenario === 'baseline' ? '#fd7e14' : '#20c997')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // Add hover effects
    [gasCircles, costCircles].forEach(circles => {
      circles
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d3.select(this).attr('r') * 1.5);
          
          setTooltip({
            year: d.year,
            gasUse: d.gasUse,
            cost: d.cost,
            carbon: d.carbon,
            scenario: d.scenario,
            funding: interventionFunding,
            heatingDemand: heatingDemandIndex
          });
        })
        .on('mousemove', function(event) {
          setMousePos({ x: event.clientX, y: event.clientY });
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d3.select(this).attr('class').includes('gas') ? 4 : 3);
          
          setTooltip(null);
        });
    });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => {
        if (d >= 1000) return `${d/1000}M`;
        return `${d}K`;
      });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + 40})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#666')
      .text('Year');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#666')
      .text('Gas Use (MWh) / Cost (£K)');

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + margin.left + 10}, ${margin.top + 20})`);

    const legendData = [
      { label: 'Baseline Gas', color: '#dc3545', style: 'dashed' },
      { label: 'With Interventions', color: '#17a2b8', style: 'solid' },
      { label: 'Baseline Cost', color: '#fd7e14', style: 'dashed' },
      { label: 'Intervention Cost', color: '#20c997', style: 'solid' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 5)
      .attr('y2', 5)
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.label.includes('Gas') ? 3 : 2)
      .attr('stroke-dasharray', d => d.style === 'dashed' ? '3,3' : 'none');

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 5)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(d => d.label);

    // Style axes
    g.selectAll('.x-axis path, .x-axis line, .y-axis path, .y-axis line')
      .attr('stroke', '#ddd');
    
    g.selectAll('.x-axis text, .y-axis text')
      .attr('fill', '#666')
      .attr('font-size', '10px');

  }, [baseline, interventionScenario, heatingDemandIndex, interventionFunding]);

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
          Gas Use & Cost Projections 2025-2050
        </h3>
        <p style={{
          margin: '0.25rem 0 0 0',
          color: '#666',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          Baseline vs intervention scenarios at {interventionFunding}% funding
        </p>
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
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#17a2b8' }}>
            {tooltip.year} - {tooltip.scenario === 'baseline' ? 'Baseline' : 'With Interventions'}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Gas Use:</strong> {(tooltip.gasUse / 1000000).toFixed(1)}M kWh/year
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Annual Cost:</strong> £{(tooltip.cost / 1000).toFixed(0)}K
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>CO₂ Emissions:</strong> {(tooltip.carbon / 1000).toFixed(0)}K kg/year
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '4px' }}>
            Heating Demand: {tooltip.heatingDemand}% HDD
          </div>
          {tooltip.scenario === 'intervention' && (
            <div style={{ fontSize: '0.8rem', color: '#20c997' }}>
              Intervention Funding: {tooltip.funding}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GasScenarioChart;