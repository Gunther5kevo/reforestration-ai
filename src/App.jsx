import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';


import useReforestation from './hooks/useReforestration';

// Import export helpers
import { exportAsCSV, exportAsTXT, exportAsJSON, generateShareText } from './utils/exportHelpers';

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
import { LoadingSpinner } from './components/ui';

// Constants
import { COLORS } from './constants/colors';

/**
 * Enhanced Alert Component with different types
 */
const Alert = ({ type = 'info', title, children, onClose, action }) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      text: 'text-blue-900'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: 'text-green-900'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      text: 'text-yellow-900'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      text: 'text-red-900'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-bold mb-1 ${style.text}`}>
              {title}
            </h4>
          )}
          <div className={`${style.text} text-sm`}>
            {children}
          </div>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Export Menu Component
 */
const ExportMenu = ({ plan, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = (format) => {
    const fileName = `reforestation-plan-${Date.now()}`;
    
    switch (format) {
      case 'csv':
        exportAsCSV(plan, fileName);
        break;
      case 'txt':
        exportAsTXT(plan, fileName);
        break;
      case 'json':
        exportAsJSON(plan, fileName);
        break;
      case 'share':
        const shareText = generateShareText(plan);
        navigator.clipboard.writeText(shareText).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
    
    if (format !== 'share') {
      setIsOpen(false);
      onExport?.(format);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
        style={{ backgroundColor: COLORS.accent }}
      >
        <Download className="w-5 h-5" />
        Export Plan
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
          <button
            onClick={() => handleExport('txt')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            📄 Text Report
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            📊 CSV Data
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            💾 JSON File
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={() => handleExport('share')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            {copied ? '✅ Copied!' : '🔗 Copy Share Text'}
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  // Use the custom reforestation hook
  const {
    state,
    handleImageUpload,
    resetWorkflow,
    clearError,
    getCompletePlan,
    getProgress
  } = useReforestation();

  const [showExportSuccess, setShowExportSuccess] = useState(false);

  /**
   * Handle export action
   */
  const handleExport = (format) => {
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  /**
   * Get alert configuration based on error or state
   */
  const getAlertConfig = () => {
    // Error alerts
    if (state.error) {
      // No trees found scenario
      if (state.error.includes('No suitable trees') || state.error.includes('no trees')) {
        return {
          type: 'warning',
          title: 'No Suitable Trees Found',
          message: (
            <>
              <p>We couldn't find trees that match your location's conditions.</p>
              <p className="mt-2">This might be due to:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Extreme climate conditions</li>
                <li>Insufficient GPS data from the image</li>
                <li>Very specific environmental constraints</li>
              </ul>
            </>
          ),
          action: (
            <div className="flex gap-2">
              <button
                onClick={clearError}
                className="px-4 py-2 bg-white border border-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
              >
                Try Different Image
              </button>
              <button
                onClick={() => {
                  clearError();
                  resetWorkflow();
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
              >
                Start Over
              </button>
            </div>
          )
        };
      }
      
      // GPS extraction error
      if (state.error.includes('GPS') || state.error.includes('coordinates')) {
        return {
          type: 'error',
          title: 'GPS Data Not Found',
          message: (
            <>
              <p>We couldn't extract GPS coordinates from your image.</p>
              <p className="mt-2">Make sure your image:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Was taken with a camera that records GPS</li>
                <li>Has location services enabled</li>
                <li>Still contains EXIF metadata (not edited heavily)</li>
              </ul>
            </>
          ),
          action: (
            <button
              onClick={() => {
                clearError();
                resetWorkflow();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Upload Different Image
            </button>
          )
        };
      }
      
      // API/Network errors
      if (state.error.includes('fetch') || state.error.includes('network') || state.error.includes('API')) {
        return {
          type: 'error',
          title: 'Connection Error',
          message: (
            <>
              <p>We couldn't connect to our data services.</p>
              <p className="mt-2">Please check your internet connection and try again.</p>
            </>
          ),
          action: (
            <button
              onClick={() => {
                clearError();
                // Retry by re-processing the image
                if (state.imageFile) {
                  handleImageUpload(state.imageFile);
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          )
        };
      }
      
      // Generic error
      return {
        type: 'error',
        title: 'Something Went Wrong',
        message: state.error,
        action: (
          <button
            onClick={() => {
              clearError();
              resetWorkflow();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Start Over
          </button>
        )
      };
    }

    // Success alert for export
    if (showExportSuccess) {
      return {
        type: 'success',
        title: 'Plan Exported Successfully!',
        message: 'Your reforestation plan has been downloaded.',
        showClose: true
      };
    }

    return null;
  };

  const alertConfig = getAlertConfig();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.background }}>
      <Header />
      
      <main className="flex-1 py-12 px-4">
        {/* Alert Display */}
        {alertConfig && (
          <div className="max-w-2xl mx-auto">
            <Alert
              type={alertConfig.type}
              title={alertConfig.title}
              onClose={alertConfig.showClose ? clearError : undefined}
              action={alertConfig.action}
            >
              {alertConfig.message}
            </Alert>
          </div>
        )}

        {/* UPLOAD STEP */}
        {state.currentStep === 'upload' && (
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
                  <p className="text-gray-600">Take a photo of your land with GPS enabled</p>
                </div>
                <div className="text-center p-6">
                  <div className="text-5xl mb-4">🤖</div>
                  <h4 className="font-bold mb-2" style={{ color: COLORS.textDark }}>2. AI Analysis</h4>
                  <p className="text-gray-600">We analyze climate, soil, and location data</p>
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
        {(state.currentStep === 'processing' || state.currentStep === 'analyzing') && (
          <div className="text-center py-12">
            <LoadingSpinner size="large" />
            <h3 className="text-2xl font-bold mb-4 mt-6" style={{ color: COLORS.textDark }}>
              Analyzing Your Location...
            </h3>
            <p className="text-lg text-gray-600 mb-8">{state.loadingMessage}</p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${getProgress()}%`,
                    backgroundColor: COLORS.accent 
                  }}
                />
              </div>
            </div>
            
            {/* Progress indicators */}
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                {state.gpsData ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : (
                  <LoadingSpinner size="small" />
                )}
                <span>Extracting GPS coordinates</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {state.locationData ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : state.gpsData ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Identifying location</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {state.climateData ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : state.locationData ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Fetching climate data</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {state.imageAnalysis ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : state.climateData ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                <span>Analyzing land conditions</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                {state.recommendations ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS.success }}>✓</div>
                ) : state.imageAnalysis ? (
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
        {state.currentStep === 'results' && state.recommendations && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Success Message with Export */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                    Analysis Complete!
                  </h2>
                  <p className="text-gray-700">
                    Found <strong>{state.recommendations.length}</strong> suitable tree species for your location
                  </p>
                  {state.aiInsights && (
                    <p className="text-sm text-green-600 mt-2">
                      ✨ Enhanced with AI insights
                    </p>
                  )}
                </div>
                <div>
                  <ExportMenu 
                    plan={getCompletePlan()} 
                    onExport={handleExport}
                  />
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {state.imageFile && <ImagePreview file={state.imageFile} analysis={state.imageAnalysis} />}
            
            {/* Location Display */}
            {state.locationData && <LocationDisplay location={state.locationData} gpsData={state.gpsData} />}
            
            {/* Climate Analysis */}
            {state.climateData && <ClimateAnalysis climate={state.climateData} />}
            
            {/* Tree Recommendations */}
            <TreeRecommendationList 
              trees={state.recommendations}
              plantingStrategy={state.plantingStrategy}
              aiInsights={state.aiInsights}
            />
            
            {/* Impact Visualization */}
            {state.impactMetrics && <ImpactVisualization impact={state.impactMetrics} />}
            
            {/* Planting Guide */}
            {state.recommendations.length > 0 && (
              <PlantingGuide 
                tree={state.recommendations[0]}
                location={state.locationData}
                climate={state.climateData}
                strategy={state.plantingStrategy}
              />
            )}
            
            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                <ActionButton onClick={resetWorkflow}>
                  🔄 Start New Analysis
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;