import { useEffect, useState } from 'react';
import { useUser, Protect } from '@clerk/clerk-react';
import { Image as ImageIcon, Download, Trash2, Eye, Sparkles, Share2, Globe, X } from 'lucide-react';

export default function GenerateImages() {
  const { user, isLoaded } = useUser();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [selectedModel, setSelectedModel] = useState('DALL-E 3');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);
  const [showUpgrade, setShowUpgrade] = useState(false);

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

    // Debug Clerk plan values in console
    console.log('[GenerateImages] Plan check', {
      userId: user?.id,
      planRaw: publicMeta?.plan ?? unsafeMeta?.plan ?? publicMeta?.tier ?? unsafeMeta?.tier ?? publicMeta?.currentPlan ?? unsafeMeta?.currentPlan,
      planNormalized: plan,
      isPremiumFlagRaw: publicMeta?.isPremium ?? unsafeMeta?.isPremium,
      isPremiumFlagNormalized: flag,
      premiumEvaluated: premium,
      publicMetadata: user?.publicMetadata,
      unsafeMetadata: user?.unsafeMetadata,
    });

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
    if (!prompt.trim()) return;
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
    // Clear previous images for new generation
    setGeneratedImages([]);
    
    // Simulate API call
    setTimeout(() => {
      const newImage = `https://picsum.photos/512/512?random=${Date.now()}`;
      setGeneratedImages([newImage]);
      setIsGenerating(false);
    }, 3000);
  };

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const handleDownloadImage = async (imageUrl: string) => {
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
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    setGeneratedImages(prev => prev.filter(img => img !== imageUrl));
    if (previewImage === imageUrl) {
      setPreviewImage(null);
    }
  };

  const handleShareImage = (imageUrl: string) => {
    setShareImageUrl(imageUrl);
    setShowShareModal(true);
  };

  const handlePublicToCommunity = async (imageUrl: string) => {
    try {
      // Simulate API call to make image public
      console.log('Making image public to community:', imageUrl);
      // You would implement the actual API call here
      alert('Image has been shared to the community!');
    } catch (error) {
      console.error('Failed to share to community:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };



  const imageStyles = [
    'Realistic',
    'Ghibli Style',
    'Cartoon',
    'Abstract',
    'Minimalist',
    'Vintage',
    'Futuristic',
    'Watercolor',
    'Oil Painting',
    'Sketch',
    'Line Art',
    'Pixel Art',
    'Isometric',
    'Low Poly',
    'Cyberpunk',
  ];

  const models = [
    { name: 'DALL-E 3', color: 'from-green-500 to-green-700', icon: '🎨' },
    { name: 'DALL-E 2', color: 'from-purple-500 to-purple-700', icon: '🖼️' },
    { name: 'Midjourney', color: 'from-green-500 to-green-700', icon: '✨' },
    { name: 'Stable Diffusion', color: 'from-orange-500 to-orange-700', icon: '⚡' },
    { name: 'Imagen', color: 'from-pink-500 to-pink-700', icon: '🌟' },
  ];

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1', description: '1024x1024' },
    { label: 'Landscape (16:9)', value: '16:9', description: '1920x1080' },
    { label: 'Portrait (9:16)', value: '9:16', description: '1080x1920' },
    { label: 'Wide (3:2)', value: '3:2', description: '1536x1024' },
    { label: 'Tall (2:3)', value: '2:3', description: '1024x1536' },
    { label: 'Ultra Wide (21:9)', value: '21:9', description: '2560x1080' },
  ];

  const selectedModelMeta = models.find(m => m.name === selectedModel);
  const selectedModelColor = selectedModelMeta?.color ?? 'from-green-500 to-green-700';
  const selectedModelIcon = selectedModelMeta?.icon ?? '🎨';
  const selectedModelTextColor = (
    {
      'DALL-E 3': 'text-green-600',
      'DALL-E 2': 'text-purple-600',
      'Midjourney': 'text-green-600',
      'Stable Diffusion': 'text-orange-600',
      'Imagen': 'text-pink-600',
    } as Record<string, string>
  )[selectedModel] ?? 'text-green-600';

  return (
    <>
      {/* Page header */}
      {/* <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <ImageIcon className="h-6 w-6 mr-3 text-purple-600" />
          Generate Images
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Create stunning images with AI-powered generation from text prompts.
        </p>
      </div> */}

      {/* Top usage / upgrade bar */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <div className="text-sm text-gray-700 flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              Plan: {isPremium ? 'Premium' : 'Free'}
            </span>
            {!isPremium && (
              <span>
                Free generations left: <span className="font-semibold">{freeLeft}</span>
              </span>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
            >
              Go Premium
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Left: Form */}
        <div className="bg-white shadow rounded-lg min-h-[530px] xl:h-[530px]">
          <div className="px-4 py-5 sm:p-6 h-full flex flex-col">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center mb-6">
              <Sparkles className={`h-5 w-5 mr-2 ${selectedModelTextColor}`} />
              AI Image Generator
            </h3>

            <Protect
              plan="premium"
              fallback={
                <div className="space-y-6 flex-1">
                  {/* Free users: UI remains the same; free limit enforced below via handleGenerateImage */}
            
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe Your Image
                    </label>
                    <textarea
                      id="prompt"
                    rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 p-2 bg-gray-50 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 sm:text-sm placeholder:text-gray-400 transition-colors resize-none"
                    placeholder="Describe what you want to see in the image.."
                    />
                  </div>
            
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">Style</p>
                    <div className="flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto pr-1">
                      {imageStyles.map((style) => {
                        const isActive = selectedStyle === style;
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setSelectedStyle(style)}
                            className={
                              `px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ` +
                              (isActive
                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-sm bg-white border border-gray-200')
                            }
                            aria-pressed={isActive}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>
            
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                      <p className="block text-sm font-medium text-gray-700 mb-2">Model</p>
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 p-2 bg-gray-50 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 sm:text-sm transition-colors cursor-pointer"
                      >
                        {models.map((model) => (
                          <option key={model.name} value={model.name}>{model.name}</option>
                        ))}
                        </select>
                      </div>
            
                      <div>
                      <p className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</p>
                      <select 
                        value={selectedAspectRatio}
                        onChange={(e) => setSelectedAspectRatio(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 p-2 bg-gray-50 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 sm:text-sm transition-colors cursor-pointer"
                      >
                        {aspectRatios.map((ratio) => (
                          <option key={ratio.value} value={ratio.value}>
                            {ratio.label} - {ratio.description}
                          </option>
                        ))}
                        </select>
                      </div>
                    </div>
            
                    <button
                    onClick={handleGenerateImage}
                    disabled={!prompt.trim() || isGenerating}
                    className={`w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r ${selectedModelColor} hover:shadow-lg cursor-pointer`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Generating image...
                      </>
                    ) : (
                      <>
                        <span className="mr-2 text-base">{selectedModelIcon}</span>
                        Generate image
                      </>
                    )}
                  </button>
                </div>
              }
            />
            
            
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white shadow rounded-lg min-h-[530px] xl:h-[530px]">
          <div className="px-4 py-5 sm:p-6 h-full flex flex-col">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-6 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-green-600" />
              Generated image
            </h3>

            {generatedImages.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm">Describe an image and click "Generate Image" to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                {/* Loading skeleton */}
                {isGenerating && (
                  <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600 font-medium">Generating your image...</p>
                    </div>
                  </div>
                )}
                
                {/* Generated images */}
                {!isGenerating && generatedImages.length > 0 && (
                  <div className="w-full h-full">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="relative group w-full h-full">
                        <img
                          src={image}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex flex-wrap gap-2 justify-center">
                            <button 
                              onClick={() => handlePreviewImage(image)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4 text-gray-700" />
                            </button>
                            <button 
                              onClick={() => handleDownloadImage(image)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Download"
                            >
                              <Download className="h-4 w-4 text-gray-700" />
                            </button>
                            <button 
                              onClick={() => handleShareImage(image)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Share"
                            >
                              <Share2 className="h-4 w-4 text-gray-700" />
                            </button>
                            <button 
                              onClick={() => handlePublicToCommunity(image)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Share to Community"
                            >
                              <Globe className="h-4 w-4 text-gray-700" />
                            </button>
                            <button 
                              onClick={() => handleDeleteImage(image)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Image</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareImageUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareImageUrl)}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                  >
                    Copy
                  </button>
            </div>
          </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handlePublicToCommunity(shareImageUrl)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Share to Community
                </button>
                <button
                  onClick={() => handleDownloadImage(shareImageUrl)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
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
