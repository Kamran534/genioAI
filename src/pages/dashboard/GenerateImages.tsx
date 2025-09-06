import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Image as ImageIcon, Download, Trash2, Eye, Sparkles, Globe, X, Save, Loader2, Heart, RefreshCw, Copy, Share } from 'lucide-react';
import { 
  useGenerateAiImageMutation, 
  useGetUserCreationsQuery, 
  usePublishImageMutation,
  useLikeImageMutation,
  useGetLikedImagesQuery
} from '../../services/api';
import Toaster, { useToaster } from '../../components/Toaster';

interface ImageGenerationData {
  prompt: string;
  selectedStyle: string;
  selectedAspectRatio: string;
  generatedImages: Array<{
    image_id: string;
    image_url: string;
    prompt: string;
    style: string;
    aspect_ratio: string;
    is_community_published: boolean;
    is_liked: boolean;
    created_at: string;
  }>;
  lastGenerated: Date | null;
}

// Enhanced localStorage utilities
const STORAGE_KEYS = {
  IMAGE_GENERATION_DATA: 'genio_image_generation_data',
  LAST_SAVED: 'genio_image_last_saved',
  AUTO_SAVE_ENABLED: 'genio_image_auto_save_enabled'
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

export default function GenerateImages() {
  const { user, isLoaded } = useUser();
  const toaster = useToaster();
  
  const [imageData, setImageData] = useState<ImageGenerationData>(() => 
    loadFromStorage(STORAGE_KEYS.IMAGE_GENERATION_DATA, {
      prompt: '',
      selectedStyle: 'realistic',
      selectedAspectRatio: 'square',
      generatedImages: [],
      lastGenerated: null
    })
  );
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const saved = loadFromStorage(STORAGE_KEYS.LAST_SAVED, null);
    return saved ? new Date(saved) : null;
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<string>('');
  const [previewImageData, setPreviewImageData] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [myLikedImages, setMyLikedImages] = useState<any[]>([]);

  // Debounced save function
  const saveTimeoutRef = useRef<number | null>(null);

  const debouncedSave = (data: ImageGenerationData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      setIsAutoSaving(true);
      try {
        saveToStorage(STORAGE_KEYS.IMAGE_GENERATION_DATA, data);
        saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
        setLastSaved(new Date());
        toaster.showInfo('Auto-saved', 'Your image generation data has been saved automatically');
      } catch (error) {
        console.error('Auto-save failed:', error);
        toaster.showError('Auto-save Failed', 'Could not save your data automatically');
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);
  };

  // Auto-save functionality
  useEffect(() => {
    if (imageData.prompt || imageData.generatedImages.length > 0) {
      debouncedSave(imageData);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [imageData]);

  // API integration
  const [generateAiImage, { isLoading: isGeneratingImage, error: generationError }] = useGenerateAiImageMutation();
  const [publishImage] = usePublishImageMutation();
  const [likeImage] = useLikeImageMutation();
  const { data: userCreations, refetch: refetchCreations } = useGetUserCreationsQuery();
  const { data: likedImagesData, refetch: refetchLikedImages, isLoading: isLoadingLikedImages, error: likedImagesError } = useGetLikedImagesQuery();


  // Fetch user's liked images from dedicated API
  useEffect(() => {
    if (likedImagesData?.data?.images) {
      setMyLikedImages(likedImagesData.data.images);
      console.log('My liked images loaded from API:', likedImagesData.data.images.length, likedImagesData.data.images);
    } else if (likedImagesError) {
      console.error('Error loading liked images:', likedImagesError);
      setMyLikedImages([]);
    }
  }, [likedImagesData, likedImagesError]);

  // Refetch liked images when plan status changes or component mounts
  useEffect(() => {
    if (isLoaded && user) {
      console.log('Plan status changed, refetching liked images...', { isPremium, freeLeft });
      refetchLikedImages();
    }
  }, [isLoaded, user, isPremium, refetchLikedImages]);

  // Initial load of liked images when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      console.log('Component mounted, fetching liked images...');
      refetchLikedImages();
    }
  }, [isLoaded, user, refetchLikedImages]);


  // Premium plan detection
  useEffect(() => {
    if (!isLoaded) return;
    type Metadata = { plan?: unknown; isPremium?: unknown; tier?: unknown; currentPlan?: unknown } | undefined;
    const publicMeta = user?.publicMetadata as Metadata;
    const unsafeMeta = user?.unsafeMetadata as Metadata;

    const normalize = (v: unknown): string => {
      if (v == null) return '';
      return String(v).toLowerCase().trim();
    };

    const plan = normalize(
      publicMeta?.plan ?? unsafeMeta?.plan ?? publicMeta?.tier ?? unsafeMeta?.tier ?? publicMeta?.currentPlan ?? unsafeMeta?.currentPlan
    );
    const flag = normalize(publicMeta?.isPremium ?? unsafeMeta?.isPremium);

    const premium = ['premium', 'premiun', 'pro', 'paid', 'active'].includes(plan) || ['true', 'yes', '1'].includes(flag);

    setIsPremium(!!premium);

    if (!premium) {
      const raw = localStorage.getItem('imgFreeLeft');
      let stored = Number(raw);
      if (Number.isNaN(stored) || stored < 0 || stored > 5) {
        stored = 5;
        localStorage.setItem('imgFreeLeft', '5');
      }
      setFreeLeft(stored);
    }
  }, [isLoaded, user]);

  const handleGenerateImage = async () => {
    if (!imageData.prompt.trim()) {
      toaster.showError('Missing Prompt', 'Please enter a description for your image');
      return;
    }
    
    if (!isPremium) {
      if (freeLeft <= 0) {
        setShowUpgrade(true);
        return;
      }
      const next = Math.max(0, freeLeft - 1);
      setFreeLeft(next);
      localStorage.setItem('imgFreeLeft', String(next));
    }
    
    setIsGenerating(true);
    const loadingToastId = toaster.showLoading('Generating Image', 'Creating your AI-generated image...');
    
    try {
      const response = await generateAiImage({
        prompt: imageData.prompt.trim(),
        style: imageData.selectedStyle,
        aspectRatio: imageData.selectedAspectRatio,
        publishToCommunity: false
      }).unwrap();
      
      console.log('Full API response:', response);
      
      if (response.success && response.data) {
        console.log('Image generation response:', response.data);
        console.log('Image URL:', response.data.image_url);
        
        // Validate that we have a valid image URL
        if (!response.data.image_url) {
          throw new Error('No image URL returned from server');
        }
        
        const newImage = {
          image_id: response.data.image_id,
          image_url: response.data.image_url,
          prompt: response.data.prompt,
          style: response.data.style,
          aspect_ratio: response.data.aspect_ratio,
          is_community_published: response.data.is_community_published || false,
          is_liked: false, // New images start as not liked
          created_at: new Date().toISOString()
        };
        
        console.log('New image created with ID:', newImage.image_id);
        
        console.log('New image object:', newImage);
        
        // Test if the image URL is accessible
        try {
          const testResponse = await fetch(newImage.image_url, { method: 'HEAD' });
          console.log('Image URL accessibility test:', testResponse.status);
          if (!testResponse.ok) {
            console.warn('Image URL may not be accessible:', testResponse.status);
          }
        } catch (urlError) {
          console.error('Image URL test failed:', urlError);
        }
        
        setImageData(prev => ({
          ...prev,
          generatedImages: [newImage], // Replace previous images
          lastGenerated: new Date()
        }));
        
        // Auto-refresh user creations
        refetchCreations();
        
        toaster.removeToast(loadingToastId);
        toaster.showSuccess('Image Generated!', 'Your AI image has been created successfully');
      } else {
        console.error('API response not successful:', response);
        throw new Error(response.message || 'Failed to generate image');
      }
    } catch (error: any) {
      let message = 'Unknown error occurred';
      
      if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.message) {
        message = error.message;
      } else if (generationError && 'data' in generationError) {
        const errorData = generationError.data as any;
        message = errorData?.message || errorData?.error || 'API error occurred';
      }
      
      // Provide more helpful error messages
      if (message.includes('premium users')) {
        message = 'Image generation is only available for premium users. Please upgrade your plan.';
        setShowUpgrade(true);
      } else if (message.includes('Unauthorized')) {
        message = 'Please log in again to continue generating images.';
      } else if (message.includes('Content policy violation')) {
        message = 'Your prompt violates content policy. Please modify your description and try again.';
      } else if (message.includes('Rate limit exceeded')) {
        message = 'Rate limit exceeded. Please wait a moment before trying again.';
      } else if (message.includes('Invalid request')) {
        message = 'Invalid request. Please check your prompt and try again.';
      }
      
      toaster.removeToast(loadingToastId);
      toaster.showError('Generation Failed', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewImage = (imageUrl: string, prompt?: string, imageData?: any) => {
    setPreviewImage(imageUrl);
    setPreviewPrompt(prompt || '');
    setPreviewImageData(imageData || null);
  };

  const handleDownloadImage= async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.jpg`;
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

  const handleDeleteImage = (imageId: string) => {
    setImageData(prev => ({
      ...prev,
      generatedImages: prev.generatedImages.filter(img => img.image_id !== imageId)
    }));
    if (previewImage && imageData.generatedImages.find(img => img.image_id === imageId)?.image_url === previewImage) {
      setPreviewImage(null);
    }
    toaster.showInfo('Image Deleted', 'Image has been removed from your collection');
  };


  const handlePublicToCommunity = async (imageId: string) => {
    try {
      const response = await publishImage({
        imageId,
        isPublished: true
      }).unwrap();
      
      if (response.success) {
        setImageData(prev => ({
          ...prev,
          generatedImages: prev.generatedImages.map(img => 
            img.image_id === imageId 
              ? { ...img, is_community_published: true }
              : img
          )
        }));
        
        // Refresh user creations
        refetchCreations();
        
        toaster.showSuccess('Published!', 'Image has been shared to the community');
      }
    } catch (error: any) {
      console.error('Failed to share to community:', error);
      toaster.showError('Publish Failed', 'Could not publish image to community');
    }
  };


  const handleLikeImage = async (imageId: string) => {
    try {
      console.log('Attempting to like image:', imageId);
      const response = await likeImage({ imageId }).unwrap();
      console.log('Like response:', response);
      
      if (response.success) {
        toaster.showSuccess('Liked!', response.data.is_liked ? 'Image liked' : 'Image unliked');
        
        // Update local state for generated images
        setImageData(prev => ({
          ...prev,
          generatedImages: prev.generatedImages.map(img => 
            img.image_id === imageId 
              ? { ...img, is_liked: response.data.is_liked }
              : img
          )
        }));
        
        // Refresh liked images to get updated like status
        refetchLikedImages();
      }
    } catch (error: any) {
      console.error('Failed to like image:', error);
      console.error('Error details:', error.data || error.message);
      
      // Show more specific error message
      let errorMessage = 'Could not like/unlike image';
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toaster.showError('Like Failed', errorMessage);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toaster.showSuccess('Copied!', 'Link copied to clipboard');
    } catch (error) {
      toaster.showError('Copy Failed', 'Could not copy to clipboard');
    }
  };

  const clearAllData = () => {
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset state
    setImageData({
      prompt: '',
      selectedStyle: 'realistic',
      selectedAspectRatio: 'square',
      generatedImages: [],
      lastGenerated: null
    });
    setLastSaved(null);
    
    toaster.showInfo('Data Cleared', 'All image generation data has been cleared');
  };

  const forceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsAutoSaving(true);
    try {
      saveToStorage(STORAGE_KEYS.IMAGE_GENERATION_DATA, imageData);
      saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      setLastSaved(new Date());
      toaster.showSuccess('Saved', 'Your image generation data has been saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toaster.showError('Save Failed', 'Could not save your data');
    } finally {
      setIsAutoSaving(false);
    }
  };



  const imageStyles = [
    { label: 'Realistic', value: 'realistic' },
    { label: 'Ghibli Style', value: 'ghibli' },
    { label: 'Cartoon', value: 'cartoon' },
    { label: 'Abstract', value: 'abstract' },
    { label: 'Minimalist', value: 'minimalist' },
    { label: 'Vintage', value: 'vintage' },
    { label: 'Futuristic', value: 'futuristic' },
    { label: 'Watercolor', value: 'watercolor' },
  ];

  const aspectRatios = [
    { label: 'Square', value: 'square', description: '1:1' },
    { label: 'Portrait', value: 'portrait', description: '9:16' },
    { label: 'Landscape', value: 'landscape', description: '16:9' },
  ];

  return (
    <>
      <Toaster toasts={toaster.toasts} onRemove={toaster.removeToast} />
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
      
      {/* Header with Status and Actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 mb-6 rounded-xl">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-600" />
                  AI Image Generator
        </h1>
                
                {/* Plan Status */}
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <div className="flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
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
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-3">
                {isAutoSaving && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Auto-saving...</span>
                    <span className="sm:hidden">Saving...</span>
                  </div>
                )}
                {lastSaved && !isAutoSaving && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                    <span className="sm:hidden">Saved</span>
                  </div>
                )}
                {imageData.lastGenerated && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span className="hidden sm:inline">Last generated: {new Date(imageData.lastGenerated).toLocaleTimeString()}</span>
                    <span className="sm:hidden">Generated</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={forceSave}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </button>
              
              <button
                onClick={clearAllData}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-red-300 text-xs sm:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Clear all data and start fresh"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top usage / upgrade bar */}
      {/* <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
          <div className="text-sm text-gray-700 flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              Plan: {isPremium ? 'Premium' : 'Free'}
            </span>
            {!isPremium && (
              <span className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Free generations left: </span>
                <span className="font-semibold">{freeLeft}</span>
              </span>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Go Premium</span>
              <span className="sm:hidden">Upgrade</span>
            </button>
          )}
        </div>
      </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 max-w-7xl mx-auto">
        {/* Left: Form */}
        <div className="bg-white shadow-lg rounded-xl h-[500px] sm:h-[600px]">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 h-full flex flex-col">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 sm:mb-6">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              <span className="hidden sm:inline">AI Image Generator</span>
              <span className="sm:hidden">Generator</span>
            </h3>

            <div className="space-y-4 sm:space-y-6 flex-1">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe Your Image
                    </label>
                    <textarea
                      id="prompt"
                    rows={4}
                  value={imageData.prompt}
                  onChange={(e) => setImageData(prev => ({ ...prev, prompt: e.target.value }))}
                  className="block w-full rounded-xl border border-gray-200 p-3 bg-gray-50 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-sm placeholder:text-gray-400 transition-colors resize-none"
                  placeholder="Describe what you want to see in the image..."
                    />
                  </div>
            
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">Style</p>
                <div className="flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
                      {imageStyles.map((style) => {
                    const isActive = imageData.selectedStyle === style.value;
                        return (
                          <button
                        key={style.value}
                            type="button"
                        onClick={() => setImageData(prev => ({ ...prev, selectedStyle: style.value }))}
                            className={
                          `px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ` +
                              (isActive
                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-sm bg-white border border-gray-200')
                            }
                            aria-pressed={isActive}
                          >
                        {style.label}
                          </button>
                        );
                      })}
                    </div>
                      </div>
            
                      <div>
                      <p className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</p>
                <div className="grid grid-cols-3 gap-2">
                  {aspectRatios.map((ratio) => {
                    const isActive = imageData.selectedAspectRatio === ratio.value;
                    return (
                      <button
                        key={ratio.value}
                        type="button"
                        onClick={() => setImageData(prev => ({ ...prev, selectedAspectRatio: ratio.value }))}
                        className={
                          `px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ` +
                          (isActive
                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-sm bg-white border border-gray-200')
                        }
                        aria-pressed={isActive}
                      >
                        <div className="font-medium">{ratio.label}</div>
                        <div className="text-xs text-gray-500">{ratio.description}</div>
                      </button>
                    );
                  })}
                      </div>
                    </div>
            
                    <button
                    onClick={handleGenerateImage}
                disabled={!imageData.prompt.trim() || isGenerating || isGeneratingImage}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                {(isGenerating || isGeneratingImage) ? (
                      <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Generating image...</span>
                    <span className="sm:hidden">Generating...</span>
                      </>
                    ) : (
                      <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generate Image</span>
                    <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </button>
                </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white shadow-lg rounded-xl h-[500px] sm:h-[600px]">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                <span className="hidden sm:inline">Generated Image</span>
                <span className="sm:hidden">Image</span>
            </h3>
              {imageData.generatedImages.length > 0 && (
                <div className="text-xs sm:text-sm text-gray-500">
                  {imageData.generatedImages.length} image{imageData.generatedImages.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {imageData.generatedImages.length === 0 && !isGenerating && !isGeneratingImage ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                </div>
                <p className="text-sm px-4">Describe an image and click "Generate Image" to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                {/* Loading skeleton */}
                {(isGenerating || isGeneratingImage) && (
                  <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600 font-medium">Generating your image...</p>
                    </div>
                  </div>
                )}
                
                {/* Generated images */}
                {!isGenerating && !isGeneratingImage && imageData.generatedImages.length > 0 && (
                  <div className="w-full h-full" style={{ minHeight: '400px', backgroundColor: '#f9fafb' }}>
                    {imageData.generatedImages.map((image) => {
                      console.log('Rendering image:', image);
                      console.log('Image URL for display:', image.image_url);
                      return (
                        <div key={image.image_id} className="relative group w-full h-full" style={{ minHeight: '400px' }}>
                          {/* Loading indicator */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl z-10">
                            <div className="text-center">
                              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">Loading image...</p>
                            </div>
                          </div>
                          <img
                            src={image.image_url}
                            alt={`Generated image: ${image.prompt}`}
                            className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm relative z-20"
                            onLoad={(e) => {
                              console.log('Image loaded successfully');
                              console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                              console.log('Image complete:', e.currentTarget.complete);
                              console.log('Image src:', e.currentTarget.src);
                              // Hide loading indicator
                              const loadingIndicator = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                              }
                            }}
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              console.error('Image URL that failed:', image.image_url);
                              // Hide loading indicator and show error state
                              const loadingIndicator = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                              }
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                            style={{ 
                              minHeight: '200px',
                              backgroundColor: '#f3f4f6',
                              display: 'block',
                              position: 'relative',
                              zIndex: 20
                            }}
                          />
                          {/* Error fallback */}
                          <div className="w-full h-full bg-red-100 border-2 border-red-300 rounded-xl flex flex-col items-center justify-center text-red-600 hidden">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <p className="text-sm font-medium">Failed to load image</p>
                            <p className="text-xs text-center px-4 mt-1">URL: {image.image_url}</p>
                          </div>
                        {/* Action buttons - always visible */}
                        <div className="absolute top-2 right-2 flex gap-1 z-20">
                            <button 
                            onClick={() => handlePreviewImage(image.image_url)}
                            className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4 text-gray-700" />
                            </button>
                            <button 
                            onClick={() => handleDownloadImage(image.image_url)}
                            className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all cursor-pointer"
                              title="Download"
                            >
                              <Download className="h-4 w-4 text-gray-700" />
                            </button>
                            <button 
                            onClick={() => {
                              console.log('Like button clicked for image:', image.image_id, image);
                              handleLikeImage(image.image_id);
                            }}
                            className={`p-2 rounded-full shadow-lg transition-all cursor-pointer ${
                              image.is_liked 
                                ? 'bg-red-100 bg-opacity-90 hover:bg-opacity-100' 
                                : 'bg-white bg-opacity-90 hover:bg-red-100'
                            }`}
                            title={image.is_liked ? "Unlike" : "Like"}
                          >
                            <Heart className={`h-4 w-4 ${image.is_liked ? 'text-red-500 fill-red-500' : 'text-red-500'}`} />
                            </button>
                            <button 
                            onClick={() => handlePublicToCommunity(image.image_id)}
                            className={`p-2 rounded-full shadow-lg transition-all cursor-pointer ${
                              image.is_community_published 
                                ? 'bg-green-100 bg-opacity-90 hover:bg-opacity-100' 
                                : 'bg-white bg-opacity-90 hover:bg-opacity-100'
                            }`}
                            title={image.is_community_published ? "Published to Community" : "Publish to Community"}
                          >
                            <Globe className={`h-4 w-4 ${image.is_community_published ? 'text-green-600' : 'text-gray-700'}`} />
                            </button>
                        </div>
                        
                        {/* Delete button - bottom right */}
                        <div className="absolute bottom-2 right-2 z-10">
                            <button 
                            onClick={() => handleDeleteImage(image.image_id)}
                            className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-red-100 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Creations Section */}
      {userCreations?.data?.ai_images && userCreations.data.ai_images.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-purple-600" />
                <span className="hidden sm:inline">Recent AI Images</span>
                <span className="sm:hidden">Recent</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {userCreations.data.ai_images.slice(0, 6).map((image) => (
                  <div key={image.image_id} className="group relative">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button
                          onClick={() => handlePreviewImage(image.image_url)}
                          className="p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          title="Preview"
            >
                          <Eye className="h-3 w-3 text-gray-700" />
            </button>
                        <button
                          onClick={() => handleDownloadImage(image.image_url)}
                          className="p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          title="Download"
                        >
                          <Download className="h-3 w-3 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 truncate">{image.prompt}</div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
                </div>
              )}


      {/* My Liked Images Section */}
      {isLoadingLikedImages ? (
        <div className="mt-6 sm:mt-8">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500 fill-red-500" />
                <span className="hidden sm:inline">My Liked Images</span>
                <span className="sm:hidden">My Liked</span>
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading liked images...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : likedImagesError ? (
        <div className="mt-6 sm:mt-8">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500 fill-red-500" />
                <span className="hidden sm:inline">My Liked Images</span>
                <span className="sm:hidden">My Liked</span>
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-gray-500 mb-4">Failed to load liked images</p>
                  <button
                    onClick={() => refetchLikedImages()}
                    className="inline-flex items-center cursor-pointer px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : myLikedImages.length > 0 ? (
        <div className="mt-6 sm:mt-8">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500 fill-red-500" />
                <span className="hidden sm:inline">My Liked Images</span>
                <span className="sm:hidden">My Liked</span>
                <span className="ml-2 text-sm text-gray-500">({myLikedImages.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6">
                {myLikedImages.map((image) => {
                  console.log('Rendering liked image:', image);
                  console.log('Liked image URL for display:', image.image_url);
                  return (
                    <div key={image.image_id} className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                      {/* Loading indicator */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                        <div className="text-center">
                          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                          <p className="text-xs text-gray-600">Loading...</p>
        </div>
      </div>
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-48 sm:h-56 md:h-48 lg:h-52 xl:h-48 object-cover hover:scale-105 transition-transform duration-300 relative z-20"
                        onLoad={(e) => {
                          console.log('Liked image loaded successfully:', image.image_url);
                          console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                          // Hide loading indicator
                          const loadingIndicator = e.currentTarget.previousElementSibling as HTMLElement;
                          if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                          }
                        }}
                        onError={(e) => {
                          console.error('Liked image failed to load:', image.image_url, e);
                          // Hide loading indicator and show error state
                          const loadingIndicator = e.currentTarget.previousElementSibling as HTMLElement;
                          if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                          }
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                        style={{ 
                          minHeight: '96px',
                          backgroundColor: '#f3f4f6',
                          display: 'block',
                          position: 'relative',
                          zIndex: 20
                        }}
                      />
                      {/* Error fallback */}
                      <div className="w-full h-48 sm:h-56 md:h-48 lg:h-52 xl:h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{ display: 'none' }}>
                        <div className="text-center">
                          <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                          <div>Failed to load</div>
                        </div>
                      </div>
                    {/* Liked indicator */}
                    <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1">
                      <Heart className="h-3 w-3 fill-white" />
                    </div>
                    {/* Action Buttons - Always Visible */}
                    <div className="absolute top-2 right-2 flex gap-1 z-30">
                      <button
                        onClick={() => handlePreviewImage(image.image_url, image.prompt, image)}
                        className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDownloadImage(image.image_url)}
                        className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Like button clicked for image:', image.image_id, image);
                          handleLikeImage(image.image_id);
                        }}
                        className="p-2 bg-red-100 bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                        title="Unlike"
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </button>
                      {/* <button
                        onClick={() => {
                          if (image.image_id) {
                            publishImage({ imageId: image.image_id, isPublished: true });
                          }
                        }}
                        className={`px-3 py-2 rounded-full text-xs font-medium shadow-lg transition-all duration-200 hover:scale-110 ${
                          image.is_community_published 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title={image.is_community_published ? "Published" : "Publish to Community"}
                      >
                        {image.is_community_published ? 'Published' : 'Publish'}
                      </button> */}
                    </div>
                    {/* Image Info */}
                    <div className="p-3 bg-gray-50">
                      <p className="text-sm text-gray-700 mb-2 leading-relaxed overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {image.prompt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">
                            {image.style}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">
                            {image.aspect_ratio}
                          </span>
                        </div>
                        <div className="flex items-center text-red-500">
                          <Heart className="h-3 w-3 mr-1 fill-red-500" />
                          <span className="font-medium">{image.likes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 sm:mt-8">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500 fill-red-500" />
                <span className="hidden sm:inline">My Liked Images</span>
                <span className="sm:hidden">My Liked</span>
                <span className="ml-2 text-sm text-gray-500">(0)</span>
              </h3>
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No liked images yet</p>
                <p className="text-gray-400 text-sm">Like some of your generated images to see them here!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amazing Fullscreen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full max-w-7xl max-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Image Preview</h2>
                  <p className="text-gray-300 text-sm">Generated with AI</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewImage(null);
                  setPreviewPrompt('');
                  setPreviewImageData(null);
                }}
                className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full shadow-lg hover:bg-opacity-30 transition-all duration-200 cursor-pointer group"
              >
                <X className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
              {/* Image Section */}
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 shadow-2xl">
                <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={previewImage}
                    alt={previewPrompt || "AI Generated Image"}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    style={{ maxHeight: '70vh' }}
            />
                  {/* Image Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl pointer-events-none"></div>
          </div>
              </div>

              {/* Details Panel */}
              <div className="w-full lg:w-96 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl overflow-y-auto">
                <div className="space-y-6">
                  {/* Prompt Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm mr-2">PROMPT</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                      {previewPrompt || "No prompt available"}
                    </p>
                  </div>

                  {/* Image Details */}
                  {previewImageData && (
            <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm mr-2">DETAILS</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Style</p>
                          <p className="font-medium text-gray-900 capitalize">{previewImageData.style || 'Unknown'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Model</p>
                          <p className="font-medium text-gray-900 capitalize">{previewImageData.model || 'Clipdrop'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Quality</p>
                          <p className="font-medium text-gray-900 capitalize">{previewImageData.quality || 'Standard'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Aspect Ratio</p>
                          <p className="font-medium text-gray-900">{previewImageData.aspect_ratio || '1:1'}</p>
                        </div>
                      </div>

                      {/* Revised Prompt Section */}
                      {previewImageData.revised_prompt && previewImageData.revised_prompt !== previewPrompt && (
              <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs mr-2">REVISED PROMPT</span>
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                            {previewImageData.revised_prompt}
                          </p>
                        </div>
                      )}

                      {/* Creation Date */}
                      {previewImageData.created_at && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-500 uppercase tracking-wide">Created</p>
                          <p className="font-medium text-blue-700">
                            {new Date(previewImageData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}

                      {/* Publication Status */}
                      <div className={`p-3 rounded-lg border ${previewImageData.is_community_published ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xs uppercase tracking-wide ${previewImageData.is_community_published ? 'text-green-500' : 'text-gray-500'}`}>
                          Community Status
                        </p>
                        <p className={`font-medium flex items-center ${previewImageData.is_community_published ? 'text-green-700' : 'text-gray-700'}`}>
                          {previewImageData.is_community_published ? (
                            <>
                              <Globe className="h-4 w-4 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Private
                            </>
                          )}
                        </p>
                      </div>

                      {previewImageData.likes_count !== undefined && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <p className="text-xs text-red-500 uppercase tracking-wide">Community Likes</p>
                          <p className="font-medium text-red-700 flex items-center">
                            <Heart className="h-4 w-4 mr-1 fill-red-500" />
                            {previewImageData.likes_count}
                          </p>
                        </div>
                      )}
        </div>
      )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm mr-2">ACTIONS</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                  <button
                        onClick={() => handleDownloadImage(previewImage)}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Download</span>
              </button>
                      
                  <button
                        onClick={() => {
                          copyToClipboard(previewImage);
                        }}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="font-medium">Copy Link</span>
                  </button>
          </div>

                    {previewImageData && (
                      <div className="grid grid-cols-2 gap-3">
                <button
                          onClick={() => {
                            if (previewImageData.image_id) {
                              handleLikeImage(previewImageData.image_id);
                            }
                          }}
                          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                            previewImageData.is_liked 
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${previewImageData.is_liked ? 'fill-white' : ''}`} />
                          <span className="font-medium">
                            {previewImageData.is_liked ? 'Liked' : 'Like'}
                          </span>
                </button>
                        
                <button
                          onClick={() => {
                            if (previewImageData.image_id) {
                              publishImage({ imageId: previewImageData.image_id, isPublished: true });
                            }
                          }}
                          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Share className="h-4 w-4" />
                          <span className="font-medium">Publish</span>
                </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal (glassy backdrop) */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md w-full border border-white/40 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Go Premium</h3>
              <button
                onClick={() => setShowUpgrade(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-800 mb-4">You have used all free generations. Upgrade to continue generating unlimited images.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { /* Redirect to billing or toggle for demo */ setShowUpgrade(false); }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer shadow"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
