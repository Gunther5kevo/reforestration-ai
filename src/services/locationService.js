/**
 * Location Service
 * Handles geocoding, reverse geocoding, location validation, and distance calculations
 */

import CONFIG from '../constants/config';

/**
 * Reverse geocode coordinates to location name
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} Location details
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // Validate coordinates
    if (!isValidCoordinates(latitude, longitude)) {
      throw new Error('Invalid coordinates');
    }
    
    const url = `${CONFIG.NOMINATIM_API}?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReForestAI/1.0' // Nominatim requires User-Agent
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      city: extractCity(data.address),
      county: data.address?.county || '',
      state: data.address?.state || data.address?.region || '',
      country: data.address?.country || 'Unknown',
      countryCode: data.address?.country_code?.toUpperCase() || '',
      displayName: data.display_name || '',
      address: data.address,
      coordinates: {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon)
      },
      boundingBox: data.boundingbox,
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Return fallback location
    return {
      success: false,
      error: error.message,
      city: 'Unknown',
      county: '',
      state: '',
      country: 'Unknown',
      countryCode: '',
      displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      coordinates: { latitude, longitude },
      isFallback: true
    };
  }
};

/**
 * Extract city name from OpenStreetMap address object
 * @param {Object} address - Address object from Nominatim
 * @returns {string} City name
 */
const extractCity = (address) => {
  if (!address) return 'Unknown';
  
  // Priority order for city extraction
  return address.city 
    || address.town 
    || address.village 
    || address.municipality
    || address.suburb
    || address.county
    || 'Unknown';
};

/**
 * Forward geocode (location name to coordinates)
 * @param {string} locationName - Location name or address
 * @returns {Promise<Object>} Coordinates and location details
 */
export const forwardGeocode = async (locationName) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&addressdetails=1&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReForestAI/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding search error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Location not found');
    }
    
    const result = data[0];
    
    return {
      success: true,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      },
      displayName: result.display_name,
      address: result.address,
      boundingBox: result.boundingbox,
      importance: result.importance
    };
    
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} True if valid
 */
export const isValidCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    return false;
  }
  
  if (lon < -180 || lon > 180) {
    return false;
  }
  
  return true;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in km
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get region/continent from country code
 * @param {string} countryCode - ISO country code (e.g., 'KE')
 * @returns {string} Region name
 */
export const getRegionFromCountry = (countryCode) => {
  const regionMap = {
    // Africa
    'KE': 'East Africa',
    'UG': 'East Africa',
    'TZ': 'East Africa',
    'RW': 'East Africa',
    'BI': 'East Africa',
    'ET': 'East Africa',
    'SO': 'East Africa',
    'NG': 'West Africa',
    'GH': 'West Africa',
    'ZA': 'Southern Africa',
    'EG': 'North Africa',
    
    // Asia
    'IN': 'South Asia',
    'CN': 'East Asia',
    'JP': 'East Asia',
    'TH': 'Southeast Asia',
    'ID': 'Southeast Asia',
    
    // Europe
    'GB': 'Western Europe',
    'DE': 'Central Europe',
    'FR': 'Western Europe',
    
    // Americas
    'US': 'North America',
    'CA': 'North America',
    'MX': 'Central America',
    'BR': 'South America',
    
    // Oceania
    'AU': 'Oceania',
    'NZ': 'Oceania'
  };
  
  return regionMap[countryCode?.toUpperCase()] || 'Unknown Region';
};

/**
 * Detect climate zone from coordinates
 * @param {number} latitude - Location latitude
 * @returns {string} Climate zone
 */
export const detectClimateZone = (latitude) => {
  const absLat = Math.abs(latitude);
  
  if (absLat >= 0 && absLat < 23.5) {
    return 'tropical';
  } else if (absLat >= 23.5 && absLat < 35) {
    return 'subtropical';
  } else if (absLat >= 35 && absLat < 60) {
    return 'temperate';
  } else {
    return 'polar';
  }
};

/**
 * Get altitude/elevation for coordinates
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<number>} Elevation in meters
 */
export const getElevation = async (latitude, longitude) => {
  try {
    // Using Open-Elevation API
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Elevation API error');
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].elevation;
    }
    
    return null;
  } catch (error) {
    console.error('Elevation fetch error:', error);
    return null;
  }
};

/**
 * Check if location is suitable for reforestation
 * @param {Object} locationData - Location information
 * @param {number} elevation - Elevation in meters (optional)
 * @returns {Object} Suitability assessment
 */
