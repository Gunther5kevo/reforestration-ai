/**
 * ProgressBar Component
 * Visual progress indicator
 */

import React from 'react';

const ProgressBar = ({ 
  value, 
  max = 100, 
  label,
  showPercentage = true,
  color = 'green',
  size = 'medium',
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };
  
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6'
  };
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;