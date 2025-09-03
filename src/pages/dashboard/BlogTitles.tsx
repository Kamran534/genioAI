import { useState } from 'react';
import { Hash, Copy } from 'lucide-react';

export default function BlogTitles() {
  const [topic, setTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const handleGenerateTitles = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const sampleTitles = [
        `10 ${selectedCategory} Ways to ${topic}: A Complete Guide`,
        `The Ultimate ${topic} Guide for Beginners`,
        `Why ${topic} is Changing Everything in 2024`,
        `5 Proven Strategies for Better ${topic}`,
        `${topic}: What Experts Don't Want You to Know`,
        `How to Master ${topic} in 30 Days`,
        `The Secret to Successful ${topic} Implementation`,
        `${topic} Trends: What's Hot and What's Not`,
        `From Zero to Hero: Your ${topic} Journey`,
        `The ${topic} Revolution: Are You Ready?`
      ];
      setGeneratedTitles(sampleTitles);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = (title: string) => {
    navigator.clipboard.writeText(title);
    // You could add a toast notification here
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
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="bg-white shadow rounded-lg h-[380px]">
          <div className="px-4 py-5 sm:p-6 h-full flex flex-col">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center mb-6">
              <Hash className="h-5 w-5 mr-2 text-purple-600" />
              AI Title Generator
            </h3>

            <div className="space-y-6 flex-1">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-10 py-2 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm placeholder:text-gray-400 transition-colors"
                    placeholder="The future of artificial intelligence"
                  />
                  {topic && (
                    <button
                      type="button"
                      onClick={() => setTopic('')}
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
                <div className="grid grid-cols-4 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={
                          `px-3 py-2 rounded-xl text-sm font-medium transition-all ` +
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
                disabled={!topic.trim() || isGenerating}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating titles...
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 mr-2" />
                    Generate title
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white shadow rounded-lg h-[380px]">
          <div className="px-4 py-5 sm:p-6 h-full flex flex-col">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-6 flex items-center">
              <Hash className="h-5 w-5 mr-2 text-purple-600" />
              Generated titles
            </h3>

            {generatedTitles.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 flex-1">
                <Hash className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm">Enter keywords and click "Generate Titles" to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                  {generatedTitles.map((title, index) => (
                    <div key={index} className="group flex items-center justify-between px-4 py-1 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
                      <span className="text-base text-gray-900 flex-1 pr-3 leading-relaxed">{title}</span>
                      <button
                        onClick={() => copyToClipboard(title)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
