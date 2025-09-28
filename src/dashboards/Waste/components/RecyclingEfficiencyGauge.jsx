import React from 'react';

function RecyclingEfficiencyGauge({ percentage, title }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(39,174,96,0.08)',
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
        {title}
      </h3>
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#27ae60',
        marginBottom: '0.5rem'
      }}>
        {percentage}%
      </div>
      <div style={{
        textAlign: 'center',
        color: '#888',
        fontSize: '0.9rem',
        fontStyle: 'italic'
      }}>
        Circular gauge visualization
      </div>
    </div>
  );
}

export default RecyclingEfficiencyGauge;