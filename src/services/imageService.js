/**
 * Image Service
 * Handles image upload, EXIF extraction, and basic image analysis
 */

import CONFIG from '../constants/config';
import EXIF from 'exif-js';

/**
 * Extract GPS coordinates from image EXIF data (production-ready)
 * Falls back to CONFIG.DEFAULT_LOCATION if no GPS metadata is found
 * @param {File} imageFile - Image file object
 * @returns {Promise<Object>} GPS data (real or fallback)
 */
export const extractGPSFromImage = async (imageFile) => {
  return new Promise((resolve) => {
    try {
      EXIF.getData(imageFile, function () {
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
        const lon = EXIF.getTag(this, 'GPSLongitude');
        const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');
        const alt = EXIF.getTag(this, 'GPSAltitude');
        const date = EXIF.getTag(this, 'DateTime');

        if (!lat || !lon) {
          console.warn('No GPS data found — using default location.');
          resolve({
            latitude: CONFIG.DEFAULT_LOCATION.latitude,
            longitude: CONFIG.DEFAULT_LOCATION.longitude,
            altitude: null,
            timestamp: new Date().toISOString(),
            hasGPS: false,
            source: 'fallback'
          });
          return;
        }

        // Convert GPS coordinates to decimal degrees
        const convertDMS = (degrees, minutes, seconds, direction) => {
          let dd = degrees + minutes / 60 + seconds / 3600;
          if (direction === 'S' || direction === 'W') dd = dd * -1;
          return dd;
        };

        const latitude = convertDMS(lat[0], lat[1], lat[2], latRef);
        const longitude = convertDMS(lon[0], lon[1], lon[2], lonRef);

        resolve({
          latitude,
          longitude,
          altitude: alt || null,
          timestamp: date || new Date().toISOString(),
          hasGPS: true,
          source: 'exif'
        });
      });
    } catch (error) {
      console.error('EXIF extraction error:', error);
      resolve({
        latitude: CONFIG.DEFAULT_LOCATION.latitude,
        longitude: CONFIG.DEFAULT_LOCATION.longitude,
        altitude: null,
        timestamp: new Date().toISOString(),
        hasGPS: false,
        source: 'error-fallback'
      });
    }
  });
};

/**
 * Create image preview URL
 * @param {File} imageFile - Image file object
 * @returns {Promise<string>} Data URL for preview
 */
export const createImagePreview = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];

  if (!file) return { valid: false, error: 'No file provided' };

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or HEIC images.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    };
  }

  return { valid: true, error: null };
};

/**
 * Analyze image for soil type and vegetation (basic color analysis)
 * @param {File} imageFile - Image file to analyze
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeImageBasic = async (imageFile) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Resize for faster processing
          const maxDim = 200;
          const scale = Math.min(maxDim / img.width, maxDim / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          let totalRed = 0,
            totalGreen = 0,
            totalBlue = 0;
          let greenPixels = 0;
          let brownPixels = 0;
          const pixelCount = pixels.length / 4;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            totalRed += r;
            totalGreen += g;
            totalBlue += b;

            if (g > r && g > b && g > 100) greenPixels++; // vegetation
            if (r > 100 && g > 60 && b < 100 && Math.abs(r - g) < 50) brownPixels++; // soil
          }

          const avgRed = totalRed / pixelCount;
          const avgGreen = totalGreen / pixelCount;
          const avgBlue = totalBlue / pixelCount;

          const greenPercentage = (greenPixels / pixelCount) * 100;
          const brownPercentage = (brownPixels / pixelCount) * 100;

          let vegetationLevel;
          if (greenPercentage > 40) vegetationLevel = 'dense';
          else if (greenPercentage > 20) vegetationLevel = 'moderate';
          else if (greenPercentage > 5) vegetationLevel = 'sparse';
          else vegetationLevel = 'bare';

          let soilType;
          if (avgRed > 120 && brownPercentage > 30) soilType = 'clay';
          else if (avgRed > 100 && avgGreen > 80) soilType = 'loam';
          else if (avgRed > 150) soilType = 'sandy';
          else soilType = 'loam';

          resolve({
            soilType,
            vegetationLevel,
            landCondition:
              vegetationLevel === 'bare' ? 'cleared' : 'vegetated',
            colorAnalysis: {
              avgRed: Math.round(avgRed),
              avgGreen: Math.round(avgGreen),
              avgBlue: Math.round(avgBlue),
              greenPercentage: Math.round(greenPercentage),
              brownPercentage: Math.round(brownPercentage)
            },
            confidence: 'low',
            method: 'color-analysis',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Image analysis error:', error);
          resolve({
            soilType: 'loam',
            vegetationLevel: 'unknown',
            landCondition: 'unknown',
            error: error.message
          });
        }
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(imageFile);
  });
};

/**
 * Compress image for storage
 * @param {File} imageFile - Original image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (
  imageFile,
  maxWidth = 1200,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

/**
 * Get image metadata
 * @param {File} imageFile - Image file
 * @returns {Object} Image metadata
 */
export const getImageMetadata = (imageFile) => {
  return {
    name: imageFile.name,
    size: imageFile.size,
    type: imageFile.type,
    lastModified: new Date(imageFile.lastModified).toISOString(),
    sizeKB: Math.round(imageFile.size / 1024),
    sizeMB: (imageFile.size / (1024 * 1024)).toFixed(2)
  };
};

export default {
  extractGPSFromImage,
  createImagePreview,
  validateImageFile,
  analyzeImageBasic,
  compressImage,
  getImageMetadata
};
