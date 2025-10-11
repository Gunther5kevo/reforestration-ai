/**
 * Tree Data Service - Hybrid approach with relaxed filtering
 * Uses local database + API enrichment + tolerance buffer
 */

import TREE_DATABASE from '../constants/treeDatabase';
import { enrichTreeData, isSpeciesNative } from './treeSpeciesAPI';
import CONFIG from '../constants/config';

/**
 * Get all available tree species
 * @param {boolean} enrichWithAPI - Whether to enrich with API data
 * @returns {Promise<Array>} Tree species array
 */
export const getAllTreeSpecies = async (enrichWithAPI = false) => {
  if (!enrichWithAPI || !CONFIG.ENABLE_API_ENRICHMENT) {
    return TREE_DATABASE;
  }

  // Enrich with API data (optional)
  const enrichedTrees = await Promise.all(
    TREE_DATABASE.map(tree =>
      enrichTreeData(
        tree,
        CONFIG.DEFAULT_LOCATION.latitude,
        CONFIG.DEFAULT_LOCATION.longitude
      )
    )
  );

  return enrichedTrees;
};

/**
 * Get tree by ID
 * @param {string} treeId - Tree identifier
 * @returns {Object|null} Tree data
 */
export const getTreeById = (treeId) => {
  return TREE_DATABASE.find(tree => tree.id === treeId) || null;
};

/**
 * Filter trees by climate compatibility with optional tolerance
 * @param {number} temperature - Current temperature
 * @param {number} rainfall - Annual rainfall
 * @param {number} toleranceBuffer - Tolerance in degrees/mm (default: 0)
 * @returns {Array} Compatible trees
 */
export const filterTreesByClimate = (temperature, rainfall, toleranceBuffer = 0) => {
  return TREE_DATABASE.filter(tree => {
    // Apply tolerance to temperature range
    const tempMin = tree.tempRange.min - toleranceBuffer;
    const tempMax = tree.tempRange.max + toleranceBuffer;
    
    // Apply tolerance to rainfall range (scaled: 1°C = ~40mm rain)
    const rainBuffer = toleranceBuffer * 40;
    const rainMin = tree.rainfallRange.min - rainBuffer;
    const rainMax = tree.rainfallRange.max + rainBuffer;
    
    const tempOk = temperature >= tempMin && temperature <= tempMax;
    const rainOk = rainfall >= rainMin && rainfall <= rainMax;
    
    return tempOk && rainOk;
  });
};

/**
 * Filter trees by soil type (with relaxed matching)
 * @param {string} soilType - Soil type (clay, loam, sandy, rocky)
 * @param {boolean} strict - Use strict matching (default: true)
 * @returns {Array} Compatible trees
 */
export const filterTreesBySoil = (soilType, strict = true) => {
  if (!soilType) return TREE_DATABASE;
  
  const normalizedSoil = soilType.toLowerCase();
  
  if (strict) {
    return TREE_DATABASE.filter(tree =>
      tree.soilTypes.includes(normalizedSoil)
    );
  }
  
  // Relaxed mode: accept similar soil types
  return TREE_DATABASE.filter(tree => {
    // If exact match, accept
    if (tree.soilTypes.includes(normalizedSoil)) return true;
    
    // Clay can grow in loam (but slower)
    if (normalizedSoil === 'clay' && tree.soilTypes.includes('loam')) return true;
    
    // Sandy can grow in loam
    if (normalizedSoil === 'sandy' && tree.soilTypes.includes('loam')) return true;
    
    // Loam accepts most
    if (normalizedSoil === 'loam' && 
        (tree.soilTypes.includes('clay') || tree.soilTypes.includes('sandy'))) return true;
    
    // Rocky soil: only accept if explicitly supported or very hardy
    if (normalizedSoil === 'rocky' && tree.hardiness === 'high') return true;
    
    return false;
  });
};

/**
 * Get trees suitable for specific conditions with optional tolerance
 * @param {Object} conditions - Environmental conditions
 * @returns {Promise<Array>} Suitable trees with scores
 */
