/**
 * Recommendation Service
 * Core AI engine that combines all data sources and generates tree recommendations
 */

import TREE_DATABASE from '../constants/treeDatabase';
import CONFIG from '../constants/config';
import openAIService from './openAIService';
import { getSuitableTrees, enrichTreeData } from './treeDataService';

/**
 * Generate tree recommendations based on all collected data
 * @param {Object} params - All input parameters
 * @returns {Promise<Object>} Complete recommendation package
 */
export const generateRecommendations = async (params) => {
  const {
    location,
    climateData,
    imageAnalysis,
    useAI = true,
    enrichWithAPIs = false,
    relaxed = false,
    toleranceBuffer = 0,
    manualLocation = false
  } = params;
  
  console.log('🌳 Generating recommendations with params:', {
    location: location?.city,
    temp: climateData?.currentConditions?.temperature,
    rainfall: climateData?.annualRainfall,
    soil: imageAnalysis?.soilType,
    useAI,
    relaxed,
    manualLocation
  });
  
  try {
    // Step 1: Get climate-compatible trees with optional relaxed criteria
    const suitableTrees = await getSuitableTrees({
      temperature: climateData.currentConditions.temperature,
      rainfall: climateData.annualRainfall,
      soilType: imageAnalysis.soilType,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      relaxed,
      toleranceBuffer
    });
    
    console.log(`📊 Found ${suitableTrees.length} suitable trees`);
    
    if (suitableTrees.length === 0) {
      console.warn('⚠️ No suitable trees found');
      return {
        success: false,
        error: manualLocation 
          ? 'No suitable trees found for this location. Try a different location or check climate data.'
          : 'No suitable trees found. Please enable GPS and take a new photo.',
        fallbackTrees: TREE_DATABASE.slice(0, 3)
      };
    }
    
    // Step 2: Calculate basic compatibility scores
    const scoredTrees = suitableTrees.map(tree => {
      const score = calculateCompatibilityScore(tree, {
        location,
        climate: climateData,
        imageAnalysis
      });
      return { ...tree, compatibilityScore: score };
    });
    
    // Sort by score
    scoredTrees.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    console.log('🏆 Top 3 scored trees:', scoredTrees.slice(0, 3).map(t => ({
      name: t.commonName,
      score: t.compatibilityScore.toFixed(1)
    })));
    
    // Step 3: Enhance with OpenAI if enabled
    let aiEnhancedData = null;
    if (useAI && openAIService.isOpenAIConfigured() && CONFIG.USE_OPENAI_ENHANCEMENT) {
      try {
        console.log('🤖 Enhancing with AI...');
        const topCandidates = scoredTrees.slice(0, 8); // Send top 8 to AI
        
        aiEnhancedData = await openAIService.enhanceRecommendations({
          location,
          climate: climateData,
          imageAnalysis,
          candidateTrees: topCandidates,
          manualLocation
        });
        
        console.log('✨ AI enhancement:', aiEnhancedData.success ? 'SUCCESS' : 'FAILED');
        
        // Apply AI rankings if successful
        if (aiEnhancedData.success && aiEnhancedData.data.rankings) {
          scoredTrees.forEach(tree => {
            const aiRanking = aiEnhancedData.data.rankings.find(
              r => r.treeId === tree.id
            );
            if (aiRanking) {
              tree.aiCompatibilityScore = aiRanking.compatibilityScore;
              tree.aiReasoning = aiRanking.reasoning;
              tree.aiAdvice = aiRanking.specificAdvice;
              tree.aiRank = aiRanking.rank;
              // Boost the score with AI input
              tree.finalScore = (tree.compatibilityScore * 0.4) + (aiRanking.compatibilityScore * 0.6);
            } else {
              tree.finalScore = tree.compatibilityScore;
            }
          });
          
          // Re-sort by final score
          scoredTrees.sort((a, b) => b.finalScore - a.finalScore);
        }
      } catch (aiError) {
        console.error('AI enhancement failed, using basic scores:', aiError);
        scoredTrees.forEach(tree => {
          tree.finalScore = tree.compatibilityScore;
        });
      }
    } else {
      scoredTrees.forEach(tree => {
        tree.finalScore = tree.compatibilityScore;
      });
    }
    
    // Step 4: Get top recommendations
    const topRecommendations = scoredTrees.slice(0, CONFIG.TOP_RECOMMENDATIONS_COUNT);
    
    // Step 5: Enrich with API data if requested
    if (enrichWithAPIs && CONFIG.ENABLE_API_ENRICHMENT) {
      const enrichedPromises = topRecommendations.map(tree =>
        enrichTreeData(tree, location.coordinates.latitude, location.coordinates.longitude)
      );
      const enrichedTrees = await Promise.all(enrichedPromises);
      topRecommendations.splice(0, topRecommendations.length, ...enrichedTrees);
    }
    
    // Step 6: Generate planting strategy
    const plantingStrategy = generatePlantingStrategy(
      topRecommendations,
      climateData,
      location,
      aiEnhancedData?.data?.plantingStrategy
    );
    
    // Step 7: Calculate impact metrics
    const impactMetrics = calculateImpactMetrics(
      topRecommendations,
      plantingStrategy.density
    );
    
    console.log('✅ Recommendations generated successfully:', {
      count: topRecommendations.length,
      aiEnhanced: !!aiEnhancedData?.success,
      manualLocation
    });
    
    return {
      success: true,
      recommendations: topRecommendations,
      plantingStrategy,
      impactMetrics,
      aiEnhanced: !!aiEnhancedData?.success,
      aiInsights: aiEnhancedData?.data || null,
      manualLocationUsed: manualLocation,
      metadata: {
        totalCandidates: suitableTrees.length,
        topCount: topRecommendations.length,
        generatedAt: new Date().toISOString(),
        aiTokensUsed: aiEnhancedData?.tokensUsed || 0,
        locationSource: manualLocation ? 'manual' : 'gps',
        relaxedMode: relaxed
      }
    };
    
  } catch (error) {
    console.error('❌ Recommendation generation error:', error);
    return {
      success: false,
      error: error.message,
      fallbackTrees: TREE_DATABASE.slice(0, 3)
    };
  }
};

