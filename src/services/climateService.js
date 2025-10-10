/**
 * Climate Service
 * Fetches and processes climate data from Open-Meteo API
 * Handles weather forecasts, historical data, and climate analysis
 */

import CONFIG from '../constants/config';

/**
 * Fetch current and forecast climate data
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} Climate data
 */
export const fetchClimateData = async (latitude, longitude) => {
  try {
    const url = `${CONFIG.OPEN_METEO_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,sunrise,sunset,wind_speed_10m_max&timezone=auto&forecast_days=14`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Climate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      current: data.current,
      daily: data.daily,
      timezone: data.timezone,
      elevation: data.elevation,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Climate data fetch error:', error);
    return {
      success: false,
      error: error.message,
      fallbackData: getMockClimateData(latitude, longitude)
    };
  }
};

/**
 * Fetch historical climate data (past year)
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} Historical climate data
 */
export const fetchHistoricalClimate = async (latitude, longitude) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Historical API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      daily: data.daily,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Historical climate fetch error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate annual rainfall estimate from current data
 * @param {Object} dailyData - Daily precipitation data
 * @returns {number} Estimated annual rainfall in mm
 */
export const calculateAnnualRainfall = (dailyData) => {
  if (!dailyData || !dailyData.precipitation_sum) {
    return 800; // Default fallback
  }
  
  const precipArray = dailyData.precipitation_sum;
  const avgDailyPrecip = precipArray.reduce((sum, val) => sum + val, 0) / precipArray.length;
  
  // Estimate annual rainfall
  return Math.round(avgDailyPrecip * 365);
};

/**
 * Calculate average temperature from daily data
 * @param {Object} dailyData - Daily temperature data
 * @returns {Object} Average, min, and max temperatures
 */
export const calculateTemperatureStats = (dailyData) => {
  if (!dailyData || !dailyData.temperature_2m_max || !dailyData.temperature_2m_min) {
    return {
      average: 20,
      max: 25,
      min: 15
    };
  }
  
  const maxTemps = dailyData.temperature_2m_max;
  const minTemps = dailyData.temperature_2m_min;
  
  const avgMax = maxTemps.reduce((sum, val) => sum + val, 0) / maxTemps.length;
  const avgMin = minTemps.reduce((sum, val) => sum + val, 0) / minTemps.length;
  
  return {
    average: Math.round((avgMax + avgMin) / 2),
    max: Math.round(Math.max(...maxTemps)),
    min: Math.round(Math.min(...minTemps)),
    avgMax: Math.round(avgMax),
    avgMin: Math.round(avgMin)
  };
};

/**
 * Analyze climate suitability for reforestation
 * @param {Object} climateData - Climate data object
 * @returns {Object} Climate analysis
 */
export const analyzeClimate = (climateData) => {
  if (!climateData || !climateData.current) {
    return null;
  }
  
  const { current, daily } = climateData;
  const annualRainfall = calculateAnnualRainfall(daily);
  const tempStats = calculateTemperatureStats(daily);
  
  // Determine climate classification
  let climateType;
  if (annualRainfall < 400) {
    climateType = 'arid';
  } else if (annualRainfall < 800) {
    climateType = 'semi-arid';
  } else if (annualRainfall < 1500) {
    climateType = 'sub-humid';
  } else if (annualRainfall < 2000) {
    climateType = 'humid';
  } else {
    climateType = 'very-humid';
  }
  
  // Determine temperature classification
  let tempZone;
  if (tempStats.average < 10) {
    tempZone = 'cool';
  } else if (tempStats.average < 20) {
    tempZone = 'temperate';
  } else if (tempStats.average < 28) {
    tempZone = 'warm';
  } else {
    tempZone = 'hot';
  }
  
  // Calculate growing season length (simplified)
  const growingSeasonMonths = tempStats.average > 10 ? 12 : Math.round((tempStats.average / 10) * 12);
  
  // Soil moisture assessment
  const soilMoisture = current.soil_moisture_0_to_1cm || 0.3;
  let moistureLevel;
  if (soilMoisture < 0.2) {
    moistureLevel = 'dry';
  } else if (soilMoisture < 0.4) {
    moistureLevel = 'moderate';
  } else if (soilMoisture < 0.6) {
    moistureLevel = 'moist';
  } else {
    moistureLevel = 'wet';
  }
  
  return {
    climateType,
    tempZone,
    annualRainfall,
    temperatureStats: tempStats,
    growingSeasonMonths,
    soilMoisture: {
      value: soilMoisture,
      percentage: Math.round(soilMoisture * 100),
      level: moistureLevel
    },
    currentConditions: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      windSpeed: current.wind_speed_10m,
      soilTemp: current.soil_temperature_0cm
    },
    suitability: {
      forReforestation: annualRainfall > 400 && tempStats.average > 10 && tempStats.average < 35,
      bestPlantingMonths: determineBestPlantingMonths(annualRainfall, tempStats),
      challenges: identifyClimateChallenges(climateType, tempZone, annualRainfall)
    }
  };
};

