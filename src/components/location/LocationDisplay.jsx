/**
 * LocationDisplay Component
 * Shows location details with map embed and suitability assessment
 */
import React from 'react';
import { MapPin, Globe, Mountain, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import COLORS from '../../constants/colors';

const LocationDisplay = ({ 
  locationData, 
  suitability,
  climateZone,
  elevation 
}) => {
  if (!locationData || !locationData.success) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-500 text-center">Location data unavailable</p>
      </div>
    );
  }

  const { city, county, country, coordinates, displayName } = locationData;

  // Generate OpenStreetMap embed URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.longitude - 0.05},${coordinates.latitude - 0.05},${coordinates.longitude + 0.05},${coordinates.latitude + 0.05}&layer=mapnik&marker=${coordinates.latitude},${coordinates.longitude}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Location Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6" style={{ backgroundColor: COLORS.background }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                {city}, {country}
              </h2>
              {county && (
                <p className="text-gray-600 mb-2">{county}</p>
              )}
              <p className="text-sm text-gray-500">
                {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
              </p>
            </div>
            <div 
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: COLORS.white }}
            >
              <MapPin className="w-8 h-8" style={{ color: COLORS.accent }} />
            </div>
          </div>
        </div>

        {/* Map Embed */}
        <div className="relative h-64 bg-gray-100">
          <iframe
            title="Location Map"
            src={mapUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>

        {/* Location Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailCard
            icon={Globe}
            label="Climate Zone"
            value={climateZone || 'Unknown'}
            color={COLORS.info}
          />
          <DetailCard
            icon={Mountain}
            label="Elevation"
            value={elevation ? `${elevation}m` : 'N/A'}
            color={COLORS.secondary}
          />
          <DetailCard
            icon={Thermometer}
            label="Region"
            value={country}
            color={COLORS.accent}
          />
        </div>
      </div>

      {/* Suitability Assessment */}
      {suitability && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" 
            style={{ color: COLORS.textDark }}>
            <Droplets className="w-6 h-6" style={{ color: COLORS.accent }} />
            Reforestation Suitability
          </h3>

          {/* Suitability Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Suitability Score
              </span>
              <span className="text-2xl font-bold" style={{ color: COLORS.accent }}>
                {suitability.suitabilityScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${suitability.suitabilityScore}%`,
                  backgroundColor: 
                    suitability.suitabilityScore >= 80 ? COLORS.success :
                    suitability.suitabilityScore >= 60 ? COLORS.accent :
                    suitability.suitabilityScore >= 40 ? COLORS.warning :
                    COLORS.error
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 capitalize">
              Level: <strong>{suitability.suitabilityLevel}</strong>
            </p>
          </div>

          {/* Warnings */}
          {suitability.warnings && suitability.warnings.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Considerations
              </h4>
              {suitability.warnings.map((warning, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                >
                  <p className="text-sm text-yellow-800">
                    <strong className="capitalize">{warning.type}:</strong> {warning.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {suitability.recommendations && suitability.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">
                Recommendations
              </h4>
              <ul className="space-y-1">
                {suitability.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component for detail cards
const DetailCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
    <div 
      className="p-2 rounded-lg"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
    </div>
  </div>
);

export default LocationDisplay;