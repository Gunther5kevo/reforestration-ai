/**
 * Calculations Utility
 * Common calculation functions for reforestation metrics
 */

/**
 * Calculate carbon sequestration over time
 * @param {number} carbonPerTreePerYear - Annual carbon capture per tree (kg CO2)
 * @param {number} numberOfTrees - Total number of trees
 * @param {number} years - Time period in years
 * @param {number} survivalRate - Expected survival rate (0-1)
 * @returns {Object} Carbon sequestration data
 */
export const calculateCarbonSequestration = (
  carbonPerTreePerYear,
  numberOfTrees,
  years = 10,
  survivalRate = 0.95
) => {
  const yearlyData = [];
  let cumulativeCarbon = 0;
  
  for (let year = 1; year <= years; year++) {
    // Trees grow, so carbon capture increases over time
    const growthFactor = Math.min(1, 0.5 + (year * 0.05)); // Starts at 50%, reaches 100% by year 10
    const survivingTrees = numberOfTrees * Math.pow(survivalRate, year);
    const yearlyCapture = carbonPerTreePerYear * survivingTrees * growthFactor;
    cumulativeCarbon += yearlyCapture;
    
    yearlyData.push({
      year,
      yearlyCapture: Math.round(yearlyCapture),
      cumulativeCarbon: Math.round(cumulativeCarbon),
      survivingTrees: Math.round(survivingTrees),
      growthFactor: (growthFactor * 100).toFixed(0)
    });
  }
  
  return {
    totalCarbonSequestered: Math.round(cumulativeCarbon),
    averageAnnualCapture: Math.round(cumulativeCarbon / years),
    yearlyBreakdown: yearlyData,
    equivalents: {
      carsDrivenOffRoad: Math.round(cumulativeCarbon / 4600), // Average car emits 4.6 tons/year
      householdsPowered: Math.round(cumulativeCarbon / 7300), // Average household 7.3 tons/year
      treesSavedEquivalent: Math.round(cumulativeCarbon / 21) // 1 tree absorbs ~21kg/year
    }
  };
};

/**
 * Calculate planting density based on tree characteristics
 * @param {Object} tree - Tree data object
 * @param {string} soilQuality - Soil quality (poor, moderate, good, excellent)
 * @param {string} purpose - Planting purpose (timber, carbon, biodiversity, agroforestry)
 * @returns {Object} Recommended density
 */
export const calculatePlantingDensity = (tree, soilQuality = 'moderate', purpose = 'carbon') => {
  // Base density by growth rate
  const baseDensity = {
    'very-fast': 250,
    'fast': 350,
    'moderate': 450,
    'slow': 550
  };
  
  let density = baseDensity[tree.growthRate] || 400;
  
  // Adjust for soil quality
  const soilMultiplier = {
    'poor': 0.8,
    'moderate': 1.0,
    'good': 1.1,
    'excellent': 1.2
  };
  density *= soilMultiplier[soilQuality] || 1.0;
  
  // Adjust for purpose
  const purposeMultiplier = {
    'timber': 0.7,      // Fewer trees, better quality
    'carbon': 1.2,      // More trees for carbon
    'biodiversity': 1.0, // Natural spacing
    'agroforestry': 0.6  // Wide spacing for intercropping
  };
  density *= purposeMultiplier[purpose] || 1.0;
  
  // Calculate spacing
  const area = 10000; // 1 hectare in m²
  const areaPerTree = area / density;
  const spacing = Math.sqrt(areaPerTree);
  
  return {
    treesPerHectare: Math.round(density),
    spacing: spacing.toFixed(1), // meters
    areaPerTree: areaPerTree.toFixed(1), // m²
    pattern: spacing > 4 ? 'wide' : spacing > 3 ? 'moderate' : 'dense'
  };
};

/**
 * Calculate biodiversity impact score
 * @param {Array} trees - Array of selected trees
 * @returns {Object} Biodiversity metrics
 */