/**
 * Determine best planting months based on climate
 * @param {number} rainfall - Annual rainfall
 * @param {Object} tempStats - Temperature statistics
 * @returns {Array} Best months for planting
 */
const determineBestPlantingMonths = (rainfall, tempStats) => {
  // Simplified logic - in production, use more detailed seasonal data
  if (rainfall < 800) {
    // Arid/Semi-arid: Plant during rainy season
    return ['March', 'April', 'May'];
  } else if (rainfall > 1500) {
    // High rainfall: Plant during drier months
    return ['January', 'February', 'August'];
  } else {
    // Moderate rainfall: Plant at start of rains
    return ['March', 'April', 'May', 'October', 'November'];
  }
};

/**
 * Identify climate challenges for tree planting
 * @param {string} climateType - Climate classification
 * @param {string} tempZone - Temperature zone
 * @param {number} rainfall - Annual rainfall
 * @returns {Array} Array of challenges
 */
const identifyClimateChallenges = (climateType, tempZone, rainfall) => {
  const challenges = [];
  
  if (climateType === 'arid' || climateType === 'semi-arid') {
    challenges.push({
      type: 'drought',
      severity: 'high',
      description: 'Low rainfall requires drought-resistant species',
      mitigation: 'Use drip irrigation during establishment phase'
    });
  }
  
  if (tempZone === 'hot') {
    challenges.push({
      type: 'heat-stress',
      severity: 'medium',
      description: 'High temperatures may stress young seedlings',
      mitigation: 'Provide shade and mulch around seedlings'
    });
  }
  
  if (rainfall > 2000) {
    challenges.push({
      type: 'waterlogging',
      severity: 'medium',
      description: 'Excessive rainfall may cause root rot',
      mitigation: 'Ensure good drainage and select flood-tolerant species'
    });
  }
  
  if (tempZone === 'cool') {
    challenges.push({
      type: 'frost',
      severity: 'medium',
      description: 'Low temperatures may damage young plants',
      mitigation: 'Plant frost-hardy species and protect seedlings'
    });
  }
  
  return challenges;
};

/**
 * Format climate data for charts
 * @param {Object} dailyData - Daily climate data
 * @param {number} days - Number of days to format
 * @returns {Array} Formatted data for charts
 */
export const formatClimateForCharts = (dailyData, days = 7) => {
  if (!dailyData || !dailyData.time) {
    return [];
  }
  
  return dailyData.time.slice(0, days).map((date, idx) => ({
    date: new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    fullDate: date,
    maxTemp: dailyData.temperature_2m_max?.[idx] || 0,
    minTemp: dailyData.temperature_2m_min?.[idx] || 0,
    avgTemp: dailyData.temperature_2m_max?.[idx] && dailyData.temperature_2m_min?.[idx]
      ? Math.round((dailyData.temperature_2m_max[idx] + dailyData.temperature_2m_min[idx]) / 2)
      : 0,
    rainfall: dailyData.precipitation_sum?.[idx] || 0,
    windSpeed: dailyData.wind_speed_10m_max?.[idx] || 0
  }));
};

