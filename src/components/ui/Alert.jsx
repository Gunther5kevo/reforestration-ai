/**
 * Alert Component
 * Displays contextual messages with different severity levels
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const config = {
    success: {
      icon: CheckCircle,
      classes: 'bg-green-50 border-green-500 text-green-900',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      classes: 'bg-red-50 border-red-500 text-red-900',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      classes: 'bg-yellow-50 border-yellow-500 text-yellow-900',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      classes: 'bg-blue-50 border-blue-500 text-blue-900',
      iconColor: 'text-blue-600'
    }
  };
  
  const { icon: Icon, classes, iconColor } = config[type];
  
  return (
    <div className={`rounded-lg border-l-4 p-4 ${classes} ${className}`}>
      <div className="flex items-start">
        <Icon className={`${iconColor} mr-3 flex-shrink-0`} size={24} />
        <div className="flex-1">
          {title && <h4 className="font-bold mb-1">{title}</h4>}
          {message && <p className="text-sm">{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;