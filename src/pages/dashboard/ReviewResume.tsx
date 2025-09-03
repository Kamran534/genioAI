import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface AnalysisResults {
  score: number;
  strengths: string[];
  improvements: string[];
  atsScore: number;
  keywordMatches: number;
  missingKeywords: string[];
}

export default function ReviewResume() {
  const { user, isLoaded } = useUser();
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [freeLeft, setFreeLeft] = useState<number>(5);

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

  // Detect premium plan and initialize free quota for resume reviews
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
    if (!resumeText.trim()) return;
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

      {/* Top usage / upgrade bar */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <div className="text-sm text-gray-700 flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              Plan: {isPremium ? 'Premium' : 'Free'}
            </span>
            {!isPremium && (
              <span>
                Free reviews left: <span className="font-semibold">{freeLeft}</span>
              </span>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
            >
              Go Premium
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload Card */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="pt-8 pl-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-gray-900">Resume Review</h3>
          </div>
          <div className="p-5 space-y-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              Upload your resume to receive AI-powered feedback on strengths, areas to improve,
              and ATS keyword coverage. We’ll analyze structure, clarity, and impact so you can
              stand out.
            </p>
            <div>
              <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload Resume</label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleResumeUpload}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-400 file:text-white hover:file:bg-emerald-500 transition-colors cursor-pointer border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Supports PDF, PNG, JPG formats</p>
            </div>

            <button
              onClick={handleAnalyzeResume}
              disabled={!resumeText.trim() || isAnalyzing}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Review Resume
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Review Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results Card */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="pt-8 pl-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-gray-900">Analysis Results</h3>
          </div>
          <div className="p-5">
            {!analysisResults ? (
              <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-500">
                <FileText className="h-8 w-8 text-gray-400 mb-3" />
                Upload your resume and click "Review Resume" to get started
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Overall Score</h4>
                      <p className="text-sm text-gray-600">Based on ATS optimization and content quality</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-600">{analysisResults.score}</div>
                      <div className="text-sm text-gray-600">out of 100</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {analysisResults.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {analysisResults.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Analysis Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md w-full border border-white/40 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Go Premium</h3>
            <p className="text-sm text-gray-800 mb-5">Resume review is a Premium feature. Upgrade to continue.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => (window.location.href = '/billing')}
                className="px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow cursor-pointer"
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
