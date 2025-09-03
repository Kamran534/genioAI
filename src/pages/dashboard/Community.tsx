import { useState } from 'react';
import {
  Heart,
  Download,
  Filter,
  Search,
  ChevronDown,
  FlipHorizontal2,
  Copy,
  Check
} from 'lucide-react';
import client01 from '../../assets/client 01.png';
import client02 from '../../assets/client 02.png';
import client03 from '../../assets/client 03.png';

// Temporary fix for export issue
interface CommunityImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
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

// Upload interface removed with share feature

// Mock data for community images
const mockImages: CommunityImage[] = [
  {
    id: '1',
    title: 'Abstract Digital Art',
    description: 'A beautiful abstract digital artwork created with AI',
    imageUrl: client01,
    prompt: 'Create a vibrant abstract digital artwork with fluid shapes, glowing gradients, and high-contrast lighting, 4k, ultra-detailed, cinematic lighting',
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
    imageUrl: client02,
    prompt: 'Photorealistic sunrise over snow-capped mountains, golden hour, dramatic clouds, crisp air, detailed textures, 50mm lens, high dynamic range',
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
    imageUrl: client03,
    prompt: 'Minimal modern app dashboard UI, glassmorphism, soft shadows, 8pt grid, neutral palette with accent purple, responsive widgets, elegant typography',
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
    imageUrl: client02,
    prompt: 'Epic sci-fi space vista with multiple colorful planets, nebula dust, starfields, rim lighting, cinematic scale, ultra wide, volumetric lighting',
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
    imageUrl: client03,
    prompt: 'Minimalist logo mark for a creative AI brand, geometric shapes, negative space, bold yet friendly, flat vector, monochrome with optional accent',
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
    imageUrl: client01,
    prompt: 'Contemporary urban skyline at blue hour, reflective glass buildings, leading lines, symmetrical composition, high detail, street-level perspective',
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

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

  const handleDownload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    // Increment download count in UI
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, downloads: img.downloads + 1 } : img));

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = image.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
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
    const image = images.find(img => img.id === imageId);
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

      {/* Filters and Controls */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
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
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <div className="group flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:border-gray-300 transition-colors">
                <Filter className="h-4 w-4 text-gray-400" />
                <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent text-sm focus:outline-none pr-7 cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                  <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200 group-focus-within:rotate-180 group-hover:text-gray-500" />
                </div>
              </div>

              {/* Sort */}
              <div className="group relative bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:border-gray-300 transition-colors">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent text-sm focus:outline-none pr-7 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200 group-focus-within:rotate-180 group-hover:text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedImages.map((image) => (
            <div key={image.id} className="group rounded-xl bg-white shadow hover:shadow-lg transition-shadow">
              <div className="relative [perspective:1000px]">
                <div className={`relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped[image.id] ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden] rounded-xl">
                    <img src={image.imageUrl} alt={image.title} className="w-full h-64 object-cover" />
                    {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-sm line-clamp-2">{image.description}</p>
                    </div> */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white/90">
                      <button onClick={() => handleLike(image.id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/50 cursor-pointer">
                        <Heart className={`h-4 w-4 ${image.isLiked ? 'fill-white text-white' : ''}`} />
                        <span className="text-xs">{image.likes}</span>
                      </button>
                      <button onClick={() => handleDownload(image.id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/50 cursor-pointer">
                        <Download className="h-4 w-4" />
                        <span className="text-xs">{image.downloads}</span>
                      </button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <button onClick={() => handleFlip(image.id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/50 text-white/90 cursor-pointer">
                        <FlipHorizontal2 className="h-4 w-4" />
                        <span className="text-xs">Prompt</span>
                      </button>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 rotate-y-180 [backface-visibility:hidden] rounded-xl bg-gradient-to-br from-white to-gray-100 text-gray-900">
                    <div className="absolute top-3 right-3">
                      <button onClick={() => handleFlip(image.id)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-900 border border-gray-300 cursor-pointer">
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
                        <div className="absolute bottom-2 right-2">
                          <button onClick={() => handleCopyPrompt(image.id)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-900 hover:bg-gray-800 text-white cursor-pointer">
                            {copied[image.id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="text-xs">{copied[image.id] ? 'Copied' : 'Copy'}</span>
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

      {/* Upload removed per requirements */}
    </div>
  );
}