import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function WasteROIChart({ interventionFunding, totalWasteGenerated, enabledInterventions }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ROI data for different waste management interventions
  const roiData = [
    {
      intervention: 'Food Waste\nReduction',
      shortName: 'Food Waste',
      baseROI: 85, // euros per tCO₂e avoided
      moneySaved: Math.round(totalWasteGenerated * 0.35 * 45 * (interventionFunding / 100)), // 35% food waste, €45 savings per ton
      tCO2eAvoided: Math.round(totalWasteGenerated * 0.35 * 1.8 * (interventionFunding / 100)), // 1.8 tCO₂e per ton food waste
      secondaryImpacts: ['Reduced methane emissions', 'Lower disposal costs', 'Decreased procurement needs']
    },
    {
      intervention: 'Reuse\nPrograms',
      shortName: 'Reuse',
      baseROI: 120,
      moneySaved: Math.round(totalWasteGenerated * 0.15 * 85 * (interventionFunding / 100)), // 15% reusable, €85 savings per ton
      tCO2eAvoided: Math.round(totalWasteGenerated * 0.15 * 2.2 * (interventionFunding / 100)), // 2.2 tCO₂e per ton reused
      secondaryImpacts: ['Extended product lifecycles', 'Community benefits', 'Resource conservation']
    },
    {
      intervention: 'Recycling\nUplift',
      shortName: 'Recycling',
      baseROI: 65,
      moneySaved: Math.round(totalWasteGenerated * 0.45 * 35 * (interventionFunding / 100)), // 45% recyclable, €35 savings per ton
      tCO2eAvoided: Math.round(totalWasteGenerated * 0.45 * 1.5 * (interventionFunding / 100)), // 1.5 tCO₂e per ton recycled
      secondaryImpacts: ['Material recovery', 'Energy savings', 'Job creation']
    },
    {
      intervention: 'Circular\nProcurement',
      shortName: 'Procurement',
      baseROI: 95,
      moneySaved: Math.round(totalWasteGenerated * 0.25 * 55 * (interventionFunding / 100)), // 25% procurement impact, €55 savings per ton
      tCO2eAvoided: Math.round(totalWasteGenerated * 0.25 * 1.9 * (interventionFunding / 100)), // 1.9 tCO₂e per ton
      secondaryImpacts: ['Supply chain optimization', 'Vendor sustainability', 'Cost predictability']
    },
    {
      intervention: 'C&D\nMinimisation',
      shortName: 'C&D',
      baseROI: 75,
      moneySaved: Math.round(totalWasteGenerated * 0.12 * 65 * (interventionFunding / 100)), // 12% construction waste, €65 savings per ton
      tCO2eAvoided: Math.round(totalWasteGenerated * 0.12 * 2.5 * (interventionFunding / 100)), // 2.5 tCO₂e per ton C&D waste
      secondaryImpacts: ['Material recovery', 'Reduced landfill burden', 'Design efficiency']
    }
  ];

  // Filter data based on enabled interventions
  const interventionMap = {
    'Food Waste': 'foodWaste',
    'Reuse': 'campusReuse',
    'Recycling': 'recyclingUplift',
    'Procurement': 'circularProcurement',
    'C&D': 'cdMinimisation'
  };

  const filteredData = roiData.filter(d => {
    const interventionKey = interventionMap[d.shortName];
    return enabledInterventions[interventionKey];
  });

  // Calculate dynamic ROI based on intervention funding
  const dataWithROI = filteredData.map(d => ({
    ...d,
    roi: d.baseROI + (d.baseROI * 0.3 * (interventionFunding / 100)) // ROI increases up to 30% with full funding
  }));

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Clear tooltip on component update
    setTooltip(null);

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(dataWithROI.map(d => d.shortName))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataWithROI, d => d.roi) * 1.1])
      .range([height, 0]);

    // Create color scale based on ROI values
    const colorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([d3.min(dataWithROI, d => d.roi), d3.max(dataWithROI, d => d.roi)]);

    // Create chart container
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add grid lines first (behind bars)
    g.selectAll('.grid-line')
      .data(yScale.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7);

    // Add bars
    const bars = g.selectAll('.bar')
      .data(dataWithROI)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.shortName))
      .attr('y', d => yScale(d.roi))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.roi))
      .attr('fill', d => colorScale(d.roi))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        // Highlight bar
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d3.color(colorScale(d.roi)).darker(0.3));
        
        setTooltip(d);
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(event, d) {
        // Return to original color
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', colorScale(d.roi));
        
        // Clear tooltip
        setTooltip(null);
      });

    // Add global mouseleave handler to the SVG to ensure tooltip clears
    svg
      .on('mouseleave', function() {
        setTooltip(null);
        // Reset all bars to original color
        g.selectAll('.bar')
          .transition()
          .duration(200)
          .attr('fill', d => colorScale(d.roi));
      });

    // Add value labels on top of bars
    g.selectAll('.bar-label')
      .data(dataWithROI)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.shortName) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.roi) - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#27ae60')
      .text(d => `€${Math.round(d.roi)}`);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#666');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#666');

    // Add y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#27ae60')
      .text('ROI (€/tCO₂e avoided)');



  }, [dataWithROI]);

  // Cleanup effect to clear tooltip on unmount
  useEffect(() => {
    return () => {
      setTooltip(null);
    };
  }, []);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(39,174,96,0.08)',
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.1rem',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        Intervention ROI Analysis
      </h3>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg ref={svgRef}></svg>
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
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#27ae60' }}>
            {tooltip.intervention.replace('\n', ' ')}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>ROI:</strong> €{Math.round(tooltip.roi)} per tCO₂e avoided
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Money Saved:</strong> €{tooltip.moneySaved.toLocaleString()}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>CO₂ Avoided:</strong> {tooltip.tCO2eAvoided.toLocaleString()} tCO₂e
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Secondary Impacts:</div>
            {tooltip.secondaryImpacts.map((impact, index) => (
              <div key={index}>• {impact}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteROIChart;