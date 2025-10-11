import React, { useState, useEffect } from "react";
import {
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  MapPin,
  Camera,
  Lightbulb,
} from "lucide-react";

import useReforestation from "./hooks/useReforestation";

// Import export helpers
import {
  exportAsCSV,
  exportAsTXT,
  exportAsJSON,
  generateShareText,
} from "./utils/exportHelpers";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Feature Components
import ImageUploader from "./components/upload/ImageUploader";
import ImagePreview from "./components/upload/ImagePreview";
import LocationDisplay from "./components/location/LocationDisplay";
import ManualLocationPicker from "./components/location/ManualLocationPicker";
import ClimateAnalysis from "./components/analysis/ClimateAnalysis";
import TreeRecommendationList from "./components/recommendations/TreeRecommendationList";
import ImpactVisualization from "./components/impact/ImpactVisualization";
import PlantingGuide from "./components/guide/PlantingGuide";
import ActionButton from "./components/action/ActionButton";

// UI Components
import { LoadingSpinner } from "./components/ui";

// Constants
import { COLORS } from "./constants/colors";

/**
 * Enhanced Alert Component
 */
const Alert = ({ type = "info", title, children, onClose, action }) => {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Info className="w-5 h-5 text-blue-500" />,
      text: "text-blue-900",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "text-green-900",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      text: "text-yellow-900",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      text: "text-red-900",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      className={`${style.bg} border-2 ${style.border} rounded-xl p-4 mb-6 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1">
          {title && <h4 className={`font-bold mb-1 ${style.text}`}>{title}</h4>}
          <div className={`${style.text} text-sm`}>{children}</div>
          {action && <div className="mt-3">{action}</div>}
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
 * Location Permission Prompt
 */
const LocationPrompt = ({ onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <Alert
      type="info"
      title="📍 Enable Location Services"
      onClose={handleDismiss}
    >
      <p className="mb-2">
        For best results, please <strong>enable location/GPS</strong> on your
        device before taking a photo.
      </p>
      <div className="bg-white rounded-lg p-3 mt-3 text-xs space-y-2">
        <p className="font-semibold text-blue-800">How to enable:</p>
        <ul className="list-disc ml-4 space-y-1 text-blue-700">
          <li>
            <strong>Android:</strong> Settings → Location → Turn On
          </li>
          <li>
            <strong>iOS:</strong> Settings → Privacy → Location Services →
            Camera → While Using
          </li>
        </ul>
        <p className="text-blue-600 mt-2">
          💡 This ensures accurate climate and location data for tree
          recommendations.
        </p>
      </div>
    </Alert>
  );
};

/**
 * Photo Tips Component
 */
const PhotoTips = () => {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <button
        onClick={() => setShowTips(!showTips)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mx-auto"
      >
        <Camera className="w-5 h-5" />
        {showTips ? "Hide" : "Show"} Photo Tips
      </button>

      {showTips && (
        <div className="mt-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h4 className="font-bold text-gray-800">Tips for Best Results</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-semibold text-green-700 mb-2">✅ DO</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Take photo in good daylight</li>
                <li>• Focus on the ground/soil</li>
                <li>• Include visible terrain</li>
                <li>• Enable GPS before shooting</li>
                <li>• Use original camera app</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h5 className="font-semibold text-red-700 mb-2">❌ DON'T</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Point camera at sky</li>
                <li>• Take photos in darkness</li>
                <li>• Use heavily edited images</li>
                <li>• Include mostly buildings</li>
                <li>• Crop or filter photos</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Best:</strong> Stand in the middle of your planting site
              and take a photo showing the ground, with some horizon visible.
              Make sure GPS is enabled!
            </p>
          </div>
        </div>
      )}
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
      case "csv":
        exportAsCSV(plan, fileName);
        break;
      case "txt":
        exportAsTXT(plan, fileName);
        break;
      case "json":
        exportAsJSON(plan, fileName);
        break;
      case "share":
        const shareText = generateShareText(plan);
        navigator.clipboard.writeText(shareText).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
      default:
        break;
    }

    if (format !== "share") {
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
            onClick={() => handleExport("txt")}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            📄 Text Report
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            📊 CSV Data
          </button>
          <button
            onClick={() => handleExport("json")}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            💾 JSON File
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={() => handleExport("share")}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            {copied ? "✅ Copied!" : "🔗 Copy Share Text"}
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const {
    state,
    handleImageUpload,
    setManualLocation,
    resetWorkflow,
    clearError,
    getCompletePlan,
    getProgress,
  } = useReforestation();

  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [isDevelopment] = useState(process.env.NODE_ENV === "development");

  // Check if we should show location prompt
  useEffect(() => {
    const hasSeenPrompt = sessionStorage.getItem("hasSeenLocationPrompt");
    if (hasSeenPrompt) {
      setShowLocationPrompt(false);
    }
  }, []);

  const handleDismissLocationPrompt = () => {
    sessionStorage.setItem("hasSeenLocationPrompt", "true");
    setShowLocationPrompt(false);
  };

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
      // No trees found
      if (
        state.error.includes("No suitable trees") ||
        state.error.includes("no trees")
      ) {
        return {
          type: "warning",
          title: "⚠️ No Suitable Trees Found",
          message: (
            <>
              <p>
                We couldn't find trees that perfectly match your location's
                conditions.
              </p>
              <div className="mt-3 bg-white rounded-lg p-3 text-xs">
                <p className="font-semibold mb-2">Possible reasons:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Photo doesn't contain GPS data (location not enabled)</li>
                  <li>Extreme climate conditions (very hot/cold or dry/wet)</li>
                  <li>Image quality too poor for analysis</li>
                </ul>
              </div>
            </>
          ),
          action: (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  clearError();
                  setShowLocationPrompt(true);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
              >
                📍 Check GPS & Retry
              </button>
              <button
                onClick={() => {
                  clearError();
                  resetWorkflow();
                }}
                className="px-4 py-2 bg-white border border-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
              >
                Start Over
              </button>
            </div>
          ),
        };
      }

      // GPS/Location errors
      if (
        state.error.includes("GPS") ||
        state.error.includes("location") ||
        state.error.includes("coordinates")
      ) {
        return {
          type: "error",
          title: "📍 Location Data Missing",
          message: (
            <>
              <p className="mb-2">
                Your photo doesn't contain GPS coordinates.
              </p>
              <div className="bg-white rounded-lg p-3 mt-3 text-xs space-y-2">
                <p className="font-semibold text-red-800">To fix this:</p>
                <ol className="list-decimal ml-4 space-y-1 text-red-700">
                  <li>Enable Location Services on your device</li>
                  <li>Open your Camera app</li>
                  <li>Allow Camera to access location</li>
                  <li>Take a new photo of your land</li>
                  <li>Upload the fresh photo here</li>
                </ol>
              </div>
            </>
          ),
          action: (
            <button
              onClick={() => {
                clearError();
                setShowLocationPrompt(true);
                resetWorkflow();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              📸 Take New Photo
            </button>
          ),
        };
      }

      // Network/API errors
      if (
        state.error.includes("fetch") ||
        state.error.includes("network") ||
        state.error.includes("API") ||
        state.error.includes("timeout")
      ) {
        return {
          type: "error",
          title: "🌐 Connection Error",
          message: (
            <>
              <p>Unable to reach our data services.</p>
              <p className="mt-2 text-xs">
                Please check your internet connection and try again.
              </p>
            </>
          ),
          action: (
            <button
              onClick={() => {
                clearError();
                if (state.imageFile) {
                  handleImageUpload(state.imageFile);
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              🔄 Retry
            </button>
          ),
        };
      }

      // Image quality errors
      if (state.error.includes("image") || state.error.includes("file")) {
        return {
          type: "error",
          title: "📸 Image Problem",
          message: (
            <>
              <p>{state.error}</p>
              <p className="mt-2 text-xs">
                Please ensure you're uploading a clear, unedited photo from your
                camera.
              </p>
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
          ),
        };
      }

      // Generic error
      return {
        type: "error",
        title: "❌ Something Went Wrong",
        message: (
          <>
            <p className="font-mono text-xs bg-white p-2 rounded">
              {state.error}
            </p>
            <p className="mt-2 text-xs">
              Please try again or contact support if the problem persists.
            </p>
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
            Start Over
          </button>
        ),
      };
    }

    // Success alert for export
    if (showExportSuccess) {
      return {
        type: "success",
        title: "✅ Plan Exported Successfully!",
        message: "Your reforestation plan has been downloaded.",
        showClose: true,
      };
    }

    return null;
  };

  const alertConfig = getAlertConfig();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.background }}
    >
      <Header />

      <main className="flex-1 py-12 px-4">
        {/* Fixed Alert Display */}
        {alertConfig && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-slideDown">
            <Alert
              type={alertConfig.type}
              title={alertConfig.title}
              onClose={
                alertConfig.showClose
                  ? () => setShowExportSuccess(false)
                  : undefined
              }
              action={alertConfig.action}
            >
              {alertConfig.message}
            </Alert>
          </div>
        )}

        {/* UPLOAD STEP */}
        {state.currentStep === "upload" && (
          <>
            {/* Show loading during initial GPS check */}
            {state.isLoading && !state.needsManualLocation ? (
              <div className="text-center py-12">
                <LoadingSpinner size="large" />
                <h3
                  className="text-2xl font-bold mb-4 mt-6"
                  style={{ color: COLORS.textDark }}
                >
                  Checking Image...
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  {state.loadingMessage || "Extracting GPS data..."}
                </p>
              </div>
            ) : state.needsManualLocation && state.imageFile ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Show image preview */}
                {state.imagePreview && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3
                      className="text-xl font-bold mb-4"
                      style={{ color: COLORS.textDark }}
                    >
                      Your Uploaded Image
                    </h3>
                    <img
                      src={state.imagePreview}
                      alt="Uploaded land"
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Location required message */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                  <MapPin className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3
                    className="text-2xl font-bold mb-2 text-center"
                    style={{ color: COLORS.textDark }}
                  >
                    📍 Location Required
                  </h3>
                  <p className="text-gray-700 mb-2 text-center">
                    Your photo doesn't contain GPS data. Please set your
                    location manually to continue.
                  </p>
                  <p className="text-sm text-gray-600 text-center">
                    💡 Tip: For future uploads, enable location services before
                    taking photos
                  </p>
                </div>

                {/* Manual Location Picker */}
                <ManualLocationPicker
                  onLocationSet={setManualLocation}
                  onCancel={resetWorkflow}
                  currentLocation={state.gpsData}
                />

                {/* Development Debug Panel */}
                {isDevelopment && (
                  <details className="mt-6" open>
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-bold">
                      🔧 Debug Panel (Dev Only)
                    </summary>
                    <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg text-left text-xs font-mono space-y-1 max-h-96 overflow-y-auto">
                      <p className="text-yellow-400 font-bold mb-2">
                        == STATE ==
                      </p>
                      <p>
                        Step:{" "}
                        <span className="text-white">{state.currentStep}</span>
                      </p>
                      <p>
                        Needs Manual Loc:{" "}
                        <span className="text-white">⚠️ YES</span>
                      </p>
                      <p>
                        Has Image:{" "}
                        <span className="text-white">
                          {state.imageFile ? "✓ YES" : "✗ NO"}
                        </span>
                      </p>
                      <p>
                        Has Preview:{" "}
                        <span className="text-white">
                          {state.imagePreview ? "✓ YES" : "✗ NO"}
                        </span>
                      </p>
                      <p className="text-yellow-400 font-bold mt-3 mb-1">
                        == GPS DATA ==
                      </p>
                      <p>
                        Source:{" "}
                        <span className="text-white">
                          {state.gpsData?.source || "none"}
                        </span>
                      </p>
                      <p>
                        Has GPS:{" "}
                        <span className="text-white">
                          {state.gpsData?.hasGPS ? "✓ YES" : "✗ NO"}
                        </span>
                      </p>
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <>
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: COLORS.textDark }}
                  >
                    Plant the Right Trees, 🌳
                    <br />
                    <span style={{ color: COLORS.accent }}>
                      In the Right Place
                    </span>
                  </h2>
                  <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                    Upload a photo of your land and get AI-powered tree
                    recommendations based on climate, soil, and location data.
                  </p>
                </div>

                {/* Location Prompt */}
                {showLocationPrompt && (
                  <div className="max-w-2xl mx-auto mb-8">
                    <LocationPrompt onDismiss={handleDismissLocationPrompt} />
                  </div>
                )}

                {/* Image Uploader */}
                <ImageUploader onImageUpload={handleImageUpload} />

                {/* Photo Tips */}
                <PhotoTips />

                {/* How It Works Section */}
                <div className="max-w-4xl mx-auto mt-16">
                  <h3
                    className="text-2xl font-bold text-center mb-8"
                    style={{ color: COLORS.textDark }}
                  >
                    How It Works
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <div className="text-5xl mb-4">📸</div>
                      <h4
                        className="font-bold mb-2"
                        style={{ color: COLORS.textDark }}
                      >
                        1. Upload Photo
                      </h4>
                      <p className="text-gray-600">
                        Take a photo of your land with GPS enabled
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <div className="text-5xl mb-4">🤖</div>
                      <h4
                        className="font-bold mb-2"
                        style={{ color: COLORS.textDark }}
                      >
                        2. AI Analysis
                      </h4>
                      <p className="text-gray-600">
                        We analyze climate, soil, and location data
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <div className="text-5xl mb-4">🌱</div>
                      <h4
                        className="font-bold mb-2"
                        style={{ color: COLORS.textDark }}
                      >
                        3. Get Recommendations
                      </h4>
                      <p className="text-gray-600">
                        Receive personalized tree suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* PROCESSING STEP */}
        {(state.currentStep === "processing" ||
          state.currentStep === "analyzing") && (
          <div className="text-center py-12">
            {/* Show manual location picker if needed */}
            {state.needsManualLocation ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                  <MapPin className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: COLORS.textDark }}
                  >
                    📍 Location Required
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Your photo doesn't contain GPS data. Please set your
                    location manually to continue.
                  </p>
                </div>

                <ManualLocationPicker
                  onLocationSelected={setManualLocation}
                  currentLocation={state.gpsData}
                />
              </div>
            ) : (
              <>
                <LoadingSpinner size="large" />
                <h3
                  className="text-2xl font-bold mb-4 mt-6"
                  style={{ color: COLORS.textDark }}
                >
                  {state.gpsData?.hasGPS
                    ? "Analyzing Your Location..."
                    : "Processing Image..."}
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  {state.loadingMessage || "Please wait..."}
                </p>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-8">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${getProgress()}%`,
                        backgroundColor: COLORS.accent,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {getProgress()}% Complete
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="max-w-md mx-auto space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-gray-700">
                    {state.gpsData ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <LoadingSpinner size="small" />
                    )}
                    <span>
                      {state.gpsData?.hasGPS
                        ? "✓ GPS coordinates extracted"
                        : state.gpsData?.source === "fallback"
                        ? "⚠️ Using default location (no GPS in image)"
                        : state.gpsData?.source === "manual"
                        ? "✓ Manual location set"
                        : "Extracting GPS coordinates..."}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    {state.locationData ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : state.gpsData ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span>Identifying location</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    {state.climateData ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : state.locationData ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span>Fetching climate data</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    {state.imageAnalysis ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : state.climateData ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span>Analyzing land conditions</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    {state.recommendations ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : state.imageAnalysis ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span>Generating recommendations</span>
                  </div>
                </div>

                {/* Development Debug Panel - Only in dev mode */}
                {isDevelopment && (
                  <details className="max-w-md mx-auto mt-6" open>
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-bold">
                      🔧 Debug Panel (Dev Only)
                    </summary>
                    <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg text-left text-xs font-mono space-y-1 max-h-96 overflow-y-auto">
                      <p className="text-yellow-400 font-bold mb-2">
                        == STATE ==
                      </p>
                      <p>
                        Step:{" "}
                        <span className="text-white">{state.currentStep}</span>
                      </p>
                      <p>
                        Loading:{" "}
                        <span className="text-white">
                          {state.isLoading ? "🔄 YES" : "✓ NO"}
                        </span>
                      </p>
                      <p>
                        Needs Manual Loc:{" "}
                        <span className="text-white">
                          {state.needsManualLocation ? "⚠️ YES" : "✓ NO"}
                        </span>
                      </p>
                      <p>
                        Fallback Location:{" "}
                        <span className="text-white">
                          {state.usingFallbackLocation ? "⚠️ YES" : "✓ NO"}
                        </span>
                      </p>

                      <p className="text-yellow-400 font-bold mt-3 mb-1">
                        == DATA ==
                      </p>
                      <p>
                        GPS:{" "}
                        <span className="text-white">
                          {state.gpsData
                            ? `✓ ${
                                state.gpsData.source
                              } (${state.gpsData.latitude?.toFixed(
                                4
                              )}, ${state.gpsData.longitude?.toFixed(4)})`
                            : "✗ None"}
                        </span>
                      </p>
                      <p>
                        Location:{" "}
                        <span className="text-white">
                          {state.locationData
                            ? `✓ ${state.locationData.city}, ${state.locationData.country}`
                            : "✗ None"}
                        </span>
                      </p>
                      <p>
                        Climate:{" "}
                        <span className="text-white">
                          {state.climateData
                            ? `✓ ${state.climateData.currentConditions?.temperature}°C, ${state.climateData.annualRainfall}mm`
                            : "✗ None"}
                        </span>
                      </p>
                      <p>
                        Image Analysis:{" "}
                        <span className="text-white">
                          {state.imageAnalysis
                            ? `✓ ${state.imageAnalysis.soilType}, ${state.imageAnalysis.vegetationLevel}`
                            : "✗ None"}
                        </span>
                      </p>
                      <p>
                        Recommendations:{" "}
                        <span className="text-white">
                          {state.recommendations?.length || 0} trees
                        </span>
                      </p>

                      {state.error && (
                        <>
                          <p className="text-red-400 font-bold mt-3 mb-1">
                            == ERROR ==
                          </p>
                          <p className="text-red-300 break-words">
                            {state.error}
                          </p>
                        </>
                      )}

                      <p className="text-yellow-400 font-bold mt-3 mb-1">
                        == TIMING ==
                      </p>
                      <p>
                        Progress:{" "}
                        <span className="text-white">{getProgress()}%</span>
                      </p>
                      <p>
                        Message:{" "}
                        <span className="text-white">
                          {state.loadingMessage || "None"}
                        </span>
                      </p>
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        )}

        {/* RESULTS STEP */}
        {state.currentStep === "results" && state.recommendations && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* GPS Warning if using fallback */}
            {state.gpsData && !state.gpsData.hasGPS && (
              <Alert type="warning" title="⚠️ Default Location Used">
                <p>
                  Your image didn't contain GPS data, so we used a default
                  location for recommendations. For more accurate results,
                  enable GPS and take a new photo.
                </p>
              </Alert>
            )}

            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: COLORS.textDark }}
                  >
                    Analysis Complete!
                  </h2>
                  <p className="text-gray-700">
                    Found <strong>{state.recommendations.length}</strong>{" "}
                    suitable tree species for your location
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
            {state.imageFile && (
              <ImagePreview
                file={state.imageFile}
                analysis={state.imageAnalysis}
              />
            )}

            {/* Location Display */}
            {state.locationData && (
              <LocationDisplay
                locationData={state.locationData}
                suitability={state.suitability}
                climateZone={state.climateData?.climateZone}
                elevation={state.locationData?.elevation}
              />
            )}

            {/* Climate Analysis */}
            {state.climateData && (
              <ClimateAnalysis
                climateData={state.climateData}
                analysis={state.climateAnalysis}
              />
            )}

            {/* Tree Recommendations */}
            <TreeRecommendationList
              recommendations={state.recommendations}
              aiEnhanced={!!state.aiInsights}
            />

            {/* Impact Visualization */}
            {state.impactMetrics && (
              <ImpactVisualization
                impactMetrics={state.impactMetrics}
                recommendations={state.recommendations}
              />
            )}

            {/* Planting Guide */}
            {state.recommendations.length > 0 && (
              <PlantingGuide
                plantingStrategy={state.plantingStrategy}
                recommendations={state.recommendations}
                aiInsights={state.aiInsights}
              />
            )}

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <ActionButton onClick={resetWorkflow}>
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