export const assessLocationSuitability = (locationData, elevation = null) => {
  const warnings = [];
  const recommendations = [];
  let suitabilityScore = 100;
  
  // Check if location data is valid
  if (!locationData.success) {
    warnings.push({
      type: 'data-unavailable',
      message: 'Location data unavailable',
      severity: 'medium'
    });
    suitabilityScore -= 20;
  }
  
  // Check country/region
  const region = getRegionFromCountry(locationData.countryCode);
  if (region === 'Unknown Region') {
    warnings.push({
      type: 'unknown-region',
      message: 'Region not identified - local species data may be limited',
      severity: 'low'
    });
    suitabilityScore -= 10;
  }
  
  // Check elevation (if available)
  if (elevation !== null) {
    if (elevation > 3000) {
      warnings.push({
        type: 'high-altitude',
        message: 'High altitude may limit tree species options',
        severity: 'medium'
      });
      suitabilityScore -= 15;
      recommendations.push('Consider alpine and cold-hardy species');
    } else if (elevation < 0) {
      warnings.push({
        type: 'below-sea-level',
        message: 'Below sea level - check for salinity and waterlogging',
        severity: 'high'
      });
      suitabilityScore -= 25;
      recommendations.push('Ensure proper drainage and salt-tolerant species');
    }
  }
  
  // Climate zone assessment
  const climateZone = detectClimateZone(locationData.coordinates.latitude);
  if (climateZone === 'polar') {
    warnings.push({
      type: 'polar-climate',
      message: 'Polar climate presents significant challenges',
      severity: 'high'
    });
    suitabilityScore -= 30;
  }
  
  // Urban area check (based on city detection)
  if (locationData.city && locationData.city !== 'Unknown') {
    recommendations.push('Urban forestry considerations may apply');
    recommendations.push('Check local regulations and available space');
  }
  
  // Determine overall suitability
  let suitabilityLevel;
  if (suitabilityScore >= 80) {
    suitabilityLevel = 'excellent';
  } else if (suitabilityScore >= 60) {
    suitabilityLevel = 'good';
  } else if (suitabilityScore >= 40) {
    suitabilityLevel = 'moderate';
  } else {
    suitabilityLevel = 'challenging';
  }
  
  return {
    suitabilityScore,
    suitabilityLevel,
    climateZone,
    region,
    warnings,
    recommendations,
    elevation,
    assessedAt: new Date().toISOString()
  };
};

/**
 * Format coordinates for display
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} decimals - Decimal places (default: 4)
 * @returns {Object} Formatted coordinates
 */
export const formatCoordinates = (latitude, longitude, decimals = 4) => {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  
  return {
    decimal: `${latitude.toFixed(decimals)}, ${longitude.toFixed(decimals)}`,
    formatted: `${Math.abs(latitude).toFixed(decimals)}°${latDirection}, ${Math.abs(longitude).toFixed(decimals)}°${lonDirection}`,
    dms: convertToDMS(latitude, longitude)
  };
};

/**
 * Convert decimal degrees to DMS (Degrees Minutes Seconds)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Object} DMS format
 */
const convertToDMS = (latitude, longitude) => {
  const toDMS = (decimal, isLatitude) => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);
    
    const direction = isLatitude 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };
  
  return {
    latitude: toDMS(latitude, true),
    longitude: toDMS(longitude, false),
    combined: `${toDMS(latitude, true)} ${toDMS(longitude, false)}`
  };
};

/**
 * Get nearby cities/towns
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} Nearby locations
 */
export const getNearbyLocations = async (latitude, longitude, radiusKm = 50) => {
  try {
    // Using Overpass API to find nearby places
    const query = `
      [out:json];
      (
        node["place"~"city|town|village"](around:${radiusKm * 1000},${latitude},${longitude});
      );
      out body;
    `;
    
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Overpass API error');
    }
    
    const data = await response.json();
    
    return data.elements.map(place => ({
      name: place.tags.name,
      type: place.tags.place,
      coordinates: {
        latitude: place.lat,
        longitude: place.lon
      },
      distance: calculateDistance(latitude, longitude, place.lat, place.lon),
      population: place.tags.population || null
    })).sort((a, b) => a.distance - b.distance);
    
  } catch (error) {
    console.error('Nearby locations error:', error);
    return [];
  }
};

/**
 * Validate and sanitize location input
 * @param {string} input - User input for location
 * @returns {Object} Validation result
 */
export const validateLocationInput = (input) => {
  if (!input || input.trim() === '') {
    return {
      valid: false,
      error: 'Location input is required'
    };
  }
  
  const trimmed = input.trim();
  
  // Check if it's coordinates format
  const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  if (coordPattern.test(trimmed)) {
    const [lat, lon] = trimmed.split(',').map(s => parseFloat(s.trim()));
    if (isValidCoordinates(lat, lon)) {
      return {
        valid: true,
        type: 'coordinates',
        coordinates: { latitude: lat, longitude: lon }
      };
    } else {
      return {
        valid: false,
        error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180'
      };
    }
  }
  
  // Assume it's a location name
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: 'Location name too short'
    };
  }
  
  return {
    valid: true,
    type: 'name',
    locationName: trimmed
  };
};

export default {
  reverseGeocode,
  forwardGeocode,
  isValidCoordinates,
  calculateDistance,
  getRegionFromCountry,
  detectClimateZone,
  getElevation,
  assessLocationSuitability,
  formatCoordinates,
  getNearbyLocations,
  validateLocationInput
};