export const calculateBiodiversityImpact = (trees) => {
  if (!trees || trees.length === 0) {
    return { score: 0, level: 'none', diversity: 'none' };
  }
  
  // Average biodiversity value
  const avgBiodiversity = trees.reduce((sum, tree) => 
    sum + (tree.biodiversityValue || 0), 0
  ) / trees.length;
  
  // Species diversity bonus
  const uniqueFamilies = new Set(trees.map(t => t.family)).size;
  const diversityBonus = uniqueFamilies * 5;
  
  // Native species bonus
  const nativeCount = trees.filter(t => 
    t.nativeRegions && t.nativeRegions.length > 0
  ).length;
  const nativeBonus = (nativeCount / trees.length) * 10;
  
  // Nitrogen-fixing bonus
  const nitrogenFixers = trees.filter(t => t.nitrogenFixing).length;
  const nitrogenBonus = (nitrogenFixers / trees.length) * 5;
  
  const totalScore = Math.min(100, 
    avgBiodiversity + diversityBonus + nativeBonus + nitrogenBonus
  );
  
  let level;
  if (totalScore >= 85) level = 'excellent';
  else if (totalScore >= 70) level = 'good';
  else if (totalScore >= 50) level = 'moderate';
  else level = 'low';
  
  let diversity;
  if (uniqueFamilies >= 4) diversity = 'high';
  else if (uniqueFamilies >= 3) diversity = 'moderate';
  else diversity = 'low';
  
  return {
    score: Math.round(totalScore),
    level,
    diversity,
    metrics: {
      avgBiodiversityValue: Math.round(avgBiodiversity),
      uniqueFamilies,
      nativeSpeciesCount: nativeCount,
      nitrogenFixersCount: nitrogenFixers
    },
    benefits: [
      uniqueFamilies >= 3 ? 'Diverse species mix enhances ecosystem resilience' : null,
      nativeCount > 0 ? `${nativeCount} native species support local wildlife` : null,
      nitrogenFixers > 0 ? `${nitrogenFixers} nitrogen-fixing species improve soil` : null
    ].filter(Boolean)
  };
};

/**
 * Calculate economic value of reforestation
 * @param {Object} params - Calculation parameters
 * @returns {Object} Economic valuation
 */
export const calculateEconomicValue = (params) => {
  const {
    numberOfTrees = 400,
    carbonPerTreePerYear = 45,
    years = 10,
    timberValue = 50, // USD per tree
    carbonCreditPrice = 10, // USD per ton CO2
    survivalRate = 0.95
  } = params;
  
  // Carbon credits
  const carbonData = calculateCarbonSequestration(
    carbonPerTreePerYear,
    numberOfTrees,
    years,
    survivalRate
  );
  const carbonValue = (carbonData.totalCarbonSequestered / 1000) * carbonCreditPrice;
  
  // Timber value (at maturity)
  const matureTrees = numberOfTrees * Math.pow(survivalRate, years);
  const timberValueTotal = matureTrees * timberValue;
  
  // Ecosystem services value (simplified)
  const waterRetention = numberOfTrees * 2; // $2 per tree annually
  const soilConservation = numberOfTrees * 1.5; // $1.5 per tree annually
  const biodiversityValue = numberOfTrees * 1; // $1 per tree annually
  const ecosystemServicesTotal = (waterRetention + soilConservation + biodiversityValue) * years;
  
  // Total value
  const totalValue = carbonValue + timberValueTotal + ecosystemServicesTotal;
  
  // Cost estimates
  const plantingCost = numberOfTrees * 2; // $2 per seedling + planting
  const maintenanceCost = (numberOfTrees * 0.5) * 3; // $0.5 per tree for 3 years
  const totalCost = plantingCost + maintenanceCost;
  
  // ROI
  const netValue = totalValue - totalCost;
  const roi = ((netValue / totalCost) * 100).toFixed(1);
  
  return {
    revenue: {
      carbonCredits: Math.round(carbonValue),
      timberValue: Math.round(timberValueTotal),
      ecosystemServices: Math.round(ecosystemServicesTotal),
      total: Math.round(totalValue)
    },
    costs: {
      planting: Math.round(plantingCost),
      maintenance: Math.round(maintenanceCost),
      total: Math.round(totalCost)
    },
    netValue: Math.round(netValue),
    roi: parseFloat(roi),
    paybackPeriod: Math.round(totalCost / (totalValue / years)), // years
    breakdownByYear: generateYearlyEconomics(params)
  };
};

/**
 * Generate yearly economic breakdown
 * @param {Object} params - Parameters
 * @returns {Array} Yearly economics
 */
const generateYearlyEconomics = (params) => {
  const { years = 10 } = params;
  const yearlyData = [];
  
  for (let year = 1; year <= years; year++) {
    yearlyData.push({
      year,
      costs: year <= 3 ? 200 : 0, // Maintenance only first 3 years
      revenue: year === years ? 2000 : 150, // Major revenue at harvest
      netCashFlow: year === years ? 1800 : -50
    });
  }
  
  return yearlyData;
};

/**
 * Calculate water usage and conservation
 * @param {Array} trees - Array of trees
 * @param {number} numberOfTrees - Total trees
 * @param {string} climateType - Climate classification
 * @returns {Object} Water metrics
 */
