import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const baseFinancialData = [
    { project: 'Energy Infrastructure', costPerStudent: 1500 },
    { project: 'Transportation Systems', costPerStudent: 1200 },
    { project: 'Campus Buildings', costPerStudent: 900 },
    { project: 'Food Services', costPerStudent: 600 },
    { project: 'Waste Management', costPerStudent: 400 }
];

export default function BudgetGapAnalysis({ growthRate = 0, population = 10000 }) {
    const [data, setData] = useState([]);
    const svgRef = useRef(null);

    // Calculate budget gap data over time
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        // Budget parameters
        const baseBudgetPerStudent = 4600; // Total baseline budget per student
        const initialBudget = population * baseBudgetPerStudent;
        const budgetGrowthRate = 1.5; // 1.5% annual budget increase
        
        // Generate 10 years of data
        for (let i = 0; i <= 10; i++) {
            const year = currentYear + i;
            const projectedPopulation = population * Math.pow(1 + growthRate / 100, i);
            
            // Calculate available budget (grows at budgetGrowthRate)
            const availableBudget = initialBudget * Math.pow(1 + budgetGrowthRate / 100, i);
            
            // Calculate required budget (grows with population)
            const totalCostPerStudent = baseFinancialData.reduce((sum, project) => sum + project.costPerStudent, 0);
            const requiredBudget = projectedPopulation * totalCostPerStudent;
            
            // Calculate gap (positive = surplus, negative = deficit)
            const budgetGap = availableBudget - requiredBudget;
            const gapPercentage = (budgetGap / availableBudget) * 100;
            
            years.push({
                year,
                population: projectedPopulation,
                availableBudget,
                requiredBudget,
                budgetGap,
                gapPercentage
            });
        }
        
        setData(years);
    }, [growthRate, population]);

    useEffect(() => {
        if (!data.length) return;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Get container dimensions
        const containerWidth = svg.node().getBoundingClientRect().width || 700;
        const containerHeight = svg.node().getBoundingClientRect().height || 400;

        const margin = { top: 50, right: 80, bottom: 60, left: 80 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        // Left Y-axis for budget amounts
        const yLeft = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.availableBudget, d.requiredBudget)) * 1.1])
            .range([height, 0]);

        // Add bars for required budget
        g.selectAll('.required-bar')
            .data(data)
            .join('rect')
            .attr('class', 'required-bar')
            .attr('x', d => x(d.year) - 8)
            .attr('y', d => yLeft(d.requiredBudget))
            .attr('width', 16)
            .attr('height', d => height - yLeft(d.requiredBudget))
            .attr('fill', '#ef4444')
            .attr('opacity', 0.7)
            .attr('rx', 2);

        // Add line for available budget
        const budgetLine = d3.line()
            .x(d => x(d.year))
            .y(d => yLeft(d.availableBudget))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(data)
            .attr('class', 'budget-line')
            .attr('d', budgetLine)
            .attr('fill', 'none')
            .attr('stroke', '#10b981')
            .attr('stroke-width', 3);

        // Add circles for budget line
        g.selectAll('.budget-circle')
            .data(data)
            .join('circle')
            .attr('class', 'budget-circle')
            .attr('cx', d => x(d.year))
            .attr('cy', d => yLeft(d.availableBudget))
            .attr('r', 4)
            .attr('fill', '#10b981')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Add X axis
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')))
            .call(g => g.selectAll('text').attr('font-size', 11).attr('fill', '#6b7280'));

        // Add left Y axis (budget amounts)
        g.append('g')
            .call(d3.axisLeft(yLeft).tickFormat(d => `$${(d / 1000000).toFixed(1)}M`))
            .call(g => g.selectAll('text').attr('font-size', 11).attr('fill', '#6b7280'));

        // Add title
        svg.append("text")
            .attr("x", containerWidth / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Budget Availability vs Requirements Analysis");

        // Add left axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#6b7280")
            .text("Budget Amount");

        // Add bottom axis label
        g.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 15})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#6b7280")
            .text("Year");

        // Add legend
        const legend = g.append('g')
            .attr('transform', `translate(20, 20)`);

        const legendData = [
            { label: 'Available Budget', color: '#10b981', type: 'line' },
            { label: 'Required Budget', color: '#ef4444', type: 'bar' }
        ];

        legendData.forEach((item, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 18})`);

            if (item.type === 'line') {
                legendRow.append('line')
                    .attr('x1', 0)
                    .attr('x2', 15)
                    .attr('y1', 6)
                    .attr('y2', 6)
                    .attr('stroke', item.color)
                    .attr('stroke-width', 3);
            } else if (item.type === 'bar') {
                legendRow.append('rect')
                    .attr('width', 15)
                    .attr('height', 12)
                    .attr('fill', item.color)
                    .attr('opacity', 0.7);
            } else if (item.type === 'dashed') {
                legendRow.append('line')
                    .attr('x1', 0)
                    .attr('x2', 15)
                    .attr('y1', 6)
                    .attr('y2', 6)
                    .attr('stroke', item.color)
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '4,4');
            }

            legendRow.append('text')
                .attr('x', 20)
                .attr('y', 9)
                .attr('font-size', 10)
                .attr('fill', '#374151')
                .text(item.label);
        });

        // Add current year indicator
        const currentYear = new Date().getFullYear();
        g.append('line')
            .attr('x1', x(currentYear))
            .attr('x2', x(currentYear))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4,4');

        g.append('text')
            .attr('x', x(currentYear) - 5)
            .attr('y', -5)
            .attr('text-anchor', 'end')
            .attr('font-size', 10)
            .attr('fill', '#e74c3c')
            .text('Today');

        // Add gap fill areas for visual emphasis
        const gapArea = d3.area()
            .x(d => x(d.year))
            .y0(d => yLeft(d.availableBudget))
            .y1(d => yLeft(d.requiredBudget))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(data)
            .attr('class', 'gap-area')
            .attr('d', gapArea)
            .attr('fill', d => {
                // Color based on whether there's generally a surplus or deficit
                const avgGap = d3.mean(data, d => d.budgetGap);
                return avgGap >= 0 ? '#10b981' : '#ef4444';
            })
            .attr('opacity', 0.2);

    }, [data]);

    return (
        <div className="budget-gap-analysis" style={{ 
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