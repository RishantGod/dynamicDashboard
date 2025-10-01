import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

function BusinessTravelMap({ travelData }) {
  const svgRef = useRef();
  const [viewMode, setViewMode] = useState('emissions'); // 'emissions' or 'flights'
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [worldData, setWorldData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoutes, setShowRoutes] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Country name mapping for data consistency
  const countryNameMap = {
    'United States': 'United States of America',
    'United Kingdom': 'United Kingdom',
    'South Korea': 'South Korea'
  };

  useEffect(() => {
    // Load world map data from multiple sources with fallbacks
    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        
        // Try multiple GeoJSON sources
        const sources = [
          'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
          'https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json',
          'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
        ];

        let countries = null;
        for (const source of sources) {
          try {
            console.log(`Trying to load world data from: ${source}`);
            const response = await fetch(source);
            if (response.ok) {
              countries = await response.json();
              console.log('Successfully loaded world data:', countries);
              break;
            }
          } catch (sourceError) {
            console.warn(`Failed to load from ${source}:`, sourceError);
            continue;
          }
        }

        if (countries && countries.features && countries.features.length > 0) {
          // Filter out Antarctica and other uninhabited regions
          const filteredCountries = {
            ...countries,
            features: countries.features.filter(feature => {
              const name = feature.properties.name || feature.properties.NAME || feature.properties.NAME_EN || '';
              return !name.toLowerCase().includes('antarctica') && 
                     !name.toLowerCase().includes('antarctic');
            })
          };
          console.log(`Filtered world data: ${filteredCountries.features.length} countries (removed Antarctica)`);
          setWorldData(filteredCountries);
        } else {
          throw new Error('No valid world data found from any source');
        }
      } catch (error) {
        console.error('Error loading world map data:', error);
        // Fallback: create a comprehensive world representation
        createFallbackWorldData();
      } finally {
        setIsLoading(false);
      }
    };

    loadWorldData();
  }, []);

  const createFallbackWorldData = () => {
    // Create comprehensive world map data with proper GeoJSON structure
    const fallbackCountries = [
      { 
        name: 'United States of America', 
        coordinates: [[-125, 48], [-125, 25], [-66, 25], [-66, 48], [-125, 48]]
      },
      { 
        name: 'Canada', 
        coordinates: [[-140, 70], [-140, 42], [-52, 42], [-52, 70], [-140, 70]]
      },
      { 
        name: 'United Kingdom', 
        coordinates: [[-8, 60], [-8, 49], [2, 49], [2, 60], [-8, 60]]
      },
      { 
        name: 'Germany', 
        coordinates: [[5, 55], [5, 47], [15, 47], [15, 55], [5, 55]]
      },
      { 
        name: 'France', 
        coordinates: [[-5, 51], [-5, 42], [8, 42], [8, 51], [-5, 51]]
      },
      { 
        name: 'Netherlands', 
        coordinates: [[3, 54], [3, 50], [8, 50], [8, 54], [3, 54]]
      },
      { 
        name: 'Spain', 
        coordinates: [[-10, 44], [-10, 35], [5, 35], [5, 44], [-10, 44]]
      },
      { 
        name: 'Italy', 
        coordinates: [[6, 47], [6, 36], [19, 36], [19, 47], [6, 47]]
      },
      { 
        name: 'China', 
        coordinates: [[73, 54], [73, 18], [135, 18], [135, 54], [73, 54]]
      },
      { 
        name: 'Japan', 
        coordinates: [[129, 46], [129, 30], [146, 30], [146, 46], [129, 46]]
      },
      { 
        name: 'Singapore', 
        coordinates: [[103.6, 1.5], [103.6, 1.1], [104.1, 1.1], [104.1, 1.5], [103.6, 1.5]]
      },
      { 
        name: 'India', 
        coordinates: [[68, 37], [68, 6], [97, 6], [97, 37], [68, 37]]
      },
      { 
        name: 'Australia', 
        coordinates: [[113, -10], [113, -44], [154, -44], [154, -10], [113, -10]]
      },
      { 
        name: 'Brazil', 
        coordinates: [[-74, 5], [-74, -34], [-34, -34], [-34, 5], [-74, 5]]
      },
      { 
        name: 'South Korea', 
        coordinates: [[124, 39], [124, 33], [132, 33], [132, 39], [124, 39]]
      }
    ];

    const features = fallbackCountries.map(country => ({
      type: 'Feature',
      properties: { 
        NAME: country.name,
        name: country.name,
        NAME_EN: country.name 
      },
      geometry: {
        type: 'Polygon',
        coordinates: [country.coordinates]
      }
    }));

    const worldData = { type: 'FeatureCollection', features };
    console.log('Created fallback world data (no Antarctica):', worldData);
    setWorldData(worldData);
  };

  useEffect(() => {
    if (!travelData || !worldData || isLoading || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions
    const container = svgRef.current.parentElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 120, right: 40, bottom: 60, left: 40 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Set up SVG with premium styling
    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    // Create advanced gradient definitions
    const defs = svg.append('defs');
    
    // Simple light blue ocean background - no gradient

    // Country glow effect
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Drop shadow effect
    const shadowFilter = defs.append('filter')
      .attr('id', 'dropShadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    shadowFilter.append('feDropShadow')
      .attr('dx', '2')
      .attr('dy', '3')
      .attr('stdDeviation', '1')
      .attr('flood-opacity', '0.2');

    // Texture pattern
    const texturePattern = defs.append('pattern')
      .attr('id', 'texturePattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', '4')
      .attr('height', '4');
    texturePattern.append('rect')
      .attr('width', '4')
      .attr('height', '4')
      .attr('fill', 'transparent');
    texturePattern.append('circle')
      .attr('cx', '2')
      .attr('cy', '2')
      .attr('r', '0.5')
      .attr('fill', '#ffffff')
      .attr('opacity', '0.02');

    // Add clean light blue ocean background
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#e3f2fd');

    // Enhanced texture pattern for depth
    const enhancedTexture = defs.append('pattern')
      .attr('id', 'enhancedTexture')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 4)
      .attr('height', 4)
      .attr('patternUnits', 'userSpaceOnUse');
    
    enhancedTexture.append('rect')
      .attr('width', 4)
      .attr('height', 4)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.02);
    
    enhancedTexture.append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 0.5)
      .attr('fill', '#000000')
      .attr('opacity', 0.03);

    // Apply enhanced texture
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#enhancedTexture)');

    const g = svg.append('g')
       .attr('transform', `translate(${margin.left}, ${margin.top})`);



    // Create premium floating control panel
    const controlPanel = svg.append('g')
      .attr('class', 'control-panel');

    // Control panel background
    controlPanel.append('rect')
      .attr('x', -10)
      .attr('y', -5)
      .attr('width', 320)
      .attr('height', 80)
      .attr('rx', 12)
      .attr('fill', '#ffffff')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1);

    // Modern separated tab buttons
    const tabGroup = controlPanel.append('g')
      .attr('transform', 'translate(10, 10)');

    // View mode label
    tabGroup.append('text')
      .attr('x', 0)
      .attr('y', 8)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#2c3e50')
      .text('View Mode:');

    // CO₂ Emissions Tab
    const emissionsTab = tabGroup.append('g')
      .attr('class', 'view-tab')
      .style('cursor', 'pointer')
      .on('click', () => setViewMode('emissions'));

    emissionsTab.append('rect')
      .attr('x', 75)
      .attr('y', -5)
      .attr('width', 55)
      .attr('height', 22)
      .attr('rx', 6)
      .attr('fill', viewMode === 'emissions' ? '#e74c3c' : '#ffffff')
      .attr('stroke', viewMode === 'emissions' ? '#c0392b' : '#d0d0d0')
      .attr('stroke-width', 1)
      .style('transition', 'all 0.3s ease');

    emissionsTab.append('text')
      .attr('x', 102)
      .attr('y', 9)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', viewMode === 'emissions' ? 'white' : '#2c3e50')
      .text('CO₂');

    // Flights Tab (separated with gap)
    const flightsTab = tabGroup.append('g')
      .attr('class', 'view-tab')
      .style('cursor', 'pointer')
      .on('click', () => setViewMode('flights'));

    flightsTab.append('rect')
      .attr('x', 138) // 8px gap between tabs
      .attr('y', -5)
      .attr('width', 55)
      .attr('height', 22)
      .attr('rx', 6)
      .attr('fill', viewMode === 'flights' ? '#f39c12' : '#ffffff')
      .attr('stroke', viewMode === 'flights' ? '#e67e22' : '#d0d0d0')
      .attr('stroke-width', 1)
      .style('transition', 'all 0.3s ease');

    flightsTab.append('text')
      .attr('x', 165)
      .attr('y', 9)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', viewMode === 'flights' ? 'white' : '#2c3e50')
      .text('Flights');

    // Additional controls with better spacing
    const additionalControls = controlPanel.append('g')
      .attr('transform', 'translate(10, 42)');

    // Modern checkbox for routes toggle
    const routesToggle = additionalControls.append('g')
      .attr('class', 'checkbox-toggle')
      .style('cursor', 'pointer')
      .on('click', () => setShowRoutes(!showRoutes));

    // Checkbox background
    routesToggle.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', showRoutes ? '#27ae60' : '#ffffff')
      .attr('stroke', showRoutes ? '#229954' : '#d0d0d0')
      .attr('stroke-width', 1.5)
      .style('transition', 'all 0.3s ease');

    // Checkmark when active
    if (showRoutes) {
      routesToggle.append('path')
        .attr('d', 'M 4 8 L 7 11 L 12 5')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('fill', 'none');
    }

    // Label with better spacing
    additionalControls.append('text')
      .attr('x', 24)
      .attr('y', 12)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#2c3e50')
      .text('Show Routes');

    // Enhanced top destinations section
    const topDestinations = additionalControls.append('g')
      .attr('transform', 'translate(140, -2)');

    topDestinations.append('text')
      .attr('x', 0)
      .attr('y', 8)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#2c3e50')
      .text('Top Destinations:');

    // Show top 3 countries with enhanced styling
    const topCountries = [...travelData.destinations]
      .sort((a, b) => viewMode === 'emissions' ? b.emissions - a.emissions : b.flights - a.flights)
      .slice(0, 3);

    topCountries.forEach((country, i) => {
      const indicator = topDestinations.append('g')
        .attr('class', 'destination-indicator')
        .attr('transform', `translate(${i * 42}, 14)`)
        .style('cursor', 'pointer');
      
      // Color theme that matches the current view mode
      const themeColors = viewMode === 'emissions' ? [
        { bg: '#e74c3c', border: '#c0392b', text: '#2c3e50' }, // Primary red
        { bg: '#ec7063', border: '#e74c3c', text: '#2c3e50' }, // Light red
        { bg: '#f1948a', border: '#ec7063', text: '#2c3e50' }  // Lighter red
      ] : [
        { bg: '#f39c12', border: '#e67e22', text: '#2c3e50' }, // Primary orange
        { bg: '#f7dc6f', border: '#f39c12', text: '#2c3e50' }, // Light orange
        { bg: '#fdeaa7', border: '#f7dc6f', text: '#2c3e50' }  // Lighter orange
      ];
      
      const colorScheme = themeColors[i];
      
      // Enhanced badge background with business travel theme colors
      indicator.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 38)
        .attr('height', 16)
        .attr('rx', 8)
        .attr('fill', colorScheme.bg)
        .attr('stroke', colorScheme.border)
        .attr('stroke-width', 1)
        .style('transition', 'all 0.3s ease');

      // Rank number with professional styling
      indicator.append('circle')
        .attr('cx', 8)
        .attr('cy', 8)
        .attr('r', 6)
        .attr('fill', 'rgba(255, 255, 255, 0.95)')
        .attr('stroke', 'rgba(255, 255, 255, 0.3)')
        .attr('stroke-width', 1);

      indicator.append('text')
        .attr('x', 8)
        .attr('y', 11)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('fill', colorScheme.text)
        .text(i + 1);

      // Country code
      indicator.append('text')
        .attr('x', 23)
        .attr('y', 11)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', 'white')
        .attr('font-weight', '700')
        .text(country.country.slice(0, 3).toUpperCase());

      // Add hover tooltip functionality
      indicator
        .on('mouseenter', function(event) {
          d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('transform', 'scale(1.05)')
            .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

          const value = viewMode === 'emissions' ? country.emissions : country.flights;
          const unit = viewMode === 'emissions' ? 'tons CO₂' : 'flights';
          const efficiency = (country.emissions / country.flights).toFixed(1);

          setTooltip({
            country: country.country,
            flights: country.flights,
            emissions: country.emissions,
            viewMode: viewMode,
            efficiency: efficiency < 2 ? 'Excellent' : efficiency < 4 ? 'Good' : efficiency < 6 ? 'Average' : 'Poor',
            efficiencyScore: parseFloat(efficiency),
            efficiencyColor: efficiency < 2 ? '#27ae60' : efficiency < 4 ? '#f39c12' : efficiency < 6 ? '#e67e22' : '#e74c3c',
            rank: i + 1,
            isTopDestination: true,
            topDestinationColor: themeColors[i].bg
          });
          setMousePos({ x: event.clientX, y: event.clientY });
        })
        .on('mousemove', function(event) {
          setMousePos({ x: event.clientX, y: event.clientY });
        })
        .on('mouseleave', function() {
          d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('transform', 'scale(1)')
            .attr('filter', null);

          setTooltip(null);
        })
        .on('click', function() {
          setSelectedCountry(selectedCountry === country.country ? null : country.country);
        });
    });



    // Set up map projection - balanced to show both north and south without Antarctica
    const projection = d3.geoEquirectangular()
      .scale(width / 6.2)
      .translate([width / 2, height / 2.1])
      .center([0, 5])
      .clipExtent([[-20, -20], [width + 20, height + 20]]);

    const path = d3.geoPath().projection(projection);

    // Create data map for quick lookup with multiple name variations
    const travelDataMap = new Map();
    travelData.destinations.forEach(d => {
      const mappedName = countryNameMap[d.country] || d.country;
      travelDataMap.set(mappedName, d);
      travelDataMap.set(d.country, d); // Also store original name
      
      // Add additional name variations for better matching
      if (d.country === 'United States') {
        travelDataMap.set('United States of America', d);
        travelDataMap.set('USA', d);
      }
      if (d.country === 'United Kingdom') {
        travelDataMap.set('UK', d);
        travelDataMap.set('Great Britain', d);
      }
    });

    console.log('Travel data map:', travelDataMap);
    console.log('World data features:', worldData.features.slice(0, 3));

    // Get data ranges for color scaling
    const maxFlights = Math.max(...travelData.destinations.map(d => d.flights));
    const maxEmissions = Math.max(...travelData.destinations.map(d => d.emissions));

    // Create color scales
    const emissionsColorScale = d3.scaleSequential()
      .interpolator(d3.interpolateReds)
      .domain([0, maxEmissions]);

    const flightsColorScale = d3.scaleSequential()
      .interpolator(d3.interpolateOranges)
      .domain([0, maxFlights]);



    // Draw countries with enhanced search and interaction features
    const countryPaths = g.selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        // Try multiple property names for country identification
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);
        
        let countryData = null;
        let countryName = null;
        for (const name of possibleNames) {
          countryData = travelDataMap.get(name);
          if (countryData) {
            countryName = name;
            break;
          }
        }

        if (!countryData) {
          return '#f8f9fa'; // Light neutral for countries without data
        }
        
        const value = viewMode === 'emissions' ? countryData.emissions : countryData.flights;
        const maxValue = viewMode === 'emissions' ? 
          Math.max(...travelData.destinations.map(d => d.emissions)) :
          Math.max(...travelData.destinations.map(d => d.flights));
        
        const intensity = value / maxValue;
        
        // Modern warm color scheme with better gradation
        if (viewMode === 'emissions') {
          // Warm gradient for emissions (yellow to red)
          return `hsl(${45 - intensity * 45}, 70%, ${85 - intensity * 30}%)`;
        } else {
          // Warm gradient for flights (light orange to dark orange)
          return `hsl(${39 - intensity * 15}, ${60 + intensity * 30}%, ${85 - intensity * 35}%)`;
        }
      })
      .attr('stroke', d => {
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);

        const isSelected = possibleNames.some(name => name === selectedCountry);
        
        if (isSelected) return '#e74c3c';
        return '#d0d0d0'; // Light grey outline for all countries
      })
      .attr('stroke-width', d => {
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);

        const isSelected = possibleNames.some(name => name === selectedCountry);
        
        if (isSelected) return 2.5;
        return 0.7; // Consistent width for good visibility
      })
      .style('cursor', d => {
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);
        
        return possibleNames.some(name => travelDataMap.has(name)) ? 'pointer' : 'default';
      })
      .on('mouseenter', function(event, d) {
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);
        
        let countryData = null;
        let countryName = null;
        for (const name of possibleNames) {
          countryData = travelDataMap.get(name);
          if (countryData) {
            countryName = name;
            break;
          }
        }
        
        // Enhanced hover effects with glow
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', '#e74c3c')
          .attr('stroke-width', 3)
          .attr('filter', 'url(#glow)');
        
        if (countryData) {
          // Premium tooltip with enhanced styling and data intelligence
          const efficiencyScore = (countryData.emissions / countryData.flights);
          const efficiency = efficiencyScore < 2 ? 'Excellent' : 
                            efficiencyScore < 4 ? 'Good' : 
                            efficiencyScore < 6 ? 'Average' : 'Poor';
          
          const efficiencyColor = efficiency === 'Excellent' ? '#2ecc71' : 
                                 efficiency === 'Good' ? '#f39c12' : 
                                 efficiency === 'Average' ? '#e67e22' : '#e74c3c';

          setTooltip({
            country: countryName,
            flights: countryData.flights,
            emissions: countryData.emissions,
            viewMode: viewMode,
            efficiency: efficiency,
            efficiencyScore: efficiencyScore,
            efficiencyColor: efficiencyColor
          });
        } else {
          // Enhanced no-data tooltip
          d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke', '#7f8c8d')
            .attr('stroke-width', 1.5);
            
          setTooltip({
            country: possibleNames[0] || 'Unknown',
            flights: 0,
            emissions: 0,
            viewMode: viewMode,
            noData: true
          });
        }
      })
      .on('mousemove', function(event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function(event, d) {
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);

        const isSelected = possibleNames.some(name => name === selectedCountry);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', isSelected ? '#e74c3c' : '#d0d0d0')
          .attr('stroke-width', isSelected ? 2.5 : 0.7)
          .attr('filter', null);
          
        setTooltip(null);
      })
      .on('click', function(event, d) {
        const possibleNames = [
          d.properties.name,
          d.properties.NAME,
          d.properties.NAME_EN,
          d.properties.ADMIN,
          d.properties.NAME_LONG
        ].filter(Boolean);
        
        let countryName = null;
        for (const name of possibleNames) {
          if (travelDataMap.has(name)) {
            countryName = name;
            break;
          }
        }
        
        if (countryName) {
          setSelectedCountry(selectedCountry === countryName ? null : countryName);
        }
      });

    // Removed proportional symbols for cleaner design - tooltips provide the detailed information

    // Add heat map overlay if enabled
    if (showHeatMap) {
      const heatMapGroup = g.append('g')
        .attr('class', 'heat-map-overlay');

      // Create gradient definitions for heat map
      const heatGradient = defs.append('radialGradient')
        .attr('id', 'heatGradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

      heatGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ff6b6b')
        .attr('stop-opacity', '0.8');

      heatGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ffa726')
        .attr('stop-opacity', '0.4');

      heatGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#fff59d')
        .attr('stop-opacity', '0.1');

      // Create heat circles for each destination
      travelData.destinations.forEach(destination => {
        const countryFeature = worldData.features.find(feature => {
          const possibleNames = [
            feature.properties.name,
            feature.properties.NAME,
            feature.properties.NAME_EN,
            feature.properties.ADMIN,
            feature.properties.NAME_LONG
          ].filter(Boolean);
          
          return possibleNames.some(name => name === destination.country);
        });
        
        if (countryFeature) {
          const centroid = path.centroid(countryFeature);
          const value = viewMode === 'emissions' ? destination.emissions : destination.flights;
          const maxValue = viewMode === 'emissions' ? 
            Math.max(...travelData.destinations.map(d => d.emissions)) :
            Math.max(...travelData.destinations.map(d => d.flights));
          
          const heatRadius = 20 + (value / maxValue) * 60; // Heat radius based on value
          const heatIntensity = 0.3 + (value / maxValue) * 0.5; // Opacity based on value
          
          heatMapGroup.append('circle')
            .attr('cx', centroid[0])
            .attr('cy', centroid[1])
            .attr('r', heatRadius)
            .attr('fill', '#ff6b6b')
            .style('animation', 'pulse 4s ease-in-out infinite');
        }
      });
    }

    // Add spectacular animated flight routes if enabled
    if (showRoutes) {


      const routesGroup = g.append('g')
        .attr('class', 'flight-routes');

      // Create sample routes from major destinations
      const majorDestinations = [...travelData.destinations]
        .sort((a, b) => (viewMode === 'emissions' ? b.emissions - a.emissions : b.flights - a.flights))
        .slice(0, 10); // Show top 10 routes for more spectacle

      // UK coordinates (approximate center)
      const ukCoords = projection([-2, 54]);

      majorDestinations.forEach((destination, index) => {
        const countryFeature = worldData.features.find(feature => {
          const possibleNames = [
            feature.properties.name,
            feature.properties.NAME,
            feature.properties.NAME_EN,
            feature.properties.ADMIN,
            feature.properties.NAME_LONG
          ].filter(Boolean);
          
          return possibleNames.some(name => name === destination.country);
        });

        if (countryFeature && ukCoords) {
          const destCoords = path.centroid(countryFeature);
          const distance = Math.sqrt(Math.pow(destCoords[0] - ukCoords[0], 2) + Math.pow(destCoords[1] - ukCoords[1], 2));
          
          // Create realistic curved path with varying heights based on distance
          const curvature = Math.min(distance * 0.3, 100);
          const midPoint = [
            (ukCoords[0] + destCoords[0]) / 2,
            Math.min(ukCoords[1], destCoords[1]) - curvature
          ];

          const routePath = `M ${ukCoords[0]} ${ukCoords[1]} Q ${midPoint[0]} ${midPoint[1]} ${destCoords[0]} ${destCoords[1]}`;
          
          // Solid route line - no transparency
          const routeBase = routesGroup.append('path')
            .attr('d', routePath)
            .attr('fill', 'none')
            .attr('stroke', '#f39c12')
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round');

          // Solid flowing effect
          const routeFlow = routesGroup.append('path')
            .attr('d', routePath)
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '8,12')
            .attr('stroke-linecap', 'round');

          // Simple continuous flow animation
          function flowAnimation() {
            routeFlow
              .transition()
              .duration(2000)
              .ease(d3.easeLinear)
              .attr('stroke-dashoffset', -20)
              .on('end', () => {
                routeFlow.attr('stroke-dashoffset', 0);
                flowAnimation();
              });
          }
          setTimeout(() => flowAnimation(), index * 200);




        }
      });
    }

    console.log(`Rendered ${countryPaths.size()} country paths with ${travelData.destinations.length} proportional symbols`);


  }, [travelData, worldData, viewMode, isLoading, showRoutes, showHeatMap, selectedCountry]);

  if (isLoading) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e74c3c',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Loading world map...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#f8f9fa'
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg 
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%'
        }}
      />

      {/* Enhanced Premium Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 15,
          top: mousePos.y - 10,
          background: tooltip.noData ? 
            'rgba(248, 249, 250, 0.98)' :
            tooltip.isTopDestination ?
            'rgba(255, 255, 255, 0.98)' :
            'rgba(255, 255, 255, 0.98)',
          color: '#2c3e50',
          padding: tooltip.isTopDestination ? '20px 24px' : '16px 20px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          zIndex: 1000,
          pointerEvents: 'none',
          minWidth: tooltip.isTopDestination ? '280px' : '260px',
          maxWidth: tooltip.isTopDestination ? '340px' : '320px',
          boxShadow: tooltip.isTopDestination ? 
            '0 8px 25px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)' :
            '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(15px)'
        }}>
          {/* Top Destination Badge */}
          {tooltip.isTopDestination && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#2c3e50',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '2px solid rgba(255,255,255,0.8)'
              }}>
                #{tooltip.rank}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '2px' }}>
                  🏆 Top Destination
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  Ranked by {viewMode === 'emissions' ? 'emissions' : 'flight volume'}
                </div>
              </div>
            </div>
          )}
          
          {/* Country Header */}
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: tooltip.isTopDestination ? '1.2rem' : '1.1rem', 
            marginBottom: '12px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{tooltip.country}</span>
            {!tooltip.noData && !tooltip.isTopDestination && (
              <div style={{
                fontSize: '0.7rem',
                background: 'rgba(0,0,0,0.06)',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 'normal'
              }}>
                Active
              </div>
            )}
          </div>
          
          {tooltip.noData ? (
            <div style={{ 
              color: 'rgba(44, 62, 80, 0.7)', 
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '10px 0'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🚫</div>
              No travel data available for this country
            </div>
          ) : (
            <>
              {/* Data Metrics */}
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(44, 62, 80, 0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ opacity: 0.7 }}>✈️</span>
                  Annual Flights:
                </span>
                <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                  {tooltip.flights.toLocaleString()}
                </span>
              </div>
              
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(44, 62, 80, 0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ opacity: 0.7 }}>🌱</span>
                  CO₂ Emissions:
                </span>
                <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                  {tooltip.emissions.toLocaleString()} tons
                </span>
              </div>
              
              {/* Efficiency Rating */}
              {tooltip.efficiency && (
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(44, 62, 80, 0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ opacity: 0.7 }}>📊</span>
                    Efficiency:
                  </span>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    background: tooltip.efficiencyColor,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    color: 'white'
                  }}>
                    {tooltip.efficiency}
                  </span>
                </div>
              )}
              
              {/* Footer Info */}
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'rgba(44, 62, 80, 0.6)', 
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                textAlign: 'center'
              }}>
                {tooltip.efficiencyScore ? (
                  <div>
                    <strong>{tooltip.efficiencyScore.toFixed(1)} tons CO₂</strong> per flight
                    <br />
                    <small style={{ opacity: 0.8 }}>
                      Currently viewing: {tooltip.viewMode === 'flights' ? 'Flight Count' : 'CO₂ Emissions'}
                    </small>
                  </div>
                ) : (
                  `Viewing: ${tooltip.viewMode === 'flights' ? 'Flight Count Data' : 'Carbon Emissions Data'}`
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { 
            stroke-opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            stroke-opacity: 0.2;
            transform: scale(1.1);
          }
          100% { 
            stroke-opacity: 0.6;
            transform: scale(1);
          }
        }
        
        @keyframes dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .control-panel {
          animation: fadeIn 0.8s ease-out;
        }
        

        
        .flight-routes path {
          transition: all 0.3s ease;
        }
        

        
        .flight-routes path {
          transition: all 0.3s ease;
        }
        
        .flight-routes:hover path {
          stroke-width: 3;
        }
        
        .view-tab {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .view-tab:hover rect {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        
        .view-tab:active rect {
          transform: translateY(0px);
        }
        
        .checkbox-toggle {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .checkbox-toggle:hover rect {
          filter: brightness(1.05);
          transform: scale(1.05);
        }
        
        .checkbox-toggle:active rect {
          transform: scale(0.98);
        }
        
        .destination-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .destination-indicator:hover rect {
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1);
          transform: scale(1.05);
        }
        
        .destination-indicator:active rect {
          transform: scale(0.98);
        }
        
        .country {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .country {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .country:hover {
          filter: brightness(1.08) contrast(1.12) saturate(1.1) drop-shadow(0 2px 8px rgba(0,0,0,0.2));
          transform: translateZ(0); /* GPU acceleration */
        }
        
        @keyframes countryHover {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1.01); }
        }
        

        
        .control-panel rect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .control-panel rect:hover {
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
        }
        
        @keyframes slideIn {
          0% { 
            opacity: 0; 
            transform: translateX(-20px);
          }
          100% { 
            opacity: 1; 
            transform: translateX(0);
          }
        }
        
        .search-container {
          animation: slideIn 0.6s ease-out 0.3s both;
        }
        
        @keyframes popIn {
          0% { 
            opacity: 0; 
            transform: scale(0.8);
          }
          50% { 
            transform: scale(1.05);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        
        .top-destinations {
          animation: popIn 0.5s ease-out 0.5s both;
        }
        
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        
        .premium-button {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 25%, #667eea 50%, #764ba2 75%, #667eea 100%);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default BusinessTravelMap;