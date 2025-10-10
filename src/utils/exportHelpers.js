/**
 * Export Helpers
 * Utilities for exporting reforestation plans to various formats
 */

/**
 * Generate CSV content from reforestation plan
 * @param {Object} plan - Complete reforestation plan
 * @returns {string} CSV formatted string
 */
export const generateCSV = (plan) => {
  const { recommendations, plantingStrategy, impactMetrics, location, climateData } = plan;
  
  let csv = '';
  
  // Header
  csv += 'REFORESTATION PLAN EXPORT\n';
  csv += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Location Info
  csv += 'LOCATION INFORMATION\n';
  csv += `City,${location.city}\n`;
  csv += `Country,${location.country}\n`;
  csv += `Latitude,${location.coordinates.latitude}\n`;
  csv += `Longitude,${location.coordinates.longitude}\n`;
  csv += `Climate Type,${climateData.climateType}\n`;
  csv += `Annual Rainfall,${climateData.annualRainfall} mm\n\n`;
  
  // Recommended Trees
  csv += 'RECOMMENDED TREE SPECIES\n';
  csv += 'Rank,Common Name,Scientific Name,Compatibility Score,Growth Rate,Carbon (kg/year),Water Needs\n';
  recommendations.forEach((tree, idx) => {
    csv += `${idx + 1},${tree.commonName},${tree.scientificName},${tree.finalScore?.toFixed(1) || tree.compatibilityScore},${tree.growthRate},${tree.carbonSequestration},${tree.waterNeeds}\n`;
  });
  csv += '\n';
  
  // Planting Strategy
  csv += 'PLANTING STRATEGY\n';
  csv += `Density,${plantingStrategy.density}\n`;
  csv += `Spacing,${plantingStrategy.spacing}\n`;
  csv += `Best Planting Months,${plantingStrategy.bestMonths.join(', ')}\n\n`;
  
  // Impact Metrics
  csv += 'EXPECTED IMPACT (10 YEARS)\n';
  csv += `Carbon Sequestration Year 1,${impactMetrics.carbonSequestration.year1} kg CO2\n`;
  csv += `Carbon Sequestration Year 10,${impactMetrics.carbonSequestration.year10} kg CO2\n`;
  csv += `Biodiversity Score,${impactMetrics.biodiversity.score}/100\n`;
  csv += `Trees Per Hectare,${impactMetrics.density.treesPerHectare}\n`;
  csv += `Economic Value,${impactMetrics.economicValue.total} USD\n`;
  
  return csv;
};

/**
 * Generate TXT report from reforestation plan
 * @param {Object} plan - Complete reforestation plan
 * @returns {string} Text formatted report
 */
export const generateTXTReport = (plan) => {
  const { recommendations, plantingStrategy, impactMetrics, location, climateData, aiInsights } = plan;
  
  let txt = '';
  
  txt += '═══════════════════════════════════════════════════════════\n';
  txt += '            REFORESTATION PLAN REPORT\n';
  txt += '             ReForest.AI - Land ReGen 2025\n';
  txt += '═══════════════════════════════════════════════════════════\n\n';
  
  txt += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Location
  txt += '━━━ LOCATION INFORMATION ━━━\n\n';
  txt += `📍 Location: ${location.city}, ${location.country}\n`;
  txt += `   Coordinates: ${location.coordinates.latitude.toFixed(4)}°, ${location.coordinates.longitude.toFixed(4)}°\n`;
  txt += `   Climate: ${climateData.climateType}\n`;
  txt += `   Temperature: ${climateData.currentConditions.temperature}°C\n`;
  txt += `   Annual Rainfall: ${climateData.annualRainfall} mm\n`;
  txt += `   Soil Type: ${climateData.soilMoisture.level}\n\n`;
  
  // Recommendations
  txt += '━━━ TOP RECOMMENDED TREE SPECIES ━━━\n\n';
  recommendations.forEach((tree, idx) => {
    txt += `${idx + 1}. ${tree.commonName} (${tree.scientificName})\n`;
    txt += `   ├─ Compatibility Score: ${(tree.finalScore || tree.compatibilityScore).toFixed(1)}/100\n`;
    txt += `   ├─ Family: ${tree.family}\n`;
    txt += `   ├─ Growth Rate: ${tree.growthRate}\n`;
    txt += `   ├─ Max Height: ${tree.maxHeight}m\n`;
    txt += `   ├─ Carbon Capture: ${tree.carbonSequestration} kg CO2/year\n`;
    txt += `   ├─ Water Needs: ${tree.waterNeeds}\n`;
    txt += `   └─ Benefits: ${tree.benefits.slice(0, 2).join(', ')}\n`;
    
    if (tree.aiReasoning) {
      txt += `   🤖 AI Insight: ${tree.aiReasoning}\n`;
    }
    txt += '\n';
  });
  
  // Planting Strategy
  txt += '━━━ PLANTING STRATEGY ━━━\n\n';
  txt += `🌱 Planting Density: ${plantingStrategy.density}\n`;
  txt += `📏 Tree Spacing: ${plantingStrategy.spacing}\n`;
  txt += `📅 Best Planting Months: ${plantingStrategy.bestMonths.join(', ')}\n`;
  txt += `🔀 Species Mix:\n`;
  Object.entries(plantingStrategy.mixRatio).forEach(([species, percentage]) => {
    txt += `   • ${species}: ${percentage}%\n`;
  });
  txt += '\n';
  
  // Impact Metrics
  txt += '━━━ EXPECTED ENVIRONMENTAL IMPACT ━━━\n\n';
  txt += `🌍 CARBON SEQUESTRATION:\n`;
  txt += `   • Year 1: ${impactMetrics.carbonSequestration.year1.toLocaleString()} kg CO2\n`;
  txt += `   • Year 10: ${impactMetrics.carbonSequestration.year10.toLocaleString()} kg CO2\n`;
  txt += `   • Per Tree: ${impactMetrics.carbonSequestration.perTree} kg CO2/year\n\n`;
  
  txt += `🦋 BIODIVERSITY:\n`;
  txt += `   • Score: ${impactMetrics.biodiversity.score}/100 (${impactMetrics.biodiversity.level})\n\n`;
  
  txt += `💰 ECONOMIC VALUE:\n`;
  txt += `   • Carbon Credits: $${impactMetrics.economicValue.carbonCredits.toLocaleString()}\n`;
  txt += `   • Timber Value: $${impactMetrics.economicValue.timber.toLocaleString()}\n`;
  txt += `   • Total Value: $${impactMetrics.economicValue.total.toLocaleString()}\n\n`;
  
  txt += `🌳 PLANTING DETAILS:\n`;
  txt += `   • Trees per Hectare: ${impactMetrics.density.treesPerHectare}\n`;
  txt += `   • Expected Survival: ${impactMetrics.density.survivalRate}%\n\n`;
  
  // AI Insights
  if (aiInsights) {
    txt += '━━━ AI-POWERED INSIGHTS ━━━\n\n';
    
    if (aiInsights.sitePreparation) {
      txt += '📋 SITE PREPARATION TIPS:\n';
      aiInsights.sitePreparation.forEach((tip, idx) => {
        txt += `   ${idx + 1}. ${tip}\n`;
      });
      txt += '\n';
    }
    
    if (aiInsights.challenges) {
      txt += '⚠️  POTENTIAL CHALLENGES & SOLUTIONS:\n';
      aiInsights.challenges.forEach((challenge, idx) => {
        txt += `   ${idx + 1}. Challenge: ${challenge.challenge}\n`;
        txt += `      Solution: ${challenge.mitigation}\n`;
      });
      txt += '\n';
    }
    
    if (aiInsights.additionalInsights) {
      txt += '💡 ADDITIONAL CONSIDERATIONS:\n';
      txt += `   ${aiInsights.additionalInsights}\n\n`;
    }
  }
  
  // Footer
  txt += '═══════════════════════════════════════════════════════════\n';
  txt += '         This plan was generated by ReForest.AI\n';
  txt += '      AI-Powered Tree Planting Advisor | 2025\n';
  txt += '═══════════════════════════════════════════════════════════\n';
  
  return txt;
};

