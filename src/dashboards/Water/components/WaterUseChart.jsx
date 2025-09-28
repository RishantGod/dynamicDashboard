import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FaUniversity, FaHome, FaSwimmingPool, FaTools, FaBirthdayCake, FaFlask } from 'react-icons/fa';

function WaterUseChart({ totalWaterUse = 450000, enabledInterventions, interventionFunding = 0 }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Static water use composition data with blue theme gradient and icons
  const waterData = [
    { 
      category: 'Academic', 
      percentage: 25, 
      color: '#3498db', // Primary blue
      icon: FaUniversity,
      uses: ['Laboratories', 'Classrooms', 'Libraries']
    },
    { 
      category: 'Residential', 
      percentage: 35, 
      color: '#5dade2', // Light blue
      icon: FaHome,
      uses: ['Dormitories', 'Staff Housing', 'Dining Halls']
    },
    { 
      category: 'Recreation', 
      percentage: 15, 
      color: '#85c1e9', // Lighter blue
      icon: FaSwimmingPool,
      uses: ['Sports Facilities', 'Pools', 'Fitness Centers']
    },
    { 
      category: 'Maintenance', 
      percentage: 12, 
      color: '#aed6f1', // Very light blue
      icon: FaTools,
      uses: ['Cleaning', 'HVAC Systems', 'Equipment']
    },
    { 
      category: 'Catering', 
      percentage: 8, 
      color: '#d6eaf8', // Pale blue
      icon: FaBirthdayCake,
      uses: ['Kitchens', 'Food Preparation', 'Dishwashing']
    },
    { 
      category: 'Research', 
      percentage: 5, 
      color: '#ebf5fb', // Very pale blue
      icon: FaFlask,
      uses: ['Research Labs', 'Experimental Facilities', 'Greenhouses']
    }
  ];

  // Calculate dynamic water composition based on enabled interventions
  const calculateDynamicComposition = () => {
    const baseData = [...waterData];
    
    // Safety check for enabledInterventions
    if (!enabledInterventions) {
      return baseData;
    }
    
    // Define intervention impacts on water categories
    const interventionImpacts = {
      rainwaterHarvesting: { // Reduces Academic and Research water use
        Academic: -0.15 * (interventionFunding / 100),
        Research: -0.20 * (interventionFunding / 100)
      },
      greywaterRecycling: { // Reduces Residential and Recreation water use
        Residential: -0.25 * (interventionFunding / 100),
        Recreation: -0.30 * (interventionFunding / 100)
      },
      leakDetection: { // Reduces all categories slightly
        Academic: -0.08 * (interventionFunding / 100),
        Residential: -0.08 * (interventionFunding / 100),
        Recreation: -0.08 * (interventionFunding / 100),
        Maintenance: -0.10 * (interventionFunding / 100)
      },
      smartIrrigation: { // Mainly affects Maintenance and Recreation
        Maintenance: -0.20 * (interventionFunding / 100),
        Recreation: -0.15 * (interventionFunding / 100)
      },
      waterEfficiencyUpgrades: { // Reduces all categories
        Academic: -0.12 * (interventionFunding / 100),
        Residential: -0.18 * (interventionFunding / 100),
        Recreation: -0.10 * (interventionFunding / 100),
        Maintenance: -0.15 * (interventionFunding / 100),
        Catering: -0.20 * (interventionFunding / 100),
        Research: -0.10 * (interventionFunding / 100)
      }
    };

    // Apply intervention impacts
    const adjustedData = baseData.map(category => {
      let adjustedPercentage = category.percentage;
      
      Object.keys(enabledInterventions).forEach(intervention => {
        if (enabledInterventions[intervention] && interventionImpacts[intervention]) {
          const impact = interventionImpacts[intervention][category.category];
          if (impact) {
            adjustedPercentage += adjustedPercentage * impact; // Proportional reduction
          }
        }
      });
      
      return {
        ...category,
        percentage: Math.max(adjustedPercentage, category.percentage * 0.4) // Minimum 40% of original
      };
    });

    // Normalize percentages to ensure they sum to 100
    const totalPercentage = adjustedData.reduce((sum, d) => sum + d.percentage, 0);
    const normalizedData = adjustedData.map(d => ({
      ...d,
      percentage: (d.percentage / totalPercentage) * 100
    }));

    return normalizedData;
  };

  const dynamicWaterData = calculateDynamicComposition();

  // Calculate cubic meters for each category
  const dataWithVolume = dynamicWaterData.map(d => ({
    ...d,
    volume: Math.round((totalWaterUse * d.percentage) / 100)
  }));

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.5; // For donut chart

    // Create pie generator
    const pie = d3.pie()
      .value(d => d.percentage)
      .sort(null);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Create hover arc generator (slightly larger)
    const hoverArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 8);

    // Set up SVG
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(dataWithVolume))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Create gradients for each arc
    const defs = svg.append('defs');
    dataWithVolume.forEach((d, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `water-gradient-${i}`)
        .attr('gradientUnits', 'objectBoundingBox');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.color);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(d.color).darker(0.3));
    });

    // Add paths
    const paths = arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => `url(#water-gradient-${i})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc);
        
        setTooltip({
          category: d.data.category,
          percentage: d.data.percentage.toFixed(1),
          volume: d.data.volume,
          uses: d.data.uses
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

    // Add icons
    arcs.each(function(d, i) {
      const [x, y] = arc.centroid(d);
      const IconComponent = d.data.icon;
      
      // Create a foreignObject to embed React icon
      const fo = d3.select(this)
        .append('foreignObject')
        .attr('x', x - 12)
        .attr('y', y - 12)
        .attr('width', 24)
        .attr('height', 24)
        .style('pointer-events', 'none');
      
      // Add the icon using innerHTML (React icon as SVG)
      const iconSvg = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="${getIconPath(d.data.category)}" />
        </svg>
      `;
      fo.node().innerHTML = iconSvg;
    });

    // Add center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3498db')
      .text('Water Use');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '14px')
      .attr('fill', '#666')
      .text(`${totalWaterUse.toLocaleString()} m³`);

    // Clear tooltip when mouse leaves SVG
    svg.on('mouseleave', function() {
      setTooltip(null);
      // Reset all arcs to normal size
      paths.transition()
        .duration(200)
        .attr('d', arc);
    });

  }, [totalWaterUse, enabledInterventions, interventionFunding]);

  // Helper function to get icon paths (simplified icons)
  const getIconPath = (category) => {
    const icons = {
      'Academic': 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z',
      'Residential': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      'Recreation': 'M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
      'Maintenance': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
      'Catering': 'M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zM16.6 16H7.4l.46-2h8.28l.46 2zm-2.6 0h-4l-1 4h6l-1-4zm6-2H4l2-8h12l2 8z',
      'Research': 'M9 2v6h2V7h1v5H8.5v2h7V12H12V7h1v1h2V2H9zm5.5 11H16v1.5h-1.5V13zm-3 0H13v1.5h-1.5V13zm-3 0H10v1.5H8.5V13zm9.5 2v7H2v-7h16zm-2 5H4v-3h12v3z'
    };
    return icons[category] || icons['Academic'];
  };

  return (
    <div>
      <h3 style={{
        textAlign: 'center',
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Water Use Breakdown
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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
          maxWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#3498db' }}>
            {tooltip.category}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Share:</strong> {tooltip.percentage}% ({tooltip.volume.toLocaleString()} m³)
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Primary Uses:</div>
            {tooltip.uses.map((use, index) => (
              <div key={index}>• {use}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WaterUseChart;