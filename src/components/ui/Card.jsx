/**
 * Card Component
 * Reusable card container with optional header, footer, and variants
 */

import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  footer,
  variant = 'default',
  className = '',
  onClick
}) => {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300',
    success: 'bg-gradient-to-br from-green-100 to-green-200 border-green-400',
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
  };
  
  return (
    <div 
      className={`rounded-xl shadow-md border ${variantClasses[variant]} ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      {(title || Icon) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            {Icon && <Icon className="text-green-700 mr-3" size={28} />}
            <div>
              {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;