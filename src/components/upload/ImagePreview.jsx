/**
 * ImagePreview Component
 * Displays uploaded image with location info and manual override option
 */
import React, { useState } from 'react';
import { MapPin, Edit2, X, Check, Info } from 'lucide-react';
import COLORS from '../../constants/colors';
import { formatCoordinates } from '../../services/locationService';

const ImagePreview = ({ 
  imageUrl, 
  gpsData, 
  locationData,
  imageMetadata,
  onLocationOverride,
  onRemoveImage 
}) => {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSubmit = async () => {
    if (!manualLocation.trim()) return;
    
    setIsSubmitting(true);
    await onLocationOverride(manualLocation);
    setIsSubmitting(false);
    setIsEditingLocation(false);
  };

  const formattedCoords = gpsData 
    ? formatCoordinates(gpsData.latitude, gpsData.longitude)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image Display */}
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Uploaded land preview" 
            className="w-full h-96 object-cover"
          />
          
          {/* Remove Button */}
          <button
            onClick={onRemoveImage}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
            title="Remove image"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>

          {/* GPS Badge */}
          {gpsData && gpsData.hasGPS && (
            <div 
              className="absolute top-4 left-4 px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg"
              style={{ backgroundColor: COLORS.accent }}
            >
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">GPS Detected</span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-6 space-y-4">
          {/* Location Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2" 
                style={{ color: COLORS.textDark }}>
                <MapPin className="w-5 h-5" style={{ color: COLORS.accent }} />
                Location Information
              </h3>
              <button
                onClick={() => setIsEditingLocation(!isEditingLocation)}
                className="text-sm font-medium px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-gray-100 transition-colors"
                style={{ color: COLORS.secondary }}
              >
                <Edit2 className="w-4 h-4" />
                {isEditingLocation ? 'Cancel' : 'Change Location'}
              </button>
            </div>

            {!isEditingLocation ? (
              <div className="space-y-2">
                {locationData ? (
                  <>
                    <p className="text-gray-800 font-medium">
                      {locationData.city}, {locationData.country}
                    </p>
                    {formattedCoords && (
                      <p className="text-sm text-gray-600">
                        Coordinates: {formattedCoords.formatted}
                      </p>
                    )}
                    {!gpsData?.hasGPS && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          No GPS data found in image. Using default location. You can change this above.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">Loading location data...</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter city name or coordinates (e.g., 'Nairobi' or '-1.2921, 36.8219')"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleLocationSubmit}
                  disabled={!manualLocation.trim() || isSubmitting}
                  className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Updating...' : 'Update Location'}
                </button>
              </div>
            )}
          </div>

          {/* Image Metadata */}
          {imageMetadata && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Image Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">File name:</div>
                <div className="text-gray-800 truncate" title={imageMetadata.name}>
                  {imageMetadata.name}
                </div>
                <div className="text-gray-600">File size:</div>
                <div className="text-gray-800">{imageMetadata.sizeMB} MB</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;