/**
 * IMPROVED Image Service - Better detection and diagnostics
 * Fixes for common issues causing poor results
 */

import CONFIG from '../constants/config';
import EXIF from 'exif-js';

/**
 * Enhanced compression with quality preservation
 */
const compressImageForProcessing = async (imageFile, maxDimension = 1200, quality = 0.92) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        let width = img.width;
        let height = img.height;
        
        // Less aggressive compression for better analysis
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
        
        // Better image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            console.log(`📸 Compressed: ${(blob.size / 1024).toFixed(1)}KB (${width}x${height})`);
            resolve(blob);
          }, 
          'image/jpeg', 
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
};

/**
 * IMPROVED: GPS extraction with better timeout and fallback
 */
export const extractGPSFromImage = async (imageFile) => {
  // Get fallback location from CONFIG
  const fallbackData = {
    latitude: CONFIG.DEFAULT_LOCATION?.latitude || -1.2921,
    longitude: CONFIG.DEFAULT_LOCATION?.longitude || 36.8219,
    altitude: null,
    timestamp: new Date().toISOString(),
    hasGPS: false,
    source: 'fallback',
    reason: 'No GPS data in image',
    needsManualLocation: true // Flag to trigger manual location picker
  };

  return new Promise((resolve) => {
    let hasResolved = false;
    
    // Longer timeout for slower devices
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        console.warn('⏱️ GPS extraction timeout (5s) - using fallback');
        resolve({ ...fallbackData, reason: 'Timeout' });
      }
    }, 5000);

    try {
      EXIF.getData(imageFile, function () {
        clearTimeout(timeoutId);
        
        if (hasResolved) return;
        
        const allTags = EXIF.getAllTags(this);
        console.log('📋 EXIF Tags Found:', Object.keys(allTags).length);
        
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
        const lon = EXIF.getTag(this, 'GPSLongitude');
        const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');
        const alt = EXIF.getTag(this, 'GPSAltitude');
        const date = EXIF.getTag(this, 'DateTime');

        if (!lat || !lon) {
          console.warn('📍 No GPS coordinates in EXIF');
          hasResolved = true;
          resolve({ ...fallbackData, reason: 'No GPS in EXIF' });
          return;
        }

        // Convert GPS coordinates
        const convertDMS = (degrees, minutes, seconds, direction) => {
          let dd = degrees + minutes / 60 + seconds / 3600;
          if (direction === 'S' || direction === 'W') dd = dd * -1;
          return dd;
        };

        const latitude = convertDMS(lat[0], lat[1], lat[2], latRef);
        const longitude = convertDMS(lon[0], lon[1], lon[2], lonRef);

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude) || 
            Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          console.error('❌ Invalid GPS coordinates:', { latitude, longitude });
          hasResolved = true;
          resolve({ ...fallbackData, reason: 'Invalid coordinates' });
          return;
        }

        console.log('✅ GPS extracted:', { latitude, longitude });
        
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
        console.error('❌ EXIF error:', error);
        hasResolved = true;
        resolve({ ...fallbackData, reason: error.message });
      }
    }
  });
};

/**
 * IMPROVED: Better image analysis with more sophisticated algorithms
 */
