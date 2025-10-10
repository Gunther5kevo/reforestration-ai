/**
 * ImageUploader Component (Improved)
 * Handles drag-and-drop, file selection, and camera capture for images
 */
import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, MapPin, AlertCircle } from 'lucide-react';
import COLORS from '../../constants/colors';
import { validateImageFile } from '../../services/imageService';

const ImageUploader = ({ onImageUpload, isProcessing = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle file selection or camera capture
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  // Validate and send file to parent
  const handleFile = (file) => {
    setError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    onImageUpload(file);
  };

  // Handle button clicks - prevent event bubbling
  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleCameraClick = (e) => {
    e.stopPropagation();
    if (!isProcessing) {
      cameraInputRef.current?.click();
    }
  };

  // Handle drop zone click (only when not clicking buttons)
  const handleDropZoneClick = (e) => {
    // Only trigger if clicking the drop zone itself, not the buttons
    if (e.target === e.currentTarget || e.target.closest('.drop-zone-content')) {
      if (!isProcessing) {
        fileInputRef.current?.click();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 bg-white'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment" // opens back camera on mobile
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="drop-zone-content pointer-events-none">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: COLORS.background }}
            >
              {isDragging ? (
                <ImageIcon className="w-12 h-12" style={{ color: COLORS.accent }} />
              ) : (
                <Upload className="w-12 h-12" style={{ color: COLORS.secondary }} />
              )}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold" style={{ color: COLORS.textDark }}>
              {isDragging ? 'Drop your image here' : 'Upload or Take a Photo of Your Land'}
            </h3>
            <p className="text-gray-600">
              Drag and drop, upload from files, or take a photo directly
            </p>
            <p className="text-sm text-gray-500">
              Supported: JPG, PNG, HEIC • Max size: 10MB
            </p>
          </div>
        </div>

        {/* Buttons - with pointer events enabled */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            disabled={isProcessing}
          >
            <Upload className="w-5 h-5" />
            Choose File
          </button>

          <button
            type="button"
            onClick={handleCameraClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            disabled={isProcessing}
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-600 pointer-events-none">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span>GPS Auto-detect</span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span>Soil Analysis</span>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="relative">
                {/* Spinner */}
                <div
                  className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"
                  style={{ borderTopColor: COLORS.accent }}
                />
                {/* Inner icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" style={{ color: COLORS.accent }} />
                </div>
              </div>
              <p className="font-semibold text-lg mt-4" style={{ color: COLORS.textDark }}>
                Processing image...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Upload Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900 mb-1">Pro Tips for Best Results:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take photos with <strong>GPS/location enabled</strong> on your device</li>
              <li>• Show the <strong>soil and surrounding vegetation</strong> clearly</li>
              <li>• Capture in <strong>good lighting</strong> (avoid shadows or glare)</li>
              <li>• Include <strong>landscape context</strong> if possible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported Formats Info */}
      <div className="mt-4 text-center">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer hover:text-gray-800 inline-flex items-center gap-1">
            <span>What image formats are supported?</span>
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
            <p className="font-medium text-gray-700 mb-2">Supported formats:</p>
            <ul className="space-y-1">
              <li>• <strong>JPEG/JPG</strong> - Standard photos from most cameras</li>
              <li>• <strong>PNG</strong> - Screenshots and graphics</li>
              <li>• <strong>HEIC/HEIF</strong> - iPhone photos (iOS 11+)</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Note: GPS data is best preserved in original photos taken with your device camera.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ImageUploader;