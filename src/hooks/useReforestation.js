/**
 * OPTIMIZED useReforestation Hook
 * - Parallel processing for faster results
 * - Better error handling
 * - Smoother loading states
 * - No localStorage (Claude artifacts compatible)
 */

import { useState, useCallback, useRef } from 'react';
import imageService from '../services/imageService';
import climateService from '../services/climateService';
import locationService from '../services/locationService';
import recommendationService from '../services/recommendationService';
import openAIService from '../services/openAIService';

const useReforestation = () => {
  const isMounted = useRef(true);

  const [state, setState] = useState({
    currentStep: 'upload',
    imageFile: null,
    imagePreview: null,
    imageAnalysis: null,
    gpsData: null,
    locationData: null,
    climateData: null,
    climateAnalysis: null,
    suitability: null,
    recommendations: null,
    selectedTree: null,
    plantingStrategy: null,
    impactMetrics: null,
    aiInsights: null,
    isLoading: false,
    loadingMessage: '',
    error: null,
    useAI: true,
    openAIKey: ''
  });

  const updateState = useCallback((updates) => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const setOpenAIKey = useCallback((apiKey) => {
    openAIService.setOpenAIKey(apiKey);
    updateState({ openAIKey: apiKey, useAI: true });
  }, [updateState]);

  /**
   * OPTIMIZED: Parallel image upload processing
   * Processes multiple steps simultaneously for faster results
   */
  const handleImageUpload = useCallback(async (file) => {
    if (!file) {
      updateState({
        imageFile: null,
        imagePreview: null,
        currentStep: 'upload',
        error: null
      });
      return;
    }

    // Validate file first (fast)
    const validation = imageService.validateImageFile(file);
    if (!validation.valid) {
      updateState({ error: validation.error });
      return;
    }

    try {
      updateState({
        isLoading: true,
        loadingMessage: 'Processing image...',
        error: null,
        currentStep: 'processing',
        imageFile: file
      });

      // ⚡ PARALLEL STEP 1: GPS + Preview (can happen simultaneously)
      console.log('⚡ Step 1/5: Extracting GPS & creating preview...');
      const [gpsData, preview] = await Promise.all([
        imageService.extractGPSFromImage(file),
        imageService.createImagePreview(file)
      ]);

      if (!isMounted.current) return;

      updateState({
        gpsData,
        imagePreview: preview,
        loadingMessage: 'Analyzing location and image...'
      });

      // ⚡ PARALLEL STEP 2: Location lookup + Image analysis (independent operations)
      console.log('⚡ Step 2/5: Getting location & analyzing image...');
      const [locationData, imageAnalysis] = await Promise.all([
        locationService.reverseGeocode(gpsData.latitude, gpsData.longitude),
        imageService.analyzeImageBasic(file)
      ]);

      if (!isMounted.current) return;

      updateState({
        locationData,
        imageAnalysis,
        loadingMessage: 'Fetching climate data...',
        currentStep: 'analyzing'
      });

      // STEP 3: Climate data (depends on location)
      console.log('⚡ Step 3/5: Fetching climate data...');
      const climateData = await climateService.fetchClimateWithRetry(
        gpsData.latitude,
        gpsData.longitude
      );

      if (!isMounted.current) return;

      // Quick local analysis (no API call)
      const climateAnalysis = climateService.analyzeClimate(climateData);
      
      // Calculate suitability score
      const suitability = calculateSuitability(climateAnalysis, imageAnalysis);

      updateState({
        climateData,
        climateAnalysis,
        suitability,
        loadingMessage: 'Generating tree recommendations...'
      });

      // STEP 4: Generate recommendations
      console.log('⚡ Step 4/5: Generating recommendations...');
      const recommendationResult = await recommendationService.generateRecommendations({
        location: locationData,
        climateData: { ...climateData, ...climateAnalysis },
        imageAnalysis,
        useAI: state.useAI && openAIService.isOpenAIConfigured()
      });

      if (!isMounted.current) return;

      if (!recommendationResult.success) {
        throw new Error(recommendationResult.error || 'Failed to generate recommendations');
      }

      if (!recommendationResult.recommendations || recommendationResult.recommendations.length === 0) {
        throw new Error('No suitable trees found for your location conditions. Try a different location.');
      }

      // STEP 5: Complete!
      console.log('✅ Step 5/5: Analysis complete!');
      updateState({
        recommendations: recommendationResult.recommendations,
        selectedTree: recommendationResult.recommendations[0],
        plantingStrategy: recommendationResult.plantingStrategy,
        impactMetrics: recommendationResult.impactMetrics,
        aiInsights: recommendationResult.aiInsights,
        currentStep: 'results',
        isLoading: false,
        loadingMessage: ''
      });

    } catch (error) {
      console.error('❌ Processing error:', error);
      
      if (!isMounted.current) return;

      updateState({
        error: error.message || 'An error occurred while processing the image',
        isLoading: false,
        loadingMessage: '',
        currentStep: 'upload'
      });
    }
  }, [state.useAI, updateState]);

  /**
   * Calculate suitability score based on climate and image analysis
   */
  const calculateSuitability = (climateAnalysis, imageAnalysis) => {
    let score = 70; // Base score
    const warnings = [];
    const recommendations = [];

    // Temperature check
    if (climateAnalysis.temperatureStats.average < 10) {
      score -= 15;
      warnings.push({
        type: 'cold-climate',
        severity: 'medium',
        message: 'Cold climate may limit tree species options'
      });
      recommendations.push('Focus on cold-hardy species');
    } else if (climateAnalysis.temperatureStats.average > 30) {
      score -= 10;
      warnings.push({
        type: 'hot-climate',
        severity: 'medium',
        message: 'Hot climate requires drought-resistant species'
      });
      recommendations.push('Choose heat and drought tolerant trees');
    } else {
      score += 10;
    }

    // Rainfall check
    if (climateAnalysis.annualRainfall < 500) {
      score -= 20;
      warnings.push({
        type: 'low-rainfall',
        severity: 'high',
        message: 'Low rainfall area - irrigation may be necessary'
      });
      recommendations.push('Plan for regular irrigation');
    } else if (climateAnalysis.annualRainfall > 2000) {
      score -= 5;
      warnings.push({
        type: 'high-rainfall',
        severity: 'low',
        message: 'High rainfall - ensure good drainage'
      });
    } else {
      score += 15;
    }

    // Soil check
    if (imageAnalysis.vegetationLevel === 'bare') {
      score += 10;
      recommendations.push('Bare land is ideal for new plantings');
    } else if (imageAnalysis.vegetationLevel === 'dense') {
      score -= 10;
      warnings.push({
        type: 'dense-vegetation',
        severity: 'medium',
        message: 'Dense existing vegetation may require clearing'
      });
    }

    // Determine level
    let level;
    if (score >= 80) level = 'excellent';
    else if (score >= 65) level = 'good';
    else if (score >= 50) level = 'moderate';
    else level = 'challenging';

    return {
      suitabilityScore: Math.max(0, Math.min(100, score)),
      suitabilityLevel: level,
      warnings,
      recommendations
    };
  };

  const setManualLocation = useCallback(async (latitude, longitude) => {
    try {
      updateState({
        isLoading: true,
        loadingMessage: 'Getting location information...',
        error: null
      });

      const locationData = await locationService.reverseGeocode(latitude, longitude);
      const gpsData = {
        latitude,
        longitude,
        altitude: null,
        timestamp: new Date().toISOString(),
        hasGPS: false,
        source: 'manual'
      };

      if (!isMounted.current) return;

      updateState({
        gpsData,
        locationData,
        isLoading: false,
        loadingMessage: ''
      });

    } catch (error) {
      if (!isMounted.current) return;
      
      updateState({
        error: 'Failed to get location information',
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [updateState]);

  const selectTree = useCallback((tree) => {
    updateState({ selectedTree: tree });
  }, [updateState]);

  const recalculateRecommendations = useCallback(async (params = {}) => {
    if (!state.locationData || !state.climateData || !state.imageAnalysis) {
      updateState({ error: 'Missing required data for recommendations' });
      return;
    }

    try {
      updateState({
        isLoading: true,
        loadingMessage: 'Recalculating recommendations...',
        error: null
      });

      const recommendationResult = await recommendationService.generateRecommendations({
        location: state.locationData,
        climateData: state.climateData,
        imageAnalysis: state.imageAnalysis,
        useAI: params.useAI ?? state.useAI,
        ...params
      });

      if (!isMounted.current) return;

      if (!recommendationResult.success) {
        throw new Error(recommendationResult.error);
      }

      updateState({
        recommendations: recommendationResult.recommendations,
        selectedTree: recommendationResult.recommendations[0],
        plantingStrategy: recommendationResult.plantingStrategy,
        impactMetrics: recommendationResult.impactMetrics,
        aiInsights: recommendationResult.aiInsights,
        isLoading: false,
        loadingMessage: ''
      });

    } catch (error) {
      if (!isMounted.current) return;
      
      updateState({
        error: error.message || 'Failed to recalculate recommendations',
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [state, updateState]);

  const generatePlantingGuide = useCallback(async () => {
    if (!state.selectedTree || !openAIService.isOpenAIConfigured()) {
      return null;
    }

    try {
      const guide = await openAIService.generatePlantingGuide(
        state.selectedTree,
        {
          location: state.locationData,
          climate: state.climateData
        }
      );

      return guide;
    } catch (error) {
      console.error('Planting guide generation error:', error);
      return null;
    }
  }, [state.selectedTree, state.locationData, state.climateData]);

  const getCompletePlan = useCallback(() => {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        generator: 'ReForest.AI'
      },
      location: state.locationData,
      gps: state.gpsData,
      climate: state.climateData,
      climateAnalysis: state.climateAnalysis,
      suitability: state.suitability,
      imageAnalysis: state.imageAnalysis,
      recommendations: state.recommendations,
      selectedTree: state.selectedTree,
      plantingStrategy: state.plantingStrategy,
      impactMetrics: state.impactMetrics,
      aiInsights: state.aiInsights
    };
  }, [state]);

  const resetWorkflow = useCallback(() => {
    setState({
      currentStep: 'upload',
      imageFile: null,
      imagePreview: null,
      imageAnalysis: null,
      gpsData: null,
      locationData: null,
      climateData: null,
      climateAnalysis: null,
      suitability: null,
      recommendations: null,
      selectedTree: null,
      plantingStrategy: null,
      impactMetrics: null,
      aiInsights: null,
      isLoading: false,
      loadingMessage: '',
      error: null,
      useAI: state.useAI,
      openAIKey: state.openAIKey
    });
  }, [state.useAI, state.openAIKey]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const toggleAI = useCallback(() => {
    updateState({ useAI: !state.useAI });
  }, [state.useAI, updateState]);

  /**
   * Get detailed progress with granular steps
   */
  const getProgress = useCallback(() => {
    if (!state.isLoading) {
      const steps = {
        upload: 0,
        processing: 50,
        analyzing: 75,
        results: 100
      };
      return steps[state.currentStep] || 0;
    }

    // Granular progress during loading
    let progress = 0;
    if (state.gpsData) progress += 15;
    if (state.imagePreview) progress += 5;
    if (state.locationData) progress += 20;
    if (state.imageAnalysis) progress += 15;
    if (state.climateData) progress += 25;
    if (state.recommendations) progress += 20;
    
    return Math.min(95, progress); // Cap at 95% until fully complete
  }, [state]);

  const isComplete = useCallback(() => {
    return state.currentStep === 'results' && 
           state.recommendations && 
           state.recommendations.length > 0;
  }, [state.currentStep, state.recommendations]);

  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 'upload':
        return !!state.imageFile;
      case 'processing':
        return !!state.gpsData && !!state.locationData;
      case 'analyzing':
        return !!state.climateData && !!state.imageAnalysis;
      case 'results':
        return true;
      default:
        return false;
    }
  }, [state]);

  return {
    state,
    handleImageUpload,
    setManualLocation,
    selectTree,
    recalculateRecommendations,
    generatePlantingGuide,
    resetWorkflow,
    clearError,
    toggleAI,
    setOpenAIKey,
    getCompletePlan,
    getProgress,
    isComplete,
    canProceed,
    hasError: !!state.error,
    isProcessing: state.isLoading,
    hasResults: state.currentStep === 'results'
  };
};

export default useReforestation;