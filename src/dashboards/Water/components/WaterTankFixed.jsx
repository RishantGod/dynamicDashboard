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

  // Calculate fill percentage
  const fillPercentage = Math.min((value / maxValue) * 100, 100);

  // Initialize tank structure only once
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
    
    // Tank gradient (metallic look)
    const tankGradient = defs.append('linearGradient')
      .attr('id', `tankGradient-${waterType}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    tankGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#d5d8dc')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '30%')
      .attr('stop-color', '#f8f9fa')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#e9ecef')
      .attr('stop-opacity', 1);

    tankGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#adb5bd')
      .attr('stop-opacity', 1);

    // Water gradient
    const waterGradient = defs.append('linearGradient')
      .attr('id', `waterGradient-${waterType}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    if (waterType === 'clean') {
      // Clean water (blue)
      waterGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#5dade2')
        .attr('stop-opacity', 0.8);

      waterGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#3498db')
        .attr('stop-opacity', 0.9);

      waterGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2874a6')
        .attr('stop-opacity', 0.8);
    } else {
      // Wastewater (grey-brown)
      waterGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#a6acaf')
        .attr('stop-opacity', 0.8);

      waterGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#85929e')
        .attr('stop-opacity', 0.9);

      waterGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#566573')
        .attr('stop-opacity', 0.8);
    }

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

    // Create tank shape
    const tankGroup = svg.append('g').attr('class', 'tank-container');
    
    // Tank body (cylinder)
    tankGroup.append('rect')
      .attr('x', tankX)
      .attr('y', tankY + ellipseRadiusY)
      .attr('width', tankWidth)
      .attr('height', tankHeight - ellipseRadiusY * 2)
      .attr('fill', `url(#tankGradient-${waterType})`)
      .attr('stroke', '#7f8c8d')
      .attr('stroke-width', 2);

    // // Tank top (ellipse)
    tankGroup.append('ellipse')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + ellipseRadiusY)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY)
      .attr('fill', `url(#tankGradient-${waterType})`)
      .attr('stroke', '#7f8c8d')
      .attr('stroke-width', 2);

    // Create water group (initially empty)
    const waterGroup = svg.append('g').attr('class', 'water-fill');

    // Water fill rectangle (starts empty)
    waterGroup.append('rect')
      .attr('class', 'water-fill-rect')
      .attr('x', tankX)
      .attr('y', tankY + tankHeight - ellipseRadiusY)
      .attr('width', tankWidth)
      .attr('height', 0)
      .attr('fill', `url(#waterGradient-${waterType})`)
      .attr('clip-path', `url(#waterClip-${waterType})`);

    // Water surface ellipse (initially hidden)
    waterGroup.append('ellipse')
      .attr('class', 'water-surface')
      .attr('cx', tankX + tankWidth / 2)
      .attr('cy', tankY + tankHeight - ellipseRadiusY)
      .attr('rx', ellipseRadiusX)
      .attr('ry', ellipseRadiusY)
      .attr('fill', waterType === 'clean' ? '#3498db' : '#85929e')
      .attr('opacity', 0);



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

    // Update water surface
    const waterSurface = svg.select('.water-surface');
    if (!waterSurface.empty()) {
      if (fillPercentage > 5) {
        if (animate) {
          waterSurface
            .transition()
            .duration(800)
            .ease(d3.easeQuadInOut)
            .attr('cy', waterStartY)
            .attr('opacity', 0.9);
        } else {
          waterSurface
            .attr('cy', waterStartY)
            .attr('opacity', 0.9);
        }
      } else {
        waterSurface.attr('opacity', 0);
      }
    }

    // Remove old bubbles and add new ones
    svg.selectAll('.bubble').remove();
    
    // Add bubbles in water for realism
    if (fillPercentage > 10) {
      const numBubbles = Math.min(Math.floor(fillPercentage / 25), 4);
      
      for (let i = 0; i < numBubbles; i++) {
        const bubbleX = tankX + tankWidth * (0.2 + Math.random() * 0.6);
        const bubbleY = waterStartY + (waterFillHeight * Math.random() * 0.8);
        
        const bubble = svg.select('.water-fill').append('circle')
          .attr('class', 'bubble')
          .attr('cx', bubbleX)
          .attr('cy', bubbleY + 20)
          .attr('r', 0)
          .attr('fill', 'rgba(255, 255, 255, 0.7)')
          .attr('clip-path', `url(#waterClip-${waterType})`);

        if (animate) {
          bubble
            .transition()
            .delay(i * 200)
            .duration(400)
            .ease(d3.easeBackOut.overshoot(1.1))
            .attr('r', 1.5 + Math.random() * 2)
            .attr('cy', bubbleY)
            .transition()
            .duration(3000)
            .ease(d3.easeSinInOut)
            .attr('cy', waterStartY - 10)
            .attr('opacity', 0)
            .on('end', function() {
              d3.select(this).remove();
            });
        } else {
          bubble
            .attr('r', 1.5 + Math.random() * 2)
            .attr('cy', bubbleY);
        }
      }
    }

  }, [value, fillPercentage, animate]); // Update when value or animation state changes

  return (
    <div 
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          display: 'block'
        }}
      />

    </div>
  );
}

export default WaterTank;