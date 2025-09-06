import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignInButton, useUser } from '@clerk/clerk-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-2 sm:top-4 z-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/50 backdrop-blur-xl shadow-sm ring-1 ring-black/5 px-3 sm:px-4 lg:px-6 h-12 sm:h-14">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/genio_logo.png" alt="GenioAI" className="h-6 w-6 sm:h-7 sm:w-7 rounded" />
            <span className="font-semibold tracking-tight text-sm sm:text-base">GenioAI</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-sm">
              Beta
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/60 backdrop-blur px-2 py-1 border border-white/40 shadow-sm">
            {isSignedIn && (
              <button 
                onClick={() => navigate('/dashboard/community')}
                className="px-3 py-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
              >
                Community
              </button>
            )}
            <button 
              onClick={() => {
                document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              Tools
            </button>
            <button 
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => {
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5  cursor-pointer text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              Reviews
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {isSignedIn ? (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-3 sm:px-4 cursor-pointer py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full bg-white/60 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors"
                >
                  Dashboard
                </button>
                {/* <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 border-2 border-slate-200 hover:border-indigo-300 transition-colors",
                      userButtonPopoverCard: "shadow-lg border border-slate-200",
                      userButtonPopoverActionButton: "hover:bg-slate-50",
                      userButtonPopoverActionButtonText: "text-slate-700",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                /> */}
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow transition-colors">
                  Get started
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile CTA - Always show toggle button, and UserButton when signed in */}
          <div className="md:hidden flex items-center gap-2">
            {/* {isSignedIn && (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border-2 border-slate-200 hover:border-indigo-300 transition-colors",
                    userButtonPopoverCard: "shadow-lg border border-slate-200",
                    userButtonPopoverActionButton: "hover:bg-slate-50",
                    userButtonPopoverActionButtonText: "text-slate-700",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            )} */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Show for all users */}
        {isMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl border border-white/30 bg-white/90 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-4">
            <nav className="flex flex-col gap-2">
              {isSignedIn && (
                <button 
                  onClick={() => {
                    navigate('/dashboard/community');
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors text-left"
                >
                  Community
                </button>
              )}
              <button 
                onClick={() => {
                  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors text-left"
              >
                Tools
              </button>
              <button 
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors text-left"
              >
                Reviews
              </button>
              {isSignedIn && (
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors text-left"
                >
                  Dashboard
                </button>
              )}
              {!isSignedIn && (
                <div className="pt-2 border-t border-slate-200">
                  <SignInButton mode="modal">
                    <button className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      Get started
                    </button>
                  </SignInButton>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}


