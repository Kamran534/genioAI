import { useState, useEffect } from 'react';
import { Scissors, Download, RotateCcw, Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export default function RemoveObject() {
  const { user, isLoaded } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
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
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be the processed image from the API
      setProcessedImage(uploadedImage); // For demo purposes
      setIsProcessing(false);
    }, 3000);
  };

  

  return (
    <>
      {/* Top usage / upgrade bar */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <div className="text-sm text-gray-700 flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              Plan: {isPremium ? 'Premium' : 'Free'}
            </span>
            {!isPremium && (
              <span>
                Free removals left: <span className="font-semibold">{freeLeft}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Object Removal form */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="pt-8 pl-5 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900">Object Removal</h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Upload */}
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload image</label>
              <div className="flex items-center">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer border border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Describe object to remove</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., car in background, tree from the image"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">Be specific about what you want to remove</p>
            </div>

            {/* Primary action */}
            <button
              onClick={handleRemoveObject}
              disabled={!uploadedImage || isProcessing}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Removing object...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Remove object
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Processed Image */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="pt-8 pl-5 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900">Processed Image</h3>
          </div>
          <div className="p-5">
            {!processedImage ? (
              <div className="h-72 flex flex-col items-center justify-center  rounded-lg text-center text-sm text-gray-500">
                {isProcessing ? (
                  <>
                    <div className="animate-spin mb-3 h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    Processing image...
                  </>
                ) : (
                  <>
                    <Scissors className="h-8 w-8 text-gray-400 mb-3" />
                    Upload an image and describe what to remove
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <img src={processedImage} alt="Processed" className="w-full max-h-[420px] object-contain rounded-lg bg-gray-50 " />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50" title="Download">
                    <Download className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50" title="Reset" onClick={() => setProcessedImage(null)}>
                    <RotateCcw className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Helpful tips below cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-sm text-gray-700">Select objects with clear boundaries for best results.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-sm text-gray-700">Avoid objects touching the image edges when possible.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-sm text-gray-700">Describe what to remove to guide the AI.</p>
        </div>
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md w-full border border-white/40 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Go Premium</h3>
            <p className="text-sm text-gray-800 mb-5">Object removal is a Premium feature. Upgrade to continue.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => (window.location.href = '/billing')}
                className="px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow cursor-pointer"
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
