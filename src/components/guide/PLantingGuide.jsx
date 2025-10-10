/**
 * PlantingGuide Component
 * Provides step-by-step planting instructions and care tips
 */
import React, { useState } from 'react';
import { BookOpen, Calendar, Droplets, Sun, Scissors, Shield, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import COLORS from '../../constants/colors';

const PlantingGuide = ({ plantingStrategy, recommendations, aiInsights }) => {
  const [activeTab, setActiveTab] = useState('steps'); // 'steps', 'calendar', 'care'

  if (!plantingStrategy || !recommendations) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-500 text-center">Planting guide unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4 mb-6">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${COLORS.accent}20` }}
          >
            <BookOpen className="w-8 h-8" style={{ color: COLORS.accent }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.textDark }}>
              🌱 Planting Guide
            </h2>
            <p className="text-gray-600">
              Complete instructions for successful tree planting and care
            </p>
            {aiInsights?.plantingStrategy && (
              <div className="flex items-center gap-2 mt-2 text-sm text-purple-700">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI-Optimized Strategy</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <TabButton
            active={activeTab === 'steps'}
            onClick={() => setActiveTab('steps')}
            icon={CheckCircle}
            label="Planting Steps"
          />
          <TabButton
            active={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            icon={Calendar}
            label="Timing"
          />
          <TabButton
            active={activeTab === 'care'}
            onClick={() => setActiveTab('care')}
            icon={Droplets}
            label="Care Guide"
          />
        </div>
      </div>

      {/* Planting Strategy Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.textDark }}>
          Recommended Planting Strategy
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <StrategyCard
            label="Density"
            value={plantingStrategy.density}
            icon="🌲"
          />
          <StrategyCard
            label="Spacing"
            value={plantingStrategy.spacing}
            icon="📏"
          />
          <StrategyCard
            label="Best Months"
            value={plantingStrategy.bestMonths.slice(0, 3).join(', ')}
            icon="📅"
          />
        </div>

        {/* Species Mix */}
        {plantingStrategy.mixRatio && Object.keys(plantingStrategy.mixRatio).length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Recommended Species Mix</h4>
            <div className="space-y-2">
              {Object.entries(plantingStrategy.mixRatio).map(([species, percentage]) => (
                <div key={species} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{species}</span>
                      <span className="text-sm font-bold" style={{ color: COLORS.accent }}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS.accent
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'steps' && <PlantingSteps recommendations={recommendations} />}
      {activeTab === 'calendar' && <PlantingCalendar bestMonths={plantingStrategy.bestMonths} />}
      {activeTab === 'care' && <CareGuide recommendations={recommendations} />}

      {/* AI-Generated Advice */}
      {aiInsights?.plantingStrategy?.detailedAdvice && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                AI-Generated Planting Advice
              </h3>
              <p className="text-purple-800 leading-relaxed">
                {aiInsights.plantingStrategy.detailedAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Planting Steps Component
const PlantingSteps = ({ recommendations }) => {
  const steps = [
    {
      title: 'Site Preparation',
      icon: Sun,
      description: 'Clear the planting area of weeds and debris. Test and amend soil if needed.',
      details: [
        'Remove grass and weeds in a 1-meter diameter circle',
        'Loosen soil to 30cm depth',
        'Add compost or organic matter if soil quality is poor',
        'Ensure good drainage - water should not pool'
      ]
    },
    {
      title: 'Digging Holes',
      icon: Shield,
      description: 'Prepare proper-sized holes for your seedlings.',
      details: [
        `Dig holes ${recommendations[0]?.maxHeight > 20 ? '60cm' : '45cm'} wide and deep`,
        'Make holes 2-3 times wider than root ball',
        'Keep topsoil and subsoil separate',
        'Roughen hole sides to help roots penetrate'
      ]
    },
    {
      title: 'Planting',
      icon: CheckCircle,
      description: 'Carefully place seedlings and backfill with soil.',
      details: [
        'Remove seedling carefully from container',
        'Place in center of hole at same depth as container',
        'Backfill with topsoil, gently firming around roots',
        'Create a small basin around tree to hold water',
        'Water immediately after planting (10-20 liters)'
      ]
    },
    {
      title: 'Mulching',
      icon: Droplets,
      description: 'Apply mulch to retain moisture and suppress weeds.',
      details: [
        'Apply 5-10cm layer of organic mulch',
        'Keep mulch 5cm away from tree trunk',
        'Use grass clippings, leaves, or wood chips',
        'Replenish mulch as it decomposes'
      ]
    },
    {
      title: 'Staking (if needed)',
      icon: Shield,
      description: 'Provide support for young trees in windy areas.',
      details: [
        'Use 2-3 stakes for larger seedlings',
        'Tie with soft material (cloth strips)',
        'Allow some movement for trunk strength',
        'Remove stakes after 12 months'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.textDark }}>
        Step-by-Step Planting Instructions
      </h3>
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: COLORS.accent }}
              >
                {idx + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <step.icon className="w-5 h-5" style={{ color: COLORS.secondary }} />
                <h4 className="text-lg font-bold text-gray-800">{step.title}</h4>
              </div>
              <p className="text-gray-700 mb-3">{step.description}</p>
              <ul className="space-y-1">
                {step.details.map((detail, detailIdx) => (
                  <li key={detailIdx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Planting Calendar Component
const PlantingCalendar = ({ bestMonths }) => {
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.textDark }}>
        Planting Calendar
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {allMonths.map((month) => {
          const isBest = bestMonths.includes(month);
          return (
            <div
              key={month}
              className={`p-4 rounded-lg text-center transition-all ${
                isBest
                  ? 'text-white font-bold shadow-lg'
                  : 'bg-gray-100 text-gray-500'
              }`}
              style={isBest ? { backgroundColor: COLORS.accent } : {}}
            >
              <p className="text-sm">{month}</p>
              {isBest && <p className="text-xs mt-1">✓ Best</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Plant at the start of the rainy season for best survival rates. 
          Avoid planting during extreme heat or drought conditions.
        </p>
      </div>
    </div>
  );
};

// Care Guide Component
const CareGuide = ({ recommendations }) => {
  const careInstructions = [
    {
      period: 'First 3 Months',
      icon: Droplets,
      color: COLORS.info,
      tasks: [
        'Water 2-3 times per week (10-15 liters)',
        'Check for pest damage weekly',
        'Remove competing weeds',
        'Inspect stakes and ties'
      ]
    },
    {
      period: '3-12 Months',
      icon: Sun,
      color: COLORS.warning,
      tasks: [
        'Reduce watering to once per week',
        'Replenish mulch layer',
        'Prune dead or damaged branches',
        'Monitor for diseases'
      ]
    },
    {
      period: 'Year 2+',
      icon: Scissors,
      color: COLORS.accent,
      tasks: [
        'Water only during dry spells',
        'Annual pruning for shape',
        'Remove stakes if still present',
        'Monitor tree health and growth'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {careInstructions.map((period, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${period.color}20` }}
            >
              <period.icon className="w-6 h-6" style={{ color: period.color }} />
            </div>
            <h4 className="text-lg font-bold text-gray-800">{period.period}</h4>
          </div>
          <ul className="space-y-2">
            {period.tasks.map((task, taskIdx) => (
              <li key={taskIdx} className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: period.color }} />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Warning Signs */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-red-900 mb-2">Warning Signs to Watch For</h4>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• Yellowing or wilting leaves (possible water stress)</li>
              <li>• Holes in leaves or bark (pest damage)</li>
              <li>• White or black spots on leaves (fungal disease)</li>
              <li>• Stunted growth (nutrient deficiency)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
      active
        ? 'border-b-2 text-green-700'
        : 'text-gray-600 hover:text-gray-800'
    }`}
    style={active ? { borderColor: COLORS.accent } : {}}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const StrategyCard = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-lg">
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

export default PlantingGuide;