import { useState, useRef, useEffect } from 'react';
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

export default function WriteArticle() {
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    category: 'Technology',
    status: 'draft'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [seoScore, setSeoScore] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLength, setAiLength] = useState<'short' | 'long'>('short');
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

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (articleData.title || articleData.content) {
      setIsAutoSaving(true);
      autoSaveTimeoutRef.current = window.setTimeout(() => {
        // Simulate auto-save
        setLastSaved(new Date());
        setIsAutoSaving(false);
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [articleData.title, articleData.content]);

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
    // Simulate API call
    setTimeout(() => {
      const titleToUse = (opts?.title && opts.title.trim()) ? opts.title.trim() : articleData.title;
      const promptToUse = (opts?.prompt && opts.prompt.trim()) ? opts.prompt.trim() : '';
      const generatedContent = `<h1>Introduction</h1>

<p>This is a comprehensive article about "<strong>${titleToUse}</strong>". In this piece, we'll explore the key concepts, benefits, and practical applications.</p>

<h2>Key Points</h2>

<ul>
<li><strong>1</strong>: Detailed explanation of the first major concept</li>
<li><strong>2</strong>: Analysis of the second important aspect</li>
<li><strong>3</strong>: Discussion of the third critical element</li>
</ul>

<h2>In-Depth Analysis</h2>

<p>${promptToUse ? `Prompt context: ${promptToUse}` : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'}</p>

<blockquote>
<p>"This is an important quote that highlights a key insight from the research."</p>
</blockquote>

<h2>Practical Applications</h2>

<ol>
<li><strong>Application 1</strong>: How this concept applies in real-world scenarios</li>
<li><strong>Application 2</strong>: Another practical use case</li>
<li><strong>Application 3</strong>: A third example of implementation</li>
</ol>

<h2>Conclusion</h2>

<p>In conclusion, this topic offers significant value and should be considered carefully. The insights provided here can help guide future decisions and strategies.</p>

<hr>

<p><em>This article was generated with AI assistance and should be reviewed before publication.</em></p>`;

      setArticleData(prev => ({
        ...prev,
        title: titleToUse || prev.title,
        content: generatedContent,
        excerpt: `A comprehensive guide to ${(titleToUse || prev.title).toLowerCase()}, covering key concepts, benefits, and practical applications.`
      }));
      setIsGenerating(false);
    }, 3000);
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

  const handleSaveDraft = () => {
    setIsAutoSaving(true);
    setTimeout(() => {
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }, 1000);
  };

  const handlePublish = () => {
    setArticleData(prev => ({ ...prev, status: 'published' }));
    // Simulate publish action
  };

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
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 ">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Write Article</h1>
              {isAutoSaving && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                  Auto-saving...
                </div>
              )}
              {lastSaved && !isAutoSaving && (
                <div className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setAiTitle(articleData.title || '');
                  setAiPrompt('');
                  setIsAIPromptOpen(true);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 bg-gray-200 cursor-pointer hover:from-fuchsia-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                ✨ 
              </button>
              <button
                onClick={handleOpenPreviewInNewTab}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
              
              <button
                onClick={handlePublish}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Send className="h-4 w-4 mr-2" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Article Title */}
          <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                  <input
                    type="text"
              value={articleData.title}
              onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full text-3xl font-bold text-gray-900 placeholder-gray-500 border-none outline-none resize-none"
                    placeholder="Enter your article title..."
                  />
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{readingTime} min read</span>
              <span>•</span>
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                SEO Score: {seoScore}/100
              </span>
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="bg-white border-b border-gray-200 p-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
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
            <div
              ref={editorRef}
              contentEditable
              dir="ltr"
              className="w-full h-full p-4 sm:p-6 text-gray-900 focus:outline-none resize-none overflow-y-auto cursor-text"
              style={{ minHeight: '400px', direction: 'ltr', textAlign: 'left' }}
              onInput={(e) => {
                const content = e.currentTarget.innerHTML;
                setArticleData(prev => ({ ...prev, content }));
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
                </div>

          
                    </div>
                  </div>
                </div>

    {isAIPromptOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsAIPromptOpen(false)}></div>
        <div className="relative bg-white w-full max-w-lg mx-auto rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 flex items-center justify-center text-white text-[10px]">✦</div>
            <h3 className="text-lg font-semibold text-gray-900">AI Article Writer</h3>
          </div>
          <div className="space-y-5">
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article Topic</label>
              <input
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="The future of artificial intelligence"
              />
                    </div>
                    <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Length</label>
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  className={`px-4 py-1.5 text-sm rounded-full ${aiLength==='short' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  onClick={() => setAiLength('short')}
                >
                  Short (200 - 400 word)
                </button>
                            <button
                  className={`px-4 py-1.5 text-sm rounded-full ${aiLength==='long' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  onClick={() => setAiLength('long')}
                >
                  Long (400 - 800 word)
                            </button>
                    </div>
                  </div>
                </div>
          <div className="mt-6">
            <button
              onClick={() => {
                setIsAIPromptOpen(false);
                const prompt = `${aiPrompt || ''} Length: ${aiLength}`.trim();
                handleGenerateArticle({ title: aiTitle, prompt });
              }}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              🖋️ Generate article
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