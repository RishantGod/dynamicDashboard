import React from 'react';

function WasteTrendChart({ wasteReductionTarget, recyclingRate }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(39,174,96,0.08)',
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: '#333',
        fontSize: '1.3rem',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        Waste Management Trends (2020-2050)
      </h3>
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#888',
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          <p>Line chart showing waste generation and diversion trends</p>
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            marginTop: '1rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ color: '#27ae60' }}>↗ Recycling Rate</div>
            <div style={{ color: '#e67e22' }}>↘ Landfill Waste</div>
            <div style={{ color: '#2ecc71' }}>↗ Carbon Savings</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WasteTrendChart;