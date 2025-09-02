import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
            <img src="/genio_logo.png" alt="GenioAI" className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
            <span className="text-xs sm:text-sm">© {new Date().getFullYear()} SterlingSoft. All rights reserved.</span>
          </div>
          
          {/* Contact */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <a 
              href="mailto:sterlingsoftco@gmail.com" 
              className="hover:text-white transition-colors duration-300 hover:underline text-xs sm:text-sm"
            >
              sterlingsoftco@gmail.com
            </a>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            Built with ❤️ by SterlingSoft • Empowering creators with AI tools
          </p>
        </div>
      </div>
    </footer>
  );
}


