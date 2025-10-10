/**
 * Tree Species API Service
 * Fetches tree data from external APIs (GBIF, Trefle, iNaturalist)
 */

import CONFIG from '../constants/config';

/**
 * Search for tree species on GBIF
 * @param {string} scientificName - Scientific name of the tree
 * @returns {Promise<Object>} Species data from GBIF
 */
export const searchGBIFSpecies = async (scientificName) => {
  try {
    const response = await fetch(
      `${CONFIG.GBIF_API}/species/match?name=${encodeURIComponent(scientificName)}&kingdom=Plantae`
    );
    
    if (!response.ok) throw new Error('GBIF API error');
    
    const data = await response.json();
    return {
      scientificName: data.scientificName,
      family: data.family,
      genus: data.genus,
      species: data.species,
      kingdom: data.kingdom,
      nativeRegions: data.nativeRegions || [],
      gbifKey: data.usageKey
    };
  } catch (error) {
    console.error('GBIF fetch error:', error);
    return null;
  }
};

/**
 * Get species occurrences from GBIF (where the tree is found)
 * @param {number} gbifKey - GBIF species key
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Array>} Occurrence records
 */
export const getSpeciesOccurrences = async (gbifKey, latitude, longitude) => {
  try {
    const response = await fetch(
      `${CONFIG.GBIF_API}/occurrence/search?speciesKey=${gbifKey}&decimalLatitude=${latitude}&decimalLongitude=${longitude}&limit=10`
    );
    
    if (!response.ok) throw new Error('GBIF occurrence error');
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('GBIF occurrence error:', error);
    return [];
  }
};

/**
 * Check if species is native to a location using GBIF
 * @param {string} scientificName - Scientific name
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<boolean>} True if native
 */
export const isSpeciesNative = async (scientificName, latitude, longitude) => {
  try {
    const species = await searchGBIFSpecies(scientificName);
    if (!species) return false;
    
    const occurrences = await getSpeciesOccurrences(species.gbifKey, latitude, longitude);
    return occurrences.length > 0;
  } catch (error) {
    console.error('Native check error:', error);
    return false;
  }
};

/**
 * Search for tree on Trefle API
 * @param {string} scientificName - Scientific name
 * @returns {Promise<Object>} Plant data from Trefle
 */
export const searchTrefleSpecies = async (scientificName) => {
  try {
    const response = await fetch(
      `${CONFIG.TREFLE_API}/plants/search?token=${CONFIG.TREFLE_API_KEY}&q=${encodeURIComponent(scientificName)}`
    );
    
    if (!response.ok) throw new Error('Trefle API error');
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const plant = data.data[0];
      return {
        commonName: plant.common_name,
        scientificName: plant.scientific_name,
        family: plant.family,
        imageUrl: plant.image_url,
        yearDiscovered: plant.year,
        bibliography: plant.bibliography
      };
    }
    return null;
  } catch (error) {
    console.error('Trefle fetch error:', error);
    return null;
  }
};

/**
 * Get detailed plant information from Trefle
 * @param {number} trefleId - Trefle plant ID
 * @returns {Promise<Object>} Detailed plant data
 */
export const getTrefleDetails = async (trefleId) => {
  try {
    const response = await fetch(
      `${CONFIG.TREFLE_API}/plants/${trefleId}?token=${CONFIG.TREFLE_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Trefle details error');
    
    const data = await response.json();
    const plant = data.data;
    
    return {
      growth: plant.growth,
      images: plant.images,
      specifications: plant.specifications,
      distributions: plant.distributions
    };
  } catch (error) {
    console.error('Trefle details error:', error);
    return null;
  }
};

/**
 * Search iNaturalist for tree observations
 * @param {string} scientificName - Scientific name
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Array>} Observation records
 */
export const searchINaturalistObservations = async (scientificName, latitude, longitude, radius = 50) => {
  try {
    const response = await fetch(
      `${CONFIG.INATURALIST_API}/observations?taxon_name=${encodeURIComponent(scientificName)}&lat=${latitude}&lng=${longitude}&radius=${radius}&per_page=20`
    );
    
    if (!response.ok) throw new Error('iNaturalist API error');
    
    const data = await response.json();
    return data.results.map(obs => ({
      id: obs.id,
      observedOn: obs.observed_on,
      location: {
        latitude: obs.geojson.coordinates[1],
        longitude: obs.geojson.coordinates[0]
      },
      photos: obs.photos.map(p => p.url),
      quality: obs.quality_grade
    }));
  } catch (error) {
    console.error('iNaturalist fetch error:', error);
    return [];
  }
};

/**
 * Enrich local tree data with API information
 * @param {Object} localTreeData - Tree from local database
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} Enhanced tree data
 */
export const enrichTreeData = async (localTreeData, latitude, longitude) => {
  if (!CONFIG.ENABLE_API_ENRICHMENT) return localTreeData;
  
  try {
    // Parallel API calls for better performance
    const [gbifData, trefleData, observations] = await Promise.all([
      searchGBIFSpecies(localTreeData.scientificName),
      searchTrefleSpecies(localTreeData.scientificName),
      searchINaturalistObservations(localTreeData.scientificName, latitude, longitude)
    ]);
    
    return {
      ...localTreeData,
      // Add GBIF data
      gbifVerified: !!gbifData,
      taxonomyVerified: gbifData?.family === localTreeData.family,
      
      // Add Trefle data
      alternativeCommonNames: trefleData?.commonName ? [trefleData.commonName] : [],
      imageUrl: trefleData?.imageUrl || null,
      
      // Add observation data
      localObservations: observations.length,
      recentObservations: observations.slice(0, 5),
      observationPhotos: observations.flatMap(o => o.photos).slice(0, 3),
      
      // Metadata
      dataEnriched: true,
      lastEnriched: new Date().toISOString()
    };
  } catch (error) {
    console.error('Data enrichment error:', error);
    return localTreeData;
  }
};

export default {
  searchGBIFSpecies,
  getSpeciesOccurrences,
  isSpeciesNative,
  searchTrefleSpecies,
  getTrefleDetails,
  searchINaturalistObservations,
  enrichTreeData
};