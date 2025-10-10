/**
 * Test helpers for development and debugging
 */

/**
 * Generate mock image file for testing
 * @returns {File} Mock image file
 */
export const createMockImageFile = () => {
  // Create a simple colored canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // Draw gradient (simulating land)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#8B7355'); // Brown soil
  gradient.addColorStop(0.6, '#6B5D42'); // Darker soil
  gradient.addColorStop(1, '#4A3F2A'); // Dark earth
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add some green (vegetation)
  ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
  ctx.fillRect(50, 50, 300, 100);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], 'test-land.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      resolve(file);
    }, 'image/jpeg');
  });
};

/**
 * Mock GPS data for testing
 * @returns {Object} Mock GPS coordinates
 */
export const getMockGPSData = () => {
  return {
    latitude: -1.2921,
    longitude: 36.8219,
    altitude: 1795,
    timestamp: new Date().toISOString(),
    hasGPS: true,
    source: 'test'
  };
};

export default {
  createMockImageFile,
  getMockGPSData
};