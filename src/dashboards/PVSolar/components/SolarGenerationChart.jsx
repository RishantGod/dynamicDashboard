import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function SolarGenerationChart({ solarCapacity }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!solarCapacity || solarCapacity === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Chart dimensions and margins - responsive to container with sufficient space for x-axis
    const containerWidth = svgRef.current.clientWidth || 820;
    const containerHeight = svgRef.current.clientHeight || 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = Math.min(containerWidth, 820) - margin.left - margin.right;
    const height = Math.min(containerHeight, 400) - margin.top - margin.bottom;

    // Create SVG with responsive dimensions
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Generate sample data for demonstration - energy production only
    const data = [];
    const currentYear = 2025;
    const startYear = 2020;
    const endYear = 2050;
    
    // Annual energy production in kWh (varies by capacity)
    const annualProduction = solarCapacity * 1200; // ~1200 kWh per kW capacity per year
    
    let cumulativeEnergy = 0;
    
    for (let year = startYear; year <= endYear; year++) {
      const isHistorical = year <= currentYear;
      
      // Add some variation to make it realistic
      const yearlyVariation = 1 + (Math.sin((year - startYear) * 0.1) * 0.1);
      const yearlyProduction = annualProduction * yearlyVariation;
      
      if (year > startYear) {
        cumulativeEnergy += yearlyProduction;
      }
      
      data.push({
        year,
        cumulativeEnergy,
        isHistorical
      });
    }    // Create scales
    const xScale = d3.scaleLinear()
      .domain([startYear, endYear])
      .range([0, width]);

    // Single Y-axis for energy production with padding for better visibility
    const maxEnergy = d3.max(data, d => d.cumulativeEnergy);
    const yScaleEnergy = d3.scaleLinear()
      .domain([0, maxEnergy * 1.1]) // Add 10% padding at top
      .range([height, 0]);

    // Create area generator for smooth filled area
    const areaEnergy = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScaleEnergy(d.cumulativeEnergy))
      .curve(d3.curveCardinal);

    // Create line generator for area border
    const lineEnergy = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScaleEnergy(d.cumulativeEnergy))
      .curve(d3.curveCardinal);

    // Split data into historical and projected
    const historicalData = data.filter(d => d.isHistorical);
    const projectedData = data.filter(d => !d.isHistorical);
    
    // Add transition point for smooth connection
    if (projectedData.length > 0) {
      projectedData.unshift(historicalData[historicalData.length - 1]);
    }

    // Add axes with proper formatting
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format("d"))
      .ticks(8);

    const yAxisLeft = d3.axisLeft(yScaleEnergy)
      .tickFormat(d => `${(d / 1000).toFixed(0)}k`)
      .ticks(6);

    // Create gradient using dashboard golden color scheme
    const defs = svg.append('defs');

    // Single gradient for energy data - golden theme
    const gradientEnergy = defs.append('linearGradient')
      .attr('id', 'gradientEnergy')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);
    
    gradientEnergy.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f9ca24')
      .attr('stop-opacity', 0.2);
    
    gradientEnergy.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#f9ca24')
      .attr('stop-opacity', 0.6);
    
    gradientEnergy.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f39c12')
      .attr('stop-opacity', 0.8);

    // Add axes with dashboard color scheme and better visibility
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-weight", "500");

    // Style x-axis line
    g.select(".x-axis")
      .select(".domain")
      .style("stroke", "#ddd")
      .style("stroke-width", 1);

    g.append("g")
      .attr("class", "y-axis-left")
      .call(yAxisLeft)
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#f39c12")
      .style("font-weight", "600");

    // Style y-axis line
    g.select(".y-axis-left")
      .select(".domain")
      .style("stroke", "#ddd")
      .style("stroke-width", 1);

    // Add grid lines
    g.selectAll(".grid-line")
      .data(yScaleEnergy.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScaleEnergy(d))
      .attr("y2", d => yScaleEnergy(d))
      .style("stroke", "#f0f0f0")
      .style("stroke-width", 1);

    // Historical area chart with gradient
    g.append("path")
      .datum(historicalData)
      .attr("class", "area-energy-historical")
      .attr("d", areaEnergy)
      .style("fill", "url(#gradientEnergy)")
      .style("opacity", 0.9);

    // Historical border line (solid)
    g.append("path")
      .datum(historicalData)
      .attr("class", "line-energy-historical")
      .attr("d", lineEnergy)
      .style("fill", "none")
      .style("stroke", "#f39c12")
      .style("stroke-width", 3);

    // Projected area and line (dashed/semi-transparent)
    if (projectedData.length > 1) {
      g.append("path")
        .datum(projectedData)
        .attr("class", "area-energy-projected")
        .attr("d", areaEnergy)
        .style("fill", "url(#gradientEnergy)")
        .style("opacity", 0.5);

      g.append("path")
        .datum(projectedData)
        .attr("class", "line-energy-projected")
        .attr("d", lineEnergy)
        .style("fill", "none")
        .style("stroke", "#f39c12")
        .style("stroke-width", 2.5)
        .style("stroke-dasharray", "8,4")
        .style("opacity", 0.8);
    }

    // Add stylish data points with dashboard colors
    g.selectAll(".dot-energy")
      .data(data.filter((d, i) => i % 5 === 0)) // Show every 5th point for cleaner look
      .enter()
      .append("circle")
      .attr("class", "dot-energy")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScaleEnergy(d.cumulativeEnergy))
      .attr("r", d => d.isHistorical ? 6 : 5)
      .style("fill", "#fff")
      .style("stroke", "#f39c12")
      .style("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.15))")
      .style("opacity", d => d.isHistorical ? 1 : 0.7);

    // Current year indicator with dashboard styling
    const currentYearX = xScale(currentYear);
    g.append("line")
      .attr("class", "current-year-line")
      .attr("x1", currentYearX)
      .attr("x2", currentYearX)
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#f9ca24")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "4,2")
      .style("opacity", 0.7);

    g.append("text")
      .attr("x", currentYearX)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#f9ca24")
      .text("TODAY");

    // Add compact axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("fill", "#f39c12")
      .text("Energy (kWh)");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#666")
      .text("Year");

    // Enhanced tooltip with dashboard styling
    const tooltip = d3.select("body").selectAll(".solar-tooltip")
      .data([null])
      .join("div")
      .attr("class", "solar-tooltip")
      .style("position", "absolute")
      .style("background", "linear-gradient(135deg, rgba(249,202,36,0.95), rgba(238,90,36,0.95))")
      .style("color", "#fff")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("backdrop-filter", "blur(4px)")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)");

    // Add invisible overlay for mouse interactions
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const year = Math.round(xScale.invert(mouseX));
        const dataPoint = data.find(d => d.year === year);
        
        if (dataPoint) {
          tooltip
            .style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .html(`
              <div style="font-size: 15px; font-weight: bold; margin-bottom: 8px;">${dataPoint.year}</div>
              <div style="color: #fff; opacity: 0.95; margin-bottom: 6px; font-size: 14px;">⚡ Energy: ${(dataPoint.cumulativeEnergy / 1000).toFixed(0)}k kWh</div>
              <div style="color: rgba(255,255,255,0.8); font-size: 12px;">${dataPoint.isHistorical ? '📊 Historical Data' : '📈 Projected Data'}</div>
            `);
        }
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

  }, [solarCapacity]);

  if (!solarCapacity || solarCapacity === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(249,202,36,0.08)',
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          color: '#333',
          fontSize: '1.2rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Cumulative Energy Production (2020-2050)
        </h3>
        <div style={{
          textAlign: 'center',
          color: '#888',
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          <p>No solar capacity selected</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Adjust the solar capacity slider to see energy production
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(249,202,36,0.08)',
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.2rem',
        fontWeight: 600,
        textAlign: 'center',
        flexShrink: 0
      }}>
        Cumulative Energy Production (2020-2050)
      </h3>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0,
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ maxWidth: '820px', maxHeight: '400px' }}></svg>
      </div>
    </div>
  );
}

export default SolarGenerationChart;