/**
 * Get weather description from code
 * @param {number} code - Weather code from Open-Meteo
 * @returns {Object} Weather description and icon
 */
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: { description: 'Clear sky', icon: '☀️', category: 'clear' },
    1: { description: 'Mainly clear', icon: '🌤️', category: 'partly-cloudy' },
    2: { description: 'Partly cloudy', icon: '⛅', category: 'partly-cloudy' },
    3: { description: 'Overcast', icon: '☁️', category: 'cloudy' },
    45: { description: 'Foggy', icon: '🌫️', category: 'fog' },
    48: { description: 'Depositing rime fog', icon: '🌫️', category: 'fog' },
    51: { description: 'Light drizzle', icon: '🌦️', category: 'rain' },
    53: { description: 'Moderate drizzle', icon: '🌦️', category: 'rain' },
    55: { description: 'Dense drizzle', icon: '🌧️', category: 'rain' },
    61: { description: 'Slight rain', icon: '🌧️', category: 'rain' },
    63: { description: 'Moderate rain', icon: '🌧️', category: 'rain' },
    65: { description: 'Heavy rain', icon: '⛈️', category: 'heavy-rain' },
    80: { description: 'Slight rain showers', icon: '🌦️', category: 'rain' },
    81: { description: 'Moderate rain showers', icon: '🌧️', category: 'rain' },
    82: { description: 'Violent rain showers', icon: '⛈️', category: 'heavy-rain' },
    95: { description: 'Thunderstorm', icon: '⛈️', category: 'storm' },
    96: { description: 'Thunderstorm with hail', icon: '⛈️', category: 'storm' },
    99: { description: 'Thunderstorm with heavy hail', icon: '⛈️', category: 'storm' }
  };
  
  return weatherCodes[code] || { description: 'Unknown', icon: '❓', category: 'unknown' };
};

/**
 * Mock climate data for testing/fallback
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Object} Mock climate data
 */
const getMockClimateData = (latitude, longitude) => {
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });
  
  return {
    success: true,
    isMock: true,
    current: {
      temperature_2m: 22,
      relative_humidity_2m: 65,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 12,
      soil_temperature_0cm: 20,
      soil_moisture_0_to_1cm: 0.35
    },
    daily: {
      time: dates,
      temperature_2m_max: [26, 27, 25, 24, 26, 28, 27, 26, 25, 27, 28, 26, 25, 27],
      temperature_2m_min: [16, 17, 15, 16, 17, 18, 16, 15, 16, 17, 18, 16, 15, 17],
      precipitation_sum: [0, 2, 5, 0, 0, 1, 3, 0, 0, 2, 4, 1, 0, 3],
      weather_code: [1, 61, 63, 2, 0, 51, 61, 1, 2, 61, 63, 51, 1, 61],
      wind_speed_10m_max: [15, 18, 20, 12, 10, 16, 19, 14, 11, 17, 21, 15, 12, 18]
    },
    timezone: 'Africa/Nairobi',
    elevation: 1795,
    coordinates: { latitude, longitude },
    fetchedAt: new Date().toISOString()
  };
};

/**
 * Check if climate data is stale (older than 1 hour)
 * @param {string} fetchedAt - ISO timestamp of when data was fetched
 * @returns {boolean} True if data is stale
 */
export const isClimateDataStale = (fetchedAt) => {
  if (!fetchedAt) return true;
  
  const oneHour = 60 * 60 * 1000; // milliseconds
  const fetchTime = new Date(fetchedAt).getTime();
  const now = Date.now();
  
  return (now - fetchTime) > oneHour;
};

/**
 * Retry failed climate fetch with exponential backoff
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Climate data
 */
export const fetchClimateWithRetry = async (latitude, longitude, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await fetchClimateData(latitude, longitude);
      if (data.success) {
        return data;
      }
      lastError = data.error;
    } catch (error) {
      lastError = error.message;
    }
    
    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed, return mock data
  console.warn(`Climate fetch failed after ${maxRetries} attempts: ${lastError}`);
  return getMockClimateData(latitude, longitude);
};

export default {
  fetchClimateData,
  fetchHistoricalClimate,
  calculateAnnualRainfall,
  calculateTemperatureStats,
  analyzeClimate,
  formatClimateForCharts,
  getWeatherDescription,
  isClimateDataStale,
  fetchClimateWithRetry
};