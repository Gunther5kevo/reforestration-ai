import React, { useState } from 'react';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Feature Components
import ImageUploader from './components/upload/ImageUploader';
import ImagePreview from './components/upload/ImagePreview';
import LocationDisplay from './components/location/LocationDisplay';
import ClimateAnalysis from './components/analysis/ClimateAnalysis';
import TreeRecommendationList from './components/recommendations/TreeRecommendationList';
import ImpactVisualization from './components/impact/ImpactVisualization';
import PlantingGuide from './components/guide/PlantingGuide';
import ActionButton from './components/action/ActionButton';

// UI Components
import { LoadingSpinner, Alert } from './components/ui';

// Services
import imageService from './services/imageService';
import locationService from './services/locationService';
import climateService from './services/climateService';
import recommendationService from './services/recommendationService';

// Constants
import { COLORS } from './constants/colors';
import CONFIG from './constants/config';

function App() {
  // State management
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'processing', 'results'
  const [imageFile, setImageFile] = useState(null);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState(null);
  
  // Data states
  const [gpsData, setGpsData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [climateData, setClimateData] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  /**
   * Main image upload and processing handler
   */
  const handleImageUpload = async (file) => {
    // Validate file first
    const validation = imageService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setImageFile(file);
    setCurrentStep('processing');
    setError(null);

    try {
      // STEP 1: Extract GPS from image
      setProcessingStage('Extracting GPS coordinates...');
      console.log('📍 Step 1: Extracting GPS from image');
      
      const extractedGPS = await imageService.extractGPSFromImage(file);
      
      if (!extractedGPS) {
        throw new Error('Could not extract GPS data from image. Using default location.');
      }
      
      setGpsData(extractedGPS);
      console.log('✅ GPS extracted:', extractedGPS);

      // STEP 2: Reverse geocode to get location name
      setProcessingStage('Identifying location...');
      console.log('🗺️ Step 2: Reverse geocoding coordinates');
      
      const location = await locationService.reverseGeocode(
        extractedGPS.latitude,
        extractedGPS.longitude
      );
      
      setLocationData(location);
      console.log('✅ Location identified:', location);

      // STEP 3: Fetch climate data
      setProcessingStage('Fetching climate data...');
      console.log('🌤️ Step 3: Fetching climate from Open-Meteo');
      
      const climate = await climateService.fetchClimateWithRetry(
        extractedGPS.latitude,
        extractedGPS.longitude
      );
      
      // Analyze climate for reforestation
      const climateAnalysis = climateService.analyzeClimate(climate);
      setClimateData(climateAnalysis);
      console.log('✅ Climate data fetched:', climateAnalysis);

      // STEP 4: Analyze image for soil/vegetation
      setProcessingStage('Analyzing land conditions...');
      console.log('🖼️ Step 4: Analyzing image');
      
      const imageAnalysisResult = await imageService.analyzeImageBasic(file);
      setImageAnalysis(imageAnalysisResult);
      console.log('✅ Image analyzed:', imageAnalysisResult);

      // STEP 5: Generate tree recommendations
      setProcessingStage('Generating tree recommendations...');
      console.log('🌳 Step 5: Generating recommendations');
      
      const recommendationResults = await recommendationService.generateRecommendations({
        location,
        climateData: climateAnalysis,
        imageAnalysis: imageAnalysisResult,
        useAI: CONFIG.USE_OPENAI_ENHANCEMENT || false,
        enrichWithAPIs: CONFIG.ENABLE_API_ENRICHMENT || false
      });
      
      if (!recommendationResults.success) {
        throw new Error(recommendationResults.error || 'Failed to generate recommendations');
      }
      
      setRecommendations(recommendationResults);
      console.log('✅ Recommendations generated:', recommendationResults);
      
      // Success! Move to results
      console.log('🎉 Analysis complete!');
      setCurrentStep('results');
      
    } catch (err) {
      console.error('❌ Processing error:', err);
      setError(err.message || 'Failed to process image. Please try again.');
      setCurrentStep('upload');
      
      // Log which step failed
      console.error('Failed at stage:', processingStage);
    }
  };

  /**
   * Reset the app to initial state
   */
  const handleReset = () => {
    setCurrentStep('upload');
    setImageFile(null);
    setProcessingStage('');
    setError(null);
    setGpsData(null);
    setLocationData(null);
    setClimateData(null);
    setImageAnalysis(null);
    setRecommendations(null);
    
    console.log('🔄 App reset');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.background }}>
      <Header />
      
      <main className="flex-1 py-12 px-4">
        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* UPLOAD STEP */}
        {currentStep === 'upload' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.textDark }}>
                Plant the Right Trees, 🌳
                <br />
                <span style={{ color: COLORS.accent }}>In the Right Place</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                Upload a photo of your land and get AI-powered tree recommendations based on climate, 
                soil, and location data.
              </p>
            </div>

            {/* Image Uploader */}
            <ImageUploader onImageUpload={handleImageUpload} />
            
            {/* How It Works Section */}
            <div className="max-w-4xl mx-auto mt-16">
              <h3 className="text-2xl font-bold text-center mb-8" style={{ color: COLORS.textDark }}>
                How It Works
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="text-5xl mb-4">📸</div>
                  <h4 className="font-bold mb-2" style={{ color: COLORS.textDark }}>1. Upload Photo</h4>
                  <p className="text-gray-600">Take a photo of your land and upload it</p>
                </div>
                <div className="text-center p-6">
                  <div className="text-5xl mb-4">🤖</div>
                  <h4 className="font-bold mb-2" style={{ color: COLORS.textDark }}>2. AI Analysis</h4>
                  <p className="text-gray-600">We analyze climate, soil, and location</p>
                </div>
                <div className="text-center p-6">
                  <div className="text-5xl mb-4">🌱</div>
                  <h4 className="font-bold mb-2" style={{ color: COLORS.textDark }}>3. Get Recommendations</h4>
                  <p className="text-gray-600">Receive personalized tree suggestions</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PROCESSING STEP */}
        {currentStep === 'processing' && (
          <div className="text-center py-12">
            <LoadingSpinner size="large" />
            <h3 className="text-2xl font-bold mb-4 mt-6" style={{ color: COLORS.textDark }}>
              Analyzing Your Location...
            </h3>
            <p className="text-lg text-gray-600 mb-8">{processingStage}</p>
            
            {/* Progress indicators */}
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                {gpsData ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : (
                  <LoadingSpinner size="small" />
                )}
                <span>Extracting GPS coordinates</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {locationData ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : gpsData ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Identifying location</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {climateData ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : locationData ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Fetching climate data</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {imageAnalysis ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : climateData ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Analyzing land conditions</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {recommendations ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : imageAnalysis ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Generating recommendations</span>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STEP */}
        {currentStep === 'results' && recommendations && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                Analysis Complete!
              </h2>
              <p className="text-gray-700">
                Found <strong>{recommendations.recommendations.length}</strong> suitable tree species for your location
              </p>
              {recommendations.aiEnhanced && (
                <p className="text-sm text-green-600 mt-2">
                  ✨ Enhanced with AI insights
                </p>
              )}
            </div>

            {/* Image Preview */}
            {imageFile && <ImagePreview file={imageFile} analysis={imageAnalysis} />}
            
            {/* Location Display */}
            {locationData && <LocationDisplay location={locationData} gpsData={gpsData} />}
            
            {/* Climate Analysis */}
            {climateData && <ClimateAnalysis climate={climateData} />}
            
            {/* Tree Recommendations */}
            <TreeRecommendationList 
              trees={recommendations.recommendations}
              plantingStrategy={recommendations.plantingStrategy}
              aiInsights={recommendations.aiInsights}
            />
            
            {/* Impact Visualization */}
            <ImpactVisualization impact={recommendations.impactMetrics} />
            
            {/* Planting Guide */}
            {recommendations.recommendations.length > 0 && (
              <PlantingGuide 
                tree={recommendations.recommendations[0]}
                location={locationData}
                climate={climateData}
                strategy={recommendations.plantingStrategy}
              />
            )}
            
            {/* Reset Button */}
            <div className="text-center">
              <ActionButton onClick={handleReset}>
                🔄 Start New Analysis
              </ActionButton>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;