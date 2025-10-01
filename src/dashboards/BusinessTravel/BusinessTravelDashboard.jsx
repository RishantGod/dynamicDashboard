import React, { useState } from 'react';
import './BusinessTravelDashboard.css';
import BAN from '../../components/BAN';
import BusinessTravelMap from './components/BusinessTravelMap';
import BusinessTravelDonut from './components/BusinessTravelDonut';
import PolicyComplianceHeatmap from './components/PolicyComplianceHeatmap';
import { FaPlane, FaEuroSign, FaExchangeAlt, FaLeaf, FaCheckCircle, FaRoute, FaHotel, FaTrain } from 'react-icons/fa';

function BusinessTravelDashboard() {
  // Business travel management variables
  const [travelFlexibilityIndex, setTravelFlexibilityIndex] = useState(50); // % (0-100%)
  const [policyImplementation, setPolicyImplementation] = useState(30); // % (0-100%)

  // Base business travel data (annual figures)
  const baseAirTravelEmissions = 2450; // tCO2e per year from air travel
  const baseGroundTravelEmissions = 680; // tCO2e per year from ground travel
  const baseVirtualMeetingCost = 85000; // euros per year for virtual meeting infrastructure
  const baseAirTravelCost = 1250000; // euros per year for air travel
  const baseGroundTravelCost = 320000; // euros per year for ground/rail travel
  const baseTotalFlights = 4200; // number of flights per year
  const baseTotalDistance = 8500000; // km per year

  // Calculate flexibility effects
  const flexibilityMultiplier = travelFlexibilityIndex / 100;
  const policyMultiplier = policyImplementation / 100;
  
  // Travel reduction calculations based on flexibility and policy
  const maxVirtualizationRate = 0.4; // Maximum 40% can be virtualized
  const maxAirReductionRate = 0.6; // Maximum 60% air travel reduction
  const maxGroundShiftRate = 0.3; // Maximum 30% can shift from air to ground
  
  // Actual reductions based on inputs
  const virtualizationRate = Math.min(flexibilityMultiplier * policyMultiplier * maxVirtualizationRate, maxVirtualizationRate);
  const airReductionRate = Math.min(flexibilityMultiplier * policyMultiplier * maxAirReductionRate, maxAirReductionRate);
  const groundShiftRate = Math.min(flexibilityMultiplier * policyMultiplier * maxGroundShiftRate, maxGroundShiftRate);

  // Calculate adjusted travel metrics
  const virtualizedTravelPercent = Math.round(virtualizationRate * 100);
  const airTravelReductionPercent = Math.round(airReductionRate * 100);
  
  // Emissions calculations
  const remainingAirTravel = 1 - airReductionRate - virtualizationRate;
  const remainingGroundTravel = 1 - virtualizationRate + groundShiftRate;
  const totalEmissions = Math.round(
    (baseAirTravelEmissions * remainingAirTravel) + 
    (baseGroundTravelEmissions * remainingGroundTravel)
  );

  // Cost calculations
  const virtualMeetingCosts = baseVirtualMeetingCost * (1 + virtualizationRate * 2); // Higher virtual infrastructure
  const airTravelCosts = baseAirTravelCost * remainingAirTravel;
  const groundTravelCosts = baseGroundTravelCost * remainingGroundTravel;
  const totalCost = Math.round(virtualMeetingCosts + airTravelCosts + groundTravelCosts);

  // Policy compliance calculation
  const policyCompliance = Math.round(Math.min(
    (virtualizationRate * 40 + airReductionRate * 35 + groundShiftRate * 25) * 100, 
    100
  ));

  // Distance calculations
  const totalDistance = Math.round(baseTotalDistance * (remainingAirTravel * 0.7 + remainingGroundTravel * 0.3));

  // Hotel nights calculation (based on travel frequency and average trip length)
  const baseHotelNights = 1800; // nights per year
  const hotelNights = Math.round(baseHotelNights * (remainingAirTravel * 0.8 + remainingGroundTravel * 0.5));

  // Lower emission travel percentage (train/car vs air)
  const lowerEmissionTravelPercent = Math.round((groundShiftRate + (1 - remainingAirTravel - virtualizationRate)) * 100);

  // Travel data for map visualization
  const travelData = {
    flexibilityIndex: travelFlexibilityIndex,
    policyImplementation: policyImplementation,
    totalFlights: Math.round(baseTotalFlights * remainingAirTravel),
    totalEmissions: totalEmissions,
    destinations: [
      // Europe
      { country: 'Germany', flights: Math.round(580 * remainingAirTravel), emissions: Math.round(145 * remainingAirTravel), coordinates: [51.1657, 10.4515] },
      { country: 'France', flights: Math.round(520 * remainingAirTravel), emissions: Math.round(125 * remainingAirTravel), coordinates: [46.6034, 1.8883] },
      { country: 'Netherlands', flights: Math.round(380 * remainingAirTravel), emissions: Math.round(85 * remainingAirTravel), coordinates: [52.1326, 5.2913] },
      { country: 'Spain', flights: Math.round(290 * remainingAirTravel), emissions: Math.round(98 * remainingAirTravel), coordinates: [40.4637, -3.7492] },
      { country: 'Italy', flights: Math.round(245 * remainingAirTravel), emissions: Math.round(88 * remainingAirTravel), coordinates: [41.8719, 12.5674] },
      
      // North America  
      { country: 'United States', flights: Math.round(425 * remainingAirTravel), emissions: Math.round(385 * remainingAirTravel), coordinates: [37.0902, -95.7129] },
      { country: 'Canada', flights: Math.round(180 * remainingAirTravel), emissions: Math.round(165 * remainingAirTravel), coordinates: [56.1304, -106.3468] },
      
      // Asia
      { country: 'China', flights: Math.round(320 * remainingAirTravel), emissions: Math.round(445 * remainingAirTravel), coordinates: [35.8617, 104.1954] },
      { country: 'Japan', flights: Math.round(285 * remainingAirTravel), emissions: Math.round(365 * remainingAirTravel), coordinates: [36.2048, 138.2529] },
      { country: 'Singapore', flights: Math.round(195 * remainingAirTravel), emissions: Math.round(285 * remainingAirTravel), coordinates: [1.3521, 103.8198] },
      { country: 'India', flights: Math.round(240 * remainingAirTravel), emissions: Math.round(325 * remainingAirTravel), coordinates: [20.5937, 78.9629] },
      
      // Others
      { country: 'Australia', flights: Math.round(145 * remainingAirTravel), emissions: Math.round(315 * remainingAirTravel), coordinates: [-25.2744, 133.7751] },
      { country: 'Brazil', flights: Math.round(125 * remainingAirTravel), emissions: Math.round(285 * remainingAirTravel), coordinates: [-14.2350, -51.9253] },
      { country: 'United Kingdom', flights: Math.round(450 * remainingAirTravel), emissions: Math.round(95 * remainingAirTravel), coordinates: [55.3781, -3.4360] },
      { country: 'South Korea', flights: Math.round(165 * remainingAirTravel), emissions: Math.round(225 * remainingAirTravel), coordinates: [35.9078, 127.7669] }
    ]
  };

  return (
    <div className="business-travel-dashboard">
      <h1 className="business-travel-dashboard-title">Business Travel Management Dashboard</h1>
      
      <div className="business-travel-controls">
        <div className="control-group">
          <label>Travel Flexibility Index (%)</label>
          <div className="slider-container">
            <div className="slider-value">
              <span className="slider-value-text">{travelFlexibilityIndex}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={travelFlexibilityIndex}
              onChange={(e) => setTravelFlexibilityIndex(Number(e.target.value))}
              className="business-travel-slider"
            />
            <div className="slider-labels">
              <span className="slider-label-min">0%</span>
              <span className="slider-label-max">100%</span>
            </div>
          </div>
        </div>
        
        <div className="control-group">
          <label>Policy Implementation (%)</label>
          <div className="slider-container">
            <div className="slider-value policy-slider-value">
              <span className="policy-slider-value-text">{policyImplementation}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={policyImplementation}
              onChange={(e) => setPolicyImplementation(Number(e.target.value))}
              className="business-travel-slider"
            />
            <div className="slider-labels">
              <span className="slider-label-min">0%</span>
              <span className="slider-label-max">100%</span>
            </div>
          </div>
        </div>
      </div>
      
      <BAN
        className="ban1"
        value={totalEmissions.toLocaleString()}
        icon={<FaLeaf size={32} color="#e74c3c" />}
        label="Total Emissions (tCO₂e)"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban2"
        value={`${virtualizedTravelPercent}%`}
        icon={<FaExchangeAlt size={32} color="#e74c3c" />}
        label="% of Travel Virtualised or Replaced"
        color="#e74c3c"
        percent={virtualizedTravelPercent}
      />
      
      <BAN
        className="ban3"
        value={`${airTravelReductionPercent}%`}
        icon={<FaPlane size={32} color="#e74c3c" />}
        label="Air Travel Reduction %"
        color="#e74c3c"
        percent={airTravelReductionPercent}
      />
      
      <BAN
        className="ban4"
        value={hotelNights.toLocaleString()}
        icon={<FaHotel size={32} color="#e74c3c" />}
        label="Number of Hotel Nights"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban5"
        value={totalDistance.toLocaleString()}
        icon={<FaRoute size={32} color="#e74c3c" />}
        label="Total Distance Traveled (km)"
        color="#e74c3c"
        percent={0}
      />
      
      <BAN
        className="ban6"
        value={`${lowerEmissionTravelPercent}%`}
        icon={<FaTrain size={32} color="#e74c3c" />}
        label="% Lower Emission Travel"
        color="#e74c3c"
        percent={lowerEmissionTravelPercent}
      />
      
      <div className="business-travel-map-container">
        <BusinessTravelMap 
          travelData={travelData}
        />
      </div>
      
      <div className="business-travel-donut-container">
        <BusinessTravelDonut 
          travelData={travelData}
        />
      </div>
    </div>
  );
}

export default BusinessTravelDashboard;