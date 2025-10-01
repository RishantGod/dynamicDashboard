import React, { useState } from 'react';
import './ElectricityDashboard.css';
import BAN from '../../components/BAN';
import ElectricityUseChart from './components/ElectricityUseChart';
import ElectricityROIChart from './components/ElectricityROIChart';
import ElectricityScenarioChart from './components/ElectricityScenarioChart';
import { FaBolt, FaLeaf, FaEuroSign, FaSolarPanel, FaUser, FaChartLine } from 'react-icons/fa';

function ElectricityDashboard() {
  // Electricity management variables
  const [campusFootfall, setCampusFootfall] = useState(100); // % change (base 100%, range 70-150%)
  const [interventionFunding, setInterventionFunding] = useState(0); // % scale (base 0%, range 0-100%)
  
  // Intervention selection state
  const [enabledInterventions, setEnabledInterventions] = useState({
    ledRetrofits: true,
    smartControls: true,
    behavioralCampaigns: true,
    onsiteRenewables: true,
    demandSideManagement: true
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
  
  // Mock data for electricity calculations
  const baseElectricityUse = 18500000; // base kWh per year (18.5 GWh)
  const baseElectricityByFootfall = Math.round(baseElectricityUse * (campusFootfall / 100)); // adjusted by footfall
  
  // Calculate electricity reduction from interventions
  const electricityReductionFactors = {
    ledRetrofits: 0.15, // 15% total electricity reduction
    smartControls: 0.12, // 12% total electricity reduction  
    behavioralCampaigns: 0.08, // 8% total electricity reduction
    onsiteRenewables: 0.20, // 20% effective reduction (via on-site generation)
    demandSideManagement: 0.10 // 10% total electricity reduction
  };
  
  let totalElectricityReduction = 0;
  Object.keys(enabledInterventions).forEach(intervention => {
    if (enabledInterventions[intervention] && electricityReductionFactors[intervention]) {
      totalElectricityReduction += electricityReductionFactors[intervention] * (interventionFunding / 100);
    }
  });
  
  const totalElectricityUse = Math.round(baseElectricityByFootfall * (1 - totalElectricityReduction));
  
  // Renewable energy calculations based on intervention funding
  const baseRenewableShare = 15; // base renewable share without intervention
  const maxRenewableShare = 65; // maximum achievable with full intervention
  const renewableBoost = enabledInterventions.onsiteRenewables ? 1 : 0;
  const actualRenewableShare = Math.round(baseRenewableShare + ((maxRenewableShare - baseRenewableShare) * (interventionFunding / 100) * renewableBoost));
  
  // Peak demand reduction: Base 0%, can increase to 25% with intervention funding
  const basePeakReduction = 0;
  const maxPeakReduction = 25;
  const peakBoost = enabledInterventions.demandSideManagement ? 1 : 0;
  const actualPeakReduction = Math.round(basePeakReduction + ((maxPeakReduction - basePeakReduction) * (interventionFunding / 100) * peakBoost));
  
  // Carbon emissions: Base 0.35 tCO2e per MWh, reduced by renewable share and efficiency
  const carbonEmissionFactor = 0.35; // tCO2e per MWh from grid electricity
  const renewableCarbonFactor = 0.05; // tCO2e per MWh from renewables (lifecycle emissions)
  
  // Calculate carbon emissions based on renewable mix
  const gridElectricity = totalElectricityUse * (1 - actualRenewableShare / 100);
  const renewableElectricity = totalElectricityUse * (actualRenewableShare / 100);
  const totalCarbonEmissions = Math.round(
    (gridElectricity * carbonEmissionFactor + renewableElectricity * renewableCarbonFactor) / 1000
  ); // Convert to tCO2e
  
  // Cost calculations: Base cost €0.12/kWh, savings from efficiency and renewables
  const baseCostPerKWh = 0.12; // euros per kWh
  const renewableCostPerKWh = 0.08; // euros per kWh for on-site renewables
  
  // Calculate costs based on energy mix
  const gridCost = gridElectricity * baseCostPerKWh;
  const renewableCost = renewableElectricity * renewableCostPerKWh;
  const totalCost = Math.round(gridCost + renewableCost);
  
  // Electricity per student: Assuming 25,000 students base population
  const baseStudentPopulation = 25000;
  const adjustedStudentPopulation = Math.round(baseStudentPopulation * (campusFootfall / 100));
  const electricityPerStudent = Math.round(totalElectricityUse / adjustedStudentPopulation); // kWh per student

  return (
    <div className="electricity-dashboard">
      <h1 className="electricity-dashboard-title">Electricity Management Dashboard</h1>
      
      <div className="electricity-controls">
        <div className="control-group">
          <label>Campus Footfall (% Change)</label>
          <div className="slider-container">
            <div className="slider-value">
              <span>{campusFootfall}%</span>
            </div>
            <input 
              type="range" 
              min="70" 
              max="150" 
              value={campusFootfall}
              onChange={(e) => setCampusFootfall(Number(e.target.value))}
              className="electricity-slider"
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
              className="electricity-slider"
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
              onClick={() => toggleIntervention('ledRetrofits')}
              className={`intervention-toggle ${enabledInterventions.ledRetrofits ? 'active' : ''}`}
            >
              LED Retrofits
            </button>
            <button
              onClick={() => toggleIntervention('smartControls')}
              className={`intervention-toggle ${enabledInterventions.smartControls ? 'active' : ''}`}
            >
              Smart Controls
            </button>
            <button
              onClick={() => toggleIntervention('behavioralCampaigns')}
              className={`intervention-toggle ${enabledInterventions.behavioralCampaigns ? 'active' : ''}`}
            >
              Behavioral Campaigns
            </button>
            <button
              onClick={() => toggleIntervention('onsiteRenewables')}
              className={`intervention-toggle ${enabledInterventions.onsiteRenewables ? 'active' : ''}`}
            >
              On-site Renewables
            </button>
            <button
              onClick={() => toggleIntervention('demandSideManagement')}
              className={`intervention-toggle ${enabledInterventions.demandSideManagement ? 'active' : ''}`}
            >
              Demand Management
            </button>
          </div>
        </div>
      </div>
      
      <BAN
        className="ban-total-electricity"
        value={totalElectricityUse.toLocaleString()}
        icon={<FaBolt size={32} color="#e74c3c" />}
        label="Total Electricity Use (kWh/year)"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban-carbon-emissions"
        value={totalCarbonEmissions.toLocaleString()}
        icon={<FaLeaf size={32} color="#e74c3c" />}
        label="Carbon Emission (tCO₂e)"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban-cost"
        value={`€${totalCost.toLocaleString()}`}
        icon={<FaEuroSign size={32} color="#e74c3c" />}
        label="Cost (euros/year)"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban-renewable-share"
        value={`${actualRenewableShare}%`}
        icon={<FaSolarPanel size={32} color="#e74c3c" />}
        label="Renewable Share (% of supply)"
        color="#e74c3c"
        percent={actualRenewableShare}
      />
      
      <BAN
        className="ban-electricity-per-student"
        value={electricityPerStudent.toLocaleString()}
        icon={<FaUser size={32} color="#e74c3c" />}
        label="Electricity per Student (kWh)"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban-peak-demand-reduction"
        value={`${actualPeakReduction}%`}
        icon={<FaChartLine size={32} color="#e74c3c" />}
        label="Peak Demand Reduction (%)"
        color="#e74c3c"
        percent={actualPeakReduction}
      />
      
      <div className="electricity-composition-container">
        <ElectricityUseChart 
          totalElectricity={totalElectricityUse}
          enabledInterventions={enabledInterventions}
          interventionFunding={interventionFunding}
          campusFootfall={campusFootfall}
        />
      </div>
      
      <div className="electricity-roi-container">
        <ElectricityROIChart 
          interventionFunding={interventionFunding}
          totalElectricity={totalElectricityUse}
          enabledInterventions={enabledInterventions}
        />
      </div>
      
      <div className="electricity-scenario-container">
        <ElectricityScenarioChart 
          interventionFunding={interventionFunding}
          totalElectricity={totalElectricityUse}
          enabledInterventions={enabledInterventions}
        />
      </div>
    </div>
  );
}

export default ElectricityDashboard;