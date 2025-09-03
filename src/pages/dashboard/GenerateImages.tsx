import { useState } from 'react';
import { Image as ImageIcon, Upload, Download, Trash2, Eye, Palette } from 'lucide-react';

export default function GenerateImages() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const newImage = `https://picsum.photos/512/512?random=${Date.now()}`;
      setGeneratedImages(prev => [newImage, ...prev]);
      setIsGenerating(false);
    }, 3000);
  };

  const samplePrompts = [
    "A futuristic cityscape at sunset",
    "Cute robot playing with a cat",
    "Abstract art with vibrant colors",
    "Minimalist logo design",
    "Fantasy landscape with mountains",
    "Modern office workspace",
    "Vintage car in a garage",
    "Space exploration scene"
  ];

  const imageStyles = [
    { name: 'Realistic', description: 'Photorealistic images' },
    { name: 'Cartoon', description: 'Animated style' },
    { name: 'Abstract', description: 'Artistic and abstract' },
    { name: 'Minimalist', description: 'Clean and simple' },
    { name: 'Vintage', description: 'Retro and nostalgic' },
    { name: 'Futuristic', description: 'Sci-fi and modern' },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Generator */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Image</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the image you want to create
                  </label>
                  <textarea
                    id="prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="e.g., A beautiful sunset over mountains with a lake in the foreground..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm">
                      <option>Realistic</option>
                      <option>Cartoon</option>
                      <option>Abstract</option>
                      <option>Minimalist</option>
                      <option>Vintage</option>
                      <option>Futuristic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm">
                      <option>512x512</option>
                      <option>1024x1024</option>
                      <option>1024x768</option>
                      <option>768x1024</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </button>
              </div>

              {/* Generated Images */}
              {generatedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Generated Images</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                              <Eye className="h-4 w-4 text-gray-700" />
                            </button>
                            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                              <Download className="h-4 w-4 text-gray-700" />
                            </button>
                            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                              <Trash2 className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sample Prompts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sample Prompts</h3>
              <div className="space-y-2">
                {samplePrompts.map((samplePrompt, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(samplePrompt)}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {samplePrompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Styles */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-500" />
                Image Styles
              </h3>
              <div className="space-y-3">
                {imageStyles.map((style, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:border-purple-300 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">{style.name}</p>
                    <p className="text-xs text-gray-600">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Image */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upload Image</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
