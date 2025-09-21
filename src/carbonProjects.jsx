import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const baseProjects = [
    { project: 'Energy Infrastructure', emissions: 15000 },
    { project: 'Transportation Systems', emissions: 12000 },
    { project: 'Campus Buildings', emissions: 8500 },
    { project: 'Food Services', emissions: 6000 },
    { project: 'Waste Management', emissions: 3500 }
];

export default function CarbonProjects({ growthRate = 0 }) {
    const [data, setData] = useState([]);
    const svgRef = useRef(null);

    // Calculate baseline + updated emissions + delta based on growth rate
    useEffect(() => {
        const scale = 1 + growthRate / 100; // linear scaling based on population growth
        const derived = baseProjects.map(p => {
            const original = p.emissions;
            const updated = Math.max(0, original * scale);
            const delta = updated - original; // positive => more emissions required
            const pct = original === 0 ? 0 : delta / original;
            return { 
                project: p.project, 
                original, 
                updated, 
                delta, 
                pct 
            };
        });
        // Sort by original emissions (largest first for better visual hierarchy)
        derived.sort((a, b) => b.original - a.original);
        setData(derived);
    }, [growthRate]);

    useEffect(() => {
        if (!data.length) return;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Get container dimensions
        const containerWidth = svg.node().getBoundingClientRect().width || 700;
        const containerHeight = svg.node().getBoundingClientRect().height || 400;

        const margin = { top: 80, right: 60, bottom: 80, left: 150 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Scale setup
        const maxVal = d3.max(data, d => Math.max(d.original, d.updated));
        const x = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, width]).nice();
        const y = d3.scaleBand().domain(data.map(d => d.project)).range([0, height]).padding(0.2);

        // Grid lines for reference
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisTop(x).ticks(6).tickSize(-height).tickFormat(d => `${(d / 1000).toFixed(0)}k`))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3'))
            .call(g => g.selectAll('.tick text').attr('font-size', 11).attr('dy', '-0.5em').attr('fill', '#6b7280'));

        // Bar groups
        const rows = g.selectAll('.row')
            .data(data, d => d.project)
            .join(enter => enter.append('g').attr('class', 'row').attr('transform', d => `translate(0,${y(d.project)})`));

        const barHeight = y.bandwidth();
        
        // Color scheme
        const baselineColor = '#d1d5db';
        const increaseColor = '#ef4444'; // Red for increased emissions
        const decreaseColor = '#10b981'; // Green for reduced emissions

        // Baseline bars (original emissions)
        rows.append('rect')
            .attr('class', 'baseline')
            .attr('x', 0)
            .attr('height', barHeight)
            .attr('rx', 6)
            .attr('fill', baselineColor)
            .attr('width', d => x(d.original))
            .attr('stroke', '#9ca3af')
            .attr('stroke-width', 1);

        // Delta bars (change due to growth)
        rows.append('rect')
            .attr('class', 'delta')
            .attr('height', barHeight)
            .attr('rx', 6)
            .attr('fill', d => d.delta >= 0 ? increaseColor : decreaseColor)
            .attr('x', d => d.delta >= 0 ? x(d.original) : x(d.updated))
            .attr('width', d => d.delta === 0 ? 0 : Math.abs(x(d.updated) - x(d.original)))
            .attr('fill-opacity', 0.8)
            .attr('stroke', d => d.delta >= 0 ? '#dc2626' : '#059669')
            .attr('stroke-width', 1);

        // Value markers at the end of bars
        rows.append('circle')
            .attr('cx', d => x(d.updated))
            .attr('cy', barHeight / 2)
            .attr('r', 5)
            .attr('fill', d => d.delta >= 0 ? increaseColor : decreaseColor)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Value labels
        rows.append('text')
            .attr('class', 'value-label')
            .attr('x', d => x(d.updated) + 8)
            .attr('y', barHeight / 2)
            .attr('dominant-baseline', 'middle')
            .attr('font-size', 11)
            .attr('font-weight', '600')
            .attr('fill', '#374151')
            .text(d => {
                if (Math.abs(d.delta) < 1) return `${(d.original / 1000).toFixed(1)}k`;
                const sign = d.delta > 0 ? '+' : '';
                return `${(d.original / 1000).toFixed(1)}k ${sign}${(d.delta / 1000).toFixed(1)}k`;
            });

        // Percentage change labels
        rows.append('text')
            .attr('class', 'pct-label')
            .attr('x', d => x(d.updated) + 8)
            .attr('y', barHeight / 2 + 12)
            .attr('dominant-baseline', 'middle')
            .attr('font-size', 9)
            .attr('fill', '#6b7280')
            .text(d => {
                if (Math.abs(d.pct) < 0.001) return '';
                const sign = d.pct > 0 ? '+' : '';
                return `(${sign}${(d.pct * 100).toFixed(1)}%)`;
            });

        // Y-axis (project labels)
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').remove())
            .call(g => g.selectAll('text')
                .attr('font-size', 13)
                .attr('font-weight', '500')
                .attr('fill', '#374151')
                .attr('dx', '-0.5em'));

        // X-axis
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${(d / 1000).toFixed(0)}k`))
            .call(g => g.select('.domain').attr('stroke', '#d1d5db'))
            .call(g => g.selectAll('text').attr('font-size', 11).attr('fill', '#6b7280'));

                // Add a title
        svg.append("text")
            .attr("x", containerWidth / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Carbon Project Emissions Impact");

        // Legend
        const legend = g.append('g').attr('transform', `translate(${width / 2 - 150}, ${height + 50})`);
        const legendItems = [
            { label: 'Baseline Emissions', color: baselineColor },
            { label: 'Additional Emissions', color: increaseColor },
            { label: 'Emission Reduction', color: decreaseColor }
        ];

        legendItems.forEach((item, i) => {
            const legendRow = legend.append('g').attr('transform', `translate(${i * 130}, 0)`);
            legendRow.append('rect')
                .attr('width', 14)
                .attr('height', 10)
                .attr('rx', 2)
                .attr('fill', item.color);
            legendRow.append('text')
                .attr('x', 18)
                .attr('y', 8)
                .attr('font-size', 10)
                .attr('fill', '#374151')
                .text(item.label);
        });

    }, [data, growthRate]);

    return (
        <div className="carbon-projects" style={{ 
            backgroundColor: 'white', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
            borderRadius: '8px', 
            padding: '12px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <svg ref={svgRef} width="100%" height="100%" style={{ minHeight: '400px' }}></svg>
        </div>
    );
}
