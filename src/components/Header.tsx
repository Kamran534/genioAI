export default function Header() {
  return (
    <header className="sticky top-4 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/50 backdrop-blur-xl shadow-sm ring-1 ring-black/5 px-4 sm:px-6 h-14">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img src="/genio_logo.png" alt="GenioAI" className="h-7 w-7 rounded" />
            <span className="font-semibold tracking-tight">GenioAI</span>
          </a>

          {/* Nav - capsule center on md+ */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/60 backdrop-blur px-2 py-1 border border-white/40 shadow-sm">
            <a href="#tools" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white">Tools</a>
            <a href="#pricing" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white">Pricing</a>
            <a href="#testimonials" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded-full hover:bg-white">Reviews</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow">Get started</button>
          </div>
        </div>
      </div>
    </header>
  );
}


