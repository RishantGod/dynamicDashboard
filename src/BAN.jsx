import React from 'react';

function BAN({ value, icon, label, color = '#8884d8', percent = 0, className = '' }) {
  // Determine arrow and color for percent change
  let percentColor = percent > 0 ? '#e74c3c' : percent < 0 ? '#43a047' : '#888';
  let arrow = percent > 0 ? '▲' : percent < 0 ? '▼' : '';
  let percentText = percent !== 0 ? `${arrow} ${Math.abs(percent).toFixed(1)}%` : '0%';
  const isFinance = label && label.toLowerCase().includes('finance');
  const isCarbon = label && label.toLowerCase().includes('carbon');
  return (
    <div className={className} style={{
      background: '#fff',
      borderRadius: 22,
      boxShadow: '0 2px 16px rgba(136,132,216,0.12)',
      padding: '1.8rem 1.5rem 1.2rem 1.5rem',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
        <div style={{
          fontSize: 32,
          fontWeight: 700,
          color,
          maxWidth: 400,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {isFinance ? <span style={{fontSize: 24, verticalAlign: 'middle', marginRight: 2}}>&pound;</span> : null}
          {value}
          {isCarbon ? <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 4 }}>
            tCO<span style={{ verticalAlign: 'super', fontSize: 10 }}>2</span>e
          </span> : null}
        </div>
      </div>
      <div style={{ fontSize: 14, color: '#888', textAlign: 'center', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: percentColor,
        background: percent !== 0 ? 'rgba(231,76,60,0.08)' : 'rgba(136,132,216,0.08)',
        borderRadius: 8,
        padding: '3px 12px',
        marginTop: 2,
        minWidth: 48,
        textAlign: 'center',
        letterSpacing: 0.2,
        display: 'inline-block',
      }}>{percentText}</div>
    </div>
  );
}

export default BAN;
