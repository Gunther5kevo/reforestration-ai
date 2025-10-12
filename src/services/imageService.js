/**
 * FIXED Image Service with Improved Nature Validation
 * - Better skin tone detection (reduces false positives from soil)
 * - Weighted decision logic (natural colors override skin detection)
 * - More lenient thresholds
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
 * IMPROVED: Better skin tone detection that reduces false positives from soil
 */
const isSkinTone = (r, g, b) => {
  // More strict skin tone detection to avoid soil false positives
  const inRange = r > 95 && r < 255 && 
                  g > 40 && g < 220 && 
                  b > 20 && b < 200;
  
  if (!inRange) return false;
  
  // Skin should have R > G > B with specific ratios
  const rGdiff = r - g;
  const gBdiff = g - b;
  
  // Soil tends to have similar R and G values, skin has more separation
  const isSkinRatio = rGdiff > 15 && rGdiff < 80 && gBdiff > 10 && gBdiff < 70;
  
  // Additional check: skin tones cluster in a specific range
  const avgValue = (r + g + b) / 3;
  const isSkinBrightness = avgValue > 100 && avgValue < 220;
  
  // Must pass both ratio and brightness checks
  return isSkinRatio && isSkinBrightness;
};

/**
 * IMPROVED: Validate if image appears to be outdoor/nature related
 */
export const validateNatureImage = async (imageFile) => {
  return new Promise(async (resolve) => {
    try {
      const compressed = await compressImageForProcessing(imageFile, 400, 0.85);
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // Analysis counters
            let naturalColors = 0;
            let artificialColors = 0;
            let skinTones = 0;
            let vividColors = 0;
            let whitePixels = 0;
            let blackPixels = 0;
            
            const pixelCount = pixels.length / 4;
            const sampleRate = Math.max(1, Math.floor(pixelCount / 5000));
            let sampledCount = 0;

            for (let i = 0; i < pixels.length; i += sampleRate * 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              sampledCount++;

              // Natural earth tones (green vegetation, brown soil, blue sky, gray rocks)
              const isGreen = g > r + 10 && g > b + 10 && g > 60;
              const isBrown = r > 80 && r < 200 && g > 50 && g < 180 && b > 20 && b < 150 &&
                             Math.abs(r - g) < 60;
              const isSkyBlue = b > r + 15 && b > g && b > 100 && r < 150 && g < 200;
              const isEarthGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && 
                                 r > 80 && r < 180;
              const isDirtBrown = r > g && g > b && r > 100 && r < 180;
              
              if (isGreen || isBrown || isSkyBlue || isEarthGray || isDirtBrown) {
                naturalColors++;
              }

              // Artificial/indoor indicators
              const isVeryBright = r > 240 && g > 240 && b > 240;
              const isVeryDark = r < 30 && g < 30 && b < 30;
              const isPureRed = r > 200 && g < 100 && b < 100;
              const isPureBlue = b > 200 && r < 100 && g < 100;
              const isPureColor = isPureRed || isPureBlue;
              
              if (isVeryBright) whitePixels++;
              if (isVeryDark) blackPixels++;
              if (isPureColor) artificialColors++;

              // IMPROVED: Skin tone detection with stricter criteria
              if (isSkinTone(r, g, b)) {
                skinTones++;
              }

              // Very vivid/saturated colors (graphics, screenshots, text)
              const saturation = Math.max(r, g, b) - Math.min(r, g, b);
              if (saturation > 180) {
                vividColors++;
              }
            }

            // Calculate percentages
            const naturalPct = (naturalColors / sampledCount) * 100;
            const artificialPct = (artificialColors / sampledCount) * 100;
            const skinPct = (skinTones / sampledCount) * 100;
            const vividPct = (vividColors / sampledCount) * 100;
            const whitePct = (whitePixels / sampledCount) * 100;
            const blackPct = (blackPixels / sampledCount) * 100;

            console.log('🔍 Nature Detection:', {
              natural: naturalPct.toFixed(1) + '%',
              artificial: artificialPct.toFixed(1) + '%',
              skin: skinPct.toFixed(1) + '%',
              vivid: vividPct.toFixed(1) + '%',
              white: whitePct.toFixed(1) + '%',
              black: blackPct.toFixed(1) + '%'
            });

            // IMPROVED: Decision logic with weighted priorities
            let isNatureRelated = false;
            let confidence = 0;
            let reason = '';
            let suggestion = '';

            // Priority 1: Strong natural indicators override skin detection
            if (naturalPct > 40) {
              // High natural content - likely outdoor scene even if some skin tones detected
              isNatureRelated = true;
              confidence = 90;
              reason = 'Strong natural landscape indicators detected';
              suggestion = '';
            }
            // Priority 2: Obvious non-nature images
            else if (vividPct > 40 && naturalPct < 15) {
              reason = 'Image appears to be a graphic, screenshot, or digital art';
              suggestion = 'Please upload an actual photograph of outdoor land or landscape';
              confidence = 0;
            } else if (whitePct > 60) {
              reason = 'Image appears to be mostly white/blank (possibly a document or screenshot)';
              suggestion = 'Please upload a photo of outdoor land, soil, or vegetation';
              confidence = 0;
            } else if (blackPct > 60) {
              reason = 'Image appears to be too dark or mostly black';
              suggestion = 'Please take a photo in better lighting showing the land clearly';
              confidence = 0;
            } else if (whitePct + blackPct > 70) {
              reason = 'Image appears to be a document, text, or high-contrast graphic';
              suggestion = 'Please upload a photograph of actual outdoor land or landscape';
              confidence = 0;
            }
            // Priority 3: Check for selfies/portraits ONLY if natural content is low
            else if (skinPct > 25 && naturalPct < 25) {
              // High skin + low natural = likely a person/portrait
              reason = 'Image appears to contain people or portraits';
              suggestion = 'Please upload a photo showing land, soil, or vegetation without people in the frame';
              confidence = 0;
            }
            // Priority 4: Medium natural content
            else if (naturalPct > 25 && skinPct < 30) {
              isNatureRelated = true;
              confidence = 75;
              reason = 'Good natural landscape indicators detected';
              suggestion = '';
            } else if (naturalPct > 15 && skinPct < 25 && vividPct < 30) {
              isNatureRelated = true;
              confidence = 60;
              reason = 'Some natural elements detected';
              suggestion = 'For best results, take a clearer photo showing more vegetation or soil';
            }
            // Priority 5: Ambiguous cases - be lenient if some natural content exists
            else if (naturalPct > 20) {
              isNatureRelated = true;
              confidence = 65;
              reason = 'Natural landscape elements detected';
              suggestion = 'For best results, take a clearer photo focusing on the land';
            }
            // Priority 6: Reject if truly no natural content
            else {
              reason = 'Image does not appear to be outdoor/land related';
              suggestion = 'Please upload a photo taken outdoors showing land, soil, trees, or vegetation';
              confidence = 0;
            }

            resolve({
              isNatureRelated,
              confidence,
              reason,
              suggestion,
              details: {
                naturalColors: Math.round(naturalPct),
                artificialColors: Math.round(artificialPct),
                skinTones: Math.round(skinPct),
                vividColors: Math.round(vividPct),
                whitePixels: Math.round(whitePct),
                blackPixels: Math.round(blackPct)
              }
            });

          } catch (error) {
            console.error('❌ Validation error:', error);
            resolve({
              isNatureRelated: true,
              confidence: 0,
              reason: 'Could not analyze image content',
              suggestion: '',
              error: error.message
            });
          }
        };
        
        img.onerror = () => {
          resolve({
            isNatureRelated: true,
            confidence: 0,
            reason: 'Failed to load image for validation',
            suggestion: ''
          });
        };
        
        img.src = e.target.result;
      };

      reader.onerror = () => {
        resolve({
          isNatureRelated: true,
          confidence: 0,
          reason: 'Failed to read file for validation',
          suggestion: ''
        });
      };
      
      reader.readAsDataURL(compressed);

    } catch (error) {
      resolve({
        isNatureRelated: true,
        confidence: 0,
        reason: error.message,
        suggestion: ''
      });
    }
  });
};

