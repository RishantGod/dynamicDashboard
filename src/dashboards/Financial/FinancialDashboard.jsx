import React, { useState } from 'react';
import './FinancialDashboard.css';
import BAN from '../../components/BAN';
import { 
  FaEuroSign, 
  FaLeaf, 
  FaPercent,
  FaWater,
  FaBolt,
  FaFire,
  FaRecycle,
  FaCalculator,
  FaPiggyBank,
  FaChartLine,
  FaMoneyBillWave,
  FaSeedling
} from 'react-icons/fa';

function FinancialDashboard() {
  const [totalBudget, setTotalBudget] = useState(5000000);
  const [annualGrowthRate, setAnnualGrowthRate] = useState(3.5);
  const [selectedCategory, setSelectedCategory] = useState('water');

  const [waterInterventions, setWaterInterventions] = useState({
    rainwaterHarvesting: 150000,
    leakDetection: 75000,
    recycling: 200000,
    lowFlowFixtures: 100000,
    greywater: 250000
  });

  const [wasteInterventions, setWasteInterventions] = useState({
    compostingSystems: 120000,
    recyclingPrograms: 80000,
    wasteReduction: 60000,
    bioWasteDigestion: 300000,
    zeroWasteInitiative: 150000
  });

  const [electricityInterventions, setElectricityInterventions] = useState({
    solarPanels: 500000,
    ledLighting: 180000,
    smartMeters: 90000,
    energyStorage: 350000,
    hvacOptimization: 220000,
    windTurbines: 400000
  });

  const [gasInterventions, setGasInterventions] = useState({
    heatPumps: 300000,
    insulation: 250000,
    smartThermostats: 50000,
    boilerUpgrade: 200000,
    renewableHeating: 400000
  });

  const [travelInterventions, setTravelInterventions] = useState({
    electricVehicles: 400000,
    remoteWork: 100000,
    publicTransport: 150000,
    carbonOffset: 80000,
    videoConferencing: 120000
  });

  const calculateTotalAllocated = () => {
    const waterTotal = Object.values(waterInterventions).reduce((sum, val) => sum + (val || 0), 0);
    const wasteTotal = Object.values(wasteInterventions).reduce((sum, val) => sum + (val || 0), 0);
    const electricityTotal = Object.values(electricityInterventions).reduce((sum, val) => sum + (val || 0), 0);
    const gasTotal = Object.values(gasInterventions).reduce((sum, val) => sum + (val || 0), 0);
    const travelTotal = Object.values(travelInterventions).reduce((sum, val) => sum + (val || 0), 0);
    return waterTotal + wasteTotal + electricityTotal + gasTotal + travelTotal;
  };

  const totalAllocated = calculateTotalAllocated();
  const remainingBudget = totalBudget - totalAllocated;
  const budgetUtilization = (totalAllocated / totalBudget) * 100;

  const calculateCarbonReduction = () => {
    const waterReduction = Object.values(waterInterventions).reduce((sum, val) => sum + (val * 0.0003), 0);
    const wasteReduction = Object.values(wasteInterventions).reduce((sum, val) => sum + (val * 0.0005), 0);
    const electricityReduction = Object.values(electricityInterventions).reduce((sum, val) => sum + (val * 0.0008), 0);
    const gasReduction = Object.values(gasInterventions).reduce((sum, val) => sum + (val * 0.001), 0);
    const travelReduction = Object.values(travelInterventions).reduce((sum, val) => sum + (val * 0.0006), 0);
    return waterReduction + wasteReduction + electricityReduction + gasReduction + travelReduction;
  };

  const totalCarbonReduction = calculateCarbonReduction();

  const renderInterventionControls = () => {
    if (selectedCategory === 'water') {
      const categoryTotal = Object.values(waterInterventions).reduce((sum, val) => sum + (val || 0), 0);
      const categoryPercentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;
      
      return (
        <div className="intervention-controls">
          <h3 className="category-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FaWater /> Water Conservation Interventions
            </span>
            <span className="category-budget-percentage">
              <span className="percentage-icon">💰</span>
              {categoryPercentage.toFixed(1)}% of budget
            </span>
          </h3>
          <div className="intervention-sliders">
            {/* Rainwater Harvesting */}
            <div className="intervention-slider-item">
              <label>🌧️ Rainwater Harvesting Systems</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={waterInterventions.rainwaterHarvesting || 0}
                    onChange={(e) => setWaterInterventions(prev => ({...prev, rainwaterHarvesting: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(waterInterventions.rainwaterHarvesting || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Leak Detection */}
            <div className="intervention-slider-item">
              <label>🏗️ Water Leak Detection Systems</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={waterInterventions.leakDetection || 0}
                    onChange={(e) => setWaterInterventions(prev => ({...prev, leakDetection: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(waterInterventions.leakDetection || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Water Recycling */}
            <div className="intervention-slider-item">
              <label>💧 Water Recycling Systems</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={waterInterventions.recycling || 0}
                    onChange={(e) => setWaterInterventions(prev => ({...prev, recycling: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(waterInterventions.recycling || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Low-flow Fixtures */}
            <div className="intervention-slider-item">
              <label>🚿 Low-flow Fixtures</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={waterInterventions.lowFlowFixtures || 0}
                    onChange={(e) => setWaterInterventions(prev => ({...prev, lowFlowFixtures: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(waterInterventions.lowFlowFixtures || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Greywater Treatment */}
            <div className="intervention-slider-item">
              <label>🔄 Greywater Treatment</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={waterInterventions.greywater || 0}
                    onChange={(e) => setWaterInterventions(prev => ({...prev, greywater: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(waterInterventions.greywater || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (selectedCategory === 'waste') {
      const categoryTotal = Object.values(wasteInterventions).reduce((sum, val) => sum + (val || 0), 0);
      const categoryPercentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;
      
      return (
        <div className="intervention-controls">
          <h3 className="category-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FaRecycle /> Waste Management Interventions
            </span>
            <span className="category-budget-percentage">
              <span className="percentage-icon">💰</span>
              {categoryPercentage.toFixed(1)}% of budget
            </span>
          </h3>
          <div className="intervention-sliders">
            {/* Composting Systems */}
            <div className="intervention-slider-item">
              <label>🌿 Composting Systems</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={wasteInterventions.compostingSystems || 0}
                    onChange={(e) => setWasteInterventions(prev => ({...prev, compostingSystems: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(wasteInterventions.compostingSystems || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Recycling Programs */}
            <div className="intervention-slider-item">
              <label>♻️ Recycling Programs</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={wasteInterventions.recyclingPrograms || 0}
                    onChange={(e) => setWasteInterventions(prev => ({...prev, recyclingPrograms: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(wasteInterventions.recyclingPrograms || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Waste Reduction */}
            <div className="intervention-slider-item">
              <label>📉 Waste Reduction</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={wasteInterventions.wasteReduction || 0}
                    onChange={(e) => setWasteInterventions(prev => ({...prev, wasteReduction: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(wasteInterventions.wasteReduction || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Bio-waste Digestion */}
            <div className="intervention-slider-item">
              <label>🦠 Bio-waste Digestion</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={wasteInterventions.bioWasteDigestion || 0}
                    onChange={(e) => setWasteInterventions(prev => ({...prev, bioWasteDigestion: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(wasteInterventions.bioWasteDigestion || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Zero Waste Initiative */}
            <div className="intervention-slider-item">
              <label>🎯 Zero Waste Initiative</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={wasteInterventions.zeroWasteInitiative || 0}
                    onChange={(e) => setWasteInterventions(prev => ({...prev, zeroWasteInitiative: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(wasteInterventions.zeroWasteInitiative || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (selectedCategory === 'electricity') {
      const categoryTotal = Object.values(electricityInterventions).reduce((sum, val) => sum + (val || 0), 0);
      const categoryPercentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;
      
      return (
        <div className="intervention-controls">
          <h3 className="category-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FaBolt /> Electricity Interventions
            </span>
            <span className="category-budget-percentage">
              <span className="percentage-icon">💰</span>
              {categoryPercentage.toFixed(1)}% of budget
            </span>
          </h3>
          <div className="intervention-sliders">
            {/* Solar Panels */}
            <div className="intervention-slider-item">
              <label>☀️ Solar Panel Installation</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={electricityInterventions.solarPanels || 0}
                    onChange={(e) => setElectricityInterventions(prev => ({...prev, solarPanels: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(electricityInterventions.solarPanels || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* LED Lighting */}
            <div className="intervention-slider-item">
              <label>💡 LED Lighting Upgrade</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={electricityInterventions.ledLighting || 0}
                    onChange={(e) => setElectricityInterventions(prev => ({...prev, ledLighting: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(electricityInterventions.ledLighting || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Smart Meters */}
            <div className="intervention-slider-item">
              <label>📊 Smart Meter Installation</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={electricityInterventions.smartMeters || 0}
                    onChange={(e) => setElectricityInterventions(prev => ({...prev, smartMeters: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(electricityInterventions.smartMeters || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Energy Storage */}
            <div className="intervention-slider-item">
              <label>🔋 Energy Storage Systems</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={electricityInterventions.energyStorage || 0}
                    onChange={(e) => setElectricityInterventions(prev => ({...prev, energyStorage: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(electricityInterventions.energyStorage || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* HVAC Optimization */}
            <div className="intervention-slider-item">
              <label>🌡️ HVAC Optimization</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={electricityInterventions.hvacOptimization || 0}
                    onChange={(e) => setElectricityInterventions(prev => ({...prev, hvacOptimization: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(electricityInterventions.hvacOptimization || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Wind Turbines */}
            <div className="intervention-slider-item">
              <label>💨 Wind Turbine Installation</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={electricityInterventions.windTurbines || 0}
                    onChange={(e) => setElectricityInterventions(prev => ({...prev, windTurbines: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(electricityInterventions.windTurbines || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedCategory === 'naturalgas') {
      const categoryTotal = Object.values(gasInterventions).reduce((sum, val) => sum + (val || 0), 0);
      const categoryPercentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;
      
      return (
        <div className="intervention-controls">
          <h3 className="category-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FaFire /> Natural Gas Interventions
            </span>
            <span className="category-budget-percentage">
              <span className="percentage-icon">💰</span>
              {categoryPercentage.toFixed(1)}% of budget
            </span>
          </h3>
          <div className="intervention-sliders">
            {/* Heat Pumps */}
            <div className="intervention-slider-item">
              <label>🔥 Heat Pump Installation</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={gasInterventions.heatPumps || 0}
                    onChange={(e) => setGasInterventions(prev => ({...prev, heatPumps: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(gasInterventions.heatPumps || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Insulation */}
            <div className="intervention-slider-item">
              <label>🏠 Insulation Upgrade</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={gasInterventions.insulation || 0}
                    onChange={(e) => setGasInterventions(prev => ({...prev, insulation: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(gasInterventions.insulation || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Smart Thermostats */}
            <div className="intervention-slider-item">
              <label>🌡️ Smart Thermostats</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={gasInterventions.smartThermostats || 0}
                    onChange={(e) => setGasInterventions(prev => ({...prev, smartThermostats: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(gasInterventions.smartThermostats || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Boiler Upgrade */}
            <div className="intervention-slider-item">
              <label>⚙️ Boiler Upgrade</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={gasInterventions.boilerUpgrade || 0}
                    onChange={(e) => setGasInterventions(prev => ({...prev, boilerUpgrade: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(gasInterventions.boilerUpgrade || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Renewable Heating */}
            <div className="intervention-slider-item">
              <label>♻️ Renewable Heating</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={gasInterventions.renewableHeating || 0}
                    onChange={(e) => setGasInterventions(prev => ({...prev, renewableHeating: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(gasInterventions.renewableHeating || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedCategory === 'business-travel') {
      const categoryTotal = Object.values(travelInterventions).reduce((sum, val) => sum + (val || 0), 0);
      const categoryPercentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;
      
      return (
        <div className="intervention-controls">
          <h3 className="category-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FaLeaf /> Business Travel Interventions
            </span>
            <span className="category-budget-percentage">
              <span className="percentage-icon">💰</span>
              {categoryPercentage.toFixed(1)}% of budget
            </span>
          </h3>
          <div className="intervention-sliders">
            {/* Electric Vehicles */}
            <div className="intervention-slider-item">
              <label>🚗 Electric Vehicle Fleet</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={travelInterventions.electricVehicles || 0}
                    onChange={(e) => setTravelInterventions(prev => ({...prev, electricVehicles: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(travelInterventions.electricVehicles || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Remote Work */}
            <div className="intervention-slider-item">
              <label>🏠 Remote Work Infrastructure</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={travelInterventions.remoteWork || 0}
                    onChange={(e) => setTravelInterventions(prev => ({...prev, remoteWork: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(travelInterventions.remoteWork || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Public Transport */}
            <div className="intervention-slider-item">
              <label>🚌 Public Transport Subsidies</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={travelInterventions.publicTransport || 0}
                    onChange={(e) => setTravelInterventions(prev => ({...prev, publicTransport: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(travelInterventions.publicTransport || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Carbon Offset */}
            <div className="intervention-slider-item">
              <label>🌍 Carbon Offset Programs</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={travelInterventions.carbonOffset || 0}
                    onChange={(e) => setTravelInterventions(prev => ({...prev, carbonOffset: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(travelInterventions.carbonOffset || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>

            {/* Video Conferencing */}
            <div className="intervention-slider-item">
              <label>📹 Video Conferencing Systems</label>
              <div className="slider-container">
                <div className="slider-row">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={travelInterventions.videoConferencing || 0}
                    onChange={(e) => setTravelInterventions(prev => ({...prev, videoConferencing: Number(e.target.value)}))}
                    className="intervention-budget-slider"
                  />
                  <span className="slider-value">€{(travelInterventions.videoConferencing || 0).toLocaleString()}</span>
                </div>
                <div className="slider-labels">
                  <span className="min-label">No Investment</span>
                  <span className="max-label">Maximum Investment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="financial-dashboard">
      <h1 className="financial-dashboard-title">Financial Planning Dashboard</h1>
      
      {/* Unified Controls Section */}
      <div className="unified-controls">
        {/* Budget Configuration */}
        <div className="budget-control">
          <h2 className="section-title">
            <FaPiggyBank /> Budget Configuration
          </h2>
          <div className="budget-inputs">
            <div className="budget-input-group">
              <label><FaEuroSign /> Total Budget (€)</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                min="1000000"
                max="50000000"
                step="100000"
                className="budget-input"
              />
            </div>
            <div className="budget-input-group">
              <label><FaPercent /> Annual Growth Rate (%)</label>
              <input
                type="number"
                value={annualGrowthRate}
                onChange={(e) => setAnnualGrowthRate(Number(e.target.value))}
                min="0"
                max="15"
                step="0.1"
                className="growth-input"
              />
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="category-selection">
          <h2 className="section-title">
            <FaCalculator /> Intervention Categories
          </h2>
          <div className="category-buttons">
            <button 
              className={`category-btn ${selectedCategory === 'water' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('water')}
            >
              <FaWater /> Water
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'waste' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('waste')}
            >
              <FaRecycle /> Waste
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'electricity' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('electricity')}
            >
              <FaBolt /> Electricity
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'naturalgas' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('naturalgas')}
            >
              <FaFire /> Natural Gas
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'business-travel' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('business-travel')}
            >
              <FaLeaf /> Business Travel
            </button>
          </div>
        </div>

        {/* Dynamic Intervention Controls */}
        {renderInterventionControls()}
      </div>
      
      {/* Progress Bars Component */}
      <div className="progress-bars-container">
        <h3><FaChartLine /> Performance Metrics</h3>
        
        {/* Budget Usage Progress */}
        <div className="progress-bar-item">
          <div className="progress-bar-header">
            <span className="progress-bar-label">
              <FaMoneyBillWave /> Budget Usage
            </span>
            <span className="progress-bar-values">
              <span className="progress-bar-current">€{totalAllocated.toLocaleString()}</span>
              {' / €'}{totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="progress-bar-track">
            <div 
              className={`progress-bar-fill budget ${budgetUtilization > 100 ? 'over-budget' : ''}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            >
              {budgetUtilization.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Carbon Reduction Progress */}
        <div className="progress-bar-item">
          <div className="progress-bar-header">
            <span className="progress-bar-label">
              <FaSeedling /> Carbon Reduction (Annual)
            </span>
            <span className="progress-bar-values">
              <span className="progress-bar-current">{totalCarbonReduction.toFixed(0)} tCO₂</span>
              {' / 2,000 tCO₂ target'}
            </span>
          </div>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill carbon"
              style={{ width: `${Math.min((totalCarbonReduction / 2000) * 100, 100)}%` }}
            >
              {((totalCarbonReduction / 2000) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
      
      <BAN 
        className="ban-total-budget" 
        value={`€${totalBudget.toLocaleString()}`} 
        icon={<FaEuroSign size={32} color="#00b894" />} 
        label="Total Budget" 
        color="#00b894"
      />
      
      <BAN 
        className="ban-budget-allocated" 
        value={`€${totalAllocated.toLocaleString()}`} 
        icon={<FaPiggyBank size={32} color="#00b894" />} 
        label="Budget Allocated" 
        color="#00b894"
      />
      
      <BAN 
        className="ban-remaining-budget" 
        value={`€${remainingBudget.toLocaleString()}`} 
        icon={<FaCalculator size={32} color="#00b894" />} 
        label="Remaining Budget" 
        color="#00b894"
      />
      
      <BAN 
        className="ban-budget-utilization" 
        value={`${budgetUtilization.toFixed(1)}%`} 
        icon={<FaPercent size={32} color="#00b894" />} 
        label="Budget Utilization" 
        color="#00b894"
      />
      
      <BAN 
        className="ban-carbon-reduction" 
        value={`${totalCarbonReduction.toFixed(0)} tCO₂`} 
        icon={<FaLeaf size={32} color="#00b894" />} 
        label="Carbon Reduction (yearly)" 
        color="#00b894"
      />

      {/* Budget Distribution Chart */}
      <div className="budget-distribution-chart">
        <h3><FaChartLine /> Budget by Category</h3>
        <div className="chart-bars">
          <div className="chart-bar-item">
            <div className="chart-bar-header">
              <span className="chart-bar-label">
                <FaWater style={{ fontSize: '0.65rem', color: '#3498db' }} /> Water
              </span>
              <span className="chart-bar-value">
                {totalBudget > 0 ? ((Object.values(waterInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="chart-bar-track">
              <div 
                className="chart-bar-fill water"
                style={{ width: `${totalBudget > 0 ? ((Object.values(waterInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100) : 0}%` }}
              >
              </div>
            </div>
          </div>

          <div className="chart-bar-item">
            <div className="chart-bar-header">
              <span className="chart-bar-label">
                <FaRecycle style={{ fontSize: '0.65rem', color: '#27ae60' }} /> Waste
              </span>
              <span className="chart-bar-value">
                {totalBudget > 0 ? ((Object.values(wasteInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="chart-bar-track">
              <div 
                className="chart-bar-fill waste"
                style={{ width: `${totalBudget > 0 ? ((Object.values(wasteInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100) : 0}%` }}
              >
              </div>
            </div>
          </div>

          <div className="chart-bar-item">
            <div className="chart-bar-header">
              <span className="chart-bar-label">
                <FaBolt style={{ fontSize: '0.65rem', color: '#f39c12' }} /> Electricity
              </span>
              <span className="chart-bar-value">
                {totalBudget > 0 ? ((Object.values(electricityInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="chart-bar-track">
              <div 
                className="chart-bar-fill electricity"
                style={{ width: `${totalBudget > 0 ? ((Object.values(electricityInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100) : 0}%` }}
              >
              </div>
            </div>
          </div>

          <div className="chart-bar-item">
            <div className="chart-bar-header">
              <span className="chart-bar-label">
                <FaFire style={{ fontSize: '0.65rem', color: '#e74c3c' }} /> Natural Gas
              </span>
              <span className="chart-bar-value">
                {totalBudget > 0 ? ((Object.values(gasInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="chart-bar-track">
              <div 
                className="chart-bar-fill gas"
                style={{ width: `${totalBudget > 0 ? ((Object.values(gasInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100) : 0}%` }}
              >
              </div>
            </div>
          </div>

          <div className="chart-bar-item">
            <div className="chart-bar-header">
              <span className="chart-bar-label">
                <FaLeaf style={{ fontSize: '0.65rem', color: '#00b894' }} /> Business Travel
              </span>
              <span className="chart-bar-value">
                {totalBudget > 0 ? ((Object.values(travelInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="chart-bar-track">
              <div 
                className="chart-bar-fill travel"
                style={{ width: `${totalBudget > 0 ? ((Object.values(travelInterventions).reduce((sum, val) => sum + (val || 0), 0) / totalBudget) * 100) : 0}%` }}
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialDashboard;
