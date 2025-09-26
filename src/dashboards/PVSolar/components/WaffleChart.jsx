import React, { useMemo } from 'react';
import * as d3 from 'd3';

function WaffleChart({ percentage, title = "Rooftop Utilization" }) {
  // Waffle chart configuration - rectangular layout with more squares
  const rows = 5;
  const cols = 25;
  const totalSquares = rows * cols;
  const squareSize = 14; // Slightly larger squares
  const gap = 2.5; // Reduced gap for more density
  
  // Calculate filled squares based on percentage
  const filledSquares = Math.round((percentage / 100) * totalSquares);
  
  // Make squares as large as possible to fill 90% width
  const containerPadding = 0;
  
  // Calculate square size to fill 90% of container width
  const availableWidth = 600; // Approximate 90% of container width
  const availableHeight = 100; // Available height
  
  const squareWidthBasedOnWidth = Math.floor((availableWidth - (cols - 1) * gap) / cols);
  const squareWidthBasedOnHeight = Math.floor((availableHeight - (rows - 1) * gap) / rows);
  const responsiveSquareSize = Math.min(squareWidthBasedOnWidth, squareWidthBasedOnHeight);
  
  const chartWidth = cols * (responsiveSquareSize + gap) - gap;
  const chartHeight = rows * (responsiveSquareSize + gap) - gap;
  
  // Use consistent yellow color for all filled squares
  const fillColor = '#f9ca24';
  
  // Generate square data - fill column by column (vertical filling)
  const squares = useMemo(() => {
    const squareData = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate index column by column instead of row by row
        const index = col * rows + row;
        const isFilled = index < filledSquares;
        
        squareData.push({
          x: col * (responsiveSquareSize + gap),
          y: row * (responsiveSquareSize + gap),
          filled: isFilled,
          index: index
        });
      }
    }
    return squareData;
  }, [filledSquares, responsiveSquareSize, gap, rows, cols]);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      padding: '0.2rem',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{
          margin: '0',
          color: '#333',
          fontSize: '1rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {title}
        </h3>
        
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#f9ca24',
          textAlign: 'center'
        }}>
          {percentage}%
        </div>
      </div>
      
      <svg 
        width={chartWidth + containerPadding} 
        height={chartHeight + containerPadding}
        style={{ 
          overflow: '5visible',
          width: '100%',
          maxWidth: '100%',
          height: '90%'
        }}
        viewBox={`0 0 ${chartWidth + containerPadding} ${chartHeight + containerPadding}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid */}
        {squares.map((square, i) => (
          <rect
            key={i}
            x={square.x + containerPadding/2}
            y={square.y + containerPadding/2}
            width={responsiveSquareSize}
            height={responsiveSquareSize}
            fill={square.filled ? fillColor : '#f3f4f6'}
            stroke="#fff"
            strokeWidth="1"
            rx="2"
            style={{
              transition: 'fill 0.3s ease',
              filter: square.filled ? 'brightness(1)' : 'brightness(0.9)'
            }}
          />
        ))}
        
        {/* Grid lines for better visual separation */}
        <defs>
          <pattern 
            id="grid" 
            width={responsiveSquareSize + gap} 
            height={responsiveSquareSize + gap} 
            patternUnits="userSpaceOnUse"
          >
            <path 
              d={`M ${responsiveSquareSize + gap} 0 L 0 0 0 ${responsiveSquareSize + gap}`} 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
      </svg>
    </div>
  );
}

export default WaffleChart;