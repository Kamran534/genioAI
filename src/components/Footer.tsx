import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-slate-300">
            <img src="/genio_logo.png" alt="GenioAI" className="h-6 w-6 rounded" />
            <span>© {new Date().getFullYear()} SterlingSoft. All rights reserved.</span>
          </div>
          
          {/* Contact */}
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="h-4 w-4" />
            <a 
              href="mailto:sterlingsoftco@gmail.com" 
              className="hover:text-white transition-colors duration-300 hover:underline"
            >
              sterlingsoftco@gmail.com
            </a>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            Built with ❤️ by SterlingSoft • Empowering creators with AI tools
          </p>
        </div>
      </div>
    </footer>
  );
}


