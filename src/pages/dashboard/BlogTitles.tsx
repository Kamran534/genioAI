import { useState } from 'react';
import { Hash, Copy, RefreshCw, TrendingUp, Eye, ThumbsUp } from 'lucide-react';

export default function BlogTitles() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const handleGenerateTitles = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const sampleTitles = [
        `10 Amazing Ways to ${topic}: A Complete Guide`,
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

  const trendingTopics = [
    { topic: 'AI Content Creation', score: 95 },
    { topic: 'Digital Marketing', score: 88 },
    { topic: 'Remote Work', score: 82 },
    { topic: 'Sustainability', score: 79 },
    { topic: 'Mental Health', score: 76 },
  ];

  return (
    <>
      {/* Page header */}
      {/* <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Hash className="h-6 w-6 mr-3 text-purple-600" />
          Blog Titles Generator
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Generate engaging and SEO-friendly blog titles for any topic.
        </p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Title Generator */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Generate Blog Titles</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your topic or keyword
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="e.g., AI content creation, digital marketing, remote work..."
                  />
                </div>

                <button
                  onClick={handleGenerateTitles}
                  disabled={!topic.trim() || isGenerating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating Titles...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Titles
                    </>
                  )}
                </button>
              </div>

              {/* Generated Titles */}
              {generatedTitles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Generated Titles</h4>
                  <div className="space-y-2">
                    {generatedTitles.map((title, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="text-sm text-gray-900 flex-1">{title}</span>
                        <button
                          onClick={() => copyToClipboard(title)}
                          className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
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
          {/* Trending Topics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button
                      onClick={() => setTopic(item.topic)}
                      className="text-sm text-gray-700 hover:text-purple-600 transition-colors text-left"
                    >
                      {item.topic}
                    </button>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Title Tips */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Title Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Eye-catching</p>
                    <p className="text-xs text-gray-600">Use numbers, questions, or power words</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ThumbsUp className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">SEO-friendly</p>
                    <p className="text-xs text-gray-600">Include relevant keywords naturally</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Hash className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Specific</p>
                    <p className="text-xs text-gray-600">Be clear about what readers will learn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
