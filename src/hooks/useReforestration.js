/**
 * useReforestation Hook
 * Custom hook for managing reforestation workflow state and logic
 */

import { useState, useCallback, useEffect } from 'react';
import imageService from '../services/imageService';
import climateService from '../services/climateService';
import locationService from '../services/locationService';
import recommendationService from '../services/recommendationService';
import openAIService from '../services/openAIService';

const useReforestation = () => {
  // State management
  const [state, setState] = useState({
    // Workflow step
    currentStep: 'upload', // upload, processing, analyzing, results
    
    // Image data
    imageFile: null,
    imagePreview: null,
    imageAnalysis: null,
    
    // Location data
    gpsData: null,
    locationData: null,
    
    // Climate data
    climateData: null,
    
    // Recommendations
    recommendations: null,
    selectedTree: null,
    plantingStrategy: null,
    impactMetrics: null,
    aiInsights: null,
    
    // Loading states
    isLoading: false,
    loadingMessage: '',
    
    // Errors
    error: null,
    
    // Configuration
    useAI: true,
    openAIKey: ''
  });

  /**
   * Update state helper
   */
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Set OpenAI API key
   */
  const setOpenAIKey = useCallback((apiKey) => {
    openAIService.setOpenAIKey(apiKey);
    updateState({ openAIKey: apiKey, useAI: true });
  }, [updateState]);

  /**
   * Step 1: Handle image upload
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

    // Validate file
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
        currentStep: 'processing'
      });

      // Create preview
      const preview = await imageService.createImagePreview(file);
      
      updateState({
        imageFile: file,
        imagePreview: preview,
        loadingMessage: 'Extracting GPS data...'
      });

      // Extract GPS
      const gpsData = await imageService.extractGPSFromImage(file);
      
      if (!gpsData) {
        throw new Error('Could not extract GPS data from image');
      }

      updateState({
        gpsData,
        loadingMessage: 'Getting location information...'
      });

      // Reverse geocode
      const locationData = await locationService.reverseGeocode(
        gpsData.latitude,
        gpsData.longitude
      );

      updateState({
        locationData,
        loadingMessage: 'Analyzing image...'
      });

      // Analyze image
      const imageAnalysis = await imageService.analyzeImageBasic(file);

      updateState({
        imageAnalysis,
        loadingMessage: 'Fetching climate data...',
        currentStep: 'analyzing'
      });

      // Fetch climate data
      const climateData = await climateService.fetchClimateWithRetry(
        gpsData.latitude,
        gpsData.longitude
      );

      // Analyze climate
      const climateAnalysis = climateService.analyzeClimate(climateData);

      updateState({
        climateData: { ...climateData, ...climateAnalysis },
        loadingMessage: 'Generating recommendations...'
      });

      // Generate recommendations
      const recommendationResult = await recommendationService.generateRecommendations({
        location: locationData,
        climateData: { ...climateData, ...climateAnalysis },
        imageAnalysis,
        useAI: state.useAI && openAIService.isOpenAIConfigured()
      });

      if (!recommendationResult.success) {
        throw new Error(recommendationResult.error || 'Failed to generate recommendations');
      }

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
      console.error('Image upload processing error:', error);
      updateState({
        error: error.message || 'An error occurred while processing the image',
        isLoading: false,
        loadingMessage: '',
        currentStep: 'upload'
      });
    }
  }, [state.useAI, updateState]);

  /**
   * Manually set location (fallback if GPS fails)
   */
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

      updateState({
        gpsData,
        locationData,
        isLoading: false,
        loadingMessage: ''
      });

    } catch (error) {
      updateState({
        error: 'Failed to get location information',
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [updateState]);

  /**
   * Select a different tree from recommendations
   */
  const selectTree = useCallback((tree) => {
    updateState({ selectedTree: tree });
  }, [updateState]);

  /**
   * Recalculate recommendations with different parameters
   */
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
      updateState({
        error: error.message || 'Failed to recalculate recommendations',
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [state, updateState]);

  /**
   * Generate AI planting guide for selected tree
   */
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

  /**
   * Get complete plan data for export
   */
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
      imageAnalysis: state.imageAnalysis,
      recommendations: state.recommendations,
      selectedTree: state.selectedTree,
      plantingStrategy: state.plantingStrategy,
      impactMetrics: state.impactMetrics,
      aiInsights: state.aiInsights
    };
  }, [state]);

  /**
   * Reset workflow
   */
  const resetWorkflow = useCallback(() => {
    setState({
      currentStep: 'upload',
      imageFile: null,
      imagePreview: null,
      imageAnalysis: null,
      gpsData: null,
      locationData: null,
      climateData: null,
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

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Toggle AI usage
   */
  const toggleAI = useCallback(() => {
    updateState({ useAI: !state.useAI });
  }, [state.useAI, updateState]);

  /**
   * Save plan to local storage
   */
  const savePlanLocally = useCallback(() => {
    try {
      const plan = getCompletePlan();
      const plans = JSON.parse(localStorage.getItem('reforestPlans') || '[]');
      plans.unshift({
        id: Date.now(),
        savedAt: new Date().toISOString(),
        ...plan
      });
      
      // Keep only last 10 plans
      if (plans.length > 10) {
        plans.length = 10;
      }
      
      localStorage.setItem('reforestPlans', JSON.stringify(plans));
      return true;
    } catch (error) {
      console.error('Save to local storage failed:', error);
      return false;
    }
  }, [getCompletePlan]);

  /**
   * Load plans from local storage
   */
  const loadSavedPlans = useCallback(() => {
    try {
      const plans = JSON.parse(localStorage.getItem('reforestPlans') || '[]');
      return plans;
    } catch (error) {
      console.error('Load from local storage failed:', error);
      return [];
    }
  }, []);

  /**
   * Load a specific plan
   */
  const loadPlan = useCallback((planId) => {
    try {
      const plans = loadSavedPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (plan) {
        updateState({
          locationData: plan.location,
          gpsData: plan.gps,
          climateData: plan.climate,
          imageAnalysis: plan.imageAnalysis,
          recommendations: plan.recommendations,
          selectedTree: plan.selectedTree,
          plantingStrategy: plan.plantingStrategy,
          impactMetrics: plan.impactMetrics,
          aiInsights: plan.aiInsights,
          currentStep: 'results'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Load plan failed:', error);
      return false;
    }
  }, [loadSavedPlans, updateState]);

  /**
   * Get workflow progress percentage
   */
  const getProgress = useCallback(() => {
    const steps = {
      upload: 0,
      processing: 25,
      analyzing: 50,
      results: 100
    };
    return steps[state.currentStep] || 0;
  }, [state.currentStep]);

  /**
   * Check if workflow is complete
   */
  const isComplete = useCallback(() => {
    return state.currentStep === 'results' && 
           state.recommendations && 
           state.recommendations.length > 0;
  }, [state.currentStep, state.recommendations]);

  /**
   * Check if can proceed to next step
   */
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

  // Auto-save to local storage when recommendations are generated
  useEffect(() => {
    if (isComplete() && state.recommendations) {
      const autoSaveTimer = setTimeout(() => {
        savePlanLocally();
      }, 2000); // Auto-save after 2 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [isComplete, state.recommendations, savePlanLocally]);

  return {
    // State
    state,
    
    // Actions
    handleImageUpload,
    setManualLocation,
    selectTree,
    recalculateRecommendations,
    generatePlantingGuide,
    resetWorkflow,
    clearError,
    toggleAI,
    setOpenAIKey,
    
    // Storage
    savePlanLocally,
    loadSavedPlans,
    loadPlan,
    
    // Utilities
    getCompletePlan,
    getProgress,
    isComplete,
    canProceed,
    
    // Computed
    hasError: !!state.error,
    isProcessing: state.isLoading,
    hasResults: state.currentStep === 'results'
  };
};

export default useReforestation;