import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FaWineGlass, FaCogs, FaNewspaper, FaSeedling, FaLaptop, FaTrash } from 'react-icons/fa';

function WasteCompositionChart({ totalWaste = 12500, enabledInterventions, interventionFunding = 0 }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Static waste composition data with green theme gradient and icons
  const wasteData = [
    { 
      category: 'Glass', 
      percentage: 15, 
      color: '#27ae60', // Primary green (highly recyclable)
      icon: FaWineGlass,
      destinations: { Recycle: 95, Reuse: 3, Landfill: 2 }
    },
    { 
      category: 'Metal', 
      percentage: 12, 
      color: '#2ecc71', // Brighter green (highly recyclable)
      icon: FaCogs,
      destinations: { Recycle: 92, Reuse: 5, Landfill: 3 }
    },
    { 
      category: 'Paper', 
      percentage: 28, 
      color: '#58d68d', // Light green (highly recyclable)
      icon: FaNewspaper,
      destinations: { Recycle: 85, Reuse: 10, Landfill: 5 }
    },
    { 
      category: 'Organic', 
      percentage: 30, 
      color: '#82e5aa', // Lighter green (compostable)
      icon: FaSeedling,
      destinations: { Recycle: 15, Reuse: 75, Landfill: 10 }
    },
    { 
      category: 'IT', 
      percentage: 5, 
      color: '#76c893', // Medium-dark green (specialized recycling)
      icon: FaLaptop,
      destinations: { Recycle: 80, Reuse: 15, Landfill: 5 }
    },
    { 
      category: 'Mixed', 
      percentage: 10, 
      color: '#95d5b2', // Medium green (least recyclable)
      icon: FaTrash,
      destinations: { Recycle: 25, Reuse: 5, Landfill: 70 }
    }
  ];

  // Calculate dynamic waste composition based on enabled interventions
  const calculateDynamicComposition = () => {
    const baseData = [...wasteData];
    
    // Safety check for enabledInterventions
    if (!enabledInterventions) {
      return baseData;
    }
    
    // Define intervention impacts on waste categories
    const interventionImpacts = {
      foodWaste: { // Reduces organic waste
        Organic: -0.25 * (interventionFunding / 100) // Up to 25% reduction in organic waste
      },
      campusReuse: { // Reduces IT and Mixed waste
        IT: -0.20 * (interventionFunding / 100),
        Mixed: -0.15 * (interventionFunding / 100)
      },
      recyclingUplift: { // Reduces all recyclable categories slightly
        Paper: -0.10 * (interventionFunding / 100),
        Glass: -0.08 * (interventionFunding / 100),
        Metal: -0.12 * (interventionFunding / 100)
      },
      circularProcurement: { // Reduces overall waste generation
        Paper: -0.15 * (interventionFunding / 100),
        Mixed: -0.20 * (interventionFunding / 100)
      },
      cdMinimisation: { // Reduces mixed and metal waste
        Mixed: -0.10 * (interventionFunding / 100),
        Metal: -0.08 * (interventionFunding / 100)
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
        percentage: Math.max(adjustedPercentage, category.percentage * 0.3) // Minimum 30% of original
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

  const dynamicWasteData = calculateDynamicComposition();

  // Calculate tons for each category
  const dataWithTons = dynamicWasteData.map(d => ({
    ...d,
    tons: Math.round((totalWaste * d.percentage) / 100)
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
      .data(pie(dataWithTons))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Create gradients for each arc
    const defs = svg.append('defs');
    
    dataWithTons.forEach((d, i) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${i}`)
        .attr('cx', '30%')
        .attr('cy', '30%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(d.color).brighter(0.3));
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color);
    });

    // Add path elements
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.3s ease')
      .style('filter', 'drop-shadow(0 2px 4px rgba(39,174,96,0.2))')
      .on('mouseenter', function(event, d) {
        // Expand arc on hover with glow effect
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc)
          .style('filter', 'drop-shadow(0 4px 8px rgba(39,174,96,0.4))');
        
        // Show tooltip
        setTooltip({
          category: d.data.category,
          percentage: d.data.percentage,
          tons: d.data.tons,
          destinations: d.data.destinations
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function() {
        // Return to normal size and shadow
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .style('filter', 'drop-shadow(0 2px 4px rgba(39,174,96,0.2))');
        
        // Hide tooltip
        setTooltip(null);
      });

    // Add icons to arc centroids using React icons
    arcs.each(function(d, i) {
      const centroid = arc.centroid(d);
      const iconSize = 24;
      
      // Create foreign object for React icon
      const foreignObject = d3.select(this)
        .append('foreignObject')
        .attr('x', centroid[0] - iconSize/2)
        .attr('y', centroid[1] - iconSize/2)
        .attr('width', iconSize)
        .attr('height', iconSize)
        .style('pointer-events', 'none');
      
      // Create a container div that React can render into
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))';
      
      foreignObject.node().appendChild(container);
      
      // Render the React icon
      const IconComponent = d.data.icon;
      const iconElement = React.createElement(IconComponent, { 
        size: 18, 
        color: '#ffffff',
        style: { 
          filter: 'brightness(1.1)',
          opacity: 0.95 
        }
      });
      
      // Use ReactDOM to render the icon (we'll need to import it)
      // For now, create the icon manually with SVG paths
      const iconSVG = createIconSVG(IconComponent);
      container.innerHTML = iconSVG;
    });
    
    // Helper function to create SVG icons with light colors
    function createIconSVG(IconComponent) {
      const iconMap = {
        [FaWineGlass]: `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 320 512" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); opacity: 0.95;"><path d="M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64h35.8l45.9 123H96c-53 0-96 43-96 96s43 96 96 96h64c53 0 96-43 96-96s-43-96-96-96h-17.7l45.9-123H224c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM160 320c17.7 0 32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32z"/></svg>`,
        [FaCogs]: `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 640 512" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); opacity: 0.95;"><path d="M512.1 191l-8.2 14.3c-3 5.3-9.4 8.5-16.1 8.5s-13.1-3.2-16.1-8.5L460.7 191c-20.7 17.1-45.5 27-72.7 27s-52-9.9-72.7-27l-10.9 19.5c-3 5.3-3 11.9 0 17.2L315.3 244c6.2 11.1 6.2 24.9 0 36L304.4 297c-3 5.3-3 11.9 0 17.2l10.9 19.5c20.7-17.1 45.5-27 72.7-27s52 9.9 72.7 27l10.9-19.5c3-5.3 9.4-8.5 16.1-8.5s13.1 3.2 16.1 8.5l8.2 14.3c-8.7 14.5-14.2 30.6-15.9 47.7L485 361c-5.5 2.3-9.1 7.7-9.1 13.7v21.3c0 6 3.6 11.4 9.1 13.7L496.1 415c1.7 17.1 7.2 33.2 15.9 47.7l-8.2 14.3c-3 5.3-9.4 8.5-16.1 8.5s-13.1-3.2-16.1-8.5L460.7 463c-20.7 17.1-45.5 27-72.7 27s-52-9.9-72.7-27l-10.9 19.5c-3 5.3-3 11.9 0 17.2L315.3 516c6.2 11.1 6.2 24.9 0 36l-10.9 19.5c-3 5.3-3 11.9 0 17.2L315.3 605c20.7-17.1 45.5-27 72.7-27s52 9.9 72.7 27l10.9-19.5c3-5.3 9.4-8.5 16.1-8.5s13.1 3.2 16.1 8.5l8.2 14.3C503.4 585.2 512 569.3 512 551.9V199.1c0-17.4-8.6-33.3-23.9-42.8z"/></svg>`,
        [FaNewspaper]: `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 512 512" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); opacity: 0.95;"><path d="M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v80c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z"/></svg>`,
        [FaSeedling]: `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 512 512" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); opacity: 0.95;"><path d="M512 32c0 113.6-84.6 207.5-194.2 222-7.1-53.4-30.6-101.6-65.3-139.3C290.8 46.3 364 0 448 0h32c17.7 0 32 14.3 32 32zM0 96C0 78.3 14.3 64 32 64H64c123.7 0 224 100.3 224 224v32V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V320C100.3 320 0 219.7 0 96z"/></svg>`,
        [FaLaptop]: `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 640 512" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); opacity: 0.95;"><path d="M128 32C92.7 32 64 60.7 64 96V352h64V96H512V352h64V96c0-35.3-28.7-64-64-64H128zM19.2 384C8.6 384 0 392.6 0 403.2C0 445.6 34.4 480 76.8 480H563.2c42.4 0 76.8-34.4 76.8-76.8c0-10.6-8.6-19.2-19.2-19.2H19.2z"/></svg>`,
        [FaTrash]: `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 448 512" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); opacity: 0.95;"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`
      };
      
      return iconMap[IconComponent] || `<svg width="18" height="18" fill="#ffffff" viewBox="0 0 512 512"><circle cx="256" cy="256" r="64"/></svg>`;
    }

    // Add center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#27ae60')
      .text('Total Waste');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '14px')
      .attr('fill', '#666')
      .text(`${totalWaste.toLocaleString()} tons`);

  }, [totalWaste, enabledInterventions, interventionFunding]);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(39,174,96,0.08)',
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.1rem',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        Waste Composition
      </h3>
      
      <svg ref={svgRef}></svg>
      

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
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#27ae60' }}>
            {tooltip.category}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Share:</strong> {tooltip.percentage}% ({tooltip.tons} tons)
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Destinations:</div>
            <div>🔄 Recycle: {tooltip.destinations.Recycle}%</div>
            <div>♻️ Reuse: {tooltip.destinations.Reuse}%</div>
            <div>🗑️ Landfill: {tooltip.destinations.Landfill}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteCompositionChart;