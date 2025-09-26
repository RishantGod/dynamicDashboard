import React from 'react';

function SolarGauge({ percentage, title = "Solar Capacity Utilization" }) {
  const radius = 60; // Increased from 45 to 60
  const strokeWidth = 4; // Slightly increased stroke width
  const svgSize = radius * 2 + 50; // Total SVG size
  const svgCenter = svgSize / 2; // Center point of SVG
  const circleLeft = svgCenter - radius; // Left edge of circle
  const circleTop = svgCenter - radius; // Top edge of circle
  
  // Calculate the fill height for the liquid effect (bottom to top)
  const fillHeight = (percentage / 100) * (radius * 2);
  const fillY = radius * 2 - fillHeight;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(249,202,36,0.08)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '200px'
    }}>
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flex: 1
      }}>
        <svg
          height={svgSize}
          width={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          {/* Sun rays - 24 rays evenly spaced at 15° intervals, length varies with percentage */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15) * (Math.PI / 180); // 15° intervals for 24 rays
            const innerRadius = radius + 5;
            
            // Ray length varies with percentage: 8px at 0%, 22px at 100%
            const baseRayLength = 8 + (percentage / 100) * 14; // 8px to 22px range
            const outerRadius = radius + baseRayLength;
            
            const x1 = svgCenter + Math.cos(angle) * innerRadius;
            const y1 = svgCenter + Math.sin(angle) * innerRadius;
            const x2 = svgCenter + Math.cos(angle) * outerRadius;
            const y2 = svgCenter + Math.sin(angle) * outerRadius;
            
            // Check if this is a cardinal direction (0°, 90°, 180°, 270°)
            const isCardinal = i % 6 === 0; // Every 6th ray (0, 6, 12, 18 = 0°, 90°, 180°, 270°)
            
            // Cardinal rays are slightly longer
            const cardinalBonus = isCardinal ? 3 : 0;
            const finalOuterRadius = outerRadius + cardinalBonus;
            const finalX2 = svgCenter + Math.cos(angle) * finalOuterRadius;
            const finalY2 = svgCenter + Math.sin(angle) * finalOuterRadius;
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={finalX2}
                y2={finalY2}
                stroke="#f9ca24"
                strokeWidth={isCardinal ? "4" : "3"} // Thicker for cardinal directions
                strokeLinecap="round"
                opacity={isCardinal ? 0.95 : 0.85} // Higher opacity for cardinal directions
                style={{
                  filter: `drop-shadow(0 0 ${isCardinal ? 4 : 2}px rgba(249,202,36,${isCardinal ? 0.5 : 0.3}))`,
                  transition: 'all 0.8s ease' // Smooth transition when percentage changes
                }}
              />
            );
          })}

          {/* Background circle */}
          <circle
            stroke="#f3f4f6"
            fill="#f9f9f9"
            strokeWidth={strokeWidth}
            r={radius - strokeWidth}
            cx={svgCenter}
            cy={svgCenter}
          />

          {/* Definitions for liquid effect */}
          <defs>
            <clipPath id="circleClip">
              <circle r={radius - strokeWidth} cx={svgCenter} cy={svgCenter} />
            </clipPath>
            
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f9ca24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffeaa7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f9ca24" stopOpacity="1" />
            </linearGradient>
            
            {/* Large wave patterns covering full width */}
            
            {/* Wave 1 - Low frequency, large amplitude */}
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(249,202,36,0.8)" />
              <stop offset="50%" stopColor="rgba(255,234,167,0.6)" />
              <stop offset="100%" stopColor="rgba(249,202,36,0.8)" />
            </linearGradient>
            
            {/* Wave 2 - Medium frequency */}
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,234,167,0.5)" />
              <stop offset="50%" stopColor="rgba(249,202,36,0.4)" />
              <stop offset="100%" stopColor="rgba(255,234,167,0.5)" />
            </linearGradient>
            
            {/* Wave 3 - High frequency, small amplitude */}
            <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(249,202,36,0.3)" />
              <stop offset="50%" stopColor="rgba(255,234,167,0.4)" />
              <stop offset="100%" stopColor="rgba(249,202,36,0.3)" />
            </linearGradient>
          </defs>

          {/* Main liquid fill - rises from bottom */}
          {percentage > 0 && (
            <rect
              x={circleLeft + strokeWidth}
              y={circleTop + fillY}
              width={(radius - strokeWidth) * 2}
              height={fillHeight}
              fill="url(#liquidGradient)"
              clipPath="url(#circleClip)"
              style={{
                transition: 'height 0.8s ease, y 0.8s ease'
              }}
            />
          )}

          {/* Stationary wave - only the top surface oscillates */}
          {percentage > 0 && fillHeight > 5 && (
            <g clipPath="url(#circleClip)">
              {/* Static liquid body */}
              <rect
                x={circleLeft + strokeWidth}
                y={circleTop + fillY + 3}
                width={(radius - strokeWidth) * 2}
                height={fillHeight - 3}
                fill="url(#liquidGradient)"
              />
              
              {/* Animated wave surface - much higher frequency with more nodes and antinodes */}
              <path
                d={`M ${circleLeft + strokeWidth} ${circleTop + fillY}
                    Q ${circleLeft + radius * 0.08} ${circleTop + fillY - 1} ${circleLeft + radius * 0.16} ${circleTop + fillY}
                    Q ${circleLeft + radius * 0.24} ${circleTop + fillY + 1} ${circleLeft + radius * 0.32} ${circleTop + fillY}
                    Q ${circleLeft + radius * 0.40} ${circleTop + fillY - 1} ${circleLeft + radius * 0.48} ${circleTop + fillY}
                    Q ${circleLeft + radius * 0.56} ${circleTop + fillY + 1} ${circleLeft + radius * 0.64} ${circleTop + fillY}
                    Q ${circleLeft + radius * 0.72} ${circleTop + fillY - 1} ${circleLeft + radius * 0.80} ${circleTop + fillY}
                    Q ${circleLeft + radius * 0.88} ${circleTop + fillY + 1} ${circleLeft + radius * 0.96} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.04} ${circleTop + fillY - 1} ${circleLeft + radius * 1.12} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.20} ${circleTop + fillY + 1} ${circleLeft + radius * 1.28} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.36} ${circleTop + fillY - 1} ${circleLeft + radius * 1.44} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.52} ${circleTop + fillY + 1} ${circleLeft + radius * 1.60} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.68} ${circleTop + fillY - 1} ${circleLeft + radius * 1.76} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.84} ${circleTop + fillY + 1} ${circleLeft + radius * 1.92} ${circleTop + fillY}
                    Q ${circleLeft + radius * 1.96} ${circleTop + fillY - 1} ${circleLeft + radius * 2 - strokeWidth} ${circleTop + fillY}
                    V ${circleTop + fillY + 3} H ${circleLeft + strokeWidth} Z`}
                fill="url(#waveGradient1)"
              >
                {/* Higher frequency stationary wave oscillation */}
                <animate
                  attributeName="d"
                  values={`M ${circleLeft + strokeWidth} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.08} ${circleTop + fillY - 1} ${circleLeft + radius * 0.16} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.24} ${circleTop + fillY + 1} ${circleLeft + radius * 0.32} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.40} ${circleTop + fillY - 1} ${circleLeft + radius * 0.48} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.56} ${circleTop + fillY + 1} ${circleLeft + radius * 0.64} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.72} ${circleTop + fillY - 1} ${circleLeft + radius * 0.80} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.88} ${circleTop + fillY + 1} ${circleLeft + radius * 0.96} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.04} ${circleTop + fillY - 1} ${circleLeft + radius * 1.12} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.20} ${circleTop + fillY + 1} ${circleLeft + radius * 1.28} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.36} ${circleTop + fillY - 1} ${circleLeft + radius * 1.44} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.52} ${circleTop + fillY + 1} ${circleLeft + radius * 1.60} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.68} ${circleTop + fillY - 1} ${circleLeft + radius * 1.76} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.84} ${circleTop + fillY + 1} ${circleLeft + radius * 1.92} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.96} ${circleTop + fillY - 1} ${circleLeft + radius * 2 - strokeWidth} ${circleTop + fillY}
                          V ${circleTop + fillY + 3} H ${circleLeft + strokeWidth} Z;
                          M ${circleLeft + strokeWidth} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.08} ${circleTop + fillY + 0.5} ${circleLeft + radius * 0.16} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.24} ${circleTop + fillY - 0.5} ${circleLeft + radius * 0.32} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.40} ${circleTop + fillY + 0.5} ${circleLeft + radius * 0.48} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.56} ${circleTop + fillY - 0.5} ${circleLeft + radius * 0.64} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.72} ${circleTop + fillY + 0.5} ${circleLeft + radius * 0.80} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.88} ${circleTop + fillY - 0.5} ${circleLeft + radius * 0.96} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.04} ${circleTop + fillY + 0.5} ${circleLeft + radius * 1.12} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.20} ${circleTop + fillY - 0.5} ${circleLeft + radius * 1.28} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.36} ${circleTop + fillY + 0.5} ${circleLeft + radius * 1.44} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.52} ${circleTop + fillY - 0.5} ${circleLeft + radius * 1.60} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.68} ${circleTop + fillY + 0.5} ${circleLeft + radius * 1.76} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.84} ${circleTop + fillY - 0.5} ${circleLeft + radius * 1.92} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.96} ${circleTop + fillY + 0.5} ${circleLeft + radius * 2 - strokeWidth} ${circleTop + fillY}
                          V ${circleTop + fillY + 3} H ${circleLeft + strokeWidth} Z;
                          M ${circleLeft + strokeWidth} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.08} ${circleTop + fillY - 1} ${circleLeft + radius * 0.16} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.24} ${circleTop + fillY + 1} ${circleLeft + radius * 0.32} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.40} ${circleTop + fillY - 1} ${circleLeft + radius * 0.48} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.56} ${circleTop + fillY + 1} ${circleLeft + radius * 0.64} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.72} ${circleTop + fillY - 1} ${circleLeft + radius * 0.80} ${circleTop + fillY}
                          Q ${circleLeft + radius * 0.88} ${circleTop + fillY + 1} ${circleLeft + radius * 0.96} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.04} ${circleTop + fillY - 1} ${circleLeft + radius * 1.12} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.20} ${circleTop + fillY + 1} ${circleLeft + radius * 1.28} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.36} ${circleTop + fillY - 1} ${circleLeft + radius * 1.44} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.52} ${circleTop + fillY + 1} ${circleLeft + radius * 1.60} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.68} ${circleTop + fillY - 1} ${circleLeft + radius * 1.76} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.84} ${circleTop + fillY + 1} ${circleLeft + radius * 1.92} ${circleTop + fillY}
                          Q ${circleLeft + radius * 1.96} ${circleTop + fillY - 1} ${circleLeft + radius * 2 - strokeWidth} ${circleTop + fillY}
                          V ${circleTop + fillY + 3} H ${circleLeft + strokeWidth} Z`}
                  dur="0.5s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )}

          {/* Circle border */}
          <circle
            stroke="#f9ca24"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius - strokeWidth}
            cx={svgCenter}
            cy={svgCenter}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(249,202,36,0.2))'
            }}
          />
        </svg>

        {/* Percentage text in center with liquid overlay effect */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Base yellow text */}
          <span style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#f9ca24',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {percentage}%
          </span>
          
          {/* White text overlay that gets revealed by liquid */}
          {percentage > 40 && (
            <span style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              clipPath: `polygon(0% ${Math.max(0, 100 - Math.max(0, (percentage - 41) / 20 * 100))}%, 100% ${Math.max(0, 100 - Math.max(0, (percentage - 41) / 20 * 100))}%, 100% 100%, 0% 100%)`,
              transition: 'clip-path 0.8s ease'
            }}>
              {percentage}%
            </span>
          )}
        </div>
      </div>

      <h3 style={{
        margin: '0.5rem 0 0 0',
        color: '#888',
        fontSize: '14px',
        fontWeight: 500,
        textAlign: 'center'
      }}>
        {title}
      </h3>
    </div>
  );
}

export default SolarGauge;