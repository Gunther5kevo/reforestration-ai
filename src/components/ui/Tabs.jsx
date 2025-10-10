/**
 * Tabs Component
 * Tabbed interface for organizing content
 */

import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex space-x-1">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                px-6 py-3 font-medium text-sm transition-all
                ${activeTab === index
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="py-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;