/**
 * Generate JSON export
 * @param {Object} plan - Complete reforestation plan
 * @returns {string} JSON string
 */
export const generateJSON = (plan) => {
  return JSON.stringify(plan, null, 2);
};

/**
 * Download file to user's computer
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export plan as CSV
 * @param {Object} plan - Reforestation plan
 * @param {string} filename - Optional filename
 */
export const exportAsCSV = (plan, filename) => {
  const csv = generateCSV(plan);
  const name = filename || `reforestation-plan-${Date.now()}.csv`;
  downloadFile(csv, name, 'text/csv');
};

/**
 * Export plan as TXT
 * @param {Object} plan - Reforestation plan
 * @param {string} filename - Optional filename
 */
export const exportAsTXT = (plan, filename) => {
  const txt = generateTXTReport(plan);
  const name = filename || `reforestation-plan-${Date.now()}.txt`;
  downloadFile(txt, name, 'text/plain');
};

/**
 * Export plan as JSON
 * @param {Object} plan - Reforestation plan
 * @param {string} filename - Optional filename
 */
export const exportAsJSON = (plan, filename) => {
  const json = generateJSON(plan);
  const name = filename || `reforestation-plan-${Date.now()}.json`;
  downloadFile(json, name, 'application/json');
};

/**
 * Copy plan to clipboard
 * @param {Object} plan - Reforestation plan
 * @param {string} format - Format (txt, json, csv)
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (plan, format = 'txt') => {
  let content;
  
  switch (format) {
    case 'csv':
      content = generateCSV(plan);
      break;
    case 'json':
      content = generateJSON(plan);
      break;
    case 'txt':
    default:
      content = generateTXTReport(plan);
  }
  
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return false;
  }
};

/**
 * Generate shareable summary for social media
 * @param {Object} plan - Reforestation plan
 * @returns {string} Social media text
 */
export const generateShareText = (plan) => {
  const { recommendations, impactMetrics, location } = plan;
  const topTree = recommendations[0];
  
  return `🌳 I'm planning to plant ${topTree.commonName} in ${location.city}!

📊 Expected Impact:
- ${impactMetrics.carbonSequestration.year10.toLocaleString()} kg CO2 captured in 10 years
- Biodiversity score: ${impactMetrics.biodiversity.score}/100
- ${impactMetrics.density.treesPerHectare} trees per hectare

Join me in climate action with ReForest.AI 🌍
#Reforestation #ClimateAction #LandReGen2025`;
};

export default {
  generateCSV,
  generateTXTReport,
  generateJSON,
  downloadFile,
  exportAsCSV,
  exportAsTXT,
  exportAsJSON,
  copyToClipboard,
  generateShareText
};