/**
 * Calculate compatibility score for a tree
 * @param {Object} tree - Tree data
 * @param {Object} context - Environmental context
 * @returns {number} Compatibility score (0-100)
 */
const calculateCompatibilityScore = (tree, context) => {
  let score = 100;
  const { location, climate, imageAnalysis } = context;
  
  // Temperature compatibility (30 points)
  const temp = climate.currentConditions.temperature;
  const tempMid = (tree.tempRange.min + tree.tempRange.max) / 2;
  const tempDeviation = Math.abs(temp - tempMid);
  const tempMaxDeviation = (tree.tempRange.max - tree.tempRange.min) / 2;
  const tempScore = Math.max(0, 30 - (tempDeviation / tempMaxDeviation) * 30);
  score = score - 30 + tempScore;
  
  // Rainfall compatibility (25 points)
  const rainfall = climate.annualRainfall;
  if (rainfall < tree.rainfallRange.min || rainfall > tree.rainfallRange.max) {
    score -= 25;
  } else {
    const rainMid = (tree.rainfallRange.min + tree.rainfallRange.max) / 2;
    const rainDeviation = Math.abs(rainfall - rainMid);
    const rainMaxDeviation = (tree.rainfallRange.max - tree.rainfallRange.min) / 2;
    const rainScore = Math.max(0, 25 - (rainDeviation / rainMaxDeviation) * 25);
    score = score - 25 + rainScore;
  }
  
  // Soil compatibility (15 points)
  if (tree.soilTypes.includes(imageAnalysis.soilType.toLowerCase())) {
    score += 0; // Keep the points
  } else {
    score -= 15;
  }
  
  // Soil moisture compatibility (10 points)
  const moistureLevel = climate.soilMoisture?.level || 'moderate';
  if (
    (tree.waterNeeds === 'low' && moistureLevel === 'dry') ||
    (tree.waterNeeds === 'moderate' && (moistureLevel === 'moderate' || moistureLevel === 'moist')) ||
    (tree.waterNeeds === 'high' && (moistureLevel === 'moist' || moistureLevel === 'wet'))
  ) {
    // Good match - keep points
  } else {
    score -= 10;
  }
  
  // Native species bonus (10 points)
  if (tree.nativeBonus) {
    score += tree.nativeBonus;
  } else if (tree.nativeRegions?.some(region => 
    location.country?.toLowerCase().includes(region.toLowerCase()) ||
    location.region?.toLowerCase().includes(region.toLowerCase())
  )) {
    score += 10;
  }
  
  // Biodiversity value (5 points)
  score += (tree.biodiversityValue / 100) * 5;
  
  // Carbon sequestration (5 points)
  const maxCarbon = 70; // Maximum realistic value in database
  score += (tree.carbonSequestration / maxCarbon) * 5;
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score));
};

/**
 * Generate planting strategy
 * @param {Array} trees - Recommended trees
 * @param {Object} climateData - Climate information
 * @param {Object} location - Location data
 * @param {Object} aiStrategy - AI-generated strategy (optional)
 * @returns {Object} Planting strategy
 */
