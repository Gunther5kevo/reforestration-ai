/**
 * useReforestation Hook - With Nature Validation
 * 
 * Key features:
 * - Nature image validation before processing
 * - No recursive calls in setManualLocation
 * - Proper workflow continuation after manual location
 * - Optimized parallel processing
 * - Better error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import imageService from '../services/imageService';
import climateService from '../services/climateService';
import locationService from '../services/locationService';
import recommendationService from '../services/recommendationService';
import openAIService from '../services/openAIService';

const useReforestation = () => {
  const isMounted = useRef(true);
  const isInitialized = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    isInitialized.current = true;
    console.log('🔧 useReforestation mounted');
    
    return () => {
      console.log('🧹 useReforestation unmounting');
      isMounted.current = false;
    };
  }, []);

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
    openAIKey: '',
    needsManualLocation: false,
    usingFallbackLocation: false,
    natureValidation: null // Store nature validation results
  });

  const updateState = useCallback((updates) => {
    if (!isMounted.current) {
      console.warn('⚠️ Attempting state update after unmount (might be StrictMode)');
    }
    
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setOpenAIKey = useCallback((apiKey) => {
    openAIService.setOpenAIKey(apiKey);
    updateState({ openAIKey: apiKey, useAI: true });
  }, [updateState]);

  /**
   * Calculate suitability score
   */
  const calculateSuitability = useCallback((climateAnalysis, imageAnalysis) => {
    let score = 70;
    const warnings = [];
    const recommendations = [];

    // Temperature check
    const avgTemp = climateAnalysis?.temperatureStats?.average || 20;
    if (avgTemp < 10) {
      score -= 15;
      warnings.push({
        type: 'cold-climate',
        severity: 'medium',
        message: 'Cold climate may limit tree species options'
      });
      recommendations.push('Focus on cold-hardy species');
    } else if (avgTemp > 30) {
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
    const rainfall = climateAnalysis?.annualRainfall || 1000;
    if (rainfall < 500) {
      score -= 20;
      warnings.push({
        type: 'low-rainfall',
        severity: 'high',
        message: 'Low rainfall area - irrigation may be necessary'
      });
      recommendations.push('Plan for regular irrigation');
    } else if (rainfall > 2000) {
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
    const vegLevel = imageAnalysis?.vegetationLevel || 'moderate';
    if (vegLevel === 'bare') {
      score += 10;
      recommendations.push('Bare land is ideal for new plantings');
    } else if (vegLevel === 'dense') {
      score -= 10;
      warnings.push({
        type: 'dense-vegetation',
        severity: 'medium',
        message: 'Dense existing vegetation may require clearing'
      });
    }

    const finalScore = Math.max(0, Math.min(100, score));
    let level;
    if (finalScore >= 80) level = 'excellent';
    else if (finalScore >= 65) level = 'good';
    else if (finalScore >= 50) level = 'moderate';
    else level = 'challenging';

    return {
      suitabilityScore: finalScore,
      suitabilityLevel: level,
      warnings,
      recommendations
    };
  }, []);

  /**
   * Get hardy fallback species
   */
  const getHardyFallbackSpecies = useCallback(async () => {
    try {
      const { default: TREE_DATABASE } = await import('../constants/treeDatabase');
      
      return TREE_DATABASE
        .filter(tree => 
          tree.hardiness === 'high' || 
          tree.waterNeeds === 'low' ||
          tree.adaptability === 'high'
        )
        .slice(0, 5)
        .map(tree => ({
          ...tree,
          compatibilityScore: 60,
          finalScore: 60,
          fallbackSpecies: true
        }));
    } catch (error) {
      console.error('Failed to load fallback species:', error);
      return [];
    }
  }, []);

  /**
   * Generate recommendations with fallback strategies
   */
  const generateRecommendationsWithFallback = useCallback(async (params) => {
    const { location, climateData, imageAnalysis, useAI, usingFallbackLocation, manualLocation } = params;

    try {
      // Try 1: Standard recommendation
      console.log('🔍 Attempting standard recommendations...');
      let result = await recommendationService.generateRecommendations({
        location,
        climateData,
        imageAnalysis,
        useAI,
        manualLocation
      });

      if (result.success && result.recommendations?.length > 0) {
        console.log(`✅ Found ${result.recommendations.length} trees (standard)`);
        return result;
      }

      // Try 2: Relaxed criteria
      if (usingFallbackLocation || manualLocation) {
        console.warn('⚠️ No trees with standard criteria, trying relaxed mode...');
        
        result = await recommendationService.generateRecommendations({
          location,
          climateData,
          imageAnalysis,
          useAI,
          manualLocation,
          relaxed: true,
          toleranceBuffer: 5
        });

        if (result.success && result.recommendations?.length > 0) {
          console.log(`✅ Found ${result.recommendations.length} trees (relaxed)`);
          return {
            ...result,
            fallbackMode: true,
            warning: 'Using approximate location. Enable GPS for more accurate results.'
          };
        }
      }

      // Try 3: Hardy species fallback
      console.warn('⚠️ Using hardy species fallback...');
      const hardySpecies = await getHardyFallbackSpecies();
      
      return {
        success: true,
        recommendations: hardySpecies,
        fallbackMode: true,
        warning: 'Showing general hardy species. Set exact location for better recommendations.',
        plantingStrategy: {
          density: '300-400 trees/hectare',
          bestMonths: ['March', 'April', 'May', 'October', 'November'],
          spacing: '3-4 meters',
          mixRatio: {},
          source: 'fallback'
        },
        impactMetrics: {
          carbonSequestration: { year1: 150, year10: 1425, perTree: 5, unit: 'kg CO2' },
          biodiversity: { score: 70, level: 'good' },
          density: { treesPerHectare: 350, survivalRate: 90 },
          economicValue: { carbonCredits: 14250, timber: 17500, total: 31750, currency: 'USD' },
          ecosystem: { soilImprovement: 'moderate', waterRetention: 'moderate', habitatCreation: 'good' }
        }
      };
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate recommendations'
      };
    }
  }, [getHardyFallbackSpecies]);

  /**
   * Main processing function - handles both GPS and manual location
   */
  const processWithLocation = useCallback(async (file, preview, gpsData, isManual = false) => {
    try {
      console.log(`🚀 Processing with ${isManual ? 'manual' : 'GPS'} location:`, {
        lat: gpsData.latitude?.toFixed(4),
        lon: gpsData.longitude?.toFixed(4)
      });

      updateState({
        gpsData,
        imagePreview: preview,
        usingFallbackLocation: isManual,
        loadingMessage: 'Analyzing location and image...',
        isLoading: true,
        currentStep: 'analyzing',
        needsManualLocation: false
      });

      // ⚡ PARALLEL: Location + Image analysis
      console.log('⚡ Step 1: Getting location & analyzing image...');
      const [locationData, imageAnalysis] = await Promise.all([
        locationService.reverseGeocode(gpsData.latitude, gpsData.longitude),
        imageService.analyzeImageBasic(file)
      ]);

      if (!isMounted.current) return;

      console.log('✅ Location & analysis complete');

      updateState({
        locationData,
        imageAnalysis,
        loadingMessage: 'Fetching climate data...'
      });

      // Step 2: Climate data
      console.log('⚡ Step 2: Fetching climate data...');
      const climateData = await climateService.fetchClimateWithRetry(
        gpsData.latitude,
        gpsData.longitude
      );

      if (!isMounted.current) return;

      const climateAnalysis = climateService.analyzeClimate(climateData);
      const suitability = calculateSuitability(climateAnalysis, imageAnalysis);

      console.log('✅ Climate data complete');

      updateState({
        climateData,
        climateAnalysis,
        suitability,
        loadingMessage: 'Generating tree recommendations...'
      });

      // Step 3: Generate recommendations
      console.log('⚡ Step 3: Generating recommendations...');
      const recommendationResult = await generateRecommendationsWithFallback({
        location: locationData,
        climateData: { ...climateData, ...climateAnalysis },
        imageAnalysis,
        useAI: state.useAI && openAIService.isOpenAIConfigured(),
        usingFallbackLocation: isManual,
        manualLocation: isManual
      });

      if (!isMounted.current) return;

      if (!recommendationResult.success) {
        throw new Error(recommendationResult.error || 'Failed to generate recommendations');
      }

      if (!recommendationResult.recommendations?.length) {
        throw new Error('No suitable trees found for this location');
      }

      // Step 4: Complete!
      console.log(`✅ Analysis complete! Found ${recommendationResult.recommendations.length} trees`);
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
        error: error.message || 'Processing failed',
        isLoading: false,
        loadingMessage: '',
        currentStep: 'processing'
      });
    }
  }, [state.useAI, updateState, calculateSuitability, generateRecommendationsWithFallback]);

  /**
   * Handle image upload with nature validation
   */
  const handleImageUpload = useCallback(async (file) => {
    if (!file) {
      updateState({
        imageFile: null,
        imagePreview: null,
        currentStep: 'upload',
        error: null,
        needsManualLocation: false,
        natureValidation: null
      });
      return;
    }

    try {
      updateState({
        isLoading: true,
        loadingMessage: 'Validating image...',
        error: null,
        currentStep: 'processing',
        imageFile: file,
        needsManualLocation: false
      });

      // Step 1: Validate that it's a nature image
      console.log('🔍 Step 1: Validating nature content...');
      const validation = await imageService.validateImageFileEnhanced(file);
      
      if (!validation.valid) {
        console.error('❌ Nature validation failed:', validation.error);
        updateState({
          error: validation.error,
          isLoading: false,
          loadingMessage: '',
          currentStep: 'upload',
          imageFile: null
        });
        return;
      }

      console.log('✅ Nature validation passed:', validation.natureCheck);

      updateState({
        natureValidation: validation.natureCheck,
        loadingMessage: 'Processing image...'
      });

      // Step 2: Extract GPS & Create Preview (parallel)
      console.log('⚡ Step 2: Extracting GPS & creating preview...');
      const [gpsData, preview] = await Promise.all([
        imageService.extractGPSFromImage(file),
        imageService.createImagePreview(file)
      ]);

      console.log('✅ GPS extraction complete:', gpsData);
      console.log('✅ Preview creation complete');

      console.log('📍 GPS Status:', {
        hasGPS: gpsData.hasGPS,
        source: gpsData.source,
        latitude: gpsData.latitude,
        longitude: gpsData.longitude
      });

      // Check if GPS is available
      if (!gpsData.hasGPS) {
        console.warn('⚠️ No GPS - requesting manual location');
        updateState({
          gpsData,
          imagePreview: preview,
          needsManualLocation: true,
          usingFallbackLocation: true,
          isLoading: false,
          loadingMessage: 'Please set your location to continue...',
          currentStep: 'processing'
        });
        return; // STOP - wait for manual location
      }

      console.log('✅ GPS found - continuing with automatic processing');

      // Continue with GPS data
      await processWithLocation(file, preview, gpsData, false);

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (!isMounted.current) return;

      updateState({
        error: error.message || 'Failed to process image',
        isLoading: false,
        loadingMessage: '',
        currentStep: 'upload'
      });
    }
  }, [updateState, processWithLocation]);

  /**
   * Set manual location and continue processing
   */
  const setManualLocation = useCallback(async (latitude, longitude) => {
    console.log('📍 Manual location set:', { latitude, longitude });
    
    const currentFile = state.imageFile;
    const currentPreview = state.imagePreview;
    
    if (!currentFile) {
      console.error('❌ No image file available in state');
      updateState({ error: 'Please upload an image first' });
      return;
    }

    try {
      updateState({
        isLoading: true,
        loadingMessage: 'Processing with your location...',
        error: null,
        needsManualLocation: false
      });

      const manualGpsData = {
        latitude,
        longitude,
        altitude: null,
        timestamp: new Date().toISOString(),
        hasGPS: false,
        source: 'manual'
      };

      // Continue processing with manual location
      await processWithLocation(currentFile, currentPreview, manualGpsData, true);

    } catch (error) {
      console.error('❌ Manual location error:', error);
      
      if (!isMounted.current) return;
      
      updateState({
        error: error.message || 'Failed to set location',
        isLoading: false,
        loadingMessage: '',
        currentStep: 'processing'
      });
    }
  }, [state.imageFile, state.imagePreview, updateState, processWithLocation]);

  const selectTree = useCallback((tree) => {
    updateState({ selectedTree: tree });
  }, [updateState]);

  const recalculateRecommendations = useCallback(async (params = {}) => {
    if (!state.locationData || !state.climateData || !state.imageAnalysis) {
      updateState({ error: 'Missing required data' });
      return;
    }

    try {
      updateState({
        isLoading: true,
        loadingMessage: 'Recalculating...',
        error: null
      });

      const result = await generateRecommendationsWithFallback({
        location: state.locationData,
        climateData: state.climateData,
        imageAnalysis: state.imageAnalysis,
        useAI: params.useAI ?? state.useAI,
        usingFallbackLocation: state.usingFallbackLocation,
        manualLocation: state.gpsData?.source === 'manual'
      });

      if (!isMounted.current) return;

      if (!result.success || !result.recommendations?.length) {
        throw new Error('Failed to generate recommendations');
      }

      updateState({
        recommendations: result.recommendations,
        selectedTree: result.recommendations[0],
        plantingStrategy: result.plantingStrategy,
        impactMetrics: result.impactMetrics,
        aiInsights: result.aiInsights,
        isLoading: false,
        loadingMessage: ''
      });

    } catch (error) {
      if (!isMounted.current) return;
      
      updateState({
        error: error.message || 'Recalculation failed',
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [state.locationData, state.climateData, state.imageAnalysis, state.useAI, state.usingFallbackLocation, state.gpsData, updateState, generateRecommendationsWithFallback]);

  const generatePlantingGuide = useCallback(async () => {
    if (!state.selectedTree || !openAIService.isOpenAIConfigured()) {
      return null;
    }

    try {
      return await openAIService.generatePlantingGuide(
        state.selectedTree,
        {
          location: state.locationData,
          climate: state.climateData
        }
      );
    } catch (error) {
      console.error('Planting guide error:', error);
      return null;
    }
  }, [state.selectedTree, state.locationData, state.climateData]);

  const getCompletePlan = useCallback(() => {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0',
        generator: 'ReForest.AI',
        usingFallbackLocation: state.usingFallbackLocation,
        locationSource: state.gpsData?.source || 'unknown',
        natureValidation: state.natureValidation
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
      openAIKey: state.openAIKey,
      needsManualLocation: false,
      usingFallbackLocation: false,
      natureValidation: null
    });
  }, [state.useAI, state.openAIKey]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const toggleAI = useCallback(() => {
    updateState({ useAI: !state.useAI });
  }, [state.useAI, updateState]);

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

    let progress = 0;
    if (state.natureValidation) progress += 10;
    if (state.gpsData) progress += 15;
    if (state.imagePreview) progress += 5;
    if (state.locationData) progress += 20;
    if (state.imageAnalysis) progress += 15;
    if (state.climateData) progress += 25;
    if (state.recommendations) progress += 10;
    
    return Math.min(95, progress);
  }, [state]);

  const isComplete = useCallback(() => {
    return state.currentStep === 'results' && state.recommendations?.length > 0;
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