export const getSuitableTrees = async (conditions) => {
  const { 
    temperature, 
    rainfall, 
    soilType, 
    latitude, 
    longitude,
    toleranceBuffer = 0,  // NEW: Tolerance for relaxed mode
    relaxedSoil = false   // NEW: Relaxed soil matching
  } = conditions;

  console.log('🔍 Finding suitable trees:', {
    temperature,
    rainfall,
    soilType,
    toleranceBuffer,
    relaxedSoil
  });

  // Start with climate-compatible trees (with tolerance)
  let suitableTrees = filterTreesByClimate(temperature, rainfall, toleranceBuffer);
  
  console.log(`📊 After climate filter: ${suitableTrees.length} trees`);

  // Further filter by soil if available
  if (soilType) {
    suitableTrees = suitableTrees.filter(tree => {
      if (relaxedSoil) {
        // Relaxed soil matching
        return filterTreesBySoil(soilType, false).includes(tree);
      } else {
        // Strict soil matching
        return tree.soilTypes.includes(soilType.toLowerCase());
      }
    });
    
    console.log(`📊 After soil filter: ${suitableTrees.length} trees`);
  }

  // Optionally check nativeness via API
  if (CONFIG.ENABLE_API_ENRICHMENT && latitude && longitude) {
    try {
      const nativeChecks = await Promise.all(
        suitableTrees.map(tree =>
          isSpeciesNative(tree.scientificName, latitude, longitude)
        )
      );

      suitableTrees = suitableTrees.map((tree, idx) => ({
        ...tree,
        isNative: nativeChecks[idx],
        nativeBonus: nativeChecks[idx] ? 20 : 0
      }));
    } catch (error) {
      console.warn('Native check failed, continuing without:', error);
    }
  }

  return suitableTrees;
};

/**
 * Get hardy fallback species for any condition
 * @param {number} temperature - Current temperature (for basic filtering)
 * @returns {Array} Hardy, versatile tree species
 */
export const getHardyFallbackSpecies = (temperature = 20) => {
  console.log('🌳 Getting hardy fallback species...');
  
  // Select trees with high adaptability and low water needs
  const hardyTrees = TREE_DATABASE.filter(tree => {
    // Must be hardy or have low water needs
    const isHardy = tree.hardiness === 'high' || tree.waterNeeds === 'low';
    
    // Must have wide temperature tolerance (>15°C range)
    const tempRange = tree.tempRange.max - tree.tempRange.min;
    const wideTempRange = tempRange > 15;
    
    // Must have wide rainfall tolerance (>500mm range)
    const rainRange = tree.rainfallRange.max - tree.rainfallRange.min;
    const wideRainRange = rainRange > 500;
    
    return isHardy || (wideTempRange && wideRainRange);
  });

  // Sort by versatility
  hardyTrees.sort((a, b) => {
    const scoreA = (a.tempRange.max - a.tempRange.min) + 
                   (a.rainfallRange.max - a.rainfallRange.min) / 10;
    const scoreB = (b.tempRange.max - b.tempRange.min) + 
                   (b.rainfallRange.max - b.rainfallRange.min) / 10;
    return scoreB - scoreA;
  });

  // Return top 5-7 hardy species
  return hardyTrees.slice(0, 7);
};

/**
 * Get species by region (for better defaults)
 * @param {string} region - Region code (e.g., 'East Africa', 'West Africa')
 * @returns {Array} Region-appropriate trees
 */
export const getRegionalSpecies = (region) => {
  const regionMap = {
    'east-africa': ['kenya', 'tanzania', 'uganda', 'ethiopia'],
    'west-africa': ['nigeria', 'ghana', 'senegal', 'ivory coast'],
    'southern-africa': ['south africa', 'zimbabwe', 'mozambique'],
    'tropical': ['tropical', 'equatorial'],
    'subtropical': ['subtropical', 'mediterranean'],
    'temperate': ['temperate']
  };

  const keywords = regionMap[region.toLowerCase()] || [];
  
  return TREE_DATABASE.filter(tree => {
    if (!tree.nativeRegions) return false;
    
    return tree.nativeRegions.some(nativeRegion =>
      keywords.some(keyword => 
        nativeRegion.toLowerCase().includes(keyword)
      )
    );
  });
};

/* ✅ Named Exports */
export {
  enrichTreeData,
  isSpeciesNative
};

/* ✅ Default Export */
export default {
  getAllTreeSpecies,
  getTreeById,
  filterTreesByClimate,
  filterTreesBySoil,
  getSuitableTrees,
  getHardyFallbackSpecies,
  getRegionalSpecies,
  enrichTreeData,
  isSpeciesNative
};