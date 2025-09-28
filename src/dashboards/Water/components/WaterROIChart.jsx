import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function WaterROIChart({ interventionFunding, totalWaterUse, enabledInterventions }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ROI data for different water management interventions
  const roiData = [
    {
      intervention: 'Rainwater\nHarvesting',
      shortName: 'Rainwater Harvest',
      baseROI: 65, // euros per m³ saved
      moneySaved: Math.round(totalWaterUse * 0.12 * 1.80 * (interventionFunding / 100)), // 12% water saved, €1.80 per m³
      waterSaved: Math.round(totalWaterUse * 0.12 * (interventionFunding / 100)), // 12% water reduction
      secondaryImpacts: ['Reduced stormwater runoff', 'Lower infrastructure load', 'Emergency water supply']
    },
    {
      intervention: 'Greywater\nRecycling',
      shortName: 'Greywater Recycle',
      baseROI: 85,
      moneySaved: Math.round(totalWaterUse * 0.15 * 2.20 * (interventionFunding / 100)), // 15% water saved, €2.20 per m³
      waterSaved: Math.round(totalWaterUse * 0.15 * (interventionFunding / 100)), // 15% water reduction
      secondaryImpacts: ['Reduced wastewater treatment', 'Nutrient recovery', 'Irrigation supply']
    },
    {
      intervention: 'Leak\nDetection',
      shortName: 'Leak Detection',
      baseROI: 95,
      moneySaved: Math.round(totalWaterUse * 0.08 * 2.50 * (interventionFunding / 100)), // 8% water saved, €2.50 per m³
      waterSaved: Math.round(totalWaterUse * 0.08 * (interventionFunding / 100)), // 8% water reduction
      secondaryImpacts: ['Prevented infrastructure damage', 'Energy savings', 'Quick ROI payback']
    },
    {
      intervention: 'Smart\nIrrigation',
      shortName: 'Smart Irrigation',
      baseROI: 55,
      moneySaved: Math.round(totalWaterUse * 0.10 * 1.50 * (interventionFunding / 100)), // 10% water saved, €1.50 per m³
      waterSaved: Math.round(totalWaterUse * 0.10 * (interventionFunding / 100)), // 10% water reduction
      secondaryImpacts: ['Improved plant health', 'Labor cost reduction', 'Weather adaptation']
    },
    {
      intervention: 'Efficiency\nUpgrades',
      shortName: 'Efficiency Upgrades',
      baseROI: 75,
      moneySaved: Math.round(totalWaterUse * 0.18 * 2.00 * (interventionFunding / 100)), // 18% water saved, €2.00 per m³
      waterSaved: Math.round(totalWaterUse * 0.18 * (interventionFunding / 100)), // 18% water reduction
      secondaryImpacts: ['Long-term savings', 'User behavior change', 'Technology modernization']
    }
  ];

  // Filter data based on enabled interventions
  const interventionMap = {
    'Rainwater Harvest': 'rainwaterHarvesting',
    'Greywater Recycle': 'greywaterRecycling',
    'Leak Detection': 'leakDetection',
    'Smart Irrigation': 'smartIrrigation',
    'Efficiency Upgrades': 'waterEfficiencyUpgrades'
  };

  const filteredData = roiData.filter(d => {
    const interventionKey = interventionMap[d.shortName];
    return enabledInterventions[interventionKey];
  });

  // Calculate dynamic ROI based on intervention funding
  const dataWithROI = filteredData.map(d => ({
    ...d,
    roi: d.baseROI + (d.baseROI * 0.4 * (interventionFunding / 100)) // ROI increases up to 40% with full funding
  }));

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Clear tooltip on component update
    setTooltip(null);

    // Get container dimensions
    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 30, bottom: 0, left: 60 };
    const width = containerRect.width - margin.left - margin.right - 20;
    const height = containerRect.height - margin.top - margin.bottom - 80;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(dataWithROI.map(d => d.shortName))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataWithROI, d => d.roi) * 1.1])
      .range([height, 0]);

    // Create color scale based on ROI values
    const colorScale = d3.scaleSequential()
      .domain([d3.min(dataWithROI, d => d.roi), d3.max(dataWithROI, d => d.roi)])
      .interpolator(d3.interpolateBlues);

    // Create chart container
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add grid lines
    g.selectAll('.grid-line-y')
      .data(yScale.ticks(5))
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

    // Create bars
    const bars = g.selectAll('.bar')
      .data(dataWithROI)
      .enter()
      .append('g')
      .attr('class', 'bar');

    // Add rectangles
    bars.append('rect')
      .attr('x', d => xScale(d.shortName))
      .attr('y', d => yScale(d.roi))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.roi))
      .attr('fill', d => colorScale(d.roi))
      .attr('stroke', '#3498db')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#2980b9')
          .attr('stroke-width', 2);
        
        setTooltip({
          intervention: d.shortName,
          roi: d.roi.toFixed(1),
          moneySaved: d.moneySaved,
          waterSaved: d.waterSaved,
          secondaryImpacts: d.secondaryImpacts,
          interventionLevel: interventionFunding
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', colorScale(d.roi))
          .attr('stroke-width', 1);
        
        setTooltip(null);
      });

    // Add value labels on bars
    bars.append('text')
      .attr('x', d => xScale(d.shortName) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.roi) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2c3e50')
      .text(d => `€${d.roi.toFixed(0)}`);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .style('text-anchor', 'middle')
      .call(wrap, xScale.bandwidth());

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `€${d}`))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#666');

    // Add y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3498db')
      .text('ROI (€ per m³ saved)');

    // Clear tooltip when mouse leaves SVG
    svg.on('mouseleave', function() {
      setTooltip(null);
      // Reset all bars
      bars.selectAll('rect')
        .transition()
        .duration(200)
        .attr('fill', d => colorScale(d.roi))
        .attr('stroke-width', 1);
    });

  }, [dataWithROI, interventionFunding]);

  // Text wrapping function
  function wrap(text, width) {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy')) || 0;
      let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      padding: '0.5rem'
    }}>
      <h3 style={{
        textAlign: 'center',
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Water Intervention ROI Analysis
      </h3>
      
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
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#3498db' }}>
            {tooltip.intervention}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>ROI:</strong> €{tooltip.roi}/m³ saved
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Annual Savings:</strong> €{tooltip.moneySaved.toLocaleString()}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Water Saved:</strong> {tooltip.waterSaved.toLocaleString()} m³/year
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Funding Level:</strong> {tooltip.interventionLevel}%
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Additional Benefits:</div>
            {tooltip.secondaryImpacts.map((impact, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>• {impact}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WaterROIChart;