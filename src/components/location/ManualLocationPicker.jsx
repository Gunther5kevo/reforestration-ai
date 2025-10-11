import React, { useState, useEffect } from 'react';
import { MapPin, Search, Globe, Target, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Manual Location Picker - Plan B when no GPS in image
 * Allows users to manually select their location
 */
const ManualLocationPicker = ({ onLocationSelected, currentLocation }) => {
  const [activeTab, setActiveTab] = useState('browser'); // browser, search, coordinates
  const [searchQuery, setSearchQuery] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Popular cities/regions database (expand based on your target regions)
  const popularLocations = [
    { name: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219, country: 'Kenya' },
    { name: 'Mombasa, Kenya', lat: -4.0435, lon: 39.6682, country: 'Kenya' },
    { name: 'Kisumu, Kenya', lat: -0.0917, lon: 34.7680, country: 'Kenya' },
    { name: 'Nakuru, Kenya', lat: -0.3031, lon: 36.0800, country: 'Kenya' },
    { name: 'Eldoret, Kenya', lat: 0.5143, lon: 35.2698, country: 'Kenya' },
    { name: 'Kampala, Uganda', lat: 0.3476, lon: 32.5825, country: 'Uganda' },
    { name: 'Dar es Salaam, Tanzania', lat: -6.7924, lon: 39.2083, country: 'Tanzania' },
    { name: 'Kigali, Rwanda', lat: -1.9706, lon: 30.1044, country: 'Rwanda' },
    { name: 'Addis Ababa, Ethiopia', lat: 9.0320, lon: 38.7469, country: 'Ethiopia' },
    { name: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792, country: 'Nigeria' },
  ];

  const [filteredLocations, setFilteredLocations] = useState(popularLocations);

  // Filter locations as user types
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(popularLocations);
    } else {
      const filtered = popularLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery]);

  /**
   * Get location from browser geolocation API
   */
  const handleBrowserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        console.log('📍 Browser location:', { latitude, longitude });
        
        onLocationSelected?.(latitude, longitude);
        setSuccess(true);
        setLoading(false);
        
        setTimeout(() => setSuccess(false), 3000);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(`Location access denied: ${error.message}. Try another method.`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Select from popular locations list
   */
  const handleSelectLocation = (location) => {
    console.log('📍 Selected location:', location);
    onLocationSelected?.(location.lat, location.lon);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  /**
   * Manual coordinate entry
   */
  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid numbers for latitude and longitude');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    console.log('📍 Manual coordinates:', { lat, lon });
    setError(null);
    onLocationSelected?.(lat, lon);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Set Your Location
          </h3>
          <p className="text-sm text-gray-600">
            Your image doesn't contain GPS data. Please set your location manually.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 text-sm font-medium">
            Location set successfully! Processing...
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('browser')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'browser'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Target className="w-4 h-4 inline mr-1" />
          Auto-Detect
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" />
          Search City
        </button>
        <button
          onClick={() => setActiveTab('coordinates')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'coordinates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-1" />
          Coordinates
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-64">
        {/* Browser Location Tab */}
        {activeTab === 'browser' && (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Use Your Current Location</h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Allow your browser to access your location for the most accurate recommendations.
            </p>
            <button
              onClick={handleBrowserLocation}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Detecting...
                </>
              ) : (
                '📍 Detect My Location'
              )}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              You may need to allow location access in your browser settings
            </p>
          </div>
        )}

        {/* Search Cities Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No cities found. Try the Coordinates tab to enter exact location.
                </p>
              ) : (
                filteredLocations.map((location, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(location)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{location.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Manual Coordinates Tab */}
        {activeTab === 'coordinates' && (
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Enter the GPS coordinates of your planting site. You can find these using Google Maps 
              (right-click on the location → "What's here?").
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., -1.2921"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 36.8219"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
              </div>

              <button
                onClick={handleManualCoordinates}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Set Location
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">
                💡 How to get coordinates:
              </h5>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal ml-4">
                <li>Open Google Maps on your phone or computer</li>
                <li>Find your planting location</li>
                <li>Long-press (mobile) or right-click (desktop) on the spot</li>
                <li>Click the coordinates to copy them</li>
                <li>Paste them here</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Current Location Display */}
      {currentLocation && (
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Current location:</strong> {currentLocation.city || 'Unknown'} 
            ({currentLocation.coordinates?.latitude.toFixed(4)}°, {currentLocation.coordinates?.longitude.toFixed(4)}°)
          </p>
        </div>
      )}
    </div>
  );
};

export default ManualLocationPicker;