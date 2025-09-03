import { useState } from 'react';
import { Scissors, Upload, Download, RotateCcw, Check, X, MousePointer } from 'lucide-react';

export default function RemoveObject() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{x: number, y: number, width: number, height: number} | null>(null);

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

  const handleRemoveObject = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be the processed image from the API
      setProcessedImage(uploadedImage); // For demo purposes
      setIsProcessing(false);
    }, 3000);
  };

  const recentProcessed = [
    { id: 1, name: 'beach-photo.jpg', date: '1 hour ago', size: '3.2 MB' },
    { id: 2, name: 'street-scene.png', date: '4 hours ago', size: '2.8 MB' },
    { id: 3, name: 'portrait.jpg', date: '1 day ago', size: '1.5 MB' },
  ];

  return (
    <>
      {/* Page header */}
      {/* <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Scissors className="h-6 w-6 mr-3 text-purple-600" />
          Remove Object
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Remove unwanted objects from your images with AI-powered precision.
        </p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Processing */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Process Image</h3>
              
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload an Image</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload an image and select the object you want to remove
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Original Image */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Original Image</h4>
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Original"
                        className="w-full h-64 object-contain border rounded-lg bg-gray-50"
                      />
                      {selectedArea && (
                        <div
                          className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                          style={{
                            left: selectedArea.x,
                            top: selectedArea.y,
                            width: selectedArea.width,
                            height: selectedArea.height,
                          }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Click and drag to select the object you want to remove
                    </p>
                  </div>

                  {/* Selection Tools */}
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <MousePointer className="h-4 w-4 mr-2" />
                      Select Object
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Scissors className="h-4 w-4 mr-2" />
                      Auto Detect
                    </button>
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={handleRemoveObject}
                    disabled={isProcessing}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scissors className="h-4 w-4 mr-2" />
                        Remove Object
                      </>
                    )}
                  </button>

                  {/* Processed Image */}
                  {processedImage && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Processed Image</h4>
                      <div className="relative">
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="w-full h-64 object-contain border rounded-lg bg-gray-50"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                            <Download className="h-4 w-4 text-gray-700" />
                          </button>
                          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                            <RotateCcw className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setProcessedImage(null);
                        setSelectedArea(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Upload New Image
                    </button>
                    
                    {processedImage && (
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <Download className="h-4 w-4 mr-2" />
                        Download Result
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Processing Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">How it Works</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Upload Image</p>
                    <p className="text-xs text-gray-600">Choose any image with unwanted objects</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Select Object</p>
                    <p className="text-xs text-gray-600">Click and drag to select the object to remove</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">3</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">AI Processing</p>
                    <p className="text-xs text-gray-600">Our AI removes the object and fills the area</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Processed */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Files</h3>
              <div className="space-y-3">
                {recentProcessed.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.date} • {file.size}</p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tips for Best Results</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Select objects with clear boundaries</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Avoid selecting objects that touch image edges</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Use auto-detect for simple objects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
