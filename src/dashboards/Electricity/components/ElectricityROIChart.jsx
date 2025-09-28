import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function ElectricityROIChart({ interventionFunding, totalElectricity, enabledInterventions }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Define intervention data with ROI calculations (Euro per kWh saved)
  const interventionData = [
    {
      name: 'LED Retrofits',
      key: 'ledRetrofits',
      baseROI: 0.08, // Euro per kWh saved
      maxROI: 0.15,
      baseElectricitySavings: 0.15, // 15% electricity savings
      baseCost: 45000, // Base implementation cost
      carbonReduction: 0.35, // tCO2e per MWh saved
      color: '#e74c3c'
    },
    {
      name: 'Smart Controls',
      key: 'smartControls',
      baseROI: 0.12,
      maxROI: 0.22,
      baseElectricitySavings: 0.12,
      baseCost: 65000,
      carbonReduction: 0.35,
      color: '#c0392b'
    },
    {
      name: 'Behavioral Campaigns',
      key: 'behavioralCampaigns',
      baseROI: 0.25,
      maxROI: 0.40,
      baseElectricitySavings: 0.08,
      baseCost: 15000,
      carbonReduction: 0.35,
      color: '#a93226'
    },
    {
      name: 'On-site Renewables',
      key: 'onsiteRenewables',
      baseROI: 0.06,
      maxROI: 0.11,
      baseElectricitySavings: 0.20,
      baseCost: 180000,
      carbonReduction: 0.45,
      color: '#922b21'
    },
    {
      name: 'Demand Management',
      key: 'demandSideManagement',
      baseROI: 0.10,
      maxROI: 0.18,
      baseElectricitySavings: 0.10,
      baseCost: 35000,
      carbonReduction: 0.35,
      color: '#7b241c'
    }
  ];

  // Calculate ROI for each intervention based on funding level
  const calculateROI = (intervention) => {
    const fundingRatio = interventionFunding / 100;
    const scaledROI = intervention.baseROI + (intervention.maxROI - intervention.baseROI) * fundingRatio;
    
    // Calculate actual savings
    const electricitySaved = totalElectricity * intervention.baseElectricitySavings * fundingRatio;
    const costSavings = electricitySaved * 0.12; // €0.12 per kWh
    const carbonSaved = (electricitySaved / 1000) * intervention.carbonReduction; // tCO2e
    const implementationCost = intervention.baseCost * (1 + fundingRatio * 0.5); // Higher funding = higher implementation
    
    return {
      ...intervention,
      roi: scaledROI,
      electricitySaved: Math.round(electricitySaved),
      costSavings: Math.round(costSavings),
      carbonSaved: Math.round(carbonSaved * 10) / 10,
      implementationCost: Math.round(implementationCost),
      enabled: enabledInterventions[intervention.key]
    };
  };

  const chartData = interventionData.map(calculateROI).filter(d => d.enabled);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (chartData.length === 0) {
      // Show "no data" message when no interventions are enabled
      svg.append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#999')
        .attr('font-size', '14px')
        .text('No interventions enabled');
      return;
    }

    // Get container dimensions
    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 30, bottom: 10, left: 80 };
    const width = containerRect.width - margin.left - margin.right - 20;
    const height = containerRect.height - margin.top - margin.bottom - 80;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.name))
      .range([0, width])
      .padding(0.3);

    const maxROI = d3.max(chartData, d => d.roi) || 0.5;
    const yScale = d3.scaleLinear()
      .domain([0, maxROI * 1.1])
      .range([height, 0]);

    // Create chart container
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add grid lines
    g.selectAll('.grid-line')
      .data(yScale.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#fadbd8')
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7);

    // Create bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('y', d => yScale(d.roi))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.roi))
      .attr('fill', d => d.color)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(d.color).brighter(0.2));
        
        setTooltip({
          name: d.name,
          roi: d.roi,
          electricitySaved: d.electricitySaved,
          costSavings: d.costSavings,
          carbonSaved: d.carbonSaved,
          implementationCost: d.implementationCost,
          funding: interventionFunding
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d.color);
        
        setTooltip(null);
      });

    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.roi) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#e74c3c')
      .text(d => `€${d.roi.toFixed(2)}`);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `€${d.toFixed(2)}`))
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
      .attr('fill', '#e74c3c')
      .text('ROI (€ per kWh saved)');

    // Clear tooltip when mouse leaves SVG
    svg.on('mouseleave', function() {
      setTooltip(null);
      // Reset all bars to normal color
      g.selectAll('.bar')
        .transition()
        .duration(200)
        .attr('fill', d => d.color);
    });

  }, [chartData, interventionFunding]);

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
          Intervention ROI Analysis
        </h3>
        <p style={{
          margin: '0.5rem 0 0 0',
          color: '#666',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          Return on Investment (€ per kWh saved)
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
          maxWidth: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#e74c3c' }}>
            {tooltip.name}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>ROI:</strong> €{tooltip.roi.toFixed(2)} per kWh saved
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Electricity Saved:</strong> {tooltip.electricitySaved.toLocaleString()} kWh/year
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Cost Savings:</strong> €{tooltip.costSavings.toLocaleString()}/year
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Carbon Reduction:</strong> {tooltip.carbonSaved} tCO₂e/year
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Implementation Cost:</strong> €{tooltip.implementationCost.toLocaleString()}
          </div>
          {tooltip.funding > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#c0392b', marginTop: '6px' }}>
              At {tooltip.funding}% funding level
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ElectricityROIChart;