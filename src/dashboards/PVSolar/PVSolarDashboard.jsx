import React, { useState } from 'react';
import './PVSolarDashboard.css';
import BAN from '../../components/BAN';
import WaffleChart from './components/WaffleChart';
import SolarGauge from './components/SolarGauge';
import ROIBarChart from './components/ROIBarChart';
import SolarGenerationChart from './components/SolarGenerationChart';
import { FaSolarPanel, FaMoneyBillWave, FaBolt, FaLeaf, FaChartLine, FaClock } from 'react-icons/fa';

function PVSolarDashboard() {
  // Solar panel variables
  const [solarCapacity, setSolarCapacity] = useState(100); // kW capacity
  const solarEfficiency = 85; // Fixed efficiency at 85%

  // Mock calculations for demonstration
  const annualGeneration = Math.round(solarCapacity * solarEfficiency * 8.76); // kWh/year (assuming 8.76 hours average sun/day)
  const annualSavings = Math.round(annualGeneration * 0.12); // Assuming $0.12/kWh
  const carbonOffset = Math.round(annualGeneration * 0.0004); // Assuming 0.4kg CO2/kWh offset
  const rooftopUtilization = Math.round((solarCapacity / 3000) * 100); // Assuming 3000kW max rooftop capacity
  
  // Financial calculations
  const initialInvestment = solarCapacity * 2500; // Assuming $2500/kW installation cost
  const paybackPeriod = annualSavings > 0 ? Math.round((initialInvestment / annualSavings) * 10) / 10 : 0; // Years to recover investment
  const roi = annualSavings > 0 ? Math.round((annualSavings / initialInvestment) * 100 * 10) / 10 : 0; // Annual ROI percentage
  
  // Solar energy usage percentage (5000 kW = 100%)
  const maxSolarCapacity = 5000; // kW
  const maxPossibleGeneration = maxSolarCapacity * solarEfficiency * 8.76; // kWh/year at max capacity
  const solarEnergyPercentage = Math.min(Math.round((annualGeneration / maxPossibleGeneration) * 100), 100);

  return (
    <div className="pv-solar-dashboard">
      <h1 className="pv-dashboard-title">PV Solar Dashboard</h1>
      
      <div className="solar-controls">
        <div className="control-group">
          <label>Solar Capacity (kW)</label>
          <div className="slider-container">
            <div className="slider-value">
              <span>{solarCapacity} kWh</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              value={solarCapacity}
              onChange={(e) => setSolarCapacity(Number(e.target.value))}
              className="solar-capacity-slider"
            />
            <div className="slider-labels">
              <span className="slider-label-min">0kWh</span>
              <span className="slider-label-max">5000kWh</span>
            </div>
          </div>
        </div>
      </div>
      
      <BAN
        className="ban-annual-generation"
        value={annualGeneration.toLocaleString()}
        icon={<FaBolt size={32} color="#f9ca24" />}
        label="Annual Generation (kWh)"
        color="#f9ca24"
        percent={0}
      />
      
      <BAN
        className="ban-CAPEX"
        value={annualSavings.toLocaleString()}
        icon={<FaMoneyBillWave size={32} color="#f9ca24" />}
        label="CAPEX"
        color="#f9ca24"
        percent={0}
      />
      
      <BAN
        className="ban-carbon-offset"
        value={carbonOffset.toLocaleString()}
        icon={<FaLeaf size={32} color="#f9ca24" />}
        label="Carbon Saving (kg CO2)"
        color="#f9ca24"
        percent={0}
      />
      
      <BAN
        className="ban-annual-savings"
        value={annualSavings.toLocaleString()}
        icon={<FaMoneyBillWave size={32} color="#f9ca24" />}
        label="Annual Savings ($)"
        color="#f9ca24"
        percent={0}
      />
      
      <BAN
        className="ban-payback"
        value={`${paybackPeriod}`}
        icon={<FaClock size={32} color="#f9ca24" />}
        label="Payback Period (Years)"
        color="#f9ca24"
        percent={0}
      />
      
      <div className="solar-gauge-container">
        <SolarGauge 
          percentage={solarEnergyPercentage} 
          title="Solar Capacity Utilization"
        />
      </div>
      
      <div className="waffle-chart-container">
        <WaffleChart 
          percentage={rooftopUtilization} 
          title="Rooftop Utilization"
        />
      </div>
      
      <div className="solar-chart-container">
        <SolarGenerationChart solarCapacity={solarCapacity} />
      </div>
      
      <div className="financial-chart-placeholder">
        <ROIBarChart 
          solarCapacity={solarCapacity}
          annualSavings={annualSavings}
        />
      </div>
    </div>
  );
}

export default PVSolarDashboard;