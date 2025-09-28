import React, { useState } from 'react';
import './NaturalGasDashboard.css';
import BAN from '../../components/BAN';
import GasUseChart from './components/GasUseChart';
import GasROIChart from './components/GasROIChart';
import GasScenarioChart from './components/GasScenarioChart';
import { FaFire, FaLeaf, FaEuroSign, FaHome, FaThermometerHalf, FaChartLine } from 'react-icons/fa';

function NaturalGasDashboard() {
  // Natural gas management variables
  const [heatingDemandIndex, setHeatingDemandIndex] = useState(100); // % of typical HDD (base 100%, range 70-150%)
  const [interventionFunding, setInterventionFunding] = useState(0); // % scale (base 0%, range 0-100%)
  
  // Intervention selection state
  const [enabledInterventions, setEnabledInterventions] = useState({
    fabricUpgrades: true,
    controls: true,
    setpointsScheduling: true,
    highEfficiencyBoilers: true,
    heatPumpConversion: true,
    dhwEfficiency: true
  });

  // Toggle intervention function
  const toggleIntervention = (intervention) => {
    setEnabledInterventions(prev => ({
      ...prev,
      [intervention]: !prev[intervention]
    }));
  };

  // Calculate effective intervention funding based on enabled interventions
  const enabledCount = Object.values(enabledInterventions).filter(Boolean).length;
  const totalCount = Object.keys(enabledInterventions).length;
  const effectiveInterventionFunding = enabledCount > 0 ? 
    (interventionFunding * enabledCount / totalCount) : 0;
  
  // Mock data for natural gas calculations
  const baseGasUse = 8500000; // base kWh per year (8.5 GWh thermal)
  const baseGasByHeatingDemand = Math.round(baseGasUse * (heatingDemandIndex / 100)); // adjusted by heating demand
  
  // Calculate gas reduction from interventions
  const gasReductionFactors = {
    fabricUpgrades: 0.25, // 25% total gas reduction
    controls: 0.08, // 8% total gas reduction  
    setpointsScheduling: 0.12, // 12% total gas reduction
    highEfficiencyBoilers: 0.15, // 15% total gas reduction
    heatPumpConversion: 0.30, // 30% effective reduction (via electrification)
    dhwEfficiency: 0.10 // 10% total gas reduction
  };
  
  let totalGasReduction = 0;
  Object.keys(enabledInterventions).forEach(intervention => {
    if (enabledInterventions[intervention] && gasReductionFactors[intervention]) {
      totalGasReduction += gasReductionFactors[intervention] * (interventionFunding / 100);
    }
  });
  
  const totalGasUse = Math.round(baseGasByHeatingDemand * (1 - totalGasReduction));
  
  // Heat pump penetration calculations based on intervention funding
  const baseHeatPumpShare = 5; // base heat pump share without intervention
  const maxHeatPumpShare = 45; // maximum achievable with full intervention
  const heatPumpBoost = enabledInterventions.heatPumpConversion ? 1 : 0;
  const actualHeatPumpShare = Math.round(baseHeatPumpShare + ((maxHeatPumpShare - baseHeatPumpShare) * (interventionFunding / 100) * heatPumpBoost));
  
  // Peak heat demand reduction: Base 0%, can increase to 35% with intervention funding
  const basePeakReduction = 0;
  const maxPeakReduction = 35;
  const peakBoost = (enabledInterventions.fabricUpgrades ? 0.4 : 0) + 
                    (enabledInterventions.controls ? 0.3 : 0) + 
                    (enabledInterventions.setpointsScheduling ? 0.3 : 0);
  const actualPeakReduction = Math.round(basePeakReduction + ((maxPeakReduction - basePeakReduction) * (interventionFunding / 100) * peakBoost));
  
  // Carbon emissions: Base 0.20 tCO2e per MWh for natural gas
  const carbonEmissionFactor = 0.20; // tCO2e per MWh from natural gas
  const heatPumpCarbonFactor = 0.35; // tCO2e per MWh from heat pumps (electricity-based)
  
  // Calculate carbon emissions based on heating mix
  const gasHeating = totalGasUse * (1 - actualHeatPumpShare / 100);
  const heatPumpHeating = totalGasUse * (actualHeatPumpShare / 100);
  const totalCarbonEmissions = Math.round(
    (gasHeating * carbonEmissionFactor + heatPumpHeating * heatPumpCarbonFactor) / 1000
  ); // Convert to tCO2e
  
  // Cost calculations: Base cost €0.08/kWh for gas, €0.12/kWh for heat pump electricity
  const baseCostPerKWh = 0.08; // euros per kWh for natural gas
  const heatPumpCostPerKWh = 0.12 / 3.0; // euros per kWh thermal (COP = 3.0)
  
  // Calculate costs based on heating mix
  const gasCost = gasHeating * baseCostPerKWh;
  const heatPumpCost = heatPumpHeating * heatPumpCostPerKWh;
  const totalCost = Math.round(gasCost + heatPumpCost);
  
  // Heating intensity: Assuming 150,000 m² heated floor area
  const heatedFloorArea = 150000; // m²
  const heatingIntensity = Math.round(totalGasUse / heatedFloorArea); // kWh/m²

  return (
    <div className="gas-dashboard">
      <h1 className="gas-dashboard-title">Natural Gas Management Dashboard</h1>
      
      <div className="gas-controls">
        <div className="control-group">
          <label>Heating Demand Index (% of typical HDD)</label>
          <div className="slider-container">
            <div className="slider-value">
              <span>{heatingDemandIndex}%</span>
            </div>
            <input 
              type="range" 
              min="70" 
              max="150" 
              value={heatingDemandIndex}
              onChange={(e) => setHeatingDemandIndex(Number(e.target.value))}
              className="gas-slider"
            />
            <div className="slider-labels">
              <span className="slider-label-min">70%</span>
              <span className="slider-label-max">150%</span>
            </div>
          </div>
        </div>
        
        <div className="control-group">
          <label>Intervention Funding/Adoption (% Scale)</label>
          <div className="slider-container">
            <div className="slider-value">
              <span>{interventionFunding}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={interventionFunding}
              onChange={(e) => setInterventionFunding(Number(e.target.value))}
              className="gas-slider"
            />
            <div className="slider-labels">
              <span className="slider-label-min">0%</span>
              <span className="slider-label-max">100%</span>
            </div>
          </div>
        </div>

        <div className="control-group">
          <label>Intervention Selection</label>
          <div className="intervention-toggles">
            <button
              onClick={() => toggleIntervention('fabricUpgrades')}
              className={`intervention-toggle ${enabledInterventions.fabricUpgrades ? 'active' : ''}`}
            >
              Fabric Upgrades
            </button>
            <button
              onClick={() => toggleIntervention('controls')}
              className={`intervention-toggle ${enabledInterventions.controls ? 'active' : ''}`}
            >
              Controls
            </button>
            <button
              onClick={() => toggleIntervention('setpointsScheduling')}
              className={`intervention-toggle ${enabledInterventions.setpointsScheduling ? 'active' : ''}`}
            >
              Setpoints & Scheduling
            </button>
            <button
              onClick={() => toggleIntervention('highEfficiencyBoilers')}
              className={`intervention-toggle ${enabledInterventions.highEfficiencyBoilers ? 'active' : ''}`}
            >
              High-Efficiency Boilers
            </button>
            <button
              onClick={() => toggleIntervention('heatPumpConversion')}
              className={`intervention-toggle ${enabledInterventions.heatPumpConversion ? 'active' : ''}`}
            >
              Heat Pump Conversion
            </button>
            <button
              onClick={() => toggleIntervention('dhwEfficiency')}
              className={`intervention-toggle ${enabledInterventions.dhwEfficiency ? 'active' : ''}`}
            >
              DHW Efficiency
            </button>
          </div>
        </div>
      </div>
      
      <BAN
        className="ban-total-gas"
        value={totalGasUse.toLocaleString()}
        icon={<FaFire size={32} color="#17a2b8" />}
        label="Total Gas Use (kWh/year)"
        color="#17a2b8"
        percent={0}
      />
      
      <BAN
        className="ban-carbon-emissions"
        value={totalCarbonEmissions.toLocaleString()}
        icon={<FaLeaf size={32} color="#17a2b8" />}
        label="Carbon Emissions (tCO₂e)"
        color="#17a2b8"
        percent={0}
      />
      
      <BAN
        className="ban-cost"
        value={`€${totalCost.toLocaleString()}`}
        icon={<FaEuroSign size={32} color="#17a2b8" />}
        label="Cost (euros/year)"
        color="#17a2b8"
        percent={0}
      />
      
      <BAN
        className="ban-heating-intensity"
        value={heatingIntensity.toLocaleString()}
        icon={<FaHome size={32} color="#17a2b8" />}
        label="Heating Intensity (kWh/m²)"
        color="#17a2b8"
        percent={0}
      />
      
      <BAN
        className="ban-heat-pump-share"
        value={`${actualHeatPumpShare}%`}
        icon={<FaThermometerHalf size={32} color="#17a2b8" />}
        label="% Heat from Heat Pumps"
        color="#17a2b8"
        percent={actualHeatPumpShare}
      />
      
      <BAN
        className="ban-peak-reduction"
        value={`${actualPeakReduction}%`}
        icon={<FaChartLine size={32} color="#17a2b8" />}
        label="Peak Heat Demand Reduction (%)"
        color="#17a2b8"
        percent={actualPeakReduction}
      />
      
      <div className="gas-composition-container">
        <GasUseChart 
          totalGasUse={totalGasUse}
          enabledInterventions={enabledInterventions}
          interventionFunding={interventionFunding}
        />
      </div>
      
      <div className="gas-roi-container">
        <GasROIChart 
          interventionFunding={interventionFunding}
          totalGasUse={totalGasUse}
          enabledInterventions={enabledInterventions}
        />
      </div>
      
      <div className="gas-scenario-container">
        <GasScenarioChart 
          interventionFunding={interventionFunding}
          totalGasUse={totalGasUse}
          enabledInterventions={enabledInterventions}
        />
      </div>
    </div>
  );
}

export default NaturalGasDashboard;