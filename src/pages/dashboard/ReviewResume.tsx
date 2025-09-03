import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle, AlertCircle, Star, TrendingUp, Users } from 'lucide-react';

interface AnalysisResults {
  score: number;
  strengths: string[];
  improvements: string[];
  atsScore: number;
  keywordMatches: number;
  missingKeywords: string[];
}

export default function ReviewResume() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysisResults({
        score: 85,
        strengths: [
          'Strong technical skills mentioned',
          'Clear work experience timeline',
          'Good use of action verbs',
          'Relevant certifications listed'
        ],
        improvements: [
          'Add more quantifiable achievements',
          'Include soft skills section',
          'Optimize for ATS keywords',
          'Add a professional summary'
        ],
        atsScore: 78,
        keywordMatches: 12,
        missingKeywords: ['leadership', 'project management', 'analytics']
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const recentResumes = [
    { id: 1, name: 'Software Engineer Resume.pdf', date: '2 hours ago', score: 88 },
    { id: 2, name: 'Marketing Manager Resume.docx', date: '1 day ago', score: 92 },
    { id: 3, name: 'Data Analyst Resume.pdf', date: '3 days ago', score: 85 },
  ];

  return (
    <>
      {/* Page header */}
      {/* <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FileText className="h-6 w-6 mr-3 text-purple-600" />
          Review Resume
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Get AI-powered feedback and optimization suggestions for your resume.
        </p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Analysis */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Resume Analysis</h3>
              
              {!resumeText ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your resume to get AI-powered feedback and suggestions
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, DOCX, TXT up to 5MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resume Text */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Resume Content</h4>
                    <textarea
                      rows={8}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      placeholder="Paste your resume content here..."
                    />
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={!resumeText.trim() || isAnalyzing}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </button>

                  {/* Analysis Results */}
                  {analysisResults && (
                    <div className="space-y-4">
                      {/* Overall Score */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">Overall Score</h4>
                            <p className="text-sm text-gray-600">Based on ATS optimization and content quality</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">{analysisResults.score}</div>
                            <div className="text-sm text-gray-600">out of 100</div>
                          </div>
                        </div>
                      </div>

                      {/* Strengths */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm text-gray-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.improvements.map((improvement: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                              <span className="text-sm text-gray-700">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* ATS Score */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-3">
                          <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">ATS Score</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mt-1">{analysisResults.atsScore}</div>
                        </div>
                        <div className="bg-white border rounded-lg p-3">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">Keyword Matches</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600 mt-1">{analysisResults.keywordMatches}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Resumes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Resumes</h3>
              <div className="space-y-3">
                {recentResumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resume.name}</p>
                      <p className="text-xs text-gray-500">{resume.date}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{resume.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Tips */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Resume Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Use action verbs to describe achievements</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Include quantifiable results and metrics</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Optimize for ATS with relevant keywords</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">Keep formatting clean and consistent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Options */}
          {analysisResults && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Download Report</h3>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <Download className="h-4 w-4 mr-2" />
                  Download Analysis Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