const generatePlantingStrategy = (trees, climateData, location, aiStrategy = null) => {
  // Use AI strategy if available
  if (aiStrategy) {
    return {
      density: aiStrategy.density,
      bestMonths: aiStrategy.bestMonths,
      spacing: aiStrategy.spacing,
      mixRatio: calculateMixRatio(trees),
      source: 'ai'
    };
  }
  
  // Otherwise, generate based on rules
  const avgGrowthRate = trees.reduce((sum, t) => {
    const rates = { 'slow': 1, 'moderate': 2, 'fast': 3, 'very-fast': 4 };
    return sum + (rates[t.growthRate] || 2);
  }, 0) / trees.length;
  
  // Density based on growth rate and climate
  let density;
  if (avgGrowthRate >= 3.5) {
    density = '200-300 trees/hectare'; // Fast growing, less dense
  } else if (avgGrowthRate >= 2.5) {
    density = '300-400 trees/hectare'; // Moderate
  } else {
    density = '400-500 trees/hectare'; // Slow growing, denser
  }
  
  // Best planting months based on climate
  const bestMonths = climateData.suitability?.bestPlantingMonths || 
    ['March', 'April', 'May', 'October', 'November'];
  
  // Spacing based on average max height
  const avgHeight = trees.reduce((sum, t) => sum + t.maxHeight, 0) / trees.length;
  const spacing = avgHeight > 25 
    ? '4-6 meters'
    : avgHeight > 15
    ? '3-4 meters'
    : '2-3 meters';
  
  return {
    density,
    bestMonths,
    spacing,
    mixRatio: calculateMixRatio(trees),
    source: 'rules'
  };
};

/**
 * Calculate recommended species mix ratio
 * @param {Array} trees - Recommended trees
 * @returns {Object} Mix ratios
 */
const calculateMixRatio = (trees) => {
  if (trees.length === 0) return {};
  
  const total = 100;
  const ratios = {};
  
  // Primary tree gets 40-50%
  ratios[trees[0].commonName] = 45;
  
  // Distribute rest among others
  const remaining = total - 45;
  const othersCount = Math.min(trees.length - 1, 3);
  
  for (let i = 1; i <= othersCount; i++) {
    const share = Math.floor(remaining / othersCount);
    ratios[trees[i].commonName] = share;
  }
  
  return ratios;
};

/**
 * Calculate environmental impact metrics
 * @param {Array} trees - Selected trees
 * @param {string} densityStr - Planting density string
 * @returns {Object} Impact metrics
 */
const calculateImpactMetrics = (trees, densityStr) => {
  // Extract numeric density (take midpoint of range)
  const densityMatch = densityStr.match(/(\d+)-(\d+)/);
  const density = densityMatch 
    ? (parseInt(densityMatch[1]) + parseInt(densityMatch[2])) / 2
    : 400;
  
  // Calculate for 1 hectare
  const avgCarbonPerTree = trees.reduce((sum, t) => sum + t.carbonSequestration, 0) / trees.length;
  const totalCarbonYear1 = Math.round(avgCarbonPerTree * density);
  const totalCarbon10Years = Math.round(totalCarbonYear1 * 10 * 0.95); // 5% mortality
  
  const avgBiodiversity = Math.round(
    trees.reduce((sum, t) => sum + t.biodiversityValue, 0) / trees.length
  );
  
  // Calculate ecosystem service value (simplified)
  const economicValue = totalCarbon10Years * 10; // $10 per ton CO2
  
  return {
    carbonSequestration: {
      year1: totalCarbonYear1,
      year10: totalCarbon10Years,
      perTree: Math.round(avgCarbonPerTree),
      unit: 'kg CO2'
    },
    biodiversity: {
      score: avgBiodiversity,
      level: avgBiodiversity >= 85 ? 'excellent' : avgBiodiversity >= 70 ? 'good' : 'moderate'
    },
    density: {
      treesPerHectare: Math.round(density),
      survivalRate: 95
    },
    economicValue: {
      carbonCredits: economicValue,
      timber: Math.round(density * 50), // Simplified timber value
      total: Math.round(economicValue + (density * 50)),
      currency: 'USD'
    },
    ecosystem: {
      soilImprovement: trees.some(t => t.nitrogenFixing) ? 'high' : 'moderate',
      waterRetention: 'moderate',
      habitatCreation: avgBiodiversity >= 80 ? 'excellent' : 'good'
    }
  };
};

export default {
  generateRecommendations,
  calculateCompatibilityScore,
  generatePlantingStrategy,
  calculateImpactMetrics
};