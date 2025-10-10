/**
 * Tree Data Service - Hybrid approach
 * Uses local database + API enrichment
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
 * Filter trees by climate compatibility
 * @param {number} temperature - Current temperature
 * @param {number} rainfall - Annual rainfall
 * @returns {Array} Compatible trees
 */
export const filterTreesByClimate = (temperature, rainfall) => {
  return TREE_DATABASE.filter(tree => {
    const tempOk = temperature >= tree.tempRange.min && temperature <= tree.tempRange.max;
    const rainOk = rainfall >= tree.rainfallRange.min && rainfall <= tree.rainfallRange.max;
    return tempOk && rainOk;
  });
};

/**
 * Filter trees by soil type
 * @param {string} soilType - Soil type (clay, loam, sandy)
 * @returns {Array} Compatible trees
 */
export const filterTreesBySoil = (soilType) => {
  return TREE_DATABASE.filter(tree =>
    tree.soilTypes.includes(soilType.toLowerCase())
  );
};

/**
 * Get trees suitable for specific conditions
 * @param {Object} conditions - Environmental conditions
 * @returns {Promise<Array>} Suitable trees with scores
 */
export const getSuitableTrees = async (conditions) => {
  const { temperature, rainfall, soilType, latitude, longitude } = conditions;

  // Start with climate-compatible trees
  let suitableTrees = filterTreesByClimate(temperature, rainfall);

  // Further filter by soil if available
  if (soilType) {
    suitableTrees = suitableTrees.filter(tree =>
      tree.soilTypes.includes(soilType.toLowerCase())
    );
  }

  // Optionally check nativeness via API
  if (CONFIG.ENABLE_API_ENRICHMENT && latitude && longitude) {
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
  }

  return suitableTrees;
};

/* ✅ Named Exports */
export {
  enrichTreeData // <-- Added this line
};

/* ✅ Default Export (for convenience) */
export default {
  getAllTreeSpecies,
  getTreeById,
  filterTreesByClimate,
  filterTreesBySoil,
  getSuitableTrees,
  enrichTreeData
};
