/**
 * Application configuration (reads from .env)
 */
export const CONFIG = {
  OPEN_METEO_API: import.meta.env.VITE_OPEN_METEO_API,
  NOMINATIM_API: import.meta.env.VITE_NOMINATIM_API,
  GBIF_API: import.meta.env.VITE_GBIF_API,
  TREFLE_API: import.meta.env.VITE_TREFLE_API,
  INATURALIST_API: import.meta.env.VITE_INATURALIST_API,

  OPENAI_API: import.meta.env.VITE_OPENAI_API,
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  OPENAI_MODEL: 'gpt-4o',

  TREFLE_API_KEY: import.meta.env.VITE_TREFLE_API_KEY,

  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_TAGLINE: import.meta.env.VITE_APP_TAGLINE,
  HACKATHON_NAME: import.meta.env.VITE_HACKATHON_NAME,

  DEFAULT_LOCATION: {
    latitude: parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE),
    longitude: parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE),
    city: import.meta.env.VITE_DEFAULT_CITY,
    country: import.meta.env.VITE_DEFAULT_COUNTRY
  },

  TOP_RECOMMENDATIONS_COUNT: Number(import.meta.env.VITE_TOP_RECOMMENDATIONS_COUNT),
  MIN_COMPATIBILITY_SCORE: Number(import.meta.env.VITE_MIN_COMPATIBILITY_SCORE),
  USE_LOCAL_DATABASE: import.meta.env.VITE_USE_LOCAL_DATABASE === 'true',
  ENABLE_API_ENRICHMENT: import.meta.env.VITE_ENABLE_API_ENRICHMENT === 'true',
  USE_OPENAI_ENHANCEMENT: import.meta.env.VITE_USE_OPENAI_ENHANCEMENT === 'true',
  ENABLE_MANUAL_LOCATION: true,
};

export default CONFIG;

