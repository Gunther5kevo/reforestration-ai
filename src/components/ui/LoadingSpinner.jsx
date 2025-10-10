/**
 * LoadingSpinner Component
 * Reusable loading indicator with customizable size and message
 */

import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  };
  
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`${sizeClasses[size]} border-green-200 border-t-green-600 rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }
  
  return spinnerContent;
};

export default LoadingSpinner;