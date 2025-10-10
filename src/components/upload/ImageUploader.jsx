/**
 * ImageUploader Component
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
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 bg-white'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? () => fileInputRef.current?.click() : undefined}
      >
        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/heic"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/heic"
          capture="environment" // opens back camera on mobile
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

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
            Maximum file size: 10MB
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isProcessing}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-600">
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
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: COLORS.accent }}
              />
              <p className="font-medium" style={{ color: COLORS.textDark }}>
                Processing image...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> For best results, take a photo that shows the soil and surrounding vegetation clearly. 
          Images with GPS data will automatically detect your location!
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
