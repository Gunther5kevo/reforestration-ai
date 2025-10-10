/**
 * ImpactVisualization Component
 * Displays environmental and economic impact metrics
 */
import React from 'react';
import { Leaf, TrendingUp, DollarSign, Users, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import COLORS from '../../constants/colors';

const ImpactVisualization = ({ impactMetrics, recommendations }) => {
  if (!impactMetrics) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-500 text-center">Impact data unavailable</p>
      </div>
    );
  }

  // Prepare chart data
  const carbonData = [
    { name: 'Year 1', value: impactMetrics.carbonSequestration.year1 },
    { name: 'Year 10', value: impactMetrics.carbonSequestration.year10 }
  ];

  const economicData = [
    { name: 'Carbon Credits', value: impactMetrics.economicValue.carbonCredits, fill: COLORS.accent },
    { name: 'Timber Value', value: impactMetrics.economicValue.timber, fill: COLORS.secondary }
  ];

  const topTrees = recommendations?.slice(0, 5).map(tree => ({
    name: tree.commonName.substring(0, 15),
    carbon: tree.carbonSequestration,
    biodiversity: tree.biodiversityValue
  })) || [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Impact Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🌍 Environmental Impact</h2>
        <p className="text-green-100">
          Projected benefits from planting {impactMetrics.density.treesPerHectare} trees per hectare
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Leaf}
          label="Carbon Captured (10 years)"
          value={`${(impactMetrics.carbonSequestration.year10 / 1000).toFixed(1)} tons`}
          subtitle={`${impactMetrics.carbonSequestration.year1} kg in year 1`}
          color={COLORS.success}
        />
        <MetricCard
          icon={TrendingUp}
          label="Trees per Hectare"
          value={impactMetrics.density.treesPerHectare}
          subtitle={`${impactMetrics.density.survivalRate}% survival rate`}
          color={COLORS.accent}
        />
        <MetricCard
          icon={Heart}
          label="Biodiversity Score"
          value={`${impactMetrics.biodiversity.score}/100`}
          subtitle={impactMetrics.biodiversity.level}
          color={COLORS.error}
        />
        <MetricCard
          icon={DollarSign}
          label="Economic Value"
          value={`$${(impactMetrics.economicValue.total / 1000).toFixed(1)}k`}
          subtitle="Over 10 years"
          color={COLORS.warning}
        />
      </div>

      {/* Carbon Sequestration Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          Carbon Sequestration Timeline
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={carbonData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} kg CO₂`} />
            <Bar dataKey="value" fill={COLORS.success} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4">
          Your trees will capture approximately <strong>{impactMetrics.carbonSequestration.perTree} kg of CO₂</strong> per tree annually.
          This is equivalent to driving a car for approximately <strong>{(impactMetrics.carbonSequestration.year10 / 0.4).toFixed(0)} km</strong>!
        </p>
      </div>

      {/* Tree Comparison Chart */}
      {topTrees.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
            Tree Species Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTrees}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="carbon" fill={COLORS.accent} name="Carbon (kg/year)" />
              <Bar yAxisId="right" dataKey="biodiversity" fill={COLORS.info} name="Biodiversity Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Economic Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          Economic Value Breakdown
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={economicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {economicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Carbon Credits</span>
              <span className="font-bold" style={{ color: COLORS.accent }}>
                ${impactMetrics.economicValue.carbonCredits.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Timber Value</span>
              <span className="font-bold" style={{ color: COLORS.secondary }}>
                ${impactMetrics.economicValue.timber.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <span className="font-semibold text-green-800">Total Value</span>
              <span className="font-bold text-xl text-green-700">
                ${impactMetrics.economicValue.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Services */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          Ecosystem Services
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <EcosystemCard
            title="Soil Improvement"
            value={impactMetrics.ecosystem.soilImprovement}
            description="Enhanced soil quality through organic matter and nitrogen fixation"
            icon="🌱"
          />
          <EcosystemCard
            title="Water Retention"
            value={impactMetrics.ecosystem.waterRetention}
            description="Improved watershed management and groundwater recharge"
            icon="💧"
          />
          <EcosystemCard
            title="Habitat Creation"
            value={impactMetrics.ecosystem.habitatCreation}
            description="Support for wildlife, pollinators, and biodiversity"
            icon="🦋"
          />
        </div>
      </div>

      {/* Community Impact */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg">
            <Users className="w-8 h-8" style={{ color: COLORS.accent }} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.textDark }}>
              Community Benefits
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Improved air quality and reduced urban heat island effect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Enhanced landscape aesthetics and property values</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Job creation in tree planting and maintenance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Educational opportunities for environmental awareness</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">🌟 Ready to Make an Impact?</h3>
        <p className="text-green-100 mb-6">
          Every tree planted contributes to a healthier planet and stronger communities.
          Your reforestation project could sequester <strong>{(impactMetrics.carbonSequestration.year10 / 1000).toFixed(1)} tons of CO₂</strong> over 10 years!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
            <p className="text-3xl font-bold">{impactMetrics.density.treesPerHectare}</p>
            <p className="text-sm text-green-100">Trees to Plant</p>
          </div>
          <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
            <p className="text-3xl font-bold">{(impactMetrics.carbonSequestration.year10 / 1000).toFixed(1)}t</p>
            <p className="text-sm text-green-100">CO₂ Captured</p>
          </div>
          <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
            <p className="text-3xl font-bold">${(impactMetrics.economicValue.total / 1000).toFixed(0)}k</p>
            <p className="text-sm text-green-100">Economic Value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, subtitle, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <h3 className="text-2xl font-bold mb-1" style={{ color: COLORS.textDark }}>
      {value}
    </h3>
    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
    <p className="text-xs text-gray-500 capitalize">{subtitle}</p>
  </div>
);

// Ecosystem Card Component
const EcosystemCard = ({ title, value, description, icon }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="text-3xl mb-2">{icon}</div>
    <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
    <p className="text-sm font-medium mb-2 capitalize" style={{ color: COLORS.accent }}>
      {value}
    </p>
    <p className="text-xs text-gray-600">{description}</p>
  </div>
);

export default ImpactVisualization;