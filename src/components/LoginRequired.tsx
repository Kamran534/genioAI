
import { SignInButton } from '@clerk/clerk-react';
import { Lock, ArrowRight, Home, RefreshCw } from 'lucide-react';

const NotLoggedIn = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.15),rgba(255,255,255,0)),radial-gradient(45%_45%_at_80%_20%,rgba(236,72,153,0.14),rgba(255,255,255,0))]" />
      
      <div className="relative text-center max-w-lg mx-auto">
        {/* Lock Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
          Welcome to your dashboard
        </h1>

        {/* Sub-heading */}
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Sign in to access your AI-powered tools and start creating amazing content.
        </p>

        {/* Sign In Button */}
        <div className="mb-8">
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              Sign In to Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </SignInButton>
        </div>

        {/* Features Preview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/40 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">What you'll get access to:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              AI Writing Tools
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Image Generation
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              Content Templates
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Community Gallery
            </div>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          <div className="hidden sm:block w-px h-4 bg-slate-300"></div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotLoggedIn;