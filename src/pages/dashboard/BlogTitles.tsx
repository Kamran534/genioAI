import React, { useState, useEffect, useRef } from 'react';
import { Hash, Copy, Loader2, Save, X, Eye, RefreshCw } from 'lucide-react';
import { useGenerateBlogTitlesMutation, useGetUserCreationsQuery } from '../../services/api';
import Toaster, { useToaster } from '../../components/Toaster';

interface BlogTitleData {
  keyword: string;
  category: string;
  generatedTitles: string[];
  lastGenerated: Date | null;
}

// Enhanced localStorage utilities
const STORAGE_KEYS = {
  BLOG_TITLE_DATA: 'genio_blog_title_data',
  LAST_SAVED: 'genio_blog_last_saved',
  AUTO_SAVE_ENABLED: 'genio_blog_auto_save_enabled'
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

export default function BlogTitles() {
  const toaster = useToaster();
  
  const [blogTitleData, setBlogTitleData] = useState<BlogTitleData>(() => 
    loadFromStorage(STORAGE_KEYS.BLOG_TITLE_DATA, {
      keyword: '',
      category: 'General',
      generatedTitles: [],
      lastGenerated: null
    })
  );
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const saved = loadFromStorage(STORAGE_KEYS.LAST_SAVED, null);
    return saved ? new Date(saved) : null;
  });

  // Debounced save function
  const saveTimeoutRef = useRef<number | null>(null);

  const debouncedSave = (data: BlogTitleData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      setIsAutoSaving(true);
      try {
        saveToStorage(STORAGE_KEYS.BLOG_TITLE_DATA, data);
        saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
        setLastSaved(new Date());
        toaster.showInfo('Auto-saved', 'Your blog title data has been saved automatically');
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
    if (blogTitleData.keyword || blogTitleData.generatedTitles.length > 0) {
      debouncedSave(blogTitleData);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blogTitleData]);

  // API integration
  const [generateBlogTitles, { isLoading: isGeneratingTitles, error: generationError }] = useGenerateBlogTitlesMutation();
  const { data: userCreations, refetch: refetchCreations } = useGetUserCreationsQuery();

  const handleGenerateTitles = async () => {
    if (!blogTitleData.keyword.trim()) {
      toaster.showError('Missing Keyword', 'Please enter a keyword to generate titles');
      return;
    }
    
    setIsGenerating(true);
    const loadingToastId = toaster.showLoading('Generating Titles', 'Creating 10 unique blog titles for you...');
    
    try {
      const response = await generateBlogTitles({
        keyword: blogTitleData.keyword.trim(),
        category: blogTitleData.category
      }).unwrap();
      
      if (response.success && response.titles) {
        setBlogTitleData(prev => ({
          ...prev,
          generatedTitles: response.titles,
          lastGenerated: new Date()
        }));
        
        // Auto-refresh user creations
        refetchCreations();
        
        toaster.removeToast(loadingToastId);
        toaster.showSuccess('Titles Generated!', `Successfully created ${response.titles.length} blog titles`);
      } else {
        throw new Error(response.message || 'Failed to generate titles');
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
      if (message.includes('Free usage limit exceeded')) {
        message = 'You have reached your free usage limit. Please upgrade to premium to continue generating blog titles.';
      } else if (message.includes('Unauthorized')) {
        message = 'Please log in again to continue generating blog titles.';
      } else if (message.includes('Failed to generate')) {
        message = 'Unable to generate titles. Please check your internet connection and try again.';
      }
      
      toaster.removeToast(loadingToastId);
      toaster.showError('Generation Failed', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toaster.showSuccess('Copied!', 'Title copied to clipboard');
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
    setBlogTitleData({
      keyword: '',
      category: 'General',
      generatedTitles: [],
      lastGenerated: null
    });
    setLastSaved(null);
    
    toaster.showInfo('Data Cleared', 'All blog title data has been cleared');
  };

  const forceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsAutoSaving(true);
    try {
      saveToStorage(STORAGE_KEYS.BLOG_TITLE_DATA, blogTitleData);
      saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      setLastSaved(new Date());
      toaster.showSuccess('Saved', 'Your blog title data has been saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toaster.showError('Save Failed', 'Could not save your data');
    } finally {
      setIsAutoSaving(false);
    }
  };

  const categories = [
    'General',
    'Technology',
    'Business',
    'Health',
    'Lifestyle',
    'Education',
    'Travel',
    'Food',
    'Marketing',
    'Finance',
    'Sports',
    'Entertainment'
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 mb-6">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <Hash className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-600" />
                Blog Title Generator
              </h1>
              
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
                {blogTitleData.lastGenerated && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span className="hidden sm:inline">Last generated: {new Date(blogTitleData.lastGenerated).toLocaleTimeString()}</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Form */}
        <div className="bg-white shadow-lg rounded-xl h-[400px] sm:h-[500px]">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 h-full flex flex-col">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 sm:mb-6">
              <Hash className="h-5 w-5 mr-2 text-purple-600" />
              <span className="hidden sm:inline">AI Title Generator</span>
              <span className="sm:hidden">Generator</span>
            </h3>

            <div className="space-y-4 sm:space-y-6 flex-1">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="keyword"
                    value={blogTitleData.keyword}
                    onChange={(e) => setBlogTitleData(prev => ({ ...prev, keyword: e.target.value }))}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-10 py-2 sm:py-3 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-sm placeholder:text-gray-400 transition-colors"
                    placeholder="The future of artificial intelligence"
                  />
                  {blogTitleData.keyword && (
                    <button
                      type="button"
                      onClick={() => setBlogTitleData(prev => ({ ...prev, keyword: '' }))}
                      aria-label="Clear keyword"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Category</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 shadow-inner max-h-32 overflow-y-auto scrollbar-hide">
                  {categories.map((cat) => {
                    const isActive = blogTitleData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setBlogTitleData(prev => ({ ...prev, category: cat }))}
                        className={
                          `px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ` +
                          (isActive
                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-sm')
                        }
                        aria-pressed={isActive}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerateTitles}
                disabled={!blogTitleData.keyword.trim() || isGenerating || isGeneratingTitles}
                className="w-full inline-flex items-center justify-center px-4 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {(isGenerating || isGeneratingTitles) ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Generating titles...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generate Titles</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white shadow-lg rounded-xl h-[400px] sm:h-[500px]">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Hash className="h-5 w-5 mr-2 text-purple-600" />
                <span className="hidden sm:inline">Generated Titles</span>
                <span className="sm:hidden">Titles</span>
            </h3>
              {blogTitleData.generatedTitles.length > 0 && (
                <div className="text-xs sm:text-sm text-gray-500">
                  {blogTitleData.generatedTitles.length} titles
                </div>
              )}
            </div>

            {blogTitleData.generatedTitles.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 flex-1">
                <Hash className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3" />
                <p className="text-sm px-4">Enter keywords and click "Generate Titles" to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="space-y-2 sm:space-y-3">
                  {blogTitleData.generatedTitles.map((title, index) => (
                    <div key={index} className="group flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
                      <span className="text-sm sm:text-base text-gray-900 flex-1 pr-2 sm:pr-3 leading-relaxed">{title}</span>
                      <button
                        onClick={() => copyToClipboard(title)}
                        className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Creations Section */}
      {userCreations?.data?.blog_titles && userCreations.data.blog_titles.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-purple-600" />
                <span className="hidden sm:inline">Recent Blog Titles</span>
                <span className="sm:hidden">Recent</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {userCreations.data.blog_titles.slice(0, 6).map((title) => (
                  <div key={title.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{title.title}</div>
                    <div className="text-xs text-gray-500">
                      {title.keyword} • {title.category} • {new Date(title.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