/**
 * IMPROVED: GPS extraction with better timeout and fallback
 */
export const extractGPSFromImage = async (imageFile) => {
  const fallbackData = {
    latitude: CONFIG.DEFAULT_LOCATION?.latitude || -1.2921,
    longitude: CONFIG.DEFAULT_LOCATION?.longitude || 36.8219,
    altitude: null,
    timestamp: new Date().toISOString(),
    hasGPS: false,
    source: 'fallback',
    reason: 'No GPS data in image',
    needsManualLocation: true
  };

  return new Promise((resolve) => {
    let hasResolved = false;
    
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

        const convertDMS = (degrees, minutes, seconds, direction) => {
          let dd = degrees + minutes / 60 + seconds / 3600;
          if (direction === 'S' || direction === 'W') dd = dd * -1;
          return dd;
        };

        const latitude = convertDMS(lat[0], lat[1], lat[2], latRef);
        const longitude = convertDMS(lon[0], lon[1], lon[2], lonRef);

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
 * IMPROVED: Better image analysis
 */
export const analyzeImageBasic = async (imageFile) => {
  return new Promise(async (resolve) => {
    try {
      const compressed = await compressImageForProcessing(imageFile, 600, 0.90);
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            let totalR = 0, totalG = 0, totalB = 0;
            let greenPixels = 0, brownPixels = 0, grayPixels = 0;
            const pixelCount = pixels.length / 4;
            
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

              const isGreen = g > r + 10 && g > b + 10 && g > 80;
              if (isGreen) greenPixels++;

              const isBrown = r > 80 && r < 200 && 
                             g > 50 && g < 180 && 
                             b > 20 && b < 150 &&
                             Math.abs(r - g) < 60;
              if (isBrown) brownPixels++;

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

            let vegetationLevel;
            if (greenPct > 35) vegetationLevel = 'dense';
            else if (greenPct > 18) vegetationLevel = 'moderate';
            else if (greenPct > 5) vegetationLevel = 'sparse';
            else vegetationLevel = 'bare';

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
              soilType = 'loam';
            }

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
 * Create preview
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
 * Basic file validation
 */
export const validateImageFile = (file) => {
  const maxSize = 15 * 1024 * 1024;
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
 * Enhanced validation with nature check
 */
export const validateImageFileEnhanced = async (file) => {
  // First do basic file validation
  const basicValidation = validateImageFile(file);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Then check if it's nature-related
  console.log('🔍 Checking if image is nature-related...');
  const natureCheck = await validateNatureImage(file);
  
  if (!natureCheck.isNatureRelated) {
    return {
      valid: false,
      error: natureCheck.reason,
      suggestion: natureCheck.suggestion,
      details: natureCheck
    };
  }

  // IMPROVED: More lenient confidence threshold
  if (natureCheck.confidence < 50) {
    return {
      valid: false,
      error: `Low confidence this is outdoor land (${natureCheck.confidence}%). ${natureCheck.reason}`,
      suggestion: natureCheck.suggestion,
      details: natureCheck
    };
  }

  console.log(`✅ Nature validation passed (${natureCheck.confidence}% confidence)`);
  return { 
    valid: true, 
    error: null,
    natureCheck 
  };
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
  validateImageFileEnhanced,
  validateNatureImage,
  analyzeImageBasic,
  getImageMetadata
};