import React, { useState, useEffect } from 'react';
import { Layers, Download, RotateCcw, Check, Upload, X, Loader2, Sparkles, Eye } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { 
  useRemoveBackgroundMutation,
  useGetUserCreationsQuery
} from '../../services/api';
import Toaster, { useToaster } from '../../components/Toaster';

// Simple localStorage utilities for image persistence
const STORAGE_KEYS = {
  UPLOADED_IMAGE: 'genio_bg_uploaded_image',
  PROCESSED_IMAGE: 'genio_bg_processed_image'
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

interface BackgroundRemovalData {
  image_id: string;
  image_url: string;
  cloudinary_public_id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  plan: string;
  image_info: {
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

export default function RemoveBackground() {
  const { user, isLoaded } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<BackgroundRemovalData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recentRemovals, setRecentRemovals] = useState<BackgroundRemovalData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageData, setPreviewImageData] = useState<BackgroundRemovalData | null>(null);
  
  const toaster = useToaster();
  const [removeBackground, { isLoading: isRemovingBackground }] = useRemoveBackgroundMutation();
  const { data: userCreations, refetch: refetchUserCreations } = useGetUserCreationsQuery();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toaster.showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toaster.showError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setUploadedImage(imageDataUrl);
        // Save to localStorage
        saveToStorage(STORAGE_KEYS.UPLOADED_IMAGE, imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Detect premium plan from Clerk
  React.useEffect(() => {
    if (!isLoaded) return;
    type Meta = { plan?: unknown; isPremium?: unknown; tier?: unknown; currentPlan?: unknown } | undefined;
    const pub = user?.publicMetadata as Meta;
    const unsafe = user?.unsafeMetadata as Meta;
    const norm = (v: unknown) => (v == null ? '' : String(v).toLowerCase().trim());
    const plan = norm(pub?.plan ?? unsafe?.plan ?? pub?.tier ?? unsafe?.tier ?? pub?.currentPlan ?? unsafe?.currentPlan);
    const flag = norm(pub?.isPremium ?? unsafe?.isPremium);
    const premium = ['premium', 'pro', 'paid', 'active'].includes(plan) || ['true', 'yes', '1'].includes(flag);
    setIsPremium(premium);

    if (!premium) {
      const raw = localStorage.getItem('bgFreeLeft');
      let stored = Number(raw);
      if (Number.isNaN(stored) || stored < 0 || stored > 5) {
        stored = 5;
        localStorage.setItem('bgFreeLeft', '5');
      }
      setFreeLeft(stored);
    }
  }, [isLoaded, user]);

  const handleRemoveBackground = async () => {
    if (!isPremium) {
      if (freeLeft <= 0) {
        setShowUpgrade(true);
        return;
      }
      const next = Math.max(0, freeLeft - 1);
      setFreeLeft(next);
      localStorage.setItem('bgFreeLeft', String(next));
    }
    
    if (!uploadedImage || !selectedFile) {
      toaster.showError('Please upload an image first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Debug logging
      console.log('Selected file:', selectedFile);
      console.log('File name:', selectedFile.name);
      console.log('File size:', selectedFile.size);
      console.log('File type:', selectedFile.type);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await removeBackground(formData).unwrap();
      
      if (response.success) {
        setProcessedImage(response.data);
        // Save processed image to localStorage
        saveToStorage(STORAGE_KEYS.PROCESSED_IMAGE, response.data);
        toaster.showSuccess('Background removed successfully!');
        
        // Refresh user creations to show the new image
        refetchUserCreations();
      } else {
        toaster.showError(response.message || 'Failed to remove background');
      }
    } catch (error: any) {
      console.error('Background removal error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to remove background';
      toaster.showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (processedImage?.image_url) {
      try {
        const response = await fetch(processedImage.image_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `background-removed-${processedImage.original_filename}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toaster.showSuccess('Downloaded!', 'Image downloaded successfully');
      } catch (error) {
        console.error('Download failed:', error);
        toaster.showError('Download Failed', 'Could not download the image');
      }
    }
  };

  const handlePreviewImage = (imageUrl: string, imageData?: BackgroundRemovalData) => {
    setPreviewImage(imageUrl);
    setPreviewImageData(imageData || null);
  };

  const handleDownloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `background-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toaster.showSuccess('Downloaded!', 'Image downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toaster.showError('Download Failed', 'Could not download the image');
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
    // Clear from localStorage
    localStorage.removeItem(STORAGE_KEYS.UPLOADED_IMAGE);
    localStorage.removeItem(STORAGE_KEYS.PROCESSED_IMAGE);
  };

  // Load saved images on component mount
  useEffect(() => {
    const savedUploadedImage = loadFromStorage(STORAGE_KEYS.UPLOADED_IMAGE, null);
    const savedProcessedImage = loadFromStorage(STORAGE_KEYS.PROCESSED_IMAGE, null);
    
    if (savedUploadedImage) {
      setUploadedImage(savedUploadedImage);
    }
    if (savedProcessedImage) {
      setProcessedImage(savedProcessedImage);
    }
  }, []);

  // Load recent background removals from user creations
  useEffect(() => {
    if (userCreations?.data?.ai_images) {
      const backgroundRemovals = userCreations.data.ai_images
        .filter(img => img.style === 'background_removal')
        .map(img => ({
          image_id: img.image_id,
          image_url: img.image_url,
          cloudinary_public_id: img.cloudinary_public_id,
          original_filename: `image_${img.image_id.slice(0, 8)}.png`,
          file_size: 0, // Not stored in current schema
          mime_type: 'image/png',
          plan: 'premium',
          image_info: {
            width: 0, // Not stored in current schema
            height: 0,
            format: 'png',
            bytes: 0
          }
        }));
      setRecentRemovals(backgroundRemovals);
    }
  }, [userCreations]);

  return (
    <>
      <Toaster toasts={toaster.toasts} onRemove={toaster.removeToast} />
      
      {/* Header with Status and Actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 mb-6 rounded-xl">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <Layers className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-orange-600" />
                  Background Remover
                </h1>
                
                {/* Plan Status */}
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <div className="flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-medium">
                      <Sparkles className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Premium Plan</span>
                      <span className="sm:hidden">Premium</span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      <span className="hidden sm:inline">Free Plan ({freeLeft} left)</span>
                      <span className="sm:hidden">Free ({freeLeft})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!isPremium && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-colors cursor-pointer font-medium"
                >
                  Go Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload Card */}
        <div className="bg-white shadow rounded-xl border border-gray-100">
          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-orange-500" />
              Background Removal
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Upload a product, portrait, or logo image and instantly remove its background.
              Results are downloadable as transparent PNGs, ideal for stores, thumbnails, and mockups.
            </p>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-2">Upload image</p>
                
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                )}
                
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Best with high-contrast subjects</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Supports JPG, PNG up to 10MB</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Transparent background output</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRemoveBackground}
                disabled={!uploadedImage || !selectedFile || isProcessing || isRemovingBackground}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isProcessing || isRemovingBackground) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing background...
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4 mr-2" />
                    Remove background
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Processed Card */}
        <div className="bg-white shadow rounded-xl border border-gray-100">
          <div className="px-5 py-5 sm:p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-orange-500" />
              Processed Image
            </h3>

            {isProcessing || isRemovingBackground ? (
              <div className="space-y-4">
                {/* Skeleton Animation */}
                <div className="relative">
                  <div className="w-full h-80 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Processing image...</p>
                    </div>
                  </div>
                </div>
                
                {/* Processing info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-center text-sm text-gray-600">
                    <p>Removing background from your image</p>
                    <p className="text-xs mt-1">This may take a few moments...</p>
                  </div>
                </div>
              </div>
            ) : processedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={processedImage.image_url}
                    alt="Background removed"
                    className="w-full h-80 object-contain rounded-lg bg-gray-50"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button 
                      onClick={() => handlePreviewImage(processedImage.image_url, processedImage)}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                      title="Preview image"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                      title="Download image"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={handleReset}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                
                {/* Image info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Format:</span> {processedImage.image_info.format.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {processedImage.image_info.width}×{processedImage.image_info.height}
                    </div>
                    <div>
                      <span className="font-medium">File size:</span> {Math.round(processedImage.image_info.bytes / 1024)}KB
                    </div>
                    <div>
                      <span className="font-medium">Original:</span> {processedImage.original_filename}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 rounded-lg bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center text-center">
                <Layers className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">Upload an image and click "Remove background" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Background Removals */}
      {recentRemovals.length > 0 && (
        <div className="mt-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-orange-500" />
              Recent Background Removals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentRemovals.slice(0, 12).map((removal) => (
                <div key={removal.image_id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={removal.image_url}
                      alt="Background removed"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePreviewImage(removal.image_url, removal)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                      title="Preview image"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDownloadImage(removal.image_url, `background-removed-${removal.original_filename}`)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                      title="Download image"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => {
                        setProcessedImage(removal);
                        setUploadedImage(removal.image_url);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                      title="Use this image"
                    >
                      <RotateCcw className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <div className="flex items-center gap-2">
                {previewImageData && (
                  <button
                    onClick={() => handleDownloadImage(previewImage, `background-removed-${previewImageData.original_filename}`)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                )}
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              {previewImageData && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Format:</span> {previewImageData.image_info.format.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {previewImageData.image_info.width}×{previewImageData.image_info.height}
                    </div>
                    <div>
                      <span className="font-medium">File size:</span> {Math.round(previewImageData.image_info.bytes / 1024)}KB
                    </div>
                    <div>
                      <span className="font-medium">Original:</span> {previewImageData.original_filename}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showUpgrade && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md w-full border border-white/40 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Go Premium</h3>
            <p className="text-sm text-gray-800 mb-5">Background removal is a Premium feature. Upgrade to continue.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => (window.location.href = '/billing')}
                className="px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow cursor-pointer"
              >
                Upgrade now
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}