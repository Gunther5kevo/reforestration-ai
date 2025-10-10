/**
 * Button Component
 * Reusable button with variants, sizes, and icon support
 */

import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-green-700 text-white hover:bg-green-800 active:bg-green-900 shadow-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md',
    outline: 'bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 active:bg-green-100',
    ghost: 'bg-transparent text-green-700 hover:bg-green-50 active:bg-green-100'
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? disabledClasses : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={20} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={20} />}
        </>
      )}
    </button>
  );
};

export default Button;