/**
 * ClimateAnalysis Component
 * Displays weather charts, climate stats, and planting recommendations
 */
import React, { useState } from 'react';
import { Cloud, Droplets, Thermometer, Wind, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import COLORS from '../../constants/colors';
import { formatClimateForCharts, getWeatherDescription } from '../../services/climateService';

const ClimateAnalysis = ({ climateData, analysis }) => {
  const [chartView, setChartView] = useState('temperature'); // 'temperature' or 'rainfall'

  if (!climateData || !analysis) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-500 text-center">Climate data unavailable</p>
      </div>
    );
  }

  const chartData = formatClimateForCharts(climateData.daily, 7);
  const currentWeather = getWeatherDescription(climateData.current.weather_code);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Current Conditions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" 
          style={{ color: COLORS.textDark }}>
          <Cloud className="w-7 h-7" style={{ color: COLORS.accent }} />
          Current Weather
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Thermometer}
            label="Temperature"
            value={`${Math.round(climateData.current.temperature_2m)}°C`}
            color={COLORS.error}
          />
          <StatCard
            icon={Droplets}
            label="Humidity"
            value={`${climateData.current.relative_humidity_2m}%`}
            color={COLORS.info}
          />
          <StatCard
            icon={Wind}
            label="Wind Speed"
            value={`${Math.round(climateData.current.wind_speed_10m)} km/h`}
            color={COLORS.secondary}
          />
          <StatCard
            icon={Cloud}
            label="Conditions"
            value={currentWeather.icon}
            subtitle={currentWeather.description}
            color={COLORS.accent}
          />
        </div>
      </div>

      {/* Climate Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          Climate Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Climate Type</p>
            <p className="text-lg font-semibold capitalize" style={{ color: COLORS.accent }}>
              {analysis.climateType}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Temperature Zone</p>
            <p className="text-lg font-semibold capitalize" style={{ color: COLORS.accent }}>
              {analysis.tempZone}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Annual Rainfall</p>
            <p className="text-lg font-semibold" style={{ color: COLORS.accent }}>
              {analysis.annualRainfall} mm
            </p>
          </div>
        </div>

        {/* Temperature Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Temp</p>
            <p className="text-xl font-bold" style={{ color: COLORS.textDark }}>
              {analysis.temperatureStats.average}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Max Temp</p>
            <p className="text-xl font-bold text-red-600">
              {analysis.temperatureStats.max}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Min Temp</p>
            <p className="text-xl font-bold text-blue-600">
              {analysis.temperatureStats.min}°C
            </p>
          </div>
        </div>
      </div>

      {/* Weather Charts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: COLORS.textDark }}>
            7-Day Forecast
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartView('temperature')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartView === 'temperature'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={chartView === 'temperature' ? { backgroundColor: COLORS.accent } : {}}
            >
              Temperature
            </button>
            <button
              onClick={() => setChartView('rainfall')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartView === 'rainfall'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={chartView === 'rainfall' ? { backgroundColor: COLORS.accent } : {}}
            >
              Rainfall
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartView === 'temperature' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="maxTemp" 
                stroke="#EF4444" 
                name="Max Temp (°C)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="minTemp" 
                stroke="#3B82F6" 
                name="Min Temp (°C)"
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="rainfall" 
                fill={COLORS.info} 
                name="Rainfall (mm)"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Best Planting Months */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" 
          style={{ color: COLORS.textDark }}>
          <Calendar className="w-6 h-6" style={{ color: COLORS.accent }} />
          Best Planting Months
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.suitability.bestPlantingMonths.map((month, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: COLORS.accent }}
            >
              {month}
            </span>
          ))}
        </div>
      </div>

      {/* Climate Challenges */}
      {analysis.suitability.challenges.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" 
            style={{ color: COLORS.textDark }}>
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            Climate Considerations
          </h3>
          <div className="space-y-3">
            {analysis.suitability.challenges.map((challenge, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  challenge.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : challenge.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold capitalize text-gray-800">
                    {challenge.type.replace(/-/g, ' ')}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      challenge.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : challenge.severity === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {challenge.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{challenge.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Mitigation:</strong> {challenge.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Soil Moisture Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          Soil Conditions
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Soil Moisture</span>
              <span className="text-sm font-bold" style={{ color: COLORS.accent }}>
                {analysis.soilMoisture.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${analysis.soilMoisture.percentage}%`,
                  backgroundColor: COLORS.info
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 capitalize">
              Level: <strong>{analysis.soilMoisture.level}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtitle, color }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
    <div 
      className="p-3 rounded-lg"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
    </div>
  </div>
);

export default ClimateAnalysis;