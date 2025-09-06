import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Star, Target, TrendingUp, Users, Clock, Loader2, Upload, X, BarChart3, Award, Lightbulb, ArrowRight, ChevronDown, ChevronUp, Trash2, BookOpen, ExternalLink } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useAnalyzeResumeMutation, useGetUserCreationsQuery } from '../../services/api';
import Toaster, { useToaster } from '../../components/Toaster';

// Simple localStorage utilities for resume persistence
const STORAGE_KEYS = {
  UPLOADED_RESUME: 'genio_resume_uploaded',
  ANALYSIS_RESULTS: 'genio_resume_analysis',
  RESUME_FILE: 'genio_resume_file'
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

interface AnalysisResults {
  analysis_id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  analysis: {
    overall_score: number;
  strengths: string[];
    areas_for_improvement: string[];
    ats_analysis: {
      keyword_coverage: number;
      compatibility_score: number;
      missing_keywords: string[];
      suggestions: string[];
    };
    detailed_feedback: {
      structure: string;
      content: string;
      formatting: string;
      keywords: string;
    };
    recommendations: string[];
    industry_insights: string;
    next_steps: string[];
  };
  plan: string;
  created_at: string;
}

export default function ReviewResume() {
  const { user, isLoaded } = useUser();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'json'>('pdf');
  
  const toaster = useToaster();
  const [analyzeResume, { isLoading: isAnalyzingResume }] = useAnalyzeResumeMutation();
  const { refetch: refetchUserCreations } = useGetUserCreationsQuery();

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toaster.showError('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toaster.showError('File size must be less than 10MB');
        return;
      }
      
      setResumeFile(file);
      
      // For text files, read content
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          saveToStorage(STORAGE_KEYS.UPLOADED_RESUME, text);
        };
        reader.readAsText(file);
      }
      
      // Save file info to localStorage
      saveToStorage(STORAGE_KEYS.RESUME_FILE, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    }
  };

  // Detect premium plan and initialize free quota
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

    if (!premium) {
      const raw = localStorage.getItem('resumeFreeLeft');
      let stored = Number(raw);
      if (Number.isNaN(stored) || stored < 0 || stored > 5) {
        stored = 5;
        localStorage.setItem('resumeFreeLeft', '5');
      }
      setFreeLeft(stored);
    }
  }, [isLoaded, user]);

  const handleAnalyzeResume = async () => {
    if (!resumeFile) {
      toaster.showError('Please upload a resume file first');
      return;
    }
    
    if (!isPremium) {
      if (freeLeft <= 0) {
        setShowUpgrade(true);
        return;
      }
      const next = Math.max(0, freeLeft - 1);
      setFreeLeft(next);
      localStorage.setItem('resumeFreeLeft', String(next));
    }
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const response = await analyzeResume(formData).unwrap();
      
      if (response.success) {
        setAnalysisResults(response.data);
        saveToStorage(STORAGE_KEYS.ANALYSIS_RESULTS, response.data);
        toaster.showSuccess('Resume analyzed successfully!');
        
        // Refresh user creations to show the new analysis
        refetchUserCreations();
      } else {
        toaster.showError(response.message || 'Failed to analyze resume');
      }
    } catch (error: any) {
      console.error('Resume analysis error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to analyze resume';
      toaster.showError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResults) return;
    
    const reportData = {
      filename: analysisResults.original_filename,
      analysisDate: new Date(analysisResults.created_at).toLocaleDateString(),
      overallScore: analysisResults.analysis.overall_score,
      strengths: analysisResults.analysis.strengths,
      improvements: analysisResults.analysis.areas_for_improvement,
      atsScore: analysisResults.analysis.ats_analysis.compatibility_score,
      keywordCoverage: analysisResults.analysis.ats_analysis.keyword_coverage,
      missingKeywords: analysisResults.analysis.ats_analysis.missing_keywords,
      recommendations: analysisResults.analysis.recommendations,
      industryInsights: analysisResults.analysis.industry_insights,
      nextSteps: analysisResults.analysis.next_steps,
      detailedFeedback: analysisResults.analysis.detailed_feedback
    };
    
    if (downloadFormat === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-report-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Generate PDF content
      const pdfContent = generatePDFContent(reportData);
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-report-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    toaster.showSuccess(`Report downloaded as ${downloadFormat.toUpperCase()}!`);
  };

  const generatePDFContent = (data: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Detailed Resume Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #374151; }
        .header { text-align: center; margin-bottom: 40px; padding: 20px; background: linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%); border-radius: 12px; }
        .score { font-size: 48px; font-weight: bold; color: #e11d48; margin: 10px 0; }
        .step { margin: 30px 0; padding: 20px; border-radius: 12px; border-left: 4px solid; }
        .step-1 { border-color: #e11d48; background: #fef2f2; }
        .step-2 { border-color: #3b82f6; background: #eff6ff; }
        .step-3 { border-color: #22c55e; background: #f0fdf4; }
        .step-4 { border-color: #f59e0b; background: #fffbeb; }
        .step-5 { border-color: #8b5cf6; background: #faf5ff; }
        .step-6 { border-color: #6366f1; background: #eef2ff; }
        .step-7 { border-color: #14b8a6; background: #f0fdfa; }
        .step-8 { border-color: #6b7280; background: #f9fafb; }
        .step-header { display: flex; align-items: center; margin-bottom: 15px; }
        .step-number { background: #e11d48; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
        .step-2 .step-number { background: #3b82f6; }
        .step-3 .step-number { background: #22c55e; }
        .step-4 .step-number { background: #f59e0b; }
        .step-5 .step-number { background: #8b5cf6; }
        .step-6 .step-number { background: #6366f1; }
        .step-7 .step-number { background: #14b8a6; }
        .step-8 .step-number { background: #6b7280; }
        .step-title { font-size: 20px; font-weight: bold; color: #1f2937; }
        .example-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .example-title { font-weight: bold; color: #475569; margin-bottom: 8px; }
        .example-content { font-style: italic; color: #64748b; }
        .strength, .improvement { margin: 10px 0; padding: 12px; border-radius: 8px; }
        .strength { background-color: #f0fdf4; border-left: 4px solid #22c55e; }
        .improvement { background-color: #fef3c7; border-left: 4px solid #f59e0b; }
        .keyword { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; margin: 3px; border-radius: 16px; font-size: 12px; font-weight: 500; }
        .metrics { display: flex; gap: 20px; margin: 20px 0; }
        .metric { text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
        .metric-value { font-size: 28px; font-weight: bold; color: #1e40af; }
        .metric-label { color: #64748b; font-size: 14px; margin-top: 5px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin: 20px 0 10px 0; }
        .resources { background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 30px; }
        .resource-section { margin: 15px 0; }
        .resource-title { font-weight: bold; color: #374151; margin-bottom: 8px; }
        .resource-list { color: #64748b; font-size: 14px; }
        .resource-list li { margin: 4px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Detailed Resume Analysis Report</h1>
        <p><strong>File:</strong> ${data.filename}</p>
        <p><strong>Generated on:</strong> ${data.analysisDate}</p>
        <div class="score">${data.overallScore}/100</div>
        <p>Comprehensive analysis with step-by-step guidance and examples</p>
    </div>
    
    <div class="step step-1">
        <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">Overall Assessment</div>
        </div>
        <p>Your resume scored <strong>${data.overallScore} out of 100</strong>. This score reflects how well your resume performs in both Applicant Tracking Systems (ATS) and human review processes.</p>
        <div class="example-box">
            <div class="example-title">📊 Score Interpretation:</div>
            <div class="example-content">
                • <strong>90-100:</strong> Excellent - Your resume is highly optimized and stands out<br>
                • <strong>80-89:</strong> Good - Minor improvements needed<br>
                • <strong>70-79:</strong> Fair - Several areas need attention<br>
                • <strong>Below 70:</strong> Needs significant improvement
            </div>
        </div>
    </div>
    
    <div class="step step-2">
        <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-title">ATS Compatibility Analysis</div>
        </div>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${data.atsScore}%</div>
                <div class="metric-label">ATS Compatibility</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.keywordCoverage}%</div>
                <div class="metric-label">Keyword Coverage</div>
            </div>
        </div>
        <p>ATS systems scan resumes for specific keywords and formatting. Your compatibility score indicates how well your resume will be parsed by these systems.</p>
        <div class="example-box">
            <div class="example-title">🔍 ATS Optimization Example:</div>
            <div class="example-content">
                <strong>Good:</strong> "Software Engineer with 5+ years of experience in React, Node.js, and Python"<br>
                <strong>Avoid:</strong> "Software Engineer | 5+ yrs exp | React/Node.js/Python"<br>
                <em>ATS systems prefer full words over abbreviations and symbols.</em>
            </div>
        </div>
        ${data.missingKeywords.length > 0 ? `
        <div class="section-title">Missing Keywords to Consider:</div>
        <div style="margin: 10px 0;">
            ${data.missingKeywords.map((k: string) => `<span class="keyword">${k}</span>`).join('')}
        </div>
        ` : ''}
    </div>
    
    <div class="step step-3">
        <div class="step-header">
            <div class="step-number">3</div>
            <div class="step-title">Strengths Analysis</div>
        </div>
        ${data.strengths.map((s: string) => `
        <div class="strength">
            <strong>✓ ${s}</strong>
            <div class="example-box">
                <div class="example-title">💡 Why this matters:</div>
                <div class="example-content">This aspect of your resume is well-executed and contributes positively to your overall score. Continue leveraging this strength in future applications.</div>
            </div>
        </div>
        `).join('')}
    </div>
    
    <div class="step step-4">
        <div class="step-header">
            <div class="step-number">4</div>
            <div class="step-title">Areas for Improvement</div>
        </div>
        ${data.improvements.map((i: string) => `
        <div class="improvement">
            <strong>→ ${i}</strong>
            <div class="example-box">
                <div class="example-title">🛠️ How to improve:</div>
                <div class="example-content">Focus on this area to improve your resume's effectiveness and increase your chances of landing interviews. Consider specific examples and quantifiable achievements.</div>
            </div>
        </div>
        `).join('')}
    </div>
    
    <div class="step step-5">
        <div class="step-header">
            <div class="step-number">5</div>
            <div class="step-title">Detailed Feedback</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="example-box">
                <div class="example-title">📋 Structure</div>
                <div class="example-content">${data.detailedFeedback.structure}</div>
            </div>
            <div class="example-box">
                <div class="example-title">📝 Content</div>
                <div class="example-content">${data.detailedFeedback.content}</div>
            </div>
            <div class="example-box">
                <div class="example-title">🎨 Formatting</div>
                <div class="example-content">${data.detailedFeedback.formatting}</div>
            </div>
            <div class="example-box">
                <div class="example-title">🔑 Keywords</div>
                <div class="example-content">${data.detailedFeedback.keywords}</div>
            </div>
        </div>
    </div>
    
    <div class="step step-6">
        <div class="step-header">
            <div class="step-number">6</div>
            <div class="step-title">Actionable Recommendations</div>
        </div>
        ${data.recommendations.map((r: string, i: number) => `
        <div class="example-box">
            <div class="example-title">💡 Recommendation ${i + 1}:</div>
            <div class="example-content"><strong>${r}</strong><br><br>Implement this recommendation to enhance your resume's impact and effectiveness. Consider how this applies specifically to your target roles.</div>
        </div>
        `).join('')}
    </div>
    
    ${data.industryInsights ? `
    <div class="step step-7">
        <div class="step-header">
            <div class="step-number">7</div>
            <div class="step-title">Industry Insights</div>
        </div>
        <div class="example-box">
            <div class="example-title">🏢 Market Context:</div>
            <div class="example-content">${data.industryInsights}</div>
        </div>
    </div>
    ` : ''}
    
    <div class="step step-8">
        <div class="step-header">
            <div class="step-number">8</div>
            <div class="step-title">Next Steps</div>
        </div>
        ${data.nextSteps.map((s: string, i: number) => `
        <div class="example-box">
            <div class="example-title">📅 Step ${i + 1}:</div>
            <div class="example-content"><strong>${s}</strong><br><br>Follow this step to continue improving your resume and career prospects. Set a timeline for completion.</div>
        </div>
        `).join('')}
    </div>
    
    <div class="resources">
        <h3 style="color: #1f2937; margin-bottom: 20px;">📚 Report References & Resources</h3>
        <div class="resource-section">
            <div class="resource-title">ATS Optimization Resources</div>
            <ul class="resource-list">
                <li>Use standard section headers (Experience, Education, Skills)</li>
                <li>Avoid tables, columns, and graphics</li>
                <li>Use common fonts like Arial, Calibri, or Times New Roman</li>
                <li>Save as .docx or .pdf format</li>
                <li>Keep formatting simple and clean</li>
            </ul>
        </div>
        <div class="resource-section">
            <div class="resource-title">Content Best Practices</div>
            <ul class="resource-list">
                <li>Use action verbs to start bullet points</li>
                <li>Quantify achievements with numbers and percentages</li>
                <li>Tailor content to each job application</li>
                <li>Keep resume length to 1-2 pages maximum</li>
                <li>Include relevant keywords from job descriptions</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
  };

  const handleReset = () => {
    setResumeFile(null);
    setAnalysisResults(null);
    setShowDetailedReport(false);
    // Clear from localStorage
    localStorage.removeItem(STORAGE_KEYS.UPLOADED_RESUME);
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.RESUME_FILE);
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedAnalysis = loadFromStorage(STORAGE_KEYS.ANALYSIS_RESULTS, null);
    
    if (savedAnalysis) {
      setAnalysisResults(savedAnalysis);
    }
  }, []);

  const isProcessingResume = isAnalyzing || isAnalyzingResume;

  return (
    <>
      <Toaster toasts={toaster.toasts} onRemove={toaster.removeToast} />
      
      {/* Header with Status and Actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 mb-6 rounded-xl">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-rose-600" />
                  Resume Analyzer
        </h1>
                
                {/* Plan Status */}
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <div className="flex items-center px-2 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-xs font-medium">
                      <Award className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Premium Plan</span>
                      <span className="sm:hidden">Premium</span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      <span className="hidden sm:inline">Free Plan ({freeLeft} left)</span>
                      <span className="sm:hidden">Free ({freeLeft})</span>
                    </div>
            )}
          </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {analysisResults && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value as 'pdf' | 'json')}
                      className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white hover:border-rose-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors cursor-pointer font-medium shadow-sm"
                    >
                      <option value="pdf">📄 PDF Report</option>
                      <option value="json">📊 JSON Data</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all duration-200 cursor-pointer font-medium flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              )}
              {analysisResults && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer font-medium flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Results
                </button>
              )}
          {!isPremium && (
            <button
              onClick={() => setShowUpgrade(true)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-colors cursor-pointer font-medium"
            >
              Go Premium
            </button>
          )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload Card */}
        <div className="bg-white shadow rounded-xl border border-gray-100">
          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-rose-500" />
              Resume Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Upload your resume to receive comprehensive AI-powered feedback on strengths, areas for improvement, ATS optimization, and detailed recommendations to help you stand out.
            </p>

            <div className="space-y-5">
            <div>
                <p className="text-sm font-medium text-gray-800 mb-2">Upload resume</p>
                
                {!resumeFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-400 transition-colors">
              <input
                type="file"
                      accept=".pdf,.doc,.docx,.txt"
                onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-rose-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleReset}
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">ATS-optimized analysis</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Industry insights</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Detailed recommendations</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <p className="text-xs text-gray-600">Keyword optimization</p>
                  </div>
                </div>
            </div>

            <button
              onClick={handleAnalyzeResume}
                disabled={!resumeFile || isProcessingResume}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessingResume ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing resume...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                    Analyze Resume
                </>
              )}
            </button>
            </div>
          </div>
        </div>

        {/* Right: Results Card */}
        <div className="bg-white shadow rounded-xl border border-gray-100">
          <div className="px-5 py-5 sm:p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-rose-500" />
              Analysis Results
            </h3>

            {isProcessingResume ? (
              <div className="space-y-4">
                {/* Skeleton Animation */}
                <div className="relative">
                  <div className="w-full h-80 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Analyzing your resume...</p>
                    </div>
                  </div>
                </div>
                
                {/* Processing info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-center text-sm text-gray-600">
                    <p>AI is analyzing your resume for strengths, improvements, and ATS optimization</p>
                    <p className="text-xs mt-1">This may take a few moments...</p>
                  </div>
          </div>
              </div>
            ) : analysisResults ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Overall Score</h4>
                      <p className="text-sm text-gray-600">Based on ATS optimization and content quality</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-rose-600">{analysisResults.analysis.overall_score}</div>
                      <div className="text-sm text-gray-600">out of 100</div>
                    </div>
                  </div>
                </div>

                {/* ATS Analysis */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 text-blue-500 mr-2" />
                    ATS Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Compatibility Score</p>
                      <p className="text-2xl font-bold text-blue-600">{analysisResults.analysis.ats_analysis.compatibility_score}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Keyword Coverage</p>
                      <p className="text-2xl font-bold text-blue-600">{analysisResults.analysis.ats_analysis.keyword_coverage}%</p>
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
                    {analysisResults.analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysisResults.analysis.areas_for_improvement.map((improvement, i) => (
                      <li key={i} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Keywords */}
                {analysisResults.analysis.ats_analysis.missing_keywords.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.analysis.ats_analysis.missing_keywords.map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Industry Insights */}
                {analysisResults.analysis.industry_insights && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                      Industry Insights
                    </h4>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                      {analysisResults.analysis.industry_insights}
                    </p>
                  </div>
                )}

                {/* Next Steps */}
                {analysisResults.analysis.next_steps.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      Next Steps
                    </h4>
                    <ul className="space-y-1">
                      {analysisResults.analysis.next_steps.map((step, i) => (
                        <li key={i} className="flex items-start">
                          <Clock className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 rounded-lg bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center text-center">
                <FileText className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">Upload your resume and click "Analyze Resume" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Step-by-Step Report Section */}
      {analysisResults && (
        <div className="mt-8">
          <div className="bg-white shadow rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-rose-500" />
                  Detailed Step-by-Step Report
                </h3>
                <button
                  onClick={() => setShowDetailedReport(!showDetailedReport)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
                >
                  {showDetailedReport ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show Details
                    </>
                  )}
                </button>
              </div>
            </div>

            {showDetailedReport && (
              <div className="p-6 space-y-8">
                {/* Step 1: Overall Assessment */}
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Overall Assessment
                  </h4>
                  <div className="bg-rose-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Your resume scored</p>
                        <p className="text-3xl font-bold text-rose-600">{analysisResults.analysis.overall_score}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Based on ATS optimization and content quality</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    This score reflects how well your resume performs in both Applicant Tracking Systems (ATS) and human review processes. 
                    A score above 80 indicates excellent optimization, while scores below 70 suggest significant areas for improvement.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      📊 Score Interpretation for Your Resume
                    </h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span><strong>90-100:</strong> Excellent - Your resume stands out</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Top Tier</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span><strong>80-89:</strong> Good - Minor improvements needed</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Strong</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span><strong>70-79:</strong> Fair - Several areas need attention</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Needs Work</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span><strong>Below 70:</strong> Needs significant improvement</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Priority</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: ATS Analysis */}
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                    ATS Compatibility Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Compatibility Score</p>
                          <p className="text-2xl font-bold text-blue-600">{analysisResults.analysis.ats_analysis.compatibility_score}%</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Keyword Coverage</p>
                          <p className="text-2xl font-bold text-blue-600">{analysisResults.analysis.ats_analysis.keyword_coverage}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    ATS systems scan resumes for specific keywords and formatting. Your compatibility score indicates how well your resume 
                    will be parsed by these systems, while keyword coverage shows how well you've incorporated industry-relevant terms.
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                      🔍 ATS Optimization Examples for Your Resume
                    </h5>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-sm font-medium text-green-700 mb-1">✅ Good Format (ATS-Friendly):</div>
                        <div className="text-sm text-gray-700 italic">
                          "Software Engineer with 5+ years of experience in React, Node.js, and Python"
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="text-sm font-medium text-red-700 mb-1">❌ Avoid (ATS-Unfriendly):</div>
                        <div className="text-sm text-gray-700 italic">
                          "Software Engineer | 5+ yrs exp | React/Node.js/Python"
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Why:</strong> ATS systems prefer full words over abbreviations and symbols. Use standard section headers like "Experience" instead of "Work History".
                      </div>
                    </div>
                  </div>
                  
                  {analysisResults.analysis.ats_analysis.missing_keywords.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-800 mb-2">Missing Keywords to Consider for Your Industry:</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.analysis.ats_analysis.missing_keywords.map((keyword, i) => (
                          <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        💡 <strong>Tip:</strong> Include these keywords naturally in your experience descriptions and skills section.
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 3: Strengths Analysis */}
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Strengths Analysis
                  </h4>
                  <div className="space-y-3">
                    {analysisResults.analysis.strengths.map((strength, i) => (
                      <div key={i} className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{strength}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              This aspect of your resume is well-executed and contributes positively to your overall score.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-sm font-medium text-green-700 mb-2">💡 Why This Matters for Your Resume:</div>
                          <div className="text-sm text-gray-600">
                            This strength demonstrates your attention to detail and professional presentation. 
                            Continue leveraging this aspect in future applications and consider highlighting it in your cover letter.
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 4: Improvement Areas */}
                <div className="border-l-4 border-orange-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Areas for Improvement
                  </h4>
                  <div className="space-y-3">
                    {analysisResults.analysis.areas_for_improvement.map((improvement, i) => (
                      <div key={i} className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{improvement}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Focus on this area to improve your resume's effectiveness and increase your chances of landing interviews.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white rounded-lg p-3 border border-orange-200">
                          <div className="text-sm font-medium text-orange-700 mb-2">🛠️ How to Improve This in Your Resume:</div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div>
                              <strong>Before:</strong> "Worked on various projects and gained experience"
                            </div>
                            <div>
                              <strong>After:</strong> "Led development of 3 web applications using React and Node.js, resulting in 40% improved user engagement"
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              💡 <strong>Tip:</strong> Use specific numbers, action verbs, and quantifiable results to make your experience more compelling.
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 5: Detailed Feedback */}
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">5</span>
                    Detailed Feedback
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                        📋 Structure
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">{analysisResults.analysis.detailed_feedback.structure}</p>
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs font-medium text-purple-700 mb-1">Example Structure:</div>
                        <div className="text-xs text-gray-600">
                          • Contact Information<br/>
                          • Professional Summary<br/>
                          • Work Experience (most recent first)<br/>
                          • Education<br/>
                          • Skills<br/>
                          • Certifications (if applicable)
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                        📝 Content
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">{analysisResults.analysis.detailed_feedback.content}</p>
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs font-medium text-purple-700 mb-1">Content Example:</div>
                        <div className="text-xs text-gray-600">
                          "Developed and maintained 5+ web applications using React and Node.js, 
                          resulting in 30% faster load times and improved user satisfaction"
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                        🎨 Formatting
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">{analysisResults.analysis.detailed_feedback.formatting}</p>
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs font-medium text-purple-700 mb-1">Formatting Tips:</div>
                        <div className="text-xs text-gray-600">
                          • Use consistent font (Arial, Calibri)<br/>
                          • 10-12pt font size<br/>
                          • 1-inch margins<br/>
                          • Bullet points for achievements<br/>
                          • Bold section headers
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                        🔑 Keywords
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">{analysisResults.analysis.detailed_feedback.keywords}</p>
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs font-medium text-purple-700 mb-1">Keyword Strategy:</div>
                        <div className="text-xs text-gray-600">
                          • Use job description keywords<br/>
                          • Include industry-specific terms<br/>
                          • Add technical skills naturally<br/>
                          • Mention relevant tools/software
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 6: Recommendations */}
                <div className="border-l-4 border-indigo-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">6</span>
                    Actionable Recommendations
                  </h4>
                  <div className="space-y-3">
                    {analysisResults.analysis.recommendations.map((recommendation, i) => (
                      <div key={i} className="bg-indigo-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Lightbulb className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{recommendation}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Implement this recommendation to enhance your resume's impact and effectiveness.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white rounded-lg p-3 border border-indigo-200">
                          <div className="text-sm font-medium text-indigo-700 mb-2">💡 Implementation Example:</div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="bg-gray-50 rounded p-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">Action Steps:</div>
                              <div className="text-xs text-gray-600">
                                1. Review your current resume for this specific area<br/>
                                2. Research best practices for your industry<br/>
                                3. Make targeted improvements<br/>
                                4. Test with ATS tools or get feedback
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              ⏱️ <strong>Timeline:</strong> Complete within 1-2 weeks for maximum impact
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 7: Industry Insights */}
                {analysisResults.analysis.industry_insights && (
                  <div className="border-l-4 border-teal-500 pl-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">7</span>
                      Industry Insights
                    </h4>
                    <div className="bg-teal-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700">{analysisResults.analysis.industry_insights}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-200">
                      <div className="text-sm font-medium text-teal-700 mb-2">🏢 Industry Context for Your Resume:</div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>
                          <strong>Current Trends:</strong> Highlight skills that are in high demand in your industry
                        </div>
                        <div>
                          <strong>Market Position:</strong> Position your experience to align with current market needs
                        </div>
                        <div>
                          <strong>Competitive Advantage:</strong> Emphasize unique skills or experiences that set you apart
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          💡 <strong>Tip:</strong> Research recent job postings in your field to identify trending keywords and requirements.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 8: Next Steps */}
                <div className="border-l-4 border-gray-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">8</span>
                    Next Steps
                  </h4>
                  <div className="space-y-3">
                    {analysisResults.analysis.next_steps.map((step, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{step}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Follow this step to continue improving your resume and career prospects.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-sm font-medium text-gray-700 mb-2">📅 Implementation Plan:</div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="bg-blue-50 rounded p-2">
                                <div className="font-medium text-blue-700">Week 1:</div>
                                <div className="text-blue-600">Research and planning</div>
                              </div>
                              <div className="bg-green-50 rounded p-2">
                                <div className="font-medium text-green-700">Week 2:</div>
                                <div className="text-green-600">Implementation and testing</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              ⏱️ <strong>Priority:</strong> High - Complete this step to maximize your resume's effectiveness
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report References */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-gray-600" />
                    Report References & Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">ATS Optimization Resources</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use standard section headers (Experience, Education, Skills)</li>
                        <li>• Avoid tables, columns, and graphics</li>
                        <li>• Use common fonts like Arial, Calibri, or Times New Roman</li>
                        <li>• Save as .docx or .pdf format</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Content Best Practices</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use action verbs to start bullet points</li>
                        <li>• Quantify achievements with numbers and percentages</li>
                        <li>• Tailor content to each job application</li>
                        <li>• Keep resume length to 1-2 pages maximum</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showUpgrade && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md w-full border border-white/40 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Go Premium</h3>
            <p className="text-sm text-gray-800 mb-5">Resume analysis is a Premium feature. Upgrade to continue.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => (window.location.href = '/billing')}
                className="px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow cursor-pointer"
              >
                Upgrade now
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}