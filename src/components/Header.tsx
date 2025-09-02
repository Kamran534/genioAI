import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-2 sm:top-4 z-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/50 backdrop-blur-xl shadow-sm ring-1 ring-black/5 px-3 sm:px-4 lg:px-6 h-12 sm:h-14">
          {/* Logo */}
          <a href="#" className="flex items-center gap-1.5 sm:gap-2">
            <img src="/genio_logo.png" alt="GenioAI" className="h-6 w-6 sm:h-7 sm:w-7 rounded" />
            <span className="font-semibold tracking-tight text-sm sm:text-base">GenioAI</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white/60 backdrop-blur px-2 py-1 border border-white/40 shadow-sm">
            <a href="#tools" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors">Tools</a>
            <a href="#pricing" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors">Pricing</a>
            <a href="#testimonials" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors">Reviews</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden sm:flex items-center gap-2">
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow transition-colors">
              Get started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-1.5 rounded-full hover:bg-white/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl border border-white/30 bg-white/90 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-4">
            <nav className="flex flex-col gap-2">
              <a 
                href="#tools" 
                className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tools
              </a>
              <a 
                href="#pricing" 
                className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#testimonials" 
                className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </a>
              <div className="pt-2 border-t border-slate-200">
                <button className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  Get started
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}


