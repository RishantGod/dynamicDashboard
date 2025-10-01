import React from 'react';
import * as d3 from 'd3';

function PolicyComplianceHeatmap({ travelFlexibilityIndex, policyImplementation }) {
  // Generate monthly compliance data based on sliders
  const generateMonthlyData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Create variation in compliance throughout the year
    return months.map((month, index) => {
      // Base compliance from sliders
      const baseCompliance = Math.min(
        (travelFlexibilityIndex * 0.4 + policyImplementation * 0.6), 
        100
      );
      
      // Add seasonal variation (summer months typically have more travel)
      const seasonalFactor = index >= 5 && index <= 7 ? 0.85 : 1.0; // Jun-Aug lower compliance
      const holidayFactor = index === 11 || index === 0 ? 0.9 : 1.0; // Dec-Jan lower compliance
      
      // Add some randomness for realistic variation
      const randomFactor = 0.9 + Math.random() * 0.2;
      
      const compliance = Math.round(baseCompliance * seasonalFactor * holidayFactor * randomFactor);
      
      return {
        month,
        monthIndex: index,
        compliance: Math.max(0, Math.min(100, compliance))
      };
    });
  };

  const monthlyData = generateMonthlyData();

  // Create color scale for heatmap
  const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([0, 100]);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '0.75rem'
      }}>
        <div>
          <div style={{
            fontSize: '0.9rem',
            color: '#7f8c8d',
            marginBottom: '2px'
          }}>
            Travel Frequency Distribution
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '4px',
        flex: 1,
        height: '100px',
        maxHeight: '100px'
      }}>
        {monthlyData.map((data, index) => (
          <div
            key={data.month}
            style={{
              backgroundColor: colorScale(data.compliance),
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 2px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '24px',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.zIndex = '10';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.zIndex = '1';
              e.target.style.boxShadow = 'none';
            }}
            title={`${data.month}: ${data.compliance}% compliance`}
          >
            <span style={{
              color: data.compliance > 50 ? '#2c3e50' : '#ffffff'
            }}>
              {data.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PolicyComplianceHeatmap;