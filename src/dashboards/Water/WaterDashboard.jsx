import React, { useState } from 'react';
import './WaterDashboard.css';
import BAN from '../../components/BAN';
import WaterUseChart from './components/WaterUseChart';
import WaterROIChart from './components/WaterROIChart';
import WaterScenarioChart from './components/WaterScenarioChart';
import WaterDropletWaffle from './components/WaterDropletWaffle';
import { FaTint, FaRecycle, FaLeaf, FaEuroSign, FaBullseye, FaWater } from 'react-icons/fa';

function WaterDashboard() {
  // Water management variables
  const [campusFootfall, setCampusFootfall] = useState(100); // % change (base 100%, range 70-150%)
  const [interventionFunding, setInterventionFunding] = useState(0); // % scale (base 0%, range 0-100%)
  
  // Intervention selection state
  const [enabledInterventions, setEnabledInterventions] = useState({
    rainwaterHarvesting: true,
    greywaterRecycling: true,
    leakDetection: true,
    smartIrrigation: true,
    waterEfficiencyUpgrades: true
  });

  // Toggle intervention function
  const toggleIntervention = (intervention) => {
    setEnabledInterventions(prev => ({
      ...prev,
      [intervention]: !prev[intervention]
    }));
  };

  // Mock data for water calculations
  const baseWaterUse = 450000; // base m³ per year (typical university consumption)
  const baseWaterUseByFootfall = Math.round(baseWaterUse * (campusFootfall / 100)); // adjusted by footfall
  
  // Calculate water reduction from interventions
  const waterReductionFactors = {
    rainwaterHarvesting: 0.12, // 12% total water reduction
    greywaterRecycling: 0.15, // 15% total water reduction  
    leakDetection: 0.08, // 8% total water reduction
    smartIrrigation: 0.10, // 10% total water reduction
    waterEfficiencyUpgrades: 0.18 // 18% total water reduction
  };
  
  let totalWaterReduction = 0;
  Object.keys(enabledInterventions).forEach(intervention => {
    if (enabledInterventions[intervention] && waterReductionFactors[intervention]) {
      totalWaterReduction += waterReductionFactors[intervention] * (interventionFunding / 100);
    }
  });
  
  const totalWaterUse = Math.round(baseWaterUseByFootfall * (1 - totalWaterReduction));
  
  // Wastewater volume calculation (typically 80-90% of water use becomes wastewater)
  const wastewaterVolume = Math.round(totalWaterUse * 0.85);
  
  // Reuse/Recycling rate: Base 5%, can increase to 35% with interventions
  const baseReuseRate = 5;
  const maxReuseRate = 35;
  let actualReuseRate = baseReuseRate;
  
  if (enabledInterventions.greywaterRecycling) {
    actualReuseRate += 15 * (interventionFunding / 100);
  }
  if (enabledInterventions.rainwaterHarvesting) {
    actualReuseRate += 10 * (interventionFunding / 100);
  }
  if (enabledInterventions.waterEfficiencyUpgrades) {
    actualReuseRate += 5 * (interventionFunding / 100);
  }
  
  actualReuseRate = Math.min(Math.round(actualReuseRate), maxReuseRate);
  
  // Carbon emissions: Base 0.35 tCO₂e per m³ (pumping, treatment, heating)
  const carbonEmissionFactor = 0.35; // tCO₂e per m³ of water
  const baselineCarbonEmissions = totalWaterUse * carbonEmissionFactor;
  
  // Intervention-specific carbon reductions
  const carbonReductions = {
    rainwaterHarvesting: enabledInterventions.rainwaterHarvesting ? 
      Math.round(totalWaterUse * 0.12 * 0.25 * (interventionFunding / 100)) : 0,
    greywaterRecycling: enabledInterventions.greywaterRecycling ? 
      Math.round(totalWaterUse * 0.15 * 0.30 * (interventionFunding / 100)) : 0,
    leakDetection: enabledInterventions.leakDetection ? 
      Math.round(totalWaterUse * 0.08 * 0.35 * (interventionFunding / 100)) : 0,
    smartIrrigation: enabledInterventions.smartIrrigation ? 
      Math.round(totalWaterUse * 0.10 * 0.20 * (interventionFunding / 100)) : 0,
    waterEfficiencyUpgrades: enabledInterventions.waterEfficiencyUpgrades ? 
      Math.round(totalWaterUse * 0.18 * 0.28 * (interventionFunding / 100)) : 0
  };
  
  const totalCarbonReduction = Object.values(carbonReductions).reduce((sum, reduction) => sum + reduction, 0);
  const totalCarbonEmissions = Math.max(Math.round(baselineCarbonEmissions - totalCarbonReduction), Math.round(baselineCarbonEmissions * 0.20));
  
  // Cost calculations: Base cost €2.50/m³ (supply, treatment, disposal)
  const baseCostPerCubicMeter = 2.50; // euros per m³
  const baselineCost = totalWaterUse * baseCostPerCubicMeter;
  
  // Intervention-specific cost savings
  const costSavings = {
    rainwaterHarvesting: enabledInterventions.rainwaterHarvesting ? 
      Math.round(totalWaterUse * 0.12 * 1.80 * (interventionFunding / 100)) : 0,
    greywaterRecycling: enabledInterventions.greywaterRecycling ? 
      Math.round(totalWaterUse * 0.15 * 2.20 * (interventionFunding / 100)) : 0,
    leakDetection: enabledInterventions.leakDetection ? 
      Math.round(totalWaterUse * 0.08 * 2.50 * (interventionFunding / 100)) : 0,
    smartIrrigation: enabledInterventions.smartIrrigation ? 
      Math.round(totalWaterUse * 0.10 * 1.50 * (interventionFunding / 100)) : 0,
    waterEfficiencyUpgrades: enabledInterventions.waterEfficiencyUpgrades ? 
      Math.round(totalWaterUse * 0.18 * 2.00 * (interventionFunding / 100)) : 0
  };
  
  const totalCostSavings = Object.values(costSavings).reduce((sum, saving) => sum + saving, 0);
  const totalCost = Math.max(Math.round(baselineCost - totalCostSavings), Math.round(baselineCost * 0.40));
  
  // Water per student: Assuming 25,000 students base population
  const baseStudentPopulation = 25000;
  const adjustedStudentPopulation = Math.round(baseStudentPopulation * (campusFootfall / 100));
  const waterPerStudent = Math.round((totalWaterUse * 1000) / adjustedStudentPopulation / 365); // liters per student per day

  return (
    <div className="water-dashboard">
      <h1 className="water-dashboard-title">Water Management Dashboard</h1>
      
      <div className="water-controls">
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
              className="water-slider"
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
              className="water-slider"
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
              onClick={() => toggleIntervention('rainwaterHarvesting')}
              className={`intervention-toggle ${enabledInterventions.rainwaterHarvesting ? 'active' : ''}`}
            >
              Rainwater Harvest
            </button>
            <button
              onClick={() => toggleIntervention('greywaterRecycling')}
              className={`intervention-toggle ${enabledInterventions.greywaterRecycling ? 'active' : ''}`}
            >
              Greywater Recycle
            </button>
            <button
              onClick={() => toggleIntervention('leakDetection')}
              className={`intervention-toggle ${enabledInterventions.leakDetection ? 'active' : ''}`}
            >
              Leak Detection
            </button>
            <button
              onClick={() => toggleIntervention('smartIrrigation')}
              className={`intervention-toggle ${enabledInterventions.smartIrrigation ? 'active' : ''}`}
            >
              Smart Irrigation
            </button>
            <button
              onClick={() => toggleIntervention('waterEfficiencyUpgrades')}
              className={`intervention-toggle ${enabledInterventions.waterEfficiencyUpgrades ? 'active' : ''}`}
            >
              Efficiency Upgrades
            </button>
          </div>
        </div>
      </div>
      
      <BAN
        className="ban-total-water"
        value={totalWaterUse.toLocaleString()}
        icon={<FaTint size={32} color="#3498db" />}
        label="Total Water Use (m³/year)"
        color="#3498db"
        percent={0}
      />
      
      <BAN
        className="ban-wastewater"
        value={wastewaterVolume.toLocaleString()}
        icon={<FaWater size={32} color="#3498db" />}
        label="Wastewater Volume (m³/year)"
        color="#3498db"
        percent={0}
      />
      
      <BAN
        className="ban-carbon-emissions"
        value={totalCarbonEmissions.toLocaleString()}
        icon={<FaLeaf size={32} color="#3498db" />}
        label="Carbon Emission (tCO₂e)"
        color="#3498db"
        percent={0}
      />
      
      <BAN
        className="ban-cost"
        value={`€${totalCost.toLocaleString()}`}
        icon={<FaEuroSign size={32} color="#3498db" />}
        label="Cost (euros/year)"
        color="#3498db"
        percent={0}
      />
      
      <BAN
        className="ban-water-per-student"
        value={waterPerStudent.toLocaleString()}
        icon={<FaBullseye size={32} color="#3498db" />}
        label="Water per Student (L/day)"
        color="#3498db"
        percent={0}
      />
      
      <div className="ban-reuse-percentage water-waffle-ban">
        <div className="ban-header">
          <div className="ban-icon">
            <FaRecycle size={32} color="#3498db" />
          </div>
          <div className="ban-label">% Reused/Recycled Water</div>
        </div>
        <div className="ban-content-waffle">
          <div className="ban-value">{actualReuseRate.toFixed(1)}%</div>
          <div className="waffle-container">
            <WaterDropletWaffle 
              percentage={actualReuseRate} 
              size={140} 
              animate={true}
            />
          </div>
        </div>
      </div>
      
      <div className="water-use-container">
        <WaterUseChart 
          totalWaterUse={totalWaterUse}
          enabledInterventions={enabledInterventions}
          interventionFunding={interventionFunding}
        />
      </div>
      
      <div className="water-scenario-container">
        <WaterScenarioChart 
          interventionFunding={interventionFunding}
          totalWaterUse={totalWaterUse}
          enabledInterventions={enabledInterventions}
        />
      </div>
      
      <div className="water-roi-container">
        <WaterROIChart 
          interventionFunding={interventionFunding}
          totalWaterUse={totalWaterUse}
          enabledInterventions={enabledInterventions}
        />
      </div>
    </div>
  );
}

export default WaterDashboard;