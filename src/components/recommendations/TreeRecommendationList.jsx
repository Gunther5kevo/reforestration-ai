/**
 * TreeRecommendationList Component
 * Displays list of recommended trees with filtering and sorting
 */
import React, { useState } from 'react';
import { Filter, SortAsc, Sparkles } from 'lucide-react';
import TreeRecommendationCard from './TreeRecommendationCard';
import COLORS from '../../constants/colors';

const TreeRecommendationList = ({ recommendations, aiEnhanced = false }) => {
  const [sortBy, setSortBy] = useState('score'); // 'score', 'carbon', 'biodiversity'
  const [filterNative, setFilterNative] = useState(false);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-12 bg-white rounded-xl shadow-lg text-center">
        <p className="text-gray-500">No tree recommendations available</p>
      </div>
    );
  }

  // Filter and sort trees
  let displayTrees = [...recommendations];

  // Apply native filter
  if (filterNative) {
    displayTrees = displayTrees.filter(tree => 
      tree.nativeRegions && tree.nativeRegions.length > 0
    );
  }

  // Apply sorting
  displayTrees.sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.finalScore || b.compatibilityScore) - (a.finalScore || a.compatibilityScore);
      case 'carbon':
        return b.carbonSequestration - a.carbonSequestration;
      case 'biodiversity':
        return b.biodiversityValue - a.biodiversityValue;
      default:
        return 0;
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.textDark }}>
              🌳 Top Tree Recommendations
            </h2>
            <p className="text-gray-600">
              {displayTrees.length} trees perfectly suited for your location
            </p>
            {aiEnhanced && (
              <div className="flex items-center gap-2 mt-2 text-sm text-purple-700">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI-Enhanced Rankings</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
              >
                <option value="score">Sort by Match Score</option>
                <option value="carbon">Sort by Carbon Capture</option>
                <option value="biodiversity">Sort by Biodiversity</option>
              </select>
              <SortAsc 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" 
              />
            </div>

            {/* Native Filter */}
            <button
              onClick={() => setFilterNative(!filterNative)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                filterNative
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filterNative ? { backgroundColor: COLORS.accent } : {}}
            >
              <Filter className="w-4 h-4" />
              Native Only
            </button>
          </div>
        </div>
      </div>

      {/* Tree Cards */}
      <div className="space-y-4">
        {displayTrees.length > 0 ? (
          displayTrees.map((tree, index) => (
            <TreeRecommendationCard
              key={tree.id || index}
              tree={tree}
              rank={index + 1}
              showDetails={index === 0} // Auto-expand first card
            />
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              No trees match your current filters. Try adjusting your selection.
            </p>
            <button
              onClick={() => setFilterNative(false)}
              className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: COLORS.accent }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.textDark }}>
          Quick Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Tree</th>
                <th className="text-center py-2 px-2">Match</th>
                <th className="text-center py-2 px-2">Growth</th>
                <th className="text-center py-2 px-2">Carbon</th>
                <th className="text-center py-2 px-2">Bio Value</th>
              </tr>
            </thead>
            <tbody>
              {displayTrees.slice(0, 5).map((tree, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{tree.commonName}</td>
                  <td className="text-center py-3 px-2">
                    <span className="font-bold" style={{ color: COLORS.accent }}>
                      {Math.round(tree.finalScore || tree.compatibilityScore)}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2 capitalize">{tree.growthRate}</td>
                  <td className="text-center py-3 px-2">{tree.carbonSequestration}kg</td>
                  <td className="text-center py-3 px-2">{tree.biodiversityValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TreeRecommendationList;