export const analyzeImageBasic = async (imageFile) => {
  return new Promise(async (resolve) => {
    try {
      // Use larger size for better analysis
      const compressed = await compressImageForProcessing(imageFile, 600, 0.90);
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            // Use full image for better analysis
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // Enhanced analysis
            let totalR = 0, totalG = 0, totalB = 0;
            let greenPixels = 0, brownPixels = 0, grayPixels = 0;
            const pixelCount = pixels.length / 4;
            
            // Sample more pixels for better accuracy
            const sampleRate = Math.max(1, Math.floor(pixelCount / 10000));
            let sampledCount = 0;

            for (let i = 0; i < pixels.length; i += sampleRate * 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];

              totalR += r;
              totalG += g;
              totalB += b;
              sampledCount++;

              // More accurate vegetation detection
              const isGreen = g > r + 10 && g > b + 10 && g > 80;
              if (isGreen) greenPixels++;

              // Better brown/soil detection
              const isBrown = r > 80 && r < 200 && 
                             g > 50 && g < 180 && 
                             b > 20 && b < 150 &&
                             Math.abs(r - g) < 60;
              if (isBrown) brownPixels++;

              // Gray/rock detection
              const isGray = Math.abs(r - g) < 20 && 
                            Math.abs(g - b) < 20 && 
                            r > 100 && r < 200;
              if (isGray) grayPixels++;
            }

            const avgR = totalR / sampledCount;
            const avgG = totalG / sampledCount;
            const avgB = totalB / sampledCount;

            const greenPct = (greenPixels / sampledCount) * 100;
            const brownPct = (brownPixels / sampledCount) * 100;
            const grayPct = (grayPixels / sampledCount) * 100;

            console.log('🎨 Color Analysis:', {
              green: greenPct.toFixed(1) + '%',
              brown: brownPct.toFixed(1) + '%',
              gray: grayPct.toFixed(1) + '%',
              avgRGB: `${avgR.toFixed(0)},${avgG.toFixed(0)},${avgB.toFixed(0)}`
            });

            // Improved vegetation level detection
            let vegetationLevel;
            if (greenPct > 35) vegetationLevel = 'dense';
            else if (greenPct > 18) vegetationLevel = 'moderate';
            else if (greenPct > 5) vegetationLevel = 'sparse';
            else vegetationLevel = 'bare';

            // Better soil type detection
            let soilType;
            if (grayPct > 30) {
              soilType = 'rocky';
            } else if (avgR > 140 && brownPct > 25) {
              soilType = 'sandy';
            } else if (avgR > 100 && avgR < 140 && brownPct > 20) {
              soilType = 'clay';
            } else if (avgG > avgR - 30 && brownPct > 15) {
              soilType = 'loam';
            } else {
              soilType = 'loam'; // default
            }

            // Calculate confidence
            const dominantFeature = Math.max(greenPct, brownPct, grayPct);
            const confidence = dominantFeature > 40 ? 'high' : 
                             dominantFeature > 20 ? 'medium' : 'low';

            const result = {
              soilType,
              vegetationLevel,
              landCondition: vegetationLevel === 'bare' || vegetationLevel === 'sparse' 
                ? 'suitable' : 'requires-clearing',
              colorAnalysis: {
                avgRed: Math.round(avgR),
                avgGreen: Math.round(avgG),
                avgBlue: Math.round(avgB),
                greenPercentage: Math.round(greenPct * 10) / 10,
                brownPercentage: Math.round(brownPct * 10) / 10,
                grayPercentage: Math.round(grayPct * 10) / 10
              },
              confidence,
              method: 'enhanced-color-analysis',
              timestamp: new Date().toISOString(),
              imageSize: {
                width: canvas.width,
                height: canvas.height,
                pixels: pixelCount
              }
            };

            console.log('✅ Analysis complete:', result);
            resolve(result);

          } catch (error) {
            console.error('❌ Analysis error:', error);
            resolve(getDefaultAnalysis(error.message));
          }
        };
        
        img.onerror = () => {
          console.error('❌ Image load error');
          resolve(getDefaultAnalysis('Failed to load image'));
        };
        
        img.src = e.target.result;
      };

      reader.onerror = () => {
        resolve(getDefaultAnalysis('Failed to read file'));
      };
      
      reader.readAsDataURL(compressed);

    } catch (error) {
      console.error('❌ Pre-analysis error:', error);
      resolve(getDefaultAnalysis(error.message));
    }
  });
};

/**
 * Default analysis fallback
 */
const getDefaultAnalysis = (errorMsg = '') => {
  return {
    soilType: 'loam',
    vegetationLevel: 'unknown',
    landCondition: 'unknown',
    colorAnalysis: {
      avgRed: 128,
      avgGreen: 128,
      avgBlue: 128,
      greenPercentage: 0,
      brownPercentage: 0,
      grayPercentage: 0
    },
    confidence: 'none',
    method: 'fallback',
    error: errorMsg,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create preview (unchanged but with better quality)
 */
export const createImagePreview = async (imageFile) => {
  const compressed = await compressImageForProcessing(imageFile, 600, 0.85);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
};

/**
 * Validate image file (enhanced)
 */
export const validateImageFile = (file) => {
  const maxSize = 15 * 1024 * 1024; // Increased to 15MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Please upload JPEG, PNG, or HEIC images.`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 15MB.`
    };
  }

  console.log(`✅ File validated: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  return { valid: true, error: null };
};

/**
 * Get enhanced image metadata
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