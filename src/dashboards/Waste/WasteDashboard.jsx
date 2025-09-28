import React, { useState } from 'react';
import './WasteDashboard.css';
import BAN from '../../components/BAN';
import WasteCompositionChart from './components/WasteCompositionChart';
import RecyclingEfficiencyGauge from './components/RecyclingEfficiencyGauge';
import ScenarioComparisonChart from './components/WasteReductionChart';
import WasteROIChart from './components/WasteROIChart';
import { FaTrash, FaRecycle, FaLeaf, FaRedoAlt, FaEuroSign, FaBullseye } from 'react-icons/fa';

function WasteDashboard() {
  // Waste management variables
  const [campusFootfall, setCampusFootfall] = useState(100); // % change (base 100%, range 70-150%)
  const [interventionFunding, setInterventionFunding] = useState(0); // % scale (base 0%, range 0-100%)
  
  // Intervention selection state
  const [enabledInterventions, setEnabledInterventions] = useState({
    foodWaste: true,
    campusReuse: true,
    recyclingUplift: true,
    circularProcurement: true,
    cdMinimisation: true
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
  
  // Mock data for waste calculations
  const baseWasteGenerated = 12500; // base tons per year
  const baseWasteByFootfall = Math.round(baseWasteGenerated * (campusFootfall / 100)); // adjusted by footfall
  
  // Calculate waste reduction from interventions
  const wasteReductionFactors = {
    foodWaste: 0.08, // 8% total waste reduction
    campusReuse: 0.06, // 6% total waste reduction  
    recyclingUplift: 0.04, // 4% total waste reduction
    circularProcurement: 0.12, // 12% total waste reduction
    cdMinimisation: 0.05 // 5% total waste reduction
  };
  
  let totalWasteReduction = 0;
  Object.keys(enabledInterventions).forEach(intervention => {
    if (enabledInterventions[intervention] && wasteReductionFactors[intervention]) {
      totalWasteReduction += wasteReductionFactors[intervention] * (interventionFunding / 100);
    }
  });
  
  const totalWasteGenerated = Math.round(baseWasteByFootfall * (1 - totalWasteReduction));
  
  // Waste calculations based on intervention funding
  const baseRecyclingRate = 45; // base recycling rate without intervention
  const maxRecyclingRate = 85; // maximum achievable with full intervention
  const recyclingBoost = enabledInterventions.recyclingUplift ? 1 : 0;
  const actualRecyclingRate = Math.round(baseRecyclingRate + ((maxRecyclingRate - baseRecyclingRate) * (interventionFunding / 100) * recyclingBoost));
  
  // Calculate recycled waste from base waste (before interventions reduce total)
  const wasteRecycled = Math.round((baseWasteByFootfall * actualRecyclingRate) / 100);
  
  // Reuse rate: Base 5%, can increase to 15% with intervention funding
  const baseReuseRate = 5;
  const maxReuseRate = 15;
  const reuseBoost = enabledInterventions.campusReuse ? 1 : 0;
  const actualReuseRate = Math.round(baseReuseRate + ((maxReuseRate - baseReuseRate) * (interventionFunding / 100) * reuseBoost));
  const wasteReused = Math.round((baseWasteByFootfall * actualReuseRate) / 100);
  
  // Carbon emissions: Base 2.1 tCO2e per ton waste, reduced by recycling and reuse
  const carbonEmissionFactor = 2.1; // tCO2e per ton of waste
  const carbonReductionFromRecycling = 0.8; // tCO2e saved per ton recycled
  const carbonReductionFromReuse = 1.2; // tCO2e saved per ton reused
  
  // Calculate carbon emissions - start with current waste generation and apply reductions
  const baselineCarbonEmissions = totalWasteGenerated * carbonEmissionFactor;
  
  // Intervention-specific carbon reductions (applied to the actual waste generated)
  const carbonReductions = {
    foodWaste: enabledInterventions.foodWaste ? 
      Math.round(totalWasteGenerated * 0.35 * 1.8 * (interventionFunding / 100)) : 0,
    campusReuse: enabledInterventions.campusReuse ? 
      Math.round(wasteReused * carbonReductionFromReuse) : 0,
    recyclingUplift: enabledInterventions.recyclingUplift ? 
      Math.round(wasteRecycled * carbonReductionFromRecycling) : 0,
    circularProcurement: enabledInterventions.circularProcurement ? 
      Math.round(totalWasteGenerated * 0.25 * 1.2 * (interventionFunding / 100)) : 0,
    cdMinimisation: enabledInterventions.cdMinimisation ? 
      Math.round(totalWasteGenerated * 0.12 * 2.0 * (interventionFunding / 100)) : 0
  };
  
  const totalCarbonReduction = Object.values(carbonReductions).reduce((sum, reduction) => sum + reduction, 0);
  const totalCarbonEmissions = Math.max(Math.round(baselineCarbonEmissions - totalCarbonReduction), Math.round(baselineCarbonEmissions * 0.15)); // Minimum 15% of baseline
  
  // Cost calculations: Base cost €120/ton, savings from recycling and reuse
  const baseCostPerTon = 120; // euros per ton
  const recyclingCostSaving = 45; // euros saved per ton recycled
  const reuseCostSaving = 85; // euros saved per ton reused
  
  // Calculate costs - start with current waste generation cost and apply savings
  const baselineCost = totalWasteGenerated * baseCostPerTon;
  
  // Intervention-specific cost savings (applied to the actual waste generated)
  const costSavings = {
    foodWaste: enabledInterventions.foodWaste ? 
      Math.round(totalWasteGenerated * 0.35 * 45 * (interventionFunding / 100)) : 0,
    campusReuse: enabledInterventions.campusReuse ? 
      Math.round(wasteReused * reuseCostSaving) : 0,
    recyclingUplift: enabledInterventions.recyclingUplift ? 
      Math.round(wasteRecycled * recyclingCostSaving) : 0,
    circularProcurement: enabledInterventions.circularProcurement ? 
      Math.round(totalWasteGenerated * 0.25 * 35 * (interventionFunding / 100)) : 0,
    cdMinimisation: enabledInterventions.cdMinimisation ? 
      Math.round(totalWasteGenerated * 0.12 * 65 * (interventionFunding / 100)) : 0
  };
  
  const totalCostSavings = Object.values(costSavings).reduce((sum, saving) => sum + saving, 0);
  const totalCost = Math.max(Math.round(baselineCost - totalCostSavings), Math.round(baselineCost * 0.3)); // Minimum 30% of baseline
  
  // Waste per student: Assuming 25,000 students base population
  const baseStudentPopulation = 25000;
  const adjustedStudentPopulation = Math.round(baseStudentPopulation * (campusFootfall / 100));
  const wastePerStudent = Math.round((totalWasteGenerated * 1000) / adjustedStudentPopulation); // kg per student

  return (
    <div className="waste-dashboard">
      <h1 className="waste-dashboard-title">Waste Management Dashboard</h1>
      
      <div className="waste-controls">
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
              className="waste-slider"
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
              className="waste-slider"
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
              onClick={() => toggleIntervention('foodWaste')}
              className={`intervention-toggle ${enabledInterventions.foodWaste ? 'active' : ''}`}
            >
              Food Waste
            </button>
            <button
              onClick={() => toggleIntervention('campusReuse')}
              className={`intervention-toggle ${enabledInterventions.campusReuse ? 'active' : ''}`}
            >
              Reuse
            </button>
            <button
              onClick={() => toggleIntervention('recyclingUplift')}
              className={`intervention-toggle ${enabledInterventions.recyclingUplift ? 'active' : ''}`}
            >
              Recycling
            </button>
            <button
              onClick={() => toggleIntervention('circularProcurement')}
              className={`intervention-toggle ${enabledInterventions.circularProcurement ? 'active' : ''}`}
            >
              Procurement
            </button>
            <button
              onClick={() => toggleIntervention('cdMinimisation')}
              className={`intervention-toggle ${enabledInterventions.cdMinimisation ? 'active' : ''}`}
            >
              C&D Reduction
            </button>
          </div>
        </div>
      </div>
      
      <BAN
        className="ban-total-waste"
        value={totalWasteGenerated.toLocaleString()}
        icon={<FaTrash size={32} color="#27ae60" />}
        label="Total Waste (tons/year)"
        color="#27ae60"
        percent={0}
      />
      
      <BAN
        className="ban-carbon-emissions"
        value={totalCarbonEmissions.toLocaleString()}
        icon={<FaLeaf size={32} color="#27ae60" />}
        label="Carbon Emission (tCO₂e)"
        color="#27ae60"
        percent={0}
      />
      
      <BAN
        className="ban-recycled-percentage"
        value={`${actualRecyclingRate}%`}
        icon={<FaRecycle size={32} color="#27ae60" />}
        label="Recycled % (tons/year)"
        color="#27ae60"
        percent={actualRecyclingRate}
      />
      
      <BAN
        className="ban-reused"
        value={wasteReused.toLocaleString()}
        icon={<FaRedoAlt size={32} color="#27ae60" />}
        label="Reused (tons/year)"
        color="#27ae60"
        percent={actualReuseRate}
      />
      
      <BAN
        className="ban-cost"
        value={`€${totalCost.toLocaleString()}`}
        icon={<FaEuroSign size={32} color="#27ae60" />}
        label="Cost (euros/year)"
        color="#27ae60"
        percent={0}
      />
      
      <BAN
        className="ban-waste-per-student"
        value={wastePerStudent.toLocaleString()}
        icon={<FaBullseye size={32} color="#27ae60" />}
        label="Waste per Student (kg)"
        color="#27ae60"
        percent={0}
      />
      
      <div className="waste-composition-container">
                <WasteCompositionChart 
          totalWaste={totalWasteGenerated}
          enabledInterventions={enabledInterventions}
          interventionFunding={interventionFunding}
        />
      </div>
      
      <div className="waste-reduction-container">
        <ScenarioComparisonChart 
          interventionFunding={interventionFunding}
          totalWasteGenerated={totalWasteGenerated}
          enabledInterventions={enabledInterventions}
        />
      </div>
      
      <div className="waste-trend-container">
        <WasteROIChart 
          interventionFunding={interventionFunding}
          totalWasteGenerated={totalWasteGenerated}
          enabledInterventions={enabledInterventions}
        />
      </div>
    </div>
  );
}

export default WasteDashboard;