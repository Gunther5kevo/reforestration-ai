/**
 * TreeRecommendationCard Component
 * Displays individual tree recommendation with details
 */
import React, { useState } from 'react';
import {
  TreePine,
  Droplets,
  TrendingUp,
  Leaf,
  MapPin,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import COLORS from '../../constants/colors';

const TreeRecommendationCard = ({ tree, rank, showDetails = false }) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  // Get compatibility color
  const getScoreColor = (score) => {
    if (score >= 85) return COLORS.success;
    if (score >= 70) return COLORS.accent;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const displayScore = tree.finalScore || tree.compatibilityScore || 0;
  const scoreColor = getScoreColor(displayScore);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Rank Badge */}
            <div
              className="px-3 py-1 rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: rank <= 3 ? COLORS.accent : COLORS.secondary }}
            >
              #{rank}
            </div>

            {/* Tree Info */}
            <div>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                <TreePine className="w-5 h-5 text-green-600" />
                {tree.commonName}
              </h3>
              <p className="text-sm text-gray-600 italic">{tree.scientificName}</p>
              {tree.nativeRegions && tree.nativeRegions.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Native to {tree.nativeRegions[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: scoreColor }}
            >
              {Math.round(displayScore)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Match</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <QuickStat
            icon={TrendingUp}
            label="Growth"
            value={tree.growthRate}
            color={COLORS.info}
          />
          <QuickStat
            icon={Droplets}
            label="Water"
            value={tree.waterNeeds}
            color={COLORS.info}
          />
          <QuickStat
            icon={Award}
            label="Biodiversity"
            value={`${tree.biodiversityValue}/100`}
            color={COLORS.accent}
          />
        </div>

        {/* AI Reasoning (if available) */}
        {tree.aiReasoning && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-purple-800 mb-1">AI Insight</p>
                <p className="text-sm text-purple-700">{tree.aiReasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors hover:bg-gray-100"
          style={{ color: COLORS.secondary }}
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show Details</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-4" style={{ backgroundColor: COLORS.background }}>
          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
            <p className="text-sm text-gray-700">{tree.description}</p>
          </div>

          {/* Physical Characteristics */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Physical Characteristics</h4>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Max Height" value={`${tree.maxHeight}m`} />
              <DetailItem label="Lifespan" value={`${tree.lifespan} years`} />
              <DetailItem label="Growth Rate" value={tree.growthRate} />
              <DetailItem
                label="Nitrogen Fixing"
                value={tree.nitrogenFixing ? 'Yes ✓' : 'No'}
              />
            </div>
          </div>

          {/* Environmental Requirements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Environmental Needs</h4>
            <div className="space-y-2">
              <DetailItem
                label="Temperature Range"
                value={`${tree.tempRange.min}°C - ${tree.tempRange.max}°C`}
              />
              <DetailItem
                label="Rainfall Range"
                value={`${tree.rainfallRange.min} - ${tree.rainfallRange.max} mm/year`}
              />
              <DetailItem label="Soil Types" value={tree.soilTypes.join(', ')} />
              <DetailItem label="Water Needs" value={tree.waterNeeds} />
            </div>
          </div>

          {/* Impact Metrics */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Environmental Impact</h4>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem
                label="Carbon Sequestration"
                value={`${tree.carbonSequestration} kg/year`}
                icon={Leaf}
              />
              <DetailItem
                label="Biodiversity Value"
                value={`${tree.biodiversityValue}/100`}
                icon={Award}
              />
            </div>
          </div>

          {/* Uses */}
          {tree.uses && tree.uses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Uses</h4>
              <div className="flex flex-wrap gap-2">
                {tree.uses.map((use, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white border"
                    style={{ borderColor: COLORS.accent, color: COLORS.secondary }}
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Specific Advice */}
          {tree.aiAdvice && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Specific Planting Advice
              </h4>
              <p className="text-sm text-purple-700">{tree.aiAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Quick Stat Component
const QuickStat = ({ icon: Icon, label, value, color }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-2">
    {Icon && <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: COLORS.accent }} />}
    <div className="flex-1">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
    </div>
  </div>
);

export default TreeRecommendationCard;
