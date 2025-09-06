import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useGenerateArticleMutation, useGetUserCreationsQuery } from '../../services/api';
import { parseArticleContent, structuredArticleToHTML, calculateSEOScore, extractSEOKeywords } from '../../utils/articleFormatter';
import Toaster, { useToaster } from '../../components/Toaster';
import { 
  Send, 
  Save, 
    Eye,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Target,
  Loader2,
  X,
} from 'lucide-react';

interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  seoTitle?: string;
  metaDescription?: string;
}

// Enhanced localStorage utilities
const STORAGE_KEYS = {
  ARTICLE_DATA: 'genio_article_data',
  LAST_SAVED: 'genio_last_saved',
  AUTO_SAVE_ENABLED: 'genio_auto_save_enabled'
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

export default function WriteArticle() {
  const { user, isLoaded } = useUser();
  const toaster = useToaster();
  const [isPremium, setIsPremium] = useState(false);
  
  const [articleData, setArticleData] = useState<ArticleData>(() => 
    loadFromStorage(STORAGE_KEYS.ARTICLE_DATA, {
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    category: 'Technology',
    status: 'draft'
    })
  );
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Load additional state from localStorage
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const saved = loadFromStorage(STORAGE_KEYS.LAST_SAVED, null);
    return saved ? new Date(saved) : null;
  });
  const [wordCount, setWordCount] = useState(() => {
    const saved = loadFromStorage('genio_word_count', 0);
    return saved;
  });
  const [readingTime, setReadingTime] = useState(() => {
    const saved = loadFromStorage('genio_reading_time', 0);
    return saved;
  });
  const [seoScore, setSeoScore] = useState(() => {
    const saved = loadFromStorage('genio_seo_score', 0);
    return saved;
  });
  const [seoKeywords, setSeoKeywords] = useState<string[]>(() => {
    const saved = loadFromStorage('genio_seo_keywords', []);
    return saved;
  });

  // Debounced save function to prevent excessive localStorage writes
  const saveTimeoutRef = useRef<number | null>(null);

  const debouncedSave = (data: ArticleData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      setIsAutoSaving(true);
      try {
      saveToStorage(STORAGE_KEYS.ARTICLE_DATA, data);
      saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      setLastSaved(new Date());
        toaster.showInfo('Auto-saved', 'Your changes have been saved automatically');
      } catch (error) {
        console.error('Auto-save failed:', error);
        toaster.showError('Auto-save Failed', 'Could not save your changes automatically');
      } finally {
      setIsAutoSaving(false);
      }
    }, 2000); // Save after 2 seconds of inactivity
  };

  // Detect premium plan
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
  }, [isLoaded, user]);

  // Save article data to localStorage whenever it changes (with debouncing)
  useEffect(() => {
    if (articleData.title || articleData.content) {
    debouncedSave(articleData);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [articleData]);

  // Save additional state changes
  useEffect(() => {
    saveToStorage('genio_word_count', wordCount);
  }, [wordCount]);

  useEffect(() => {
    saveToStorage('genio_reading_time', readingTime);
  }, [readingTime]);

  useEffect(() => {
    saveToStorage('genio_seo_score', seoScore);
  }, [seoScore]);

  useEffect(() => {
    saveToStorage('genio_seo_keywords', seoKeywords);
  }, [seoKeywords]);

  // Function to clear all saved article data
  const clearSavedArticle = () => {
    // Clear all localStorage keys
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('genio_word_count');
    localStorage.removeItem('genio_reading_time');
    localStorage.removeItem('genio_seo_score');
    localStorage.removeItem('genio_seo_keywords');
    
    // Reset all state
    setArticleData({
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      category: 'Technology',
      status: 'draft'
    });
    setWordCount(0);
    setReadingTime(0);
    setSeoScore(0);
    setSeoKeywords([]);
    setLastSaved(null);
    
    // Clear editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    
    toaster.showInfo('Article Cleared', 'All content has been cleared and you can start fresh');
  };

  // Function to force save immediately
  const forceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsAutoSaving(true);
    try {
    saveToStorage(STORAGE_KEYS.ARTICLE_DATA, articleData);
    saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    setLastSaved(new Date());
      toaster.showSuccess('Saved', 'Your article has been saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toaster.showError('Save Failed', 'Could not save your article');
    } finally {
    setIsAutoSaving(false);
    }
  };

  const editorRef = useRef<HTMLDivElement>(null);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLength, setAiLength] = useState<'short' | 'long' | 'custom'>('short');
  const [customWords, setCustomWords] = useState<number>(400);
  const [generateArticle, { isLoading: isGeneratingArticle, error: generationApiError }] = useGenerateArticleMutation();
  
  // Fetch user's previous creations
  const { data: userCreations, refetch: refetchCreations } = useGetUserCreationsQuery();
  // Image upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Simple function to focus the editor
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Initialize editor focus and content
  useEffect(() => {
    if (editorRef.current) {
      // Set initial content
      if (articleData.content && editorRef.current.innerHTML !== articleData.content) {
        editorRef.current.innerHTML = articleData.content;
      }
      
      // Force text direction
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.setAttribute('dir', 'ltr');
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        focusEditor();
      }, 100);
    }
  }, [articleData.content]);

  // Remove duplicate auto-save functionality - now handled by debouncedSave

  // Calculate word count and reading time
  useEffect(() => {
    const words = articleData.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
    
    // Calculate SEO score
    let score = 0;
    if (articleData.title.length > 10 && articleData.title.length < 60) score += 25;
    if (articleData.metaDescription && articleData.metaDescription.length > 120 && articleData.metaDescription.length < 160) score += 25;
    if (words > 300) score += 25;
    if (articleData.tags.length > 0) score += 25;
    setSeoScore(score);
  }, [articleData]);

  const handleGenerateArticle = async (opts?: { title?: string; prompt?: string }) => {
    setIsGenerating(true);
    
    // Show loading toast
    const loadingToastId = toaster.showLoading('Generating Article', 'Please wait while we create your content...');
    
    try {
      const titleToUse = (opts?.title && opts.title.trim()) ? opts.title.trim() : articleData.title;
      const promptToUse = (opts?.prompt && opts.prompt.trim()) ? opts.prompt.trim() : '';
      const targetLength = aiLength === 'custom' ? Math.max(100, Math.min(2000, Number(customWords) || 300)) : (aiLength === 'long' ? 600 : 300);
      
      // Create a comprehensive prompt
      const fullPrompt = `${titleToUse ? `Title: ${titleToUse}\n\n` : ''}${promptToUse ? `Topic: ${promptToUse}\n\n` : ''}Write a comprehensive article with proper structure including headings, subheadings, and well-organized content.`;
      
      const res = await generateArticle({ 
        prompt: fullPrompt, 
        length: targetLength 
      }).unwrap();
      
      if (res.success && res.article) {
        console.log('📝 Full article content received:', res.article);
        console.log('📊 Article length:', res.article.length);
        
        // Parse and structure the article content
        const structuredArticle = parseArticleContent(res.article);
        console.log('🔍 Structured article:', structuredArticle);
        
        // Update article data with structured content
      setArticleData(prev => ({
        ...prev,
          title: titleToUse || structuredArticle.title || prev.title,
          content: structuredArticleToHTML(structuredArticle),
          excerpt: structuredArticle.excerpt,
        }));
        
        // Update word count and SEO metrics
        setWordCount(structuredArticle.wordCount);
        setReadingTime(structuredArticle.readingTime);
        setSeoScore(calculateSEOScore(structuredArticle));
        setSeoKeywords(extractSEOKeywords(res.article));
        
        // Auto-refresh user creations
        refetchCreations();
        
        // Remove loading toast and show success
        toaster.removeToast(loadingToastId);
        toaster.showSuccess('Article Generated!', `Successfully created ${structuredArticle.wordCount} words in ${structuredArticle.readingTime} min read`);
      } else {
        throw new Error(res.message || 'Failed to generate article');
      }
    } catch (err: unknown) {
      let message = 'Unknown error occurred';
      
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (generationApiError && 'data' in generationApiError) {
        const errorData = generationApiError.data as any;
        message = errorData?.message || errorData?.error || 'API error occurred';
      } else {
        try { 
          message = JSON.stringify(err); 
        } catch { 
          message = 'Unserializable error'; 
        }
      }
      
      // Provide more helpful error messages
      if (message.includes('OPENAI_API_ERROR')) {
        message = 'AI service is currently unavailable. Please check your API configuration or try again later.';
      } else if (message.includes('Free usage limit exceeded')) {
        if (isPremium) {
          message = 'There seems to be an issue with your premium plan. Please contact support or try again later.';
        } else {
          message = 'You have reached your free usage limit. Please upgrade to premium to continue generating articles.';
        }
      } else if (message.includes('Unauthorized')) {
        message = 'Please log in again to continue generating articles.';
      } else if (message.includes('Failed to generate article')) {
        message = 'Unable to generate article. Please check your internet connection and try again.';
      }
      
      // Remove loading toast and show error
      toaster.removeToast(loadingToastId);
      toaster.showError('Generation Failed', message);
    } finally {
      setIsGenerating(false);
    }
  };

  // (Deprecated) Modal helpers removed; handled inline where used to avoid unused symbols

  const handleFormatText = (format: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (!selectedText) return;
      
      let formattedHTML = '';
      
      switch (format) {
        case 'bold':
          formattedHTML = `<strong>${selectedText}</strong>`;
          break;
        case 'italic':
          formattedHTML = `<em>${selectedText}</em>`;
          break;
        case 'underline':
          formattedHTML = `<u>${selectedText}</u>`;
          break;
        case 'blockquote':
          formattedHTML = `<blockquote>${selectedText}</blockquote>`;
          break;
        default:
          return;
      }
      
      range.deleteContents();
      range.insertNode(document.createRange().createContextualFragment(formattedHTML));
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  const handleListFormat = (listType: 'ul' | 'ol') => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (!selectedText) return;
      
      // Split selected text into lines and wrap each with <li>
      const lines = selectedText.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => `<li>${line.trim()}</li>`).join('');
      const formattedHTML = `<${listType}>${listItems}</${listType}>`;
      
      range.deleteContents();
      range.insertNode(document.createRange().createContextualFragment(formattedHTML));
      
      selection.removeAllRanges();
    }
  };

  const handleTextAlign = (alignment: string) => {
      if (editorRef.current) {
        editorRef.current.focus();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Find the block element (p, div, etc.)
      let blockElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);
      while (
        blockElement &&
        !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes((blockElement as Element).tagName)
      ) {
        blockElement = blockElement.parentElement;
      }
      
      if (blockElement instanceof HTMLElement) {
        blockElement.style.textAlign = alignment as 'left' | 'center' | 'right' | 'justify';
      }
    }
  };

  // Heading toggles (H1/H2/H3)
  const getBlockElement = (node: Node): HTMLElement | null => {
    const base = node.nodeType === Node.TEXT_NODE ? (node.parentElement as Element) : (node as Element);
    return (base && (base.closest('p,div,h1,h2,h3,h4,h5,h6') as HTMLElement)) || null;
  };

  const toggleHeading = (level: 1 | 2 | 3) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const block = getBlockElement(range.commonAncestorContainer);
    const tag = `H${level}`;
    if (block) {
      if (block.tagName === tag) {
        const p = document.createElement('p');
        p.innerHTML = block.innerHTML;
        block.replaceWith(p);
      } else {
        const h = document.createElement(tag);
        h.innerHTML = block.innerHTML;
        block.replaceWith(h);
      }
    }
  };

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  const handleInsertLink = () => {
    const selection = window.getSelection();
    setLinkText(selection && selection.toString() ? selection.toString() : '');
    setLinkUrl('');
    setLinkNewTab(true);
    setIsLinkOpen(true);
  };

  const saveLinkFromModal = () => {
    if (!linkUrl) { setIsLinkOpen(false); return; }
    const text = linkText && linkText.trim() ? linkText.trim() : 'Link';
    const target = linkNewTab ? '_blank' : '_self';
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const html = `<a href="${linkUrl}" target="${target}">${text}</a>`;
      range.deleteContents();
      range.insertNode(document.createRange().createContextualFragment(html));
      selection.removeAllRanges();
    }
    setIsLinkOpen(false);
  };

  const handleInsertImage = () => {
    setIsUploadOpen(true);
  };

  const insertImageAtCursor = (url: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const imgHTML = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; cursor: pointer;" onclick="window.open('${url}', '_blank')" />`;
    range.insertNode(document.createRange().createContextualFragment(imgHTML));
    selection.removeAllRanges();
  };

  const requestPresign = async (file: File) => {
    const params = new URLSearchParams({ filename: file.name, contentType: file.type });
    const res = await fetch(`/api/uploads/presign?${params.toString()}`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to get presign');
    return res.json();
  };

  const uploadToS3 = async (file: File) => {
    const presign = await requestPresign(file);
    // Support either POST (fields) or PUT (uploadUrl)
    if (presign.url && presign.fields) {
      const formData = new FormData();
      Object.entries(presign.fields).forEach(([k, v]) => formData.append(k, String(v)));
      formData.append('file', file);
      const resp = await fetch(presign.url, { method: 'POST', body: formData });
      if (!resp.ok) throw new Error('S3 upload failed');
      // Final URL (for standard S3 form uploads)
      const fileUrl = `${presign.url}/${presign.fields.key}`;
      return fileUrl;
    }
    if (presign.uploadUrl) {
      const resp = await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!resp.ok) throw new Error('S3 upload failed');
      return presign.publicUrl || presign.uploadUrl.split('?')[0];
    }
    throw new Error('Invalid presign response');
  };


  // Handle content changes in the editor
  const handleContentChange = (newContent: string) => {
    setArticleData(prev => ({ ...prev, content: newContent }));
    
    // Update word count and reading time
    const words = newContent.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Assuming 200 words per minute
  };

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setArticleData(prev => ({ ...prev, title: newTitle }));
  };

  // Handle save draft
  const handleSaveDraft = () => {
    forceSave();
    toaster.showSuccess('Draft Saved', 'Your article has been saved as a draft');
  };

  // Handle publish
  const handlePublish = () => {
    if (!articleData.title.trim()) {
      toaster.showError('Cannot Publish', 'Please add a title before publishing');
      return;
    }
    if (!articleData.content.trim()) {
      toaster.showError('Cannot Publish', 'Please add content before publishing');
      return;
    }
    
    forceSave();
    toaster.showSuccess('Article Published!', 'Your article has been published successfully');
  };

  // Handle page unload to ensure data is saved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Force save before page unload
      forceSave();
      
      // Check if there are unsaved changes
      if (articleData.title || articleData.content) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [articleData]);

  // Restore content from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromStorage(STORAGE_KEYS.ARTICLE_DATA, null as ArticleData | null);
    if (savedData && (savedData.title || savedData.content)) {
      console.log('📄 Restored article data from localStorage:', {
        title: savedData.title,
        contentLength: savedData.content?.length || 0,
        wordCount: savedData.content?.split(/\s+/).length || 0
      });
    }
  }, []);

  const handleOpenPreviewInNewTab = () => {
    // Prepare article data for the preview page
    const previewData = {
      ...articleData,
      wordCount,
      readingTime,
      author: 'Current User', // You can get this from user context
      createdAt: new Date().toISOString()
    };
    
    // Encode the data for URL
    const encodedData = encodeURIComponent(JSON.stringify(previewData));
    
    // Open preview page in new tab
    const previewUrl = `/preview?data=${encodedData}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <>
      <Toaster toasts={toaster.toasts} onRemove={toaster.removeToast} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Write Article</h1>
              
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
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setAiTitle(articleData.title || '');
                  setAiPrompt('');
                  setIsAIPromptOpen(true);
                }}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-gray-500 bg-gray-200 cursor-pointer hover:from-fuchsia-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="AI Article Generator"
              >
                <span className="text-sm sm:text-base">✨</span>
                <span className="hidden sm:inline ml-1">AI</span>
              </button>
              
              <button
                onClick={handleOpenPreviewInNewTab}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Save</span>
              </button>
              
              <button
                onClick={clearSavedArticle}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-red-300 text-xs sm:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Clear all content and start fresh"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              
              <button
                onClick={handlePublish}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Publish</span>
                <span className="sm:hidden">Publish</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)]">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col w-full">
            {/* Article Title */}
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6">
                      <input
                        type="text"
                  value={articleData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-500 border-none outline-none resize-none"
                        placeholder="Enter your article title..."
                      />
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span>{wordCount} words</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{readingTime} min read</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    SEO: {seoScore}/100
                  </span>
                  {seoKeywords.length > 0 && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center">
                        <span className="hidden sm:inline">Keywords: </span>
                        <span className="sm:hidden">KW: </span>
                        {seoKeywords.slice(0, 2).join(', ')}
                        {seoKeywords.length > 2 && ` +${seoKeywords.length - 2}`}
                      </span>
                    </>
                  )}
                </div>
            </div>

            {/* Editor Toolbar */}
            <div className="bg-white border-b border-gray-200 p-2">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => handleFormatText('bold')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Bold (B)"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleFormatText('italic')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Italic (I)"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleFormatText('underline')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Underline (U)"
                >
                  <Underline className="h-4 w-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <button
                  onClick={() => handleListFormat('ul')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleListFormat('ol')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleFormatText('blockquote')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Blockquote"
                >
                  <Quote className="h-4 w-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <button
                  onClick={() => toggleHeading(1)}
                  className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-semibold text-gray-700"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => toggleHeading(2)}
                  className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-semibold text-gray-700"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => toggleHeading(3)}
                  className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-semibold text-gray-700"
                  title="Heading 3"
                >
                  H3
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <button
                  onClick={handleInsertLink}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Insert Link"
                >
                  <Link className="h-4 w-4" />
                </button>
                <button
                  onClick={handleInsertImage}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <button
                  onClick={() => handleTextAlign('left')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleTextAlign('center')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleTextAlign('right')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleTextAlign('justify')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <button
                  onClick={() => document.execCommand('undo')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  onClick={() => document.execCommand('redo')}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="flex-1 bg-white">
              {(isGenerating || isGeneratingArticle) ? (
                <div className="p-3 sm:p-4 lg:p-6 animate-pulse space-y-3">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  dir="ltr"
                  className="w-full h-full p-3 sm:p-4 lg:p-6 text-gray-900 focus:outline-none resize-none overflow-y-auto cursor-text text-sm sm:text-base"
                  style={{ minHeight: '300px', direction: 'ltr', textAlign: 'left' }}
                  onInput={(e) => {
                    const content = e.currentTarget.innerHTML;
                    handleContentChange(content);
                  }}
                  suppressContentEditableWarning={true}
                  onFocus={() => {
                    // Simple focus handling
                    editorRef.current?.focus();
                  }}
                  onKeyDown={(e) => {
                    // Handle special key combinations
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      document.execCommand('insertHTML', false, '<br>');
                    }
                  }}
                  data-placeholder="Start writing your article here... Use the toolbar above to format your text."
                      />
              )}
            </div>

            
                      </div>
                    </div>
                  </div>

    {isAIPromptOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsAIPromptOpen(false)}></div>
        <div className="relative bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs sm:text-sm">
                ✦
          </div>
                <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">AI Article Writer</h3>
                <p className="text-xs sm:text-sm text-gray-500">Generate structured, SEO-optimized articles</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIPromptOpen(false)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
              <input
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="e.g., The Future of Artificial Intelligence in Healthcare"
              />
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions (Optional)</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 resize-none overflow-hidden [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                placeholder="e.g., Focus on practical applications, include case studies, target healthcare professionals..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Article Length</label>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg border-2 transition-all ${
                      aiLength === 'short' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setAiLength('short')}
                  >
                    <div className="font-medium">Short</div>
                    <div className="text-xs text-gray-500">~300 words</div>
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg border-2 transition-all ${
                      aiLength === 'long' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setAiLength('long')}
                  >
                    <div className="font-medium">Long</div>
                    <div className="text-xs text-gray-500">~600 words</div>
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg border-2 transition-all ${
                      aiLength === 'custom' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setAiLength('custom')}
                  >
                    <div className="font-medium">Custom</div>
                    <div className="text-xs text-gray-500">Your choice</div>
                  </button>
                </div>
                
                {aiLength === 'custom' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <input
                      type="number"
                      min={100}
                      max={2000}
                      step={50}
                      value={customWords}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomWords(Number(e.target.value))}
                      className="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Words"
                    />
                    <span className="text-xs sm:text-sm text-gray-600">words (100-2000)</span>
                  </div>
                )}
              </div>
                  </div>
            
            {/* Recent Articles Preview */}
            {userCreations?.data?.articles && userCreations.data.articles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recent Articles</label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {userCreations.data.articles.slice(0, 3).map((article) => (
                    <div
                      key={article.article_id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setAiTitle(article.prompt);
                        setIsAIPromptOpen(false);
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {article.prompt}
                </div>
                      <div className="text-xs text-gray-500">
                        {article.length} words • {new Date(article.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <button
              onClick={() => setIsAIPromptOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsAIPromptOpen(false);
                handleGenerateArticle({ title: aiTitle, prompt: aiPrompt });
              }}
              disabled={isGenerating || isGeneratingArticle || (!aiTitle.trim() && !aiPrompt.trim())}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {(isGenerating || isGeneratingArticle) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Generate Article</span>
                  <span className="sm:hidden">Generate</span>
                </>
              )}
            </button>
                    </div>
                        </div>
                          </div>
                        )}

    {isUploadOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsUploadOpen(false)}></div>
        <div className="relative bg-white w-full max-w-lg mx-auto rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h3>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files && e.dataTransfer.files[0];
              if (f) setUploadFile(f);
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-purple-400 transition-colors"
          >
            <p className="text-sm text-gray-600 mb-3">Drag & drop an image here</p>
            <p className="text-xs text-gray-400 mb-4">or</p>
            <label className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200">
              Browse
                      <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) setUploadFile(f);
                }}
              />
            </label>
            {uploadFile && (
              <div className="mt-4 text-sm text-gray-700">Selected: {uploadFile.name}</div>
            )}
                    </div>
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!uploadFile}
              onClick={async () => {
                if (!uploadFile) return;
                try {
                  setUploadProgress(10);
                  const url = await uploadToS3(uploadFile);
                  setUploadProgress(100);
                  insertImageAtCursor(url);
                  setIsUploadOpen(false);
                  setUploadFile(null);
                  setUploadProgress(0);
                } catch {
                  alert('Upload failed');
                  setUploadProgress(0);
                }
              }}
              className="px-4 py-2 text-sm rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Upload'}
            </button>
                    </div>
                  </div>
                </div>
    )}

    {isLinkOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsLinkOpen(false)}></div>
        <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insert link</h3>
                  <div className="space-y-4">
                    <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                        <input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Link text"
                        />
                      </div>
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://example.com"
                  />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={linkNewTab} onChange={(e) => setLinkNewTab(e.target.checked)} />
              Open in new tab
            </label>
          </div>
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={() => setIsLinkOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveLinkFromModal}
              className="px-4 py-2 text-sm rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              disabled={!linkUrl}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}