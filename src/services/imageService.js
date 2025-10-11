/**
 * Optimized Image Service - FIXED
 * Performance improvements for mobile
 */

import CONFIG from '../constants/config';
import EXIF from 'exif-js';

/**
 * Compress image BEFORE processing (critical for mobile)
 */
const compressImageForProcessing = async (imageFile, maxDimension = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => resolve(blob), 
          'image/jpeg', 
          0.85
        );
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

/**
 * FIXED: Extract GPS with proper timeout handling
 */
export const extractGPSFromImage = async (imageFile) => {
  const fallbackData = {
    latitude: CONFIG.DEFAULT_LOCATION.latitude,
    longitude: CONFIG.DEFAULT_LOCATION.longitude,
    altitude: null,
    timestamp: new Date().toISOString(),
    hasGPS: false,
    source: 'fallback'
  };

  return new Promise((resolve) => {
    let hasResolved = false;
    
    // Timeout after 3 seconds
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        console.warn('⏱️ EXIF extraction timeout - using fallback location');
        resolve(fallbackData);
      }
    }, 3000);

    try {
      EXIF.getData(imageFile, function () {
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        if (hasResolved) return; // Already timed out
        
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
        const lon = EXIF.getTag(this, 'GPSLongitude');
        const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');
        const alt = EXIF.getTag(this, 'GPSAltitude');
        const date = EXIF.getTag(this, 'DateTime');

        if (!lat || !lon) {
          console.warn('📍 No GPS data in EXIF - using fallback location');
          hasResolved = true;
          resolve(fallbackData);
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

        console.log('✅ GPS data extracted:', { latitude, longitude });
        
        hasResolved = true;
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
      clearTimeout(timeoutId);
      if (!hasResolved) {
        console.error('❌ EXIF extraction error:', error);
        hasResolved = true;
        resolve(fallbackData);
      }
    }
  });
};

/**
 * Create image preview URL (optimized)
 */
export const createImagePreview = async (imageFile) => {
  const compressed = await compressImageForProcessing(imageFile, 400);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
};

/**
 * Validate image file
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
 * Optimized image analysis
 */
export const analyzeImageBasic = async (imageFile) => {
  return new Promise(async (resolve) => {
    try {
      const compressed = await compressImageForProcessing(imageFile, 200);
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const maxDim = 150;
            const scale = Math.min(maxDim / img.width, maxDim / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            let totalRed = 0, totalGreen = 0, totalBlue = 0;
            let greenPixels = 0, brownPixels = 0;
            const pixelCount = pixels.length / 4;

            for (let i = 0; i < pixels.length; i += 16) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];

              totalRed += r;
              totalGreen += g;
              totalBlue += b;

              if (g > r && g > b && g > 100) greenPixels++;
              if (r > 100 && g > 60 && b < 100 && Math.abs(r - g) < 50) brownPixels++;
            }

            const sampledCount = pixelCount / 4;
            const avgRed = totalRed / sampledCount;
            const avgGreen = totalGreen / sampledCount;
            const avgBlue = totalBlue / sampledCount;

            const greenPercentage = (greenPixels / sampledCount) * 100;
            const brownPercentage = (brownPixels / sampledCount) * 100;

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
              landCondition: vegetationLevel === 'bare' ? 'cleared' : 'vegetated',
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

      reader.readAsDataURL(compressed);
    } catch (error) {
      resolve({
        soilType: 'loam',
        vegetationLevel: 'unknown',
        landCondition: 'unknown',
        error: error.message
      });
    }
  });
};

/**
 * Get image metadata
 */
export const getImageMetadata = (file) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
    sizeKB: Math.round(file.size / 1024),
    sizeMB: (file.size / (1024 * 1024)).toFixed(2)
  };
};

export default {
  extractGPSFromImage,
  createImagePreview,
  validateImageFile,
  analyzeImageBasic,
  getImageMetadata
};