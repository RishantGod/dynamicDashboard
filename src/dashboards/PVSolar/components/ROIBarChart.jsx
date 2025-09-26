import React from 'react';

function ROIBarChart({ solarCapacity, annualSavings }) {
  // CAPEX calculation - spread over 5 years (2025-2029)
  const totalCAPEX = solarCapacity * 2500; // $2500/kW
  const annualCAPEX = totalCAPEX / 5; // Spread over 5 years

  // Generate data for 25 years (2025-2050) with increasing savings
  const startYear = 2025;
  const endYear = 2050;
  const totalYears = endYear - startYear + 1; // 26 years total
  
  const years = Array.from({ length: totalYears }, (_, i) => {
    const currentYear = startYear + i;
    // Increase savings by 3% annually due to rising energy prices
    const adjustedSavings = annualSavings * Math.pow(1.03, i);
    // CAPEX only for first 5 years (2025-2029)
    const capexAmount = i < 5 ? annualCAPEX : 0;
    
    return {
      year: currentYear.toString(),
      capex: capexAmount,
      savings: adjustedSavings,
      netCashFlow: adjustedSavings - capexAmount
    };
  });

  // Calculate max values for scaling
  const maxSavings = Math.max(...years.map(y => y.savings));
  const maxCAPEX = Math.max(...years.map(y => y.capex));
  
  // Use controlled height scaling to fit within viewport
  const chartHeight = 340;
  
  // CAPEX bars: Scale to use max 40% of chart height
  const getCAPEXBarHeight = (value) => {
    if (value === 0) return 0;
    const maxCAPEXHeight = chartHeight * 0.4; // Max 40% of chart height
    return Math.max((value / maxCAPEX) * maxCAPEXHeight, 8); // Minimum 8px height
  };
  
  // Savings bars: Scale to use 15-60% of chart height to show progression
  const getSavingsBarHeight = (value) => {
    const minSavings = Math.min(...years.map(y => y.savings));
    const range = maxSavings - minSavings;
    const normalizedValue = (value - minSavings) / range;
    const minHeight = chartHeight * 0.15; // Start at 15% of chart height
    const maxHeight = chartHeight * 0.6; // Max 60% of chart height (reduced from 75%)
    const heightRange = maxHeight - minHeight;
    return minHeight + (normalizedValue * heightRange);
  };
  
  // Calculate scales for y-axis labels to match actual bar scaling
  const capexScale = maxCAPEX * 1.2;
  
  // Savings scale should match the actual range used by bars (20-85% of chart)
  const minSavings = Math.min(...years.map(y => y.savings));
  const savingsRange = maxSavings - minSavings;
  const savingsScaleMin = minSavings;
  const savingsScaleMax = maxSavings;

  // Show every 2nd year for more data points, plus all first 5 years
  const displayYears = years.filter((_, index) => index % 2 === 0 || index < 5);

  // If no solar capacity, show empty state
  if (solarCapacity === 0) {
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
          25-Year ROI Analysis (2025-2050)
        </h3>
        <div style={{
          textAlign: 'center',
          color: '#888',
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          <p>No solar capacity selected</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Adjust the solar capacity slider to see ROI projections
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
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.2rem',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        25-Year ROI Analysis (2025-2050)
      </h3>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          height: chartHeight + 120,
          position: 'relative',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* Left Y-axis for CAPEX */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: chartHeight,
            marginRight: '4px',
            paddingTop: '20px',
            width: '28px',
            flexShrink: 0
          }}>
            {/* CAPEX Y-axis labels */}
            {Array.from({ length: 6 }, (_, i) => {
              const value = Math.round((capexScale * (5 - i)) / 5 / 1000);
              return (
                <div key={i} style={{
                  fontSize: '9px',
                  color: '#e67e22',
                  textAlign: 'right',
                  position: 'relative',
                  fontWeight: '600'
                }}>
                  ${value}k
                  <div style={{
                    position: 'absolute',
                    left: '100%',
                    top: '50%',
                    width: '5px',
                    height: '1px',
                    backgroundColor: '#e67e22',
                    marginLeft: '2px',
                    opacity: 0.6
                  }} />
                </div>
              );
            })}

          </div>

          {/* Chart area */}
          <div style={{
            flex: 1,
            position: 'relative',
            paddingTop: '20px',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            {/* Horizontal grid lines */}
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: '4px',
                right: '4px',
                top: `${20 + (chartHeight * i) / 5}px`,
                height: '1px',
                backgroundColor: i === 5 ? '#bdc3c7' : '#ecf0f1',
                zIndex: 0
              }} />
            ))}

            {/* Bars container */}
            <div style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-evenly',
              width: '100%',
              height: chartHeight,
              position: 'relative',
              gap: '2px',
              overflowX: 'hidden',
              paddingLeft: '4px',
              paddingRight: '4px',
              zIndex: 2
            }}>
              {displayYears.map((yearData, index) => (
                <div key={yearData.year} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1',
                  minWidth: '35px',
                  maxWidth: '60px'
                }}>
                  {/* Bars container */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'end',
                    gap: '1px',
                    height: chartHeight,
                    marginBottom: '4px'
                  }}>
                    {/* CAPEX bar (orange) */}
                    <div 
                      style={{
                        width: '14px',
                        height: `${getCAPEXBarHeight(yearData.capex)}px`,
                        backgroundColor: yearData.capex > 0 ? '#e67e22' : 'transparent',
                        borderRadius: '3px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        if (yearData.capex > 0) {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 2px 6px rgba(230,126,34,0.3)';
                          const tooltip = e.target.querySelector('.tooltip');
                          if (tooltip) tooltip.style.opacity = '1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = '0';
                      }}
                    >
                      {yearData.capex > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#2c3e50',
                          color: '#ecf0f1',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          opacity: 0,
                          pointerEvents: 'none',
                          transition: 'all 0.3s ease',
                          zIndex: 1000,
                          marginBottom: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: '1px solid rgba(230,126,34,0.2)'
                        }}
                        className="tooltip"
                        >
                          <div style={{ fontSize: '10px', color: '#bdc3c7', marginBottom: '2px' }}>CAPEX</div>
                          ${Math.round(yearData.capex / 1000)}k
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #2c3e50'
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Savings bar (yellow) */}
                    <div 
                      style={{
                        width: '14px',
                        height: `${getSavingsBarHeight(yearData.savings)}px`,
                        backgroundColor: '#f9ca24',
                        borderRadius: '3px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 2px 6px rgba(249,202,36,0.4)';
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = '0';
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#2c3e50',
                        color: '#ecf0f1',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'all 0.3s ease',
                        zIndex: 1000,
                        marginBottom: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(249,202,36,0.2)'
                      }}
                      className="tooltip"
                      >
                        <div style={{ fontSize: '10px', color: '#bdc3c7', marginBottom: '2px' }}>Annual Savings</div>
                        ${Math.round(yearData.savings / 1000)}k
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '6px solid #2c3e50'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Year label at bottom with tooltip */}
                  <span 
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#666',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      marginTop: '12px',
                      position: 'relative',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(249,202,36,0.1)';
                      e.target.style.color = '#333';
                      const tooltip = e.target.querySelector('.year-tooltip');
                      if (tooltip) tooltip.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#666';
                      const tooltip = e.target.querySelector('.year-tooltip');
                      if (tooltip) tooltip.style.opacity = '0';
                    }}
                  >
                    {yearData.year}
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#2c3e50',
                      color: '#ecf0f1',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: 'all 0.3s ease',
                      zIndex: 1001,
                      marginBottom: '8px',
                      textAlign: 'left',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      minWidth: '160px'
                    }}
                    className="year-tooltip"
                    >
                      <div style={{ fontWeight: '600', color: '#3498db', marginBottom: '8px', fontSize: '13px' }}>
                        {yearData.year}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#e67e22' }}>CAPEX:</span>
                          <span style={{ fontWeight: '600' }}>${Math.round(yearData.capex / 1000)}k</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#f9ca24' }}>Savings:</span>
                          <span style={{ fontWeight: '600' }}>${Math.round(yearData.savings / 1000)}k</span>
                        </div>
                        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: yearData.netCashFlow >= 0 ? '#2ecc71' : '#e74c3c' }}>Net Flow:</span>
                          <span style={{ fontWeight: '600', color: yearData.netCashFlow >= 0 ? '#2ecc71' : '#e74c3c' }}>
                            {yearData.netCashFlow >= 0 ? '+' : ''}${Math.round(yearData.netCashFlow / 1000)}k
                          </span>
                        </div>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid #2c3e50'
                      }} />
                    </div>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Y-axis for Savings */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: chartHeight,
            marginLeft: '4px',
            paddingTop: '20px',
            width: '28px',
            flexShrink: 0
          }}>
            {/* Savings Y-axis labels */}
            {Array.from({ length: 6 }, (_, i) => {
              // Map the axis labels to match the actual bar scaling (15-60% range)
              const axisPosition = (5 - i) / 5; // 0 to 1 from bottom to top
              const actualValue = savingsScaleMin + (savingsRange * axisPosition);
              const value = Math.round(actualValue / 1000);
              return (
                <div key={i} style={{
                  fontSize: '9px',
                  color: '#f9ca24',
                  textAlign: 'left',
                  position: 'relative',
                  fontWeight: '600'
                }}>
                  <div style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    width: '5px',
                    height: '1px',
                    backgroundColor: '#f9ca24',
                    marginRight: '2px',
                    opacity: 0.6
                  }} />
                  ${value}k
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '15px',
        paddingTop: '10px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#f9ca24',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '12px', color: '#666' }}>Annual Savings</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#e67e22',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '12px', color: '#666' }}>Annual CAPEX</span>
        </div>
      </div>
    </div>
  );
}

export default ROIBarChart;