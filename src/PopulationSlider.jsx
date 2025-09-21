import React from 'react';

function PopulationSlider({ growthRate, setGrowthRate }) {
  return (
    <div style={{
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(136,132,216,0.08)',
      padding: '1.5rem 2rem',
    }}>
      <label htmlFor="growth-slider" style={{
        fontWeight: 600,
        color: '#8884d8',
        fontSize: '1.1rem',
        marginBottom: '0.8rem',
        letterSpacing: 0.2,
        textAlign: 'center',
      }}>
        Population Growth Rate
      </label>
      <div style={{
        color: '#fff',
        background: 'linear-gradient(90deg, #8884d8 0%, #b3aaff 100%)',
        fontWeight: 700,
        fontSize: '1.8rem',
        borderRadius: 8,
        padding: '0.6rem 1.5rem',
        marginBottom: '1.2rem',
        boxShadow: '0 1px 4px rgba(136,132,216,0.10)',
        letterSpacing: 0.2,
        minWidth: '5rem',
        textAlign: 'center',
        display: 'inline-block',
      }}>{growthRate}%</div>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <input
          id="growth-slider"
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={growthRate}
          onChange={e => setGrowthRate(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: '#8884d8',
            height: 8,
            borderRadius: 8,
            background: 'linear-gradient(90deg, #8884d8 0%, #b3aaff 100%)',
            outline: 'none',
            boxShadow: '0 1px 4px rgba(136,132,216,0.10)',
            margin: 0,
            appearance: 'none',
          }}
          className="custom-slider"
        />
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#b0bed9', marginTop: '0.5rem' }}>
        <span>-10%</span>
        <span>+10%</span>
      </div>
      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          margin-top: -8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8884d8 60%, #b3aaff 100%);
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(136,132,216,0.18);
          cursor: pointer;
          transition: background 0.2s;
        }
        .custom-slider:focus::-webkit-slider-thumb {
          outline: 2px solid #8884d8;
        }
        .custom-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8884d8 60%, #b3aaff 100%);
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(136,132,216,0.18);
          cursor: pointer;
          transition: background 0.2s;
        }
        .custom-slider::-moz-range-thumb {
          margin-top: 0px;
        }
        .custom-slider:focus::-moz-range-thumb {
          outline: 2px solid #8884d8;
        }
        .custom-slider::-ms-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8884d8 60%, #b3aaff 100%);
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(136,132,216,0.18);
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0px;
        }
        .custom-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 8px;
          background: linear-gradient(90deg, #8884d8 0%, #b3aaff 100%);
        }
        .custom-slider::-ms-fill-lower {
          background: #8884d8;
        }
        .custom-slider::-ms-fill-upper {
          background: #b3aaff;
        }
        .custom-slider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}

export default PopulationSlider;
