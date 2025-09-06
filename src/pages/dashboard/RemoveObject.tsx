import React, { useState, useEffect } from 'react';
import { Target, Download, RotateCcw, Check, Upload, X, Loader2, Sparkles, Eye } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { 
  useRemoveObjectMutation,
  useGetUserCreationsQuery
} from '../../services/api';
import Toaster, { useToaster } from '../../components/Toaster';

// Simple localStorage utilities for image persistence
const STORAGE_KEYS = {
  UPLOADED_IMAGE: 'genio_obj_uploaded_image',
  PROCESSED_IMAGE: 'genio_obj_processed_image',
  OBJECT_DESCRIPTION: 'genio_obj_description'
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

interface ObjectRemovalData {
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

export default function RemoveObject() {
  const { user, isLoaded } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<ObjectRemovalData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recentRemovals, setRecentRemovals] = useState<ObjectRemovalData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageData, setPreviewImageData] = useState<ObjectRemovalData | null>(null);
  
  const toaster = useToaster();
  const [removeObject, { isLoading: isRemovingObject }] = useRemoveObjectMutation();
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

  // Detect premium plan and initialize free credits like other premium pages
  useEffect(() => {
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
      const raw = localStorage.getItem('objFreeLeft');
      let stored = Number(raw);
      if (Number.isNaN(stored) || stored < 0 || stored > 5) {
        stored = 5;
        localStorage.setItem('objFreeLeft', '5');
      }
      setFreeLeft(stored);
    }
  }, [isLoaded, user]);

  const handleRemoveObject = async () => {
    if (!isPremium) {
      if (freeLeft <= 0) {
        setShowUpgrade(true);
        return;
      }
      const next = Math.max(0, freeLeft - 1);
      setFreeLeft(next);
      localStorage.setItem('objFreeLeft', String(next));
    }
    
    if (!uploadedImage || !selectedFile) {
      toaster.showError('Please upload an image first');
      return;
    }

    if (!description.trim()) {
      toaster.showError('Please describe the object you want to remove');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', description.trim());
      
      const response = await removeObject(formData).unwrap();
      
      console.log('Object removal response:', response);
      
      if (response.success) {
        console.log('Setting processed image:', response.data);
        setProcessedImage(response.data);
        // Save processed image to localStorage
        saveToStorage(STORAGE_KEYS.PROCESSED_IMAGE, response.data);
        toaster.showSuccess('Object removed successfully!');
        
        // Refresh user creations to show the new image
        refetchUserCreations();
      } else {
        toaster.showError(response.message || 'Failed to remove object');
      }
    } catch (error: any) {
      console.error('Object removal error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to remove object';
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
        link.download = `object-removed-${processedImage.original_filename}`;
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

  const handlePreviewImage = (imageUrl: string, imageData?: ObjectRemovalData) => {
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
      link.download = filename || `object-removed-${Date.now()}.png`;
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
    setDescription('');
    // Clear from localStorage
    localStorage.removeItem(STORAGE_KEYS.UPLOADED_IMAGE);
    localStorage.removeItem(STORAGE_KEYS.PROCESSED_IMAGE);
    localStorage.removeItem(STORAGE_KEYS.OBJECT_DESCRIPTION);
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedUploadedImage = loadFromStorage(STORAGE_KEYS.UPLOADED_IMAGE, null);
    const savedProcessedImage = loadFromStorage(STORAGE_KEYS.PROCESSED_IMAGE, null);
    const savedDescription = loadFromStorage(STORAGE_KEYS.OBJECT_DESCRIPTION, '');
    
    if (savedUploadedImage) {
      setUploadedImage(savedUploadedImage);
    }
    if (savedProcessedImage) {
      setProcessedImage(savedProcessedImage);
    }
    setDescription(savedDescription);
  }, []);

  // Save description to localStorage
  useEffect(() => {
    if (description) {
      saveToStorage(STORAGE_KEYS.OBJECT_DESCRIPTION, description);
    }
  }, [description]);

  // Load recent object removals from user creations
  useEffect(() => {
    if (userCreations?.data?.ai_images) {
      const objectRemovals = userCreations.data.ai_images
        .filter(img => img.style === 'object_removal')
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
      setRecentRemovals(objectRemovals);
    }
  }, [userCreations]);

  const isProcessingImage = isProcessing || isRemovingObject;

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
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-orange-600" />
                  Object Remover
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
              <Target className="h-5 w-5 mr-2 text-orange-500" />
              Object Removal
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Upload an image and describe the object you want to remove. Our AI will intelligently remove the specified object while preserving the rest of the image.
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
                    <p className="text-xs text-gray-600">Best with clear object boundaries</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Supports JPG, PNG up to 10MB</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Intelligent object detection</p>
                  </div>
                </div>
              </div>

              {/* Object Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Describe the object to remove
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 'right side boy', 'person in blue shirt', 'car on the left'..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
                />
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>💡 <strong>Tips for better results:</strong></p>
                  <p>• Be specific about location: "right side boy", "left corner tree"</p>
                  <p>• Describe appearance: "person in blue shirt", "red car"</p>
                  <p>• Use natural language: "the boy on the right"</p>
                  <p>• Avoid complex descriptions or multiple objects</p>
                </div>
              </div>

              <button
                onClick={handleRemoveObject}
                disabled={!uploadedImage || !selectedFile || isProcessingImage || !description.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing object...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Remove object
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
              <Target className="h-5 w-5 mr-2 text-orange-500" />
              Processed Image
            </h3>

            {isProcessingImage ? (
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
                    <p>Intelligently removing the specified object</p>
                    <p className="text-xs mt-1">This may take a few moments...</p>
                  </div>
                </div>
              </div>
            ) : processedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  {processedImage.image_url ? (
                    <img
                      src={processedImage.image_url}
                      alt="Object removed"
                      className="w-full h-80 object-contain rounded-lg bg-gray-50"
                      onError={(e) => {
                        console.error('Image failed to load:', processedImage.image_url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback message
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg';
                        fallback.innerHTML = `
                          <div class="text-center">
                            <div class="text-gray-500 mb-2">⚠️ Object removal processing failed</div>
                            <div class="text-sm text-gray-400 mb-2">The AI object removal feature may not be available yet.</div>
                            <div class="text-xs text-gray-400">Please try background removal instead.</div>
                          </div>
                        `;
                        target.parentNode?.appendChild(fallback);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', processedImage.image_url);
                      }}
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center text-gray-500">
                        <div className="mb-2">⚠️ No image URL available</div>
                        <div className="text-sm text-gray-400">Check console for details</div>
                      </div>
                    </div>
                  )}
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
                <Target className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">Upload an image and click "Remove object" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Object Removals */}
      {recentRemovals.length > 0 && (
        <div className="mt-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-500" />
              Recent Object Removals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentRemovals.slice(0, 12).map((removal) => (
                <div key={removal.image_id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={removal.image_url}
                      alt="Object removed"
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
                      onClick={() => handleDownloadImage(removal.image_url, `object-removed-${removal.original_filename}`)}
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
                    onClick={() => handleDownloadImage(previewImage, `object-removed-${previewImageData.original_filename}`)}
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
            <p className="text-sm text-gray-800 mb-5">Object removal is a Premium feature. Upgrade to continue.</p>
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
