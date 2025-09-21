import { useState, useMemo } from 'react';
import './App.css';
import PopulationSlider from './PopulationSlider';
import PopulationChart from './PopulationChart';
import CarbonProjects from './carbonProjects';
import BudgetGapAnalysis from './BudgetGapAnalysis';
import Sidebar from './Sidebar';
import BAN from './BAN';
import { FaLeaf, FaMoneyBillWave, FaSmog, FaBullseye } from 'react-icons/fa';


function App() {
  // Current population state
  const [population, setPopulation] = useState(10000);
  // Growth rate in percent per year
  const [growthRate, setGrowthRate] = useState(2.0);
  // Number of years to project
  const years = 20;

  // Calculate population data for chart
  const populationData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    let data = [];
    // Years before current year: constant population
    for (let y = startYear; y < currentYear; y++) {
      data.push({ year: y, population: population });
    }
    // Years from current year onwards: apply growth
    let current = population;
    for (let i = 0; i <= years; i++) {
      data.push({ year: currentYear + i, population: Math.round(current) });
      current = current * (1 + growthRate / 100);
    }
    return data;
  }, [population, growthRate]);

  // Carbon Emission BAN: additional annual carbon reduction needed (tons CO2)
  const carbonBan = Math.round((growthRate / 100) * population * 0.5); // 0.5 ton CO2 per person per %
  // Financial Impact BAN: additional financial impact (USD)
  const financialBan = Math.round((growthRate / 100) * population * 1200); // $1200 per person per %
  // Carbon Emission Per Student BAN: total carbon emissions per student (kg CO2)
  const carbonPerStudent = (15000 + 12000 + 8500 + 6000 + 3500) * (1 + growthRate / 100) / 1000; // Total emissions in kg per student
  
  // Annual Carbon Reduction to Zero by 2050 BAN: linear reduction needed per year
  const currentYear = new Date().getFullYear();
  const targetYear = 2050;
  const yearsToTarget = targetYear - currentYear;
  // Current total annual emissions (tons CO2) - sum of all carbon projects
  const currentTotalEmissions = 15000 + 12000 + 8500 + 6000 + 3500; // 45000 tons
  // With population growth, total emissions will be higher
  const adjustedTotalEmissions = currentTotalEmissions * (1 + growthRate / 100);
  // Annual reduction needed (linear method)
  const annualReductionNeeded = Math.round(adjustedTotalEmissions / yearsToTarget);

  return (
    <div className="App">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="main-content">
        <h1 className="grid-title">Student Population Dashboard</h1>
        
        <div className="grid-slider">
          <PopulationSlider growthRate={growthRate} setGrowthRate={setGrowthRate} />
        </div>
        
        <BAN
          className="ban-additional-carbon-reduction"
          value={carbonBan.toLocaleString()}
          icon={<FaLeaf size={32} color="#8884d8" />}
          label="Annual Carbon Reduction"
          color="#8884d8"
          percent={growthRate}
        />
        <BAN
          className="ban-financial-impact"
          value={financialBan.toLocaleString()}
          icon={<FaMoneyBillWave size={32} color="#8884d8" />}
          label="Financial Impact"
          color="#8884d8"
          percent={growthRate}
        />
        <BAN
          className="ban-co2-per-student"
          value={Math.round(carbonPerStudent).toLocaleString()}
          icon={<FaSmog size={32} color="#8884d8" />}
          label="CO2 kg per Student"
          color="#8884d8"
          percent={growthRate}
        />
        <BAN
          className="ban-annual-reduction"
          value={annualReductionNeeded.toLocaleString()}
          icon={<FaBullseye size={32} color="#e74c3c" />}
          label="Annual Reduction to Zero by 2050"
          color="#e74c3c"
          percent={0}
        />
        
        <div className="grid-carbon-chart">
          <CarbonProjects growthRate={growthRate} />
        </div>
        
        <div className="grid-population-chart">
          <PopulationChart data={populationData} />
        </div>
        
        <div className="grid-budget-gap">
          <BudgetGapAnalysis growthRate={growthRate} population={population} />
        </div>
      </div>
    </div>
  );
}

export default App;
