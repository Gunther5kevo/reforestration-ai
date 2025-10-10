/**
 * ActionButtons Component
 * Provides export, share, and action buttons for recommendations
 */
import React, { useState } from 'react';
import { Download, Share2, Mail, Printer, Copy, Check, FileText } from 'lucide-react';
import COLORS from '../../constants/colors';

const ActionButtons = ({ 
  recommendations, 
  plantingStrategy, 
  impactMetrics,
  locationData 
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Generate summary text for sharing
  const generateSummaryText = () => {
    const topTree = recommendations[0];
    return `🌳 ReForest.AI Recommendations for ${locationData.city}, ${locationData.country}

Top Recommendation: ${topTree.commonName} (${Math.round(topTree.finalScore || topTree.compatibilityScore)}% match)

Environmental Impact (10 years):
🌱 ${impactMetrics.density.treesPerHectare} trees/hectare
🍃 ${(impactMetrics.carbonSequestration.year10 / 1000).toFixed(1)} tons CO₂ captured
💚 Biodiversity Score: ${impactMetrics.biodiversity.score}/100

Best planting months: ${plantingStrategy.bestMonths.slice(0, 3).join(', ')}

Get your personalized tree recommendations at ReForest.AI!`;
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    setIsExporting(true);
    
    // In production, use a library like jsPDF or html2pdf
    setTimeout(() => {
      alert('PDF export will be implemented with jsPDF library.\n\nThis would generate a comprehensive report including:\n- Location analysis\n- Climate data\n- Top 5 tree recommendations\n- Planting guide\n- Impact metrics');
      setIsExporting(false);
    }, 1000);
  };

  // Handle Copy Link
  const handleCopyLink = () => {
    const summaryText = generateSummaryText();
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  };

  // Handle Email Share
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Tree Planting Recommendations for ${locationData.city}`);
    const body = encodeURIComponent(generateSummaryText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Handle Web Share (mobile)
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ReForest.AI Tree Recommendations',
          text: generateSummaryText(),
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          📤 Export & Share
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Export PDF */}
          <ActionButton
            icon={Download}
            label="Export PDF"
            onClick={handleExportPDF}
            disabled={isExporting}
            loading={isExporting}
            primary
          />

          {/* Copy Summary */}
          <ActionButton
            icon={copiedLink ? Check : Copy}
            label={copiedLink ? 'Copied!' : 'Copy Summary'}
            onClick={handleCopyLink}
            success={copiedLink}
          />

          {/* Share */}
          <ActionButton
            icon={Share2}
            label="Share"
            onClick={handleWebShare}
          />

          {/* Email */}
          <ActionButton
            icon={Mail}
            label="Email"
            onClick={handleEmailShare}
          />
        </div>
      </div>

      {/* Additional Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.textDark }}>
          🔧 Additional Actions
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Print */}
          <ActionButton
            icon={Printer}
            label="Print Report"
            onClick={handlePrint}
          />

          {/* Download Data */}
          <ActionButton
            icon={FileText}
            label="Download JSON"
            onClick={() => {
              const dataStr = JSON.stringify({
                location: locationData,
                recommendations: recommendations,
                plantingStrategy: plantingStrategy,
                impactMetrics: impactMetrics
              }, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `reforest-ai-${locationData.city}-${Date.now()}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          />

          {/* Start Over */}
          <ActionButton
            icon={FileText}
            label="Start New Analysis"
            onClick={() => window.location.reload()}
            variant="outline"
          />
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.textDark }}>
          📊 Quick Summary
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <SummaryStat
            label="Top Tree"
            value={recommendations[0]?.commonName}
            icon="🌳"
          />
          <SummaryStat
            label="Match Score"
            value={`${Math.round(recommendations[0]?.finalScore || recommendations[0]?.compatibilityScore)}%`}
            icon="✨"
          />
          <SummaryStat
            label="CO₂ Capture"
            value={`${(impactMetrics.carbonSequestration.year10 / 1000).toFixed(1)}t`}
            icon="🍃"
          />
          <SummaryStat
            label="Trees/Hectare"
            value={impactMetrics.density.treesPerHectare}
            icon="🌲"
          />
        </div>
      </div>

      {/* Share Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-900 mb-2">💡 Sharing Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>PDF Export:</strong> Comprehensive report with all recommendations and charts</li>
          <li>• <strong>Copy Summary:</strong> Quick text summary perfect for messaging apps</li>
          <li>• <strong>Email:</strong> Send detailed recommendations to your team</li>
          <li>• <strong>JSON Download:</strong> Raw data for developers and researchers</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">🌍 Ready to Plant?</h3>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Share these recommendations with your team, local forestry experts, or community members. 
          Together, we can restore our planet one tree at a time!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => window.open('https://www.plant-for-the-planet.org/', '_blank')}
            className="px-6 py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors"
          >
            Find Planting Partners
          </button>
          <button
            onClick={() => window.open('https://trees.org/', '_blank')}
            className="px-6 py-3 bg-white bg-opacity-20 text-white font-bold rounded-lg hover:bg-opacity-30 transition-colors border-2 border-white"
          >
            Learn More About Trees
          </button>
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false, 
  loading = false, 
  primary = false,
  success = false,
  variant = 'default'
}) => {
  const getButtonStyle = () => {
    if (success) return { backgroundColor: COLORS.success };
    if (primary) return { backgroundColor: COLORS.accent };
    if (variant === 'outline') return { border: `2px solid ${COLORS.accent}`, color: COLORS.accent, backgroundColor: 'white' };
    return { backgroundColor: COLORS.secondary };
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.accent;
    return 'white';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg font-medium transition-all hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
        variant === 'outline' ? 'border-2' : ''
      }`}
      style={getButtonStyle()}
    >
      {loading ? (
        <div 
          className="animate-spin rounded-full h-6 w-6 border-b-2"
          style={{ borderColor: variant === 'outline' ? COLORS.accent : 'white' }}
        />
      ) : (
        <Icon className="w-6 h-6" style={{ color: getTextColor() }} />
      )}
      <span className="text-sm" style={{ color: getTextColor() }}>
        {label}
      </span>
    </button>
  );
};

// Summary Stat Component
const SummaryStat = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-lg text-center shadow hover:shadow-md transition-shadow">
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-2xl font-bold mb-1" style={{ color: COLORS.accent }}>
      {value}
    </p>
    <p className="text-xs text-gray-600">{label}</p>
  </div>
);

export default ActionButtons;