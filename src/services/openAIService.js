/**
 * OpenAI Service
 * Handles all interactions with OpenAI API for intelligent recommendations
 */

import CONFIG from '../constants/config';

/**
 * Set OpenAI API Key
 * @param {string} apiKey - OpenAI API key
 */
export const setOpenAIKey = (apiKey) => {
  CONFIG.OPENAI_API_KEY = apiKey;
};

/**
 * Check if OpenAI is configured
 * @returns {boolean} True if API key is set
 */
export const isOpenAIConfigured = () => {
  return !!CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.trim() !== '';
};

/**
 * Call OpenAI Chat Completion API
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} OpenAI response
 */
const callOpenAI = async (messages, options = {}) => {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    const response = await fetch(`${CONFIG.OPENAI_API}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || CONFIG.OPENAI_MODEL,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('OpenAI API call error:', error);
    throw error;
  }
};

/**
 * Enhance tree recommendations with AI insights
 * @param {Object} contextData - All context (location, climate, image analysis, trees)
 * @returns {Promise<Object>} AI-enhanced recommendations
 */
export const enhanceRecommendations = async (contextData) => {
  const { location, climate, imageAnalysis, candidateTrees } = contextData;
  
  const systemPrompt = `You are an expert arborist and reforestation specialist with deep knowledge of:
- Tree species ecology and native ranges
- Climate adaptation and soil requirements
- Sustainable forestry practices
- Carbon sequestration and biodiversity
- Regional agricultural and environmental conditions

Your role is to analyze reforestation sites and provide expert, actionable tree planting recommendations.`;

  const userPrompt = `I need expert advice for reforestation at this location:

LOCATION:
- City: ${location.city}, ${location.country}
- Coordinates: ${location.coordinates.latitude.toFixed(4)}°, ${location.coordinates.longitude.toFixed(4)}°
- Region: ${location.region || 'Not specified'}
- Elevation: ${climate.elevation || 'Unknown'}m

CLIMATE CONDITIONS:
- Current Temperature: ${climate.currentConditions.temperature}°C
- Annual Rainfall: ${climate.annualRainfall}mm
- Climate Type: ${climate.climateType}
- Temperature Zone: ${climate.tempZone}
- Soil Moisture: ${climate.soilMoisture.level} (${climate.soilMoisture.percentage}%)
- Growing Season: ${climate.growingSeasonMonths} months

SITE ANALYSIS:
- Soil Type: ${imageAnalysis.soilType}
- Vegetation Level: ${imageAnalysis.vegetationLevel}
- Land Condition: ${imageAnalysis.landCondition}

CANDIDATE TREE SPECIES (already filtered for climate compatibility):
${candidateTrees.map((tree, idx) => `
${idx + 1}. ${tree.commonName} (${tree.scientificName})
   - Family: ${tree.family}
   - Growth Rate: ${tree.growthRate}
   - Max Height: ${tree.maxHeight}m
   - Carbon Sequestration: ${tree.carbonSequestration} kg CO2/year
   - Water Needs: ${tree.waterNeeds}
   - Soil Types: ${tree.soilTypes.join(', ')}
   - Benefits: ${tree.benefits.join(', ')}
`).join('\n')}

PLEASE PROVIDE:
1. Rank these trees from BEST to WORST for this specific location (1-${candidateTrees.length})
2. For each tree, provide a compatibility score (0-100) and brief reasoning
3. Recommend optimal planting density (trees per hectare)
4. Suggest best planting months for this location
5. Provide 3-5 actionable site preparation tips
6. Identify any potential challenges and mitigation strategies

Format your response as JSON with this structure:
{
  "rankings": [
    {
      "treeId": "tree-id-here",
      "rank": 1,
      "compatibilityScore": 95,
      "reasoning": "Brief explanation why this tree is ideal",
      "specificAdvice": "Any specific care instructions"
    }
  ],
  "plantingStrategy": {
    "density": "400-500 trees per hectare",
    "bestMonths": ["March", "April", "May"],
    "spacing": "2-3 meters between trees"
  },
  "sitePreparation": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "challenges": [
    {
      "challenge": "Issue description",
      "mitigation": "How to address it"
    }
  ],
  "additionalInsights": "Any other important considerations"
}`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.7,
      maxTokens: 2500
    });
    
    const aiResponse = response.choices[0].message.content;
    
    // Parse JSON response
    let enhancedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      enhancedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error, using raw response:', parseError);
      enhancedData = {
        rawResponse: aiResponse,
        parseError: true
      };
    }
    
    return {
      success: true,
      enhanced: true,
      data: enhancedData,
      model: response.model,
      tokensUsed: response.usage?.total_tokens || 0,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('OpenAI enhancement error:', error);
    return {
      success: false,
      enhanced: false,
      error: error.message
    };
  }
};

/**
 * Generate planting guide with AI
 * @param {Object} treeData - Selected tree information
 * @param {Object} contextData - Location and climate context
 * @returns {Promise<Object>} AI-generated planting guide
 */
export const generatePlantingGuide = async (treeData, contextData) => {
  const { location, climate } = contextData;
  
  const systemPrompt = `You are an expert agricultural extension officer specializing in tree planting and forest restoration. Provide clear, practical, step-by-step guidance.`;
  
  const userPrompt = `Create a detailed planting guide for:

TREE: ${treeData.commonName} (${treeData.scientificName})
LOCATION: ${location.city}, ${location.country}
CLIMATE: ${climate.climateType}, ${climate.annualRainfall}mm annual rainfall
SOIL: ${climate.soilMoisture.level} moisture, temperature ${climate.currentConditions.temperature}°C

Provide a comprehensive planting guide with:
1. Pre-planting site preparation (week before planting)
2. Step-by-step planting instructions (detailed, numbered steps)
3. First-year care calendar (monthly tasks)
4. Common problems and solutions
5. Success indicators (what to look for)

Make it practical and easy to follow for someone with basic farming knowledge.`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.6,
      maxTokens: 2000
    });
    
    return {
      success: true,
      guide: response.choices[0].message.content,
      tokensUsed: response.usage?.total_tokens || 0
    };
    
  } catch (error) {
    console.error('Planting guide generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Analyze image with OpenAI Vision (if using GPT-4 Vision)
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<Object>} Vision analysis
 */
export const analyzeImageWithVision = async (imageBase64, prompt = null) => {
  if (!CONFIG.OPENAI_MODEL.includes('vision') && !CONFIG.OPENAI_MODEL.includes('gpt-4o')) {
    throw new Error('Vision analysis requires GPT-4 Vision model');
  }
  
  const defaultPrompt = `Analyze this land/terrain image for reforestation planning:
1. Describe the soil type and condition (color, texture visible)
2. Estimate vegetation coverage (bare, sparse, moderate, dense)
3. Identify any visible terrain features (slope, water features, rocks)
4. Assess land suitability for tree planting (score 1-10)
5. Suggest any site preparation needs

Provide your analysis in structured format.`;
  
  try {
    const response = await callOpenAI([
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: prompt || defaultPrompt 
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ], {
      maxTokens: 1000
    });
    
    return {
      success: true,
      analysis: response.choices[0].message.content,
      tokensUsed: response.usage?.total_tokens || 0
    };
    
  } catch (error) {
    console.error('Vision analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get AI explanation for why a tree is recommended
 * @param {Object} treeData - Tree information
 * @param {Object} contextData - Context data
 * @returns {Promise<string>} AI explanation
 */
export const explainRecommendation = async (treeData, contextData) => {
  const { location, climate, imageAnalysis } = contextData;
  
  const prompt = `In 2-3 sentences, explain why ${treeData.commonName} is a good choice for reforestation in ${location.city} (${climate.climateType} climate, ${climate.annualRainfall}mm rainfall, ${imageAnalysis.soilType} soil). Focus on practical benefits.`;
  
  try {
    const response = await callOpenAI([
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.7,
      maxTokens: 150
    });
    
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('Explanation generation error:', error);
    return `${treeData.commonName} is well-suited for this location due to its compatibility with the local climate and soil conditions.`;
  }
};

export default {
  setOpenAIKey,
  isOpenAIConfigured,
  enhanceRecommendations,
  generatePlantingGuide,
  analyzeImageWithVision,
  explainRecommendation
};