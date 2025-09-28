import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function GasROIChart({ enabledInterventions, interventionFunding, heatingDemandIndex }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Define interventions with their base ROI characteristics for heating/gas
  const interventions = {
    fabricUpgrades: {
      name: 'Fabric & Building Envelope Upgrades',
      baseROI: 4.2, // Years payback
      baseGasSavings: 25,  // % reduction
      baseCarbon: 18,      // % CO2 reduction
      baseCost: 285000,    // Total cost (£)
      color: '#17a2b8'
    },
    controls: {
      name: 'Controls',
      baseROI: 2.1,
      baseGasSavings: 12,
      baseCarbon: 9,
      baseCost: 85000,
      color: '#20c997'
    },
    setpointsScheduling: {
      name: 'Setpoints & Scheduling',
      baseROI: 1.8,
      baseGasSavings: 15,
      baseCarbon: 11,
      baseCost: 45000,
      color: '#138496'
    },
    highEfficiencyBoilers: {
      name: 'High-Efficiency Boilers & Distribution',
      baseROI: 6.5,
      baseGasSavings: 18,
      baseCarbon: 14,
      baseCost: 420000,
      color: '#6c757d'
    },
    heatPumpConversion: {
      name: 'Partial Heat-Pump Conversion',
      baseROI: 8.2,
      baseGasSavings: 35,
      baseCarbon: 28,
      baseCost: 680000,
      color: '#fd7e14'
    },
    dhwEfficiency: {
      name: 'DHW Efficiency',
      baseROI: 3.4,
      baseGasSavings: 22,
      baseCarbon: 16,
      baseCost: 125000,
      color: '#e83e8c'
    }
  };

  // Calculate adjusted metrics based on funding and heating demand
  const getInterventionData = () => {
    return Object.keys(interventions).map(key => {
      const intervention = interventions[key];
      const isEnabled = enabledInterventions[key];
      
      // Adjust for heating demand index (affects ROI and savings)
      const demandMultiplier = heatingDemandIndex / 100;
      
      // Funding affects implementation scale
      const fundingMultiplier = interventionFunding / 100;
      
      // Calculate adjusted values
      const adjustedROI = intervention.baseROI / (demandMultiplier * (0.3 + 0.7 * fundingMultiplier));
      const adjustedSavings = intervention.baseGasSavings * demandMultiplier * fundingMultiplier;
      const adjustedCarbon = intervention.baseCarbon * demandMultiplier * fundingMultiplier;
      const adjustedCost = intervention.baseCost * fundingMultiplier;

      return {
        id: key,
        name: intervention.name,
        roi: Math.max(0.5, adjustedROI), // Minimum 0.5 years
        gasSavings: adjustedSavings,
        carbonSavings: adjustedCarbon,
        cost: adjustedCost,
        isEnabled,
        color: intervention.color,
        opacity: isEnabled ? 1.0 : 0.4
      };
    });
  };

  const interventionData = getInterventionData();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions
    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 20, bottom: 80, left: 120 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(interventionData, d => d.roi) * 1.1])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(interventionData.map(d => d.name))
      .range([0, height])
      .padding(0.2);

    // Create main group
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add background grid
    const xTicks = xScale.ticks(5);
    g.selectAll('.grid-line')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#f0f0f0')
      .attr('stroke-width', 1);

    // Create bars
    const bars = g.selectAll('.bar')
      .data(interventionData)
      .enter()
      .append('g')
      .attr('class', 'bar');

    bars.append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name))
      .attr('width', d => xScale(d.roi))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.color)
      .attr('opacity', d => d.opacity)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', Math.min(1.0, d.opacity + 0.2));
        
        setTooltip({
          intervention: d.name,
          roi: d.roi,
          gasSavings: d.gasSavings,
          carbonSavings: d.carbonSavings,
          cost: d.cost,
          isEnabled: d.isEnabled,
          heatingDemand: heatingDemandIndex,
          funding: interventionFunding
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', d.opacity);
        
        setTooltip(null);
      });

    // Add ROI value labels on bars
    bars.append('text')
      .attr('x', d => xScale(d.roi) + 5)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', d => d.opacity > 0.7 ? '#333' : '#999')
      .style('pointer-events', 'none')
      .text(d => `${d.roi.toFixed(1)} yrs`);

    // Add intervention name labels
    g.selectAll('.label')
      .data(interventionData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', d => d.opacity > 0.7 ? '#333' : '#999')
      .text(d => {
        // Truncate long names for display
        const maxLength = 25;
        return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${d} yrs`);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    // Add axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', `translate(${width / 2}, ${height + 40})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#666')
      .text('Payback Period (Years)');

    // Style axes
    g.selectAll('.x-axis path, .x-axis line')
      .attr('stroke', '#ddd');
    
    g.selectAll('.x-axis text')
      .attr('fill', '#666')
      .attr('font-size', '10px');

  }, [interventionData, heatingDemandIndex, interventionFunding]);

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
          Heating Intervention ROI Analysis
        </h3>
        <p style={{
          margin: '0.25rem 0 0 0',
          color: '#666',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          Payback periods at {interventionFunding}% funding, {heatingDemandIndex}% heating demand
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
            {tooltip.intervention}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Payback Period:</strong> {tooltip.roi.toFixed(1)} years
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Gas Savings:</strong> {tooltip.gasSavings.toFixed(1)}%
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Carbon Reduction:</strong> {tooltip.carbonSavings.toFixed(1)}%
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Investment:</strong> £{(tooltip.cost / 1000).toFixed(0)}K
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '4px' }}>
            Heating Demand Index: {tooltip.heatingDemand}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
            Intervention Funding: {tooltip.funding}%
          </div>
          {!tooltip.isEnabled && (
            <div style={{ fontSize: '0.8rem', color: '#fd7e14', marginTop: '4px' }}>
              ⚠ Intervention not currently enabled
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GasROIChart;