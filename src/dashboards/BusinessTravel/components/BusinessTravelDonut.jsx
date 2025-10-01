import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FaPlane, FaTrain, FaCar } from 'react-icons/fa';

function BusinessTravelDonut({ travelData }) {
  const svgRef = useRef();
  const [viewMode, setViewMode] = useState('emissions');
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!travelData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 60, right: 20, bottom: 20, left: 20 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2 - 20;

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
       .attr('transform', `translate(${width/2 + margin.left}, ${height/2 + margin.top})`);

    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .attr('fill', '#2c3e50')
      .text('Business Travel Distribution');

    const tabGroup = svg.append('g')
      .attr('transform', `translate(${margin.left + width/2 - 80}, 40)`);

    const emissionsTab = tabGroup.append('g')
      .attr('class', 'donut-tab')
      .style('cursor', 'pointer')
      .on('click', () => setViewMode('emissions'));

    emissionsTab.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 80)
      .attr('height', 25)
      .attr('rx', 3)
      .attr('fill', viewMode === 'emissions' ? '#e74c3c' : '#f8f9fa')
      .attr('stroke', '#bdc3c7')
      .attr('stroke-width', 1);

    emissionsTab.append('text')
      .attr('x', 40)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', viewMode === 'emissions' ? 'white' : '#2c3e50')
      .text('Emissions');

    const countsTab = tabGroup.append('g')
      .attr('class', 'donut-tab')
      .attr('transform', 'translate(85, 0)')
      .style('cursor', 'pointer')
      .on('click', () => setViewMode('counts'));

    countsTab.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 80)
      .attr('height', 25)
      .attr('rx', 3)
      .attr('fill', viewMode === 'counts' ? '#e74c3c' : '#f8f9fa')
      .attr('stroke', '#bdc3c7')
      .attr('stroke-width', 1);

    countsTab.append('text')
      .attr('x', 40)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', viewMode === 'counts' ? 'white' : '#2c3e50')
      .text('Trips');

    const flexibility = travelData.flexibilityIndex / 100;
    const policy = travelData.policyImplementation / 100;
    
    const baseFlightEmissions = 2450;
    const baseTrainEmissions = 145;
    const baseCarEmissions = 380;
    
    const baseFlightTrips = 850;
    const baseTrainTrips = 320;
    const baseCarTrips = 580;

    const reductionFactor = flexibility * policy;
    const shiftToLowerEmission = reductionFactor * 0.3;
    
    const flightEmissions = Math.round(baseFlightEmissions * (1 - reductionFactor * 0.6));
    const trainEmissions = Math.round(baseTrainEmissions * (1 + shiftToLowerEmission * 2));
    const carEmissions = Math.round(baseCarEmissions * (1 + shiftToLowerEmission * 1.5));
    
    const flightTrips = Math.round(baseFlightTrips * (1 - reductionFactor * 0.5));
    const trainTrips = Math.round(baseTrainTrips * (1 + shiftToLowerEmission * 2.5));
    const carTrips = Math.round(baseCarTrips * (1 + shiftToLowerEmission * 1.8));

    const data = [
      {
        mode: 'Flight',
        emissions: flightEmissions,
        trips: flightTrips,
        color: '#e74c3c',
        hoverColor: '#c0392b',
        IconComponent: FaPlane,
        description: 'Commercial flights and air travel'
      },
      {
        mode: 'Train',
        emissions: trainEmissions, 
        trips: trainTrips,
        color: '#f39c12',
        hoverColor: '#e67e22',
        IconComponent: FaTrain,
        description: 'High-speed and regional rail transport'
      },
      {
        mode: 'Car',
        emissions: carEmissions,
        trips: carTrips,
        color: '#d68910',
        hoverColor: '#b7950b',
        IconComponent: FaCar,
        description: 'Company cars and rental vehicles'
      }
    ];

    const getValue = d => viewMode === 'emissions' ? d.emissions : d.trips;
    const total = d3.sum(data, getValue);

    const pie = d3.pie()
      .value(getValue)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d3.arc()
            .innerRadius(radius * 0.45)
            .outerRadius(radius * 0.87)
          )
          .attr('fill', d.data.hoverColor);

        const percentage = ((getValue(d.data) / total) * 100).toFixed(1);
        const efficiency = viewMode === 'emissions' ? 
          (d.data.emissions / d.data.trips).toFixed(1) + ' tCO₂e per trip' :
          (d.data.trips / d.data.emissions * 1000).toFixed(0) + ' trips per 1000 tCO₂e';

        setTooltip({
          mode: d.data.mode,
          description: d.data.description,
          emissions: d.data.emissions,
          trips: d.data.trips,
          percentage: percentage,
          efficiency: efficiency,
          IconComponent: d.data.IconComponent,
          color: d.data.color
        });
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .attr('fill', d.data.color);

        setTooltip(null);
      });

    // Add simple text icons instead of complex SVG for better compatibility
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '20px')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text(d => {
        if (d.data.IconComponent === FaPlane) return '✈';
        if (d.data.IconComponent === FaTrain) return '🚆';
        if (d.data.IconComponent === FaCar) return '🚗';
        return '•';
      });

    const centerGroup = g.append('g')
      .attr('text-anchor', 'middle');

    centerGroup.append('text')
      .attr('y', -15)
      .attr('font-size', '22px')
      .attr('font-weight', '700')
      .attr('fill', '#2c3e50')
      .text(total.toLocaleString());

    centerGroup.append('text')
      .attr('y', 5)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#7f8c8d')
      .text(viewMode === 'emissions' ? 'Total tCO₂e' : 'Total Trips');

    centerGroup.append('text')
      .attr('y', 20)
      .attr('font-size', '10px')
      .attr('fill', '#95a5a6')
      .text('Hover for details');

    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height + margin.top - 30})`);

    data.forEach((d, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(${i * (width / 3)}, 0)`)
        .style('cursor', 'pointer');

      // Simple text icon for legend
      const IconComponent = d.IconComponent;
      legendRow.append('text')
        .attr('x', 8)
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .style('fill', d.color)
        .text(() => {
          if (IconComponent === FaPlane) return '✈';
          if (IconComponent === FaTrain) return '🚆';
          if (IconComponent === FaCar) return '🚗';
          return '•';
        });

      legendRow.append('circle')
        .attr('cx', 22)
        .attr('cy', 8)
        .attr('r', 6)
        .attr('fill', d.color);

      legendRow.append('text')
        .attr('x', 32)
        .attr('y', 12)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#2c3e50')
        .text(`${d.mode} (${((getValue(d) / total) * 100).toFixed(1)}%)`);
    });

  }, [travelData, viewMode]);

  return (
    <div 
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg 
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%'
        }}
      />

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 15,
          top: mousePos.y - 10,
          background: 'rgba(255, 255, 255, 0.98)',
          color: '#2c3e50',
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          zIndex: 1000,
          pointerEvents: 'none',
          minWidth: '240px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '20px', color: tooltip.color }}>
              {tooltip.IconComponent && <tooltip.IconComponent />}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {tooltip.mode} Transport
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(44, 62, 80, 0.7)' }}>
                {tooltip.description}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(44, 62, 80, 0.7)' }}>CO₂ Emissions:</span>
            <span style={{ fontWeight: '600' }}>{tooltip.emissions.toLocaleString()} tCO₂e</span>
          </div>

          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(44, 62, 80, 0.7)' }}>Total Trips:</span>
            <span style={{ fontWeight: '600' }}>{tooltip.trips.toLocaleString()}</span>
          </div>

          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(44, 62, 80, 0.7)' }}>Share of Total:</span>
            <span style={{ fontWeight: '600', color: tooltip.color }}>{tooltip.percentage}%</span>
          </div>

          <div style={{
            padding: '8px',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            borderRadius: '6px',
            borderLeft: `3px solid ${tooltip.color}`
          }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(44, 62, 80, 0.7)' }}>
              Efficiency: <strong>{tooltip.efficiency}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessTravelDonut;
