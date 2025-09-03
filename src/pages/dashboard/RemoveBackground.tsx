import React, { useState } from 'react';
import { Layers, Download, RotateCcw, Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export default function RemoveBackground() {
  const { user, isLoaded } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be the processed image from the API
      setProcessedImage(uploadedImage); // For demo purposes
      setIsProcessing(false);
    }, 3000);
  };

  // (Reserved) Recent processed list can be shown in a future enhancement

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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
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
                disabled={!uploadedImage || isProcessing}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Remove background...
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

            {processedImage ? (
              <div className="relative">
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-80 object-contain  rounded-lg bg-gray-50"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
                    <Download className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors" onClick={() => setProcessedImage(null)}>
                    <RotateCcw className="h-4 w-4 text-gray-700" />
                  </button>
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