export const calculateWaterImpact = (trees, numberOfTrees, climateType) => {
  // Average water needs
  const waterNeedsMap = {
    'very-low': 10,  // liters per tree per week
    'low': 20,
    'moderate': 35,
    'high': 50
  };
  
  const avgWaterNeed = trees.reduce((sum, tree) => {
    return sum + (waterNeedsMap[tree.waterNeeds] || 30);
  }, 0) / trees.length;
  
  const weeklyWater = avgWaterNeed * numberOfTrees;
  const annualWater = weeklyWater * 52;
  
  // Water retention capacity (simplified)
  const retentionPerTree = 100; // liters per year
  const totalRetention = numberOfTrees * retentionPerTree;
  
  // Adjust for climate
  const climateMultiplier = {
    'arid': 1.5,
    'semi-arid': 1.3,
    'sub-humid': 1.0,
    'humid': 0.8,
    'very-humid': 0.6
  };
  
  const adjustedWaterNeed = annualWater * (climateMultiplier[climateType] || 1.0);
  
  return {
    irrigation: {
      weeklyLiters: Math.round(weeklyWater),
      annualLiters: Math.round(adjustedWaterNeed),
      annualCubicMeters: Math.round(adjustedWaterNeed / 1000),
      perTree: Math.round(avgWaterNeed)
    },
    conservation: {
      annualRetention: Math.round(totalRetention),
      runoffReduction: Math.round(totalRetention * 0.7),
      groundwaterRecharge: Math.round(totalRetention * 0.3)
    },
    efficiency: {
      netWaterImpact: Math.round(totalRetention - adjustedWaterNeed),
      isWaterPositive: totalRetention > adjustedWaterNeed
    }
  };
};

/**
 * Calculate soil improvement metrics
 * @param {Array} trees - Array of trees
 * @param {number} numberOfTrees - Total trees
 * @param {number} years - Time period
 * @returns {Object} Soil improvement data
 */
export const calculateSoilImprovement = (trees, numberOfTrees, years = 10) => {
  // Nitrogen-fixing trees
  const nitrogenFixers = trees.filter(t => t.nitrogenFixing);
  const nitrogenFixerCount = Math.round(
    (nitrogenFixers.length / trees.length) * numberOfTrees
  );
  
  // Nitrogen added (kg per tree per year)
  const nitrogenPerTree = 5;
  const totalNitrogen = nitrogenFixerCount * nitrogenPerTree * years;
  
  // Organic matter from leaf litter (kg per tree per year)
  const organicMatterPerTree = 10;
  const totalOrganicMatter = numberOfTrees * organicMatterPerTree * years;
  
  // Erosion prevention (tons of soil saved per hectare per year)
  const erosionPrevention = 5 * years;
  
  return {
    nitrogenFixation: {
      fixingTrees: nitrogenFixerCount,
      totalNitrogen: Math.round(totalNitrogen),
      annualNitrogen: Math.round(totalNitrogen / years),
      equivalentFertilizer: Math.round(totalNitrogen * 2) // kg of urea equivalent
    },
    organicMatter: {
      totalAdded: Math.round(totalOrganicMatter),
      annualAddition: Math.round(totalOrganicMatter / years),
      soilCarbonIncrease: Math.round(totalOrganicMatter * 0.4) // 40% is carbon
    },
    erosionControl: {
      soilSaved: Math.round(erosionPrevention),
      annualSaved: Math.round(erosionPrevention / years)
    },
    soilHealth: {
      improvement: 'significant',
      timeToMatureHealth: Math.min(years, 5)
    }
  };
};

/**
 * Calculate project timeline and milestones
 * @param {Object} tree - Primary tree species
 * @param {number} numberOfTrees - Total trees
 * @returns {Object} Project timeline
 */
export const calculateProjectTimeline = (tree, numberOfTrees) => {
  const milestones = [
    {
      phase: 'Preparation',
      months: 0,
      duration: 1,
      tasks: ['Site survey', 'Soil testing', 'Seedling procurement'],
      status: 'upcoming'
    },
    {
      phase: 'Planting',
      months: 1,
      duration: 1,
      tasks: ['Land clearing', 'Tree planting', 'Initial watering'],
      status: 'upcoming'
    },
    {
      phase: 'Establishment',
      months: 2,
      duration: 12,
      tasks: ['Regular watering', 'Weeding', 'Pest monitoring', 'Fertilization'],
      status: 'upcoming'
    },
    {
      phase: 'Growth',
      months: 14,
      duration: tree.firstHarvestYears ? (tree.firstHarvestYears * 12) - 14 : 36,
      tasks: ['Monitoring', 'Thinning', 'Disease control'],
      status: 'upcoming'
    },
    {
      phase: 'Maturity',
      months: tree.firstHarvestYears ? tree.firstHarvestYears * 12 : 60,
      duration: 12,
      tasks: ['Assessment', 'Harvest planning', 'Regeneration'],
      status: 'upcoming'
    }
  ];
  
  return {
    totalDuration: tree.firstHarvestYears || 5,
    milestones,
    criticalPeriod: {
      phase: 'Establishment',
      importance: 'High - determines survival rate'
    },
    estimatedWorkHours: Math.round(numberOfTrees * 0.5) // 30 min per tree
  };
};

export default {
  calculateCarbonSequestration,
  calculatePlantingDensity,
  calculateBiodiversityImpact,
  calculateEconomicValue,
  calculateWaterImpact,
  calculateSoilImprovement,
  calculateProjectTimeline
};