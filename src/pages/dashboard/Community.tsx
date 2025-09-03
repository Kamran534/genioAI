import { useState, useRef } from 'react';
import { 
  Heart, 
  Share2, 
  Download, 
  Filter, 
  Grid, 
  List, 
  Upload,
  Search,
  Eye,
  Calendar,
  Tag,
  MoreVertical,
  X
} from 'lucide-react';

// Temporary fix for export issue
interface CommunityImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  likes: number;
  downloads: number;
  views: number;
  tags: string[];
  createdAt: string;
  isLiked: boolean;
  category: string;
}

interface UploadImageData {
  title: string;
  description: string;
  tags: string[];
  category: string;
  file: File | null;
}

// Mock data for community images
const mockImages: CommunityImage[] = [
  {
    id: '1',
    title: 'Abstract Digital Art',
    description: 'A beautiful abstract digital artwork created with AI',
    imageUrl: '/api/placeholder/400/300',
    author: {
      name: 'Alex Chen',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    likes: 1247,
    downloads: 89,
    views: 3456,
    tags: ['abstract', 'digital', 'art', 'ai-generated'],
    createdAt: '2024-01-15',
    isLiked: false,
    category: 'Art'
  },
  {
    id: '2',
    title: 'Nature Landscape',
    description: 'Stunning mountain landscape with perfect lighting',
    imageUrl: '/api/placeholder/400/300',
    author: {
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    likes: 892,
    downloads: 156,
    views: 2134,
    tags: ['nature', 'landscape', 'mountains', 'photography'],
    createdAt: '2024-01-14',
    isLiked: true,
    category: 'Photography'
  },
  {
    id: '3',
    title: 'Modern UI Design',
    description: 'Clean and modern user interface design mockup',
    imageUrl: '/api/placeholder/400/300',
    author: {
      name: 'Mike Rodriguez',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    likes: 567,
    downloads: 234,
    views: 1890,
    tags: ['ui', 'design', 'modern', 'interface'],
    createdAt: '2024-01-13',
    isLiked: false,
    category: 'Design'
  },
  {
    id: '4',
    title: 'Space Exploration',
    description: 'Futuristic space scene with planets and stars',
    imageUrl: '/api/placeholder/400/300',
    author: {
      name: 'Emma Wilson',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    likes: 1456,
    downloads: 78,
    views: 4567,
    tags: ['space', 'sci-fi', 'planets', 'stars'],
    createdAt: '2024-01-12',
    isLiked: true,
    category: 'Art'
  },
  {
    id: '5',
    title: 'Minimalist Logo',
    description: 'Simple and elegant logo design concept',
    imageUrl: '/api/placeholder/400/300',
    author: {
      name: 'David Kim',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    likes: 789,
    downloads: 345,
    views: 2345,
    tags: ['logo', 'minimalist', 'branding', 'design'],
    createdAt: '2024-01-11',
    isLiked: false,
    category: 'Design'
  },
  {
    id: '6',
    title: 'Urban Architecture',
    description: 'Modern cityscape with impressive architectural details',
    imageUrl: '/api/placeholder/400/300',
    author: {
      name: 'Lisa Park',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    likes: 634,
    downloads: 123,
    views: 1789,
    tags: ['architecture', 'urban', 'city', 'modern'],
    createdAt: '2024-01-10',
    isLiked: false,
    category: 'Photography'
  }
];

const categories = ['All', 'Art', 'Photography', 'Design', 'Illustration', '3D'];
const sortOptions = ['Latest', 'Popular', 'Most Downloaded', 'Most Liked'];

export default function Community() {
  const [images, setImages] = useState<CommunityImage[]>(mockImages);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState<UploadImageData>({
    title: '',
    description: '',
    tags: [],
    category: 'Art',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLike = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { 
            ...img, 
            isLiked: !img.isLiked, 
            likes: img.isLiked ? img.likes - 1 : img.likes + 1 
          }
        : img
    ));
  };

  const handleDownload = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, downloads: img.downloads + 1 }
        : img
    ));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setUploadData(prev => ({ ...prev, tags }));
  };

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.description || !uploadData.file) {
      alert('Please fill in all required fields and select an image');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newImage: CommunityImage = {
        id: Date.now().toString(),
        title: uploadData.title,
        description: uploadData.description,
        imageUrl: URL.createObjectURL(uploadData.file!),
        author: {
          name: 'You',
          avatar: '/api/placeholder/40/40',
          verified: true
        },
        likes: 0,
        downloads: 0,
        views: 0,
        tags: uploadData.tags,
        createdAt: new Date().toISOString().split('T')[0],
        isLiked: false,
        category: uploadData.category
      };

      setImages(prev => [newImage, ...prev]);
      setUploadData({
        title: '',
        description: '',
        tags: [],
        category: 'Art',
        file: null
      });
      setShowUploadModal(false);
      setIsUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      tags: [],
      category: 'Art',
      file: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (sortBy) {
      case 'Popular':
        return b.likes - a.likes;
      case 'Most Downloaded':
        return b.downloads - a.downloads;
      case 'Most Liked':
        return b.likes - a.likes;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community</h1>
              {/* <p className="mt-2 text-gray-600">
                Discover and share amazing AI-generated images with the community
              </p> */}
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Share Image
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images, tags, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid/List */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {sortedImages.map((image) => (
              <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={() => handleLike(image.id)}
                        className={`p-2 rounded-full ${
                          image.isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                        } hover:scale-110 transition-transform duration-200`}
                      >
                        <Heart className={`h-4 w-4 ${image.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 rounded-full bg-white text-gray-700 hover:scale-110 transition-transform duration-200">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(image.id)}
                        className="p-2 rounded-full bg-white text-gray-700 hover:scale-110 transition-transform duration-200"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{image.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                  
                  {/* Author */}
                  <div className="flex items-center mb-3">
                    <img
                      src={image.author.avatar}
                      alt={image.author.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      {image.author.name}
                      {image.author.verified && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {image.likes}
                      </span>
                      <span className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {image.downloads}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {image.views}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {image.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{image.tags.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedImages.map((image) => (
              <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="h-32 w-48 object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{image.description}</p>
                        
                        {/* Author */}
                        <div className="flex items-center mb-3">
                          <img
                            src={image.author.avatar}
                            alt={image.author.name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          <span className="text-sm text-gray-700 flex items-center">
                            {image.author.name}
                            {image.author.verified && (
                              <span className="ml-1 text-blue-500">✓</span>
                            )}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {image.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(image.id)}
                            className={`p-2 rounded-full ${
                              image.isLiked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                            } hover:scale-110 transition-transform duration-200`}
                          >
                            <Heart className={`h-4 w-4 ${image.isLiked ? 'fill-current' : ''}`} />
                          </button>
                          <button className="p-2 rounded-full bg-gray-100 text-gray-700 hover:scale-110 transition-transform duration-200">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(image.id)}
                            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:scale-110 transition-transform duration-200"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-full bg-gray-100 text-gray-700 hover:scale-110 transition-transform duration-200">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {image.likes}
                          </span>
                          <span className="flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {image.downloads}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {image.views}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(image.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedImages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Share Your Image</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image *
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadData.file ? (
                      <div>
                        <img 
                          src={URL.createObjectURL(uploadData.file)} 
                          alt="Preview" 
                          className="h-20 w-20 object-cover rounded mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-600">{uploadData.file.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter image title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe your image"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={uploadData.tags.join(', ')}
                    onChange={(e) => handleTagInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter tags separated by commas"
                  />
                  {uploadData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {uploadData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select 
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading || !uploadData.title || !uploadData.description || !uploadData.file}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Share Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}