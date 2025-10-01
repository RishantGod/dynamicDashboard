import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function WaterTank({ 
  value, 
  maxValue = 600000, 
  width = 80, 
  height = 100, 
  animate = true,
  waterType = 'clean' // 'clean' for blue water, 'waste' for grey water
}) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Calculate fill percentage
  const fillPercentage = Math.min((value / maxValue) * 100, 100);

  // Initialize tank structure only once (not when value changes)
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Tank dimensions
    const tankWidth = width * 0.7;
    const tankHeight = height * 0.8;
    const tankX = (width - tankWidth) / 2;
    const tankY = height * 0.1;
    const ellipseRadiusX = tankWidth / 2;
    const ellipseRadiusY = tankHeight * 0.1;

    // Create gradients
    const defs = svg.append('defs');
    
    // Enhanced metallic tank gradient with 3D effect
    const tankGradient = defs.append('linearGradient')
      .attr('id', `tankGradient-${waterType}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    tankGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#b2bec3')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '15%')
      .attr('stop-color', '#ddd')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '45%')
      .attr('stop-color', '#f8f9fa')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '55%')
      .attr('stop-color', '#ffffff')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '75%')
      .attr('stop-color', '#e9ecef')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#95a5a6')
      .attr('stop-opacity', 1);

    // Create shadow gradient for depth
    const shadowGradient = defs.append('radialGradient')
      .attr('id', `shadowGradient-${waterType}`)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '60%');

    shadowGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#000000')
      .attr('stop-opacity', 0);

    shadowGradient.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#000000')
      .attr('stop-opacity', 0.1);

    shadowGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#000000')
      .attr('stop-opacity', 0.3);

    // Enhanced bottom gradient for 3D effect
    const bottomGradient = defs.append('radialGradient')
      .attr('id', `bottomGradient-${waterType}`)
      .attr('cx', '50%')
      .attr('cy', '30%')
      .attr('r', '80%');

    bottomGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ecf0f1')
      .attr('stop-opacity', 1);

    bottomGradient.append('stop')
      .attr('offset', '60%')
      .attr('stop-color', '#bdc3c7')
      .attr('stop-opacity', 1);

    bottomGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#95a5a6')
      .attr('stop-opacity', 1);

    // Enhanced water gradient with shimmer effect
    const waterGradient = defs.append('linearGradient')
      .attr('id', `waterGradient-${waterType}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    // Animated shimmer gradient
    const shimmerGradient = defs.append('linearGradient')
      .attr('id', `shimmerGradient-${waterType}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    if (waterType === 'clean') {
      // Clean water with depth and shimmer
      waterGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#85c1e9')
        .attr('stop-opacity', 0.7);

      waterGradient.append('stop')
        .attr('offset', '25%')
        .attr('stop-color', '#5dade2')
        .attr('stop-opacity', 0.8);

      waterGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#3498db')
        .attr('stop-opacity', 0.9);

      waterGradient.append('stop')
        .attr('offset', '75%')
        .attr('stop-color', '#2980b9')
        .attr('stop-opacity', 0.95);

      waterGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#1f618d')
        .attr('stop-opacity', 1);

      // Shimmer effect for clean water
      shimmerGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0);

      shimmerGradient.append('stop')
        .attr('offset', '40%')
        .attr('stop-color', '#aed6f1')
        .attr('stop-opacity', 0.3);

      shimmerGradient.append('stop')
        .attr('offset', '60%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0.6);

      shimmerGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0);
    } else {
      // Wastewater with realistic murky appearance
      waterGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#bfc9ca')
        .attr('stop-opacity', 0.7);

      waterGradient.append('stop')
        .attr('offset', '25%')
        .attr('stop-color', '#a6acaf')
        .attr('stop-opacity', 0.8);

      waterGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#85929e')
        .attr('stop-opacity', 0.9);

      waterGradient.append('stop')
        .attr('offset', '75%')
        .attr('stop-color', '#707b7c')
        .attr('stop-opacity', 0.95);

      waterGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#566573')
        .attr('stop-opacity', 1);

      // Subtle shimmer for wastewater
      shimmerGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0);

      shimmerGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#d5dbdb')
        .attr('stop-opacity', 0.2);

      shimmerGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0);
    }



    // Create ripple pattern for water surface animation
    const ripplePattern = defs.append('pattern')
      .attr('id', `ripplePattern-${waterType}`)
      .attr('x', '0')
      .attr('y', '0')
      .attr('width', '40')
      .attr('height', '20')
      .attr('patternUnits', 'userSpaceOnUse');



    // Create filter for tank 3D effect
    const filter = defs.append('filter')
      .attr('id', 'tankFilter')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    // Add subtle inner shadow
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1)
      .attr('result', 'blur');

    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'offsetBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create realistic bubble gradient
    const bubbleGradient = defs.append('radialGradient')
      .attr('id', `bubbleGradient-${waterType}`)
      .attr('cx', '30%')
      .attr('cy', '30%')
      .attr('r', '70%');

    bubbleGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ffffff')
      .attr('stop-opacity', 0.9);

    bubbleGradient.append('stop')
      .attr('offset', '40%')
      .attr('stop-color', waterType === 'clean' ? '#aed6f1' : '#d5dbdb')
      .attr('stop-opacity', 0.6);

    bubbleGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', waterType === 'clean' ? '#3498db' : '#85929e')
      .attr('stop-opacity', 0.3);

    // Create glow filter for water level indicator
    const glowFilter = defs.append('filter')
      .attr('id', `glowFilter-${waterType}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', 3)
      .attr('result', 'coloredBlur');

    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create tank shape with enhanced 3D appearance
    const tankGroup = svg.append('g').attr('class', 'tank-container');

    // // Add drop shadow behind tank
    tankGroup.append('ellipse')
      .attr('cx', tankX + tankWidth / 2 + 2)
      .attr('cy', tankY + tankHeight - ellipseRadiusY + 3)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY)
      .attr('fill', `url(#shadowGradient-${waterType})`);

    tankGroup.append('rect')
      .attr('x', tankX + 2)
      .attr('y', tankY + ellipseRadiusY + 2)
      .attr('width', tankWidth)
      .attr('height', tankHeight - ellipseRadiusY * 2)
      .attr('fill', `url(#shadowGradient-${waterType})`);
    
    // Tank body (cylinder) with enhanced metallic appearance
    tankGroup.append('rect')
      .attr('x', tankX)
      .attr('y', tankY + ellipseRadiusY)
      .attr('width', tankWidth)
      .attr('height', tankHeight - ellipseRadiusY * 2)
      .attr('fill', `url(#tankGradient-${waterType})`)
      .attr('stroke', '#7f8c8d')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#tankFilter)');

    // Tank bottom (ellipse) with realistic 3D gradient
    tankGroup.append('ellipse')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + tankHeight - ellipseRadiusY)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY)
      .attr('fill', `url(#bottomGradient-${waterType})`)
      .attr('stroke', '#7f8c8d')
      .attr('stroke-width', 1.5);

    // Tank top (ellipse) with enhanced gradient
    tankGroup.append('ellipse')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + ellipseRadiusY)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY)
      .attr('fill', `url(#tankGradient-${waterType})`)
      .attr('stroke', '#7f8c8d')
      .attr('stroke-width', 1.5);

    // Add inner rim highlight for realism
    tankGroup.append('ellipse')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + ellipseRadiusY)
      .attr('rx', ellipseRadiusX - 3)
      .attr('ry', ellipseRadiusY - 1)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6);

    // Clipping path for water (tank shape)
    const clipPath = defs.append('clipPath')
      .attr('id', `waterClip-${waterType}`);
    
    // Tank body clip
    clipPath.append('rect')
      .attr('x', tankX)
      .attr('y', tankY + ellipseRadiusY)
      .attr('width', tankWidth)
      .attr('height', tankHeight - ellipseRadiusY * 2);
    
    // Bottom ellipse clip
    clipPath.append('ellipse')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + tankHeight - ellipseRadiusY)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY);

    // Create empty water group
    const waterGroup = svg.append('g').attr('class', 'water-fill');

    // Water fill rectangle (initially empty)
    waterGroup.append('rect')
      .attr('class', 'water-fill-rect')
      .attr('x', tankX)
      .attr('y', tankY + tankHeight - ellipseRadiusY)
      .attr('width', tankWidth)
      .attr('height', 0)
      .attr('fill', `url(#waterGradient-${waterType})`)
      .attr('clip-path', `url(#waterClip-${waterType})`);



    // Enhanced water surface ellipse with ripple effect
    waterGroup.append('ellipse')
      .attr('class', 'water-surface')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + tankHeight - ellipseRadiusY)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY)
      .attr('fill', waterType === 'clean' ? 'url(#surfaceGradient-clean)' : 'url(#surfaceGradient-waste)')
      .attr('opacity', 0);



    // Add water level glow indicator (initially hidden)
    waterGroup.append('line')
      .attr('class', 'water-level-glow')
      .attr('x1', tankX - 5)
      .attr('y1', tankY + tankHeight - ellipseRadiusY)
      .attr('x2', tankX + tankWidth + 5)
      .attr('y2', tankY + tankHeight - ellipseRadiusY)
      .attr('stroke', waterType === 'clean' ? '#3498db' : '#85929e')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .attr('filter', `url(#glowFilter-${waterType})`);



    // Create surface gradient for more realistic water surface
    const surfaceGradient = defs.append('radialGradient')
      .attr('id', `surfaceGradient-${waterType}`)
      .attr('cx', '50%')
      .attr('cy', '30%')
      .attr('r', '70%');

    if (waterType === 'clean') {
      surfaceGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#aed6f1')
        .attr('stop-opacity', 0.9);

      surfaceGradient.append('stop')
        .attr('offset', '60%')
        .attr('stop-color', '#3498db')
        .attr('stop-opacity', 0.8);

      surfaceGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#1f618d')
        .attr('stop-opacity', 0.9);
    } else {
      surfaceGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#d5dbdb')
        .attr('stop-opacity', 0.7);

      surfaceGradient.append('stop')
        .attr('offset', '60%')
        .attr('stop-color', '#85929e')
        .attr('stop-opacity', 0.8);

      surfaceGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#566573')
        .attr('stop-opacity', 0.9);
    }
    // Add hover area
    const hoverArea = svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event) {
        setTooltip({
          value: value,
          maxValue: maxValue,
          percentage: fillPercentage,
          waterType: waterType
        });
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function() {
        setTooltip(null);
      });

  }, [waterType, width, height]); // Only recreate when tank structure needs to change

  // Update water level smoothly when value changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tankWidth = width * 0.7;
    const tankHeight = height * 0.8;
    const tankX = (width - tankWidth) / 2;
    const tankY = height * 0.1;
    const ellipseRadiusY = tankHeight * 0.1;

    const waterFillHeight = ((tankHeight - ellipseRadiusY * 2) * fillPercentage) / 100;
    const waterStartY = tankY + tankHeight - ellipseRadiusY - waterFillHeight;
    const tankBottomY = tankY + tankHeight - ellipseRadiusY;

    // Update water fill rectangle
    const waterFillRect = svg.select('.water-fill-rect');
    if (!waterFillRect.empty()) {
      if (animate) {
        waterFillRect
          .transition()
          .duration(800)
          .ease(d3.easeQuadInOut)
          .attr('y', waterStartY)
          .attr('height', waterFillHeight + ellipseRadiusY);
      } else {
        waterFillRect
          .attr('y', waterStartY)
          .attr('height', waterFillHeight + ellipseRadiusY);
      }
    }



    // Update water surface with enhanced lighting effects
    const waterSurface = svg.select('.water-surface');
    const waterLevelGlow = svg.select('.water-level-glow');
    const ambientLight = svg.select('.ambient-light');
    
    if (!waterSurface.empty()) {
      if (fillPercentage > 5) {
        if (animate) {
          waterSurface
            .transition()
            .duration(800)
            .ease(d3.easeQuadInOut)
            .attr('cy', waterStartY)
            .attr('opacity', 0.9);
          


          // Animate water level glow indicator
          waterLevelGlow
            .transition()
            .duration(800)
            .ease(d3.easeQuadInOut)
            .attr('y1', waterStartY)
            .attr('y2', waterStartY)
            .attr('opacity', 0.6);

          // Animate ambient lighting
          ambientLight
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr('opacity', fillPercentage > 30 ? 0.8 : 0.4);
        } else {
          waterSurface
            .attr('cy', waterStartY)
            .attr('opacity', 0.9);
          


          waterLevelGlow
            .attr('y1', waterStartY)
            .attr('y2', waterStartY)
            .attr('opacity', 0.6);

          ambientLight
            .attr('opacity', fillPercentage > 30 ? 0.8 : 0.4);
        }
      } else {
        waterSurface.attr('opacity', 0);

        waterLevelGlow.attr('opacity', 0);
        ambientLight.attr('opacity', 0);
      }
    }

    // Remove old bubbles and add new ones
    svg.selectAll('.bubble').remove();
    
    // Reduced bubble system to prevent flickering
    if (fillPercentage > 20) {
      const numBubbles = Math.min(Math.floor(fillPercentage / 30), 4);
      const numParticles = Math.min(Math.floor(fillPercentage / 40), 6);
      
      // Create various sized bubbles
      for (let i = 0; i < numBubbles; i++) {
        const bubbleX = tankX + tankWidth * (0.15 + Math.random() * 0.7);
        const bubbleY = waterStartY + (waterFillHeight * Math.random() * 0.9);
        const bubbleSize = 0.8 + Math.random() * 2.5;
        
        // Create bubble with gradient for 3D effect
        const bubble = svg.select('.water-fill').append('circle')
          .attr('class', 'bubble')
          .attr('cx', bubbleX)
          .attr('cy', bubbleY + 25)
          .attr('r', 0)
          .attr('fill', `url(#bubbleGradient-${waterType})`)
          .attr('stroke', 'rgba(255, 255, 255, 0.3)')
          .attr('stroke-width', 0.5)
          .attr('clip-path', `url(#waterClip-${waterType})`);

        if (animate) {
          bubble
            .transition()
            .delay(i * 300 + Math.random() * 500)
            .duration(500)
            .ease(d3.easeBackOut.overshoot(1.2))
            .attr('r', bubbleSize)
            .attr('cy', bubbleY)
            .transition()
            .duration(2500 + Math.random() * 2000)
            .ease(d3.easeSinInOut)
            .attr('cy', waterStartY - 15)
            .attr('cx', bubbleX + (Math.random() - 0.5) * 10) // Slight horizontal drift
            .attr('r', bubbleSize * 1.3) // Expand as it rises
            .attr('opacity', 0)
            .on('end', function() {
              d3.select(this).remove();
            });
        } else {
          bubble
            .attr('r', bubbleSize)
            .attr('cy', bubbleY);
        }
      }

      // Add floating particles for depth
      for (let i = 0; i < numParticles; i++) {
        const particleX = tankX + tankWidth * Math.random();
        const particleY = waterStartY + (waterFillHeight * Math.random());
        const particleSize = 0.3 + Math.random() * 0.8;
        
        const particle = svg.select('.water-fill').append('circle')
          .attr('class', 'particle')
          .attr('cx', particleX)
          .attr('cy', particleY + 15)
          .attr('r', particleSize)
          .attr('fill', waterType === 'clean' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(200, 200, 200, 0.3)')
          .attr('clip-path', `url(#waterClip-${waterType})`);

        if (animate) {
          particle
            .transition()
            .delay(Math.random() * 1000)
            .duration(4000 + Math.random() * 3000)
            .ease(d3.easeLinear)
            .attr('cy', waterStartY - 20)
            .attr('cx', particleX + (Math.random() - 0.5) * 15)
            .attr('opacity', 0)
            .on('end', function() {
              d3.select(this).remove();
            });
        }
      }
    }

  }, [value, fillPercentage, animate]); // Update when value changes

  return (
    <div 
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          display: 'block'
        }}
      />
      
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 10,
          top: mousePos.y - 10,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: waterType === 'clean' ? '#3498db' : '#85929e' }}>
            {waterType === 'clean' ? 'Clean Water Tank' : 'Wastewater Tank'}
          </div>
          <div style={{ marginBottom: '2px' }}>
            <strong>Current:</strong> {tooltip.value.toLocaleString()} m³/year
          </div>
          <div style={{ marginBottom: '2px' }}>
            <strong>Capacity:</strong> {tooltip.maxValue.toLocaleString()} m³/year
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ccc' }}>
            Tank Fill: {tooltip.percentage.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default WaterTank;