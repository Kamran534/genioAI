import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Printer, Eye, Clock, FileText, User, Calendar } from 'lucide-react';

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
  wordCount: number;
  readingTime: number;
  author: string;
  createdAt: string;
}

export default function ArticlePreview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    // Get article data from URL parameters or localStorage
    const articleDataParam = searchParams.get('data');
    
    if (articleDataParam) {
      try {
        const decodedData = decodeURIComponent(articleDataParam);
        const parsedData = JSON.parse(decodedData);
        setArticleData(parsedData);
      } catch (error) {
        console.error('Error parsing article data:', error);
        // Fallback to sample data
        setArticleData({
          title: 'Sample Article Title',
          content: '<p>This is a sample article content. The preview page is working correctly!</p>',
          excerpt: 'This is a sample excerpt for the article preview.',
          tags: ['sample', 'preview', 'article'],
          category: 'Technology',
          status: 'draft',
          wordCount: 15,
          readingTime: 1,
          author: 'John Doe',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Fallback to sample data
      setArticleData({
        title: 'Sample Article Title',
        content: '<p>This is a sample article content. The preview page is working correctly!</p>',
        excerpt: 'This is a sample excerpt for the article preview.',
        tags: ['sample', 'preview', 'article'],
        category: 'Technology',
        status: 'draft',
        wordCount: 15,
        readingTime: 1,
        author: 'John Doe',
        createdAt: new Date().toISOString()
      });
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleBackToEditor = () => {
    navigate('/dashboard/write-article');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: articleData?.title || 'Article Preview',
        text: articleData?.excerpt || '',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!articleData) return;
    const printable = window.open('', '_blank');
    if (!printable) return;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${articleData.title}</title>
        <style>
          @page { margin: 24mm; }
          body { font-family: Arial, sans-serif; color: #111827; }
          h1, h2, h3, h4 { color: #111827; }
          .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
          .content { line-height: 1.6; font-size: 14px; }
          blockquote { margin: 12px 0; padding: 8px 12px; border-left: 4px solid #8b5cf6; color: #374151; background: #f9fafb; }
          img { max-width: 100%; height: auto; border-radius: 6px; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
          ul, ol { padding-left: 20px; }
        </style>
      </head>
      <body>
        <h1>${articleData.title}</h1>
        <div class="meta">By ${articleData.author} • ${articleData.wordCount} words • ${articleData.readingTime} min read</div>
        <div class="content">${articleData.content}</div>
      </body>
      </html>
    `;
    printable.document.open();
    printable.document.write(html);
    printable.document.close();
    // Wait for assets to load, then print
    printable.onload = () => {
      printable.focus();
      printable.print();
    };
  };

  const handleDownloadDOC = () => {
    if (!articleData) return;
    
    // Convert HTML to RTF (Rich Text Format) for Word compatibility
    const convertHtmlToRtf = (html: string) => {
      return html
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\\fs28\\b $1\\b0\\fs24\\par\\par')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\\fs26\\b $1\\b0\\fs24\\par\\par')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\\fs25\\b $1\\b0\\fs24\\par\\par')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '\\b $1\\b0')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '\\b $1\\b0')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '\\i $1\\i0')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '\\i $1\\i0')
        .replace(/<u[^>]*>(.*?)<\/u>/gi, '\\ul $1\\ul0')
        .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (_, content) => {
          return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '\\bullet $1\\par');
        })
        .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (_, content) => {
          let counter = 1;
          return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\\par`);
        })
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\\par\\par\\i $1\\i0\\par\\par')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\\par\\par')
        .replace(/<br[^>]*>/gi, '\\par')
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    };
    
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24
\\b ${articleData.title}\\b0\\par\\par
By ${articleData.author} • ${articleData.wordCount} words • ${articleData.readingTime} min read\\par\\par
${articleData.excerpt}\\par\\par
${convertHtmlToRtf(articleData.content)}
}`;
    
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${articleData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for could not be found.</p>
          <button
            onClick={handleBackToEditor}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToEditor}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Editor
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Preview Mode</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleDownloadPDF();
                          setShowDownloadMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Download as PDF
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadDOC();
                          setShowDownloadMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Download as DOC
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {articleData.title}
          </h1>
          
          {articleData.excerpt && (
            <div className="bg-gray-50 border-l-4 border-purple-500 p-6 mb-6 rounded-r-lg">
              <p className="text-lg text-gray-700 italic leading-relaxed">
                {articleData.excerpt}
              </p>
            </div>
          )}
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{articleData.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(articleData.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>{articleData.wordCount} words</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{articleData.readingTime} min read</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span className="capitalize">{articleData.status}</span>
            </div>
          </div>
          
          {/* Tags */}
          {articleData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {articleData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: articleData.content }}
            onClick={(e) => {
              // Handle image clicks to open in new tab
              if (e.target instanceof HTMLImageElement) {
                const imgUrl = e.target.src;
                window.open(imgUrl, '_blank');
              }
            }}
          />
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              This is a preview of your article. Changes made here won't be saved.
            </p>
            <button
              onClick={handleBackToEditor}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
