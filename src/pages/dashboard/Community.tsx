import { useState, useEffect } from 'react';
import {
  Heart,
  Download,
  Filter,
  Search,
  ChevronDown,
  FlipHorizontal2,
  Copy,
  Check,
  Loader2,
  X,
  Maximize2,
  Share2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { useGetCommunityImagesQuery, useLikeImageMutation } from '../../services/api';

// API response interface matching the backend structure
interface CommunityImage {
  image_id: string;
  user_id: string;
  prompt: string;
  revised_prompt: string;
  style: string;
  model: string;
  aspect_ratio: string;
  quality: string;
  image_url: string;
  cloudinary_public_id: string;
  is_community_published: boolean;
  is_liked: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Additional UI fields
  author?: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  downloads?: number;
  views?: number;
  tags?: string[];
  category?: string;
}

// Upload interface removed with share feature

// Categories and sort options
const categories = ['All', 'Art', 'Photography', 'Design', 'Illustration', '3D', 'Portrait', 'Landscape', 'Abstract'];
const sortOptions = ['Latest', 'Popular', 'Most Liked'];

// Map API styles to display categories
const mapStyleToCategory = (style: string) => {
  const styleMap: Record<string, string> = {
    'realistic': 'Photography',
    'artistic': 'Art',
    'cartoon': 'Illustration',
    'anime': 'Illustration',
    'oil_painting': 'Art',
    'watercolor': 'Art',
    'sketch': 'Design',
    'digital_art': 'Design',
    '3d_render': '3D',
    'portrait': 'Portrait',
    'landscape': 'Landscape',
    'abstract': 'Abstract'
  };
  return styleMap[style?.toLowerCase()] || 'Art';
};

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  
  // Preview modal state
  const [previewImage, setPreviewImage] = useState<CommunityImage | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // API calls
  const { 
    data: communityData, 
    isLoading, 
    error, 
    refetch 
  } = useGetCommunityImagesQuery({
    page: currentPage,
    limit,
    style: selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase(),
    sortBy: sortBy === 'Latest' ? 'created_at' : sortBy === 'Popular' ? 'likes_count' : sortBy === 'Most Liked' ? 'likes_count' : 'created_at',
    sortOrder: 'desc'
  });

  const [likeImage] = useLikeImageMutation();

  // Transform API data to match UI expectations
  const images: CommunityImage[] = communityData?.data?.images?.map(img => ({
    ...img, 
    category: mapStyleToCategory(img.style || 'artistic')
  })) || [];


  const handleLike = async (imageId: string) => {
    try {
      await likeImage({ imageId }).unwrap();
      refetch(); // Refresh the data to get updated like status
    } catch (error) {
      console.error('Failed to like image:', error);
    }
  };

  const handleDownload = async (imageId: string) => {
    const image = images.find(img => img.image_id === imageId);
    if (!image) return;

    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = image.prompt.slice(0, 30).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      link.download = `${safeName || 'community-image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  const handleFlip = (imageId: string) => {
    setFlipped(prev => ({ ...prev, [imageId]: !prev[imageId] }));
  };

  const handleCopyPrompt = async (imageId: string) => {
    const image = images.find(img => img.image_id === imageId);
    if (!image) return;
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(prev => ({ ...prev, [imageId]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [imageId]: false }));
      }, 1500);
    } catch (err) {
      console.error('Failed to copy prompt', err);
    }
  };

  // Preview functions
  const openPreview = (image: CommunityImage, index: number) => {
    setPreviewImage(image);
    setPreviewIndex(index);
    setZoomLevel(1);
    setRotation(0);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setZoomLevel(1);
    setRotation(0);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    const currentIndex = previewIndex;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : sortedImages.length - 1;
    } else {
      newIndex = currentIndex < sortedImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setPreviewIndex(newIndex);
    setPreviewImage(sortedImages[newIndex]);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleZoom = (action: 'in' | 'out' | 'reset') => {
    if (action === 'in') {
      setZoomLevel(prev => Math.min(prev + 0.5, 3));
    } else if (action === 'out') {
      setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    } else {
      setZoomLevel(1);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleShare = async () => {
    if (!previewImage) return;
    
    const shareData = {
      title: 'AI Generated Image',
      text: `Check out this amazing AI-generated image: ${previewImage.prompt.slice(0, 100)}...`,
      url: previewImage.image_url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(previewImage.image_url);
        alert('Image URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to share image', err);
    }
  };

  // Apply search filter on frontend since API doesn't support search yet
  const filteredImages = images.filter(img => {
    if (searchQuery === '') return true;
    return img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
           img.revised_prompt?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Images are already sorted and filtered by the API
  const sortedImages = filteredImages;

  // Keyboard navigation for preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewImage) return;
      
      switch (e.key) {
        case 'Escape':
          closePreview();
          break;
        case 'ArrowLeft':
          navigatePreview('prev');
          break;
        case 'ArrowRight':
          navigatePreview('next');
          break;
        case '+':
        case '=':
          handleZoom('in');
          break;
        case '-':
          handleZoom('out');
          break;
        case '0':
          handleZoom('reset');
          break;
        case 'r':
          handleRotate();
          break;
      }
    };

    if (previewImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewImage, previewIndex, sortedImages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setShowCategoryDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Search is handled by frontend filtering, no API call needed
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500 mb-4" />
          <p className="text-gray-600">Loading community images...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Failed to load community images</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Filters and Controls */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts, tags, or creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Clear Filters Button */}
              {(selectedCategory !== 'All' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}

              {/* Category Filter */}
              <div className="relative" data-dropdown>
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer min-w-[140px]"
                >
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{selectedCategory}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedCategory === category 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Filter */}
              <div className="relative" data-dropdown>
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowCategoryDropdown(false);
                  }}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer min-w-[120px]"
                >
                  <span className="text-sm font-medium text-gray-700">{sortBy}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          sortBy === option 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <span>Loading images...</span>
            ) : (
              <span>
                {/* Showing {sortedImages.length} of {communityData?.data?.pagination?.total || 0} images
                {(selectedCategory !== 'All' || searchQuery !== '') && (
                  <span className="ml-2 text-blue-600">
                    (filtered)
                  </span>
                )} */}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedImages.map((image) => (
            <div key={image.image_id} className="group rounded-xl bg-white shadow hover:shadow-lg transition-shadow">
              <div className="relative [perspective:1000px]">
                <div className={`relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped[image.image_id] ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden] rounded-xl">
                    <img 
                      src={image.image_url} 
                      alt={image.prompt.slice(0, 50)} 
                      className="w-full h-64 object-cover cursor-pointer hover:scale-105 transition-transform duration-300" 
                      onClick={() => openPreview(image, sortedImages.findIndex(img => img.image_id === image.image_id))}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white/90">
                      <button onClick={() => handleLike(image.image_id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/50 cursor-pointer">
                        <Heart className={`h-4 w-4 ${image.is_liked ? 'fill-white text-white' : ''}`} />
                        <span className="text-xs">{image.likes_count}</span>
                      </button>
                      <button onClick={() => handleDownload(image.image_id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/50 cursor-pointer">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <button onClick={() => handleFlip(image.image_id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/50 text-white/90 cursor-pointer">
                        <FlipHorizontal2 className="h-4 w-4" />
                        <span className="text-xs">Prompt</span>
                      </button>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 rotate-y-180 [backface-visibility:hidden] rounded-xl bg-gradient-to-br from-white to-gray-100 text-gray-900">
                    <div className="absolute top-3 right-3">
                      <button onClick={() => handleFlip(image.image_id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-900 border border-gray-300 cursor-pointer">
                        <FlipHorizontal2 className="h-4 w-4" />
                        <span className="text-xs">Back</span>
                      </button>
                    </div>
                    <div className="h-full w-full p-4 flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Prompt</h3>
                      </div>
                      <div className="relative flex-1 overflow-auto rounded-lg bg-white border border-gray-200 p-3 shadow-sm">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                          {image.prompt}
                        </p>
                        <div className="s bottom-2 right-2">
                          <button onClick={() => handleCopyPrompt(image.image_id)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-900 hover:bg-gray-800 text-white cursor-pointer">
                            {copied[image.image_id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="text-xs">{copied[image.image_id] ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>

        {sortedImages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {communityData?.data?.pagination && communityData.data.pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!communityData.data.pagination.has_prev_page}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, communityData.data.pagination.total_pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(communityData.data.pagination.total_pages, prev + 1))}
              disabled={!communityData.data.pagination.has_next_page}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Amazing Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={closePreview}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                  <div className="text-white">
                    <h3 className="text-lg font-semibold">AI Generated Image</h3>
                    <p className="text-sm text-white/80">
                      {previewIndex + 1} of {sortedImages.length}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(previewImage.image_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                  >
                    <Heart className={`h-4 w-4 ${previewImage.is_liked ? 'fill-white text-white' : ''}`} />
                    <span className="text-sm">{previewImage.likes_count}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownload(previewImage.image_id)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Share2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 flex items-center justify-center bg-gray-100 overflow-hidden p-4">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={previewImage.image_url}
                  alt={previewImage.prompt}
                  className="max-w-full max-h-full object-contain transition-all duration-300"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
                  }}
                  onMouseDown={(e) => {
                    if (zoomLevel > 1) {
                      e.preventDefault();
                      // Add drag functionality here if needed
                    }
                  }}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={() => navigatePreview('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigatePreview('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleZoom('out')}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-white text-sm px-2">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom('in')}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleZoom('reset')}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-white/80 text-sm">
                  {/* <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>{previewImage.model}</span>
                  </div> */}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(previewImage.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Section */}
            {/* <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 max-h-32 overflow-y-auto shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Prompt</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {previewImage.prompt}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyPrompt(previewImage.image_id)}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                >
                  {copied[previewImage.image_id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied[previewImage.image_id] ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}