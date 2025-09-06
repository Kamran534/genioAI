import client01 from "../assets/client 01.png";
import client02 from "../assets/client 02.png";
import client03 from "../assets/client 03.png";
import Header from "./Header";
import { Bot, Atom, Brain, Search, Palette, Smile } from "lucide-react";

export default function Hero() {
  const brands = [
    { name: "OpenAI", Icon: Bot, textClass: "brand-openai-text", badgeClass: "brand-openai-badge" },
    { name: "Gemini", Icon: Atom, textClass: "brand-gemini-text", badgeClass: "brand-gemini-badge" },
    { name: "Grok", Icon: Brain, textClass: "brand-grok-text", badgeClass: "brand-grok-badge" },
    { name: "DeepSeek", Icon: Search, textClass: "brand-deepseek-text", badgeClass: "brand-deepseek-badge" },
    { name: "Canva", Icon: Palette, textClass: "brand-canva-text", badgeClass: "brand-canva-badge" },
    { name: "Hugging Face", Icon: Smile, textClass: "brand-huggingface-text", badgeClass: "brand-huggingface-badge" },
  ];
  return (
    <section className="relative overflow-hidden" role="banner" aria-labelledby="hero-heading">
      <Header />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.15),rgba(255,255,255,0)),radial-gradient(45%_45%_at_80%_20%,rgba(236,72,153,0.14),rgba(255,255,255,0))]" />
      <div className="relative mx-auto max-w-5xl px-3 sm:px-4 lg:px-8 py-12 sm:py-14 lg:py-14 text-center mt-6 sm:mt-8 lg:mt-2">
        {/* Beta Version Capsule */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-full shadow-sm mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-indigo-700">Beta Version</span>
          </div>
          <div className="w-px h-4 bg-indigo-200"></div>
          <span className="text-xs text-indigo-600">Early Access</span>
        </div>

        <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
          Unleash your best work
          <br className="hidden sm:block" />
          <span className="text-indigo-600"> with AI that feels magical</span>
        </h1>
        <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl sm:max-w-2xl mx-auto px-2">
          Write, design, and ship standout content in minutes—not hours. Smart tools, beautiful results.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <button 
            className="w-full sm:w-auto px-6 sm:px-5 py-3 rounded-lg sm:rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            aria-label="Start creating content with AI tools"
          >
            Start creating now
          </button>
          <button 
            className="w-full sm:w-auto px-6 sm:px-5 py-3 rounded-lg sm:rounded-md border border-slate-300 hover:bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            aria-label="Watch a demonstration of our AI tools"
          >
            Watch demo
          </button>
        </div>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="flex -space-x-2 sm:-space-x-3">
            {/* Client images are imported from src/assets */}
            {[client01, client02, client03].map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Happy client ${index + 1} using GenioAI`}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                loading="lazy"
                width="36"
                height="36"
              />
            ))}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">Trusted by 10k+ people</div>
        </div>
        
        {/* Company Logos Carousel */}
        <div className="mt-12 sm:mt-16">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              <div className="flex items-center space-x-6 sm:space-x-8 lg:space-x-12 whitespace-nowrap">
                {/* First set of logos */}
                <div className="flex items-center space-x-6 sm:space-x-8 lg:space-x-12">
                  {brands.map(({ name, Icon, textClass, badgeClass }) => (
                    <div key={`a-${name}`} className="flex items-center gap-1.5 sm:gap-2 opacity-80 hover:opacity-100 transition">
                      <span className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full grid place-content-center ${badgeClass}`}>
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      </span>
                      <span className={`text-lg sm:text-xl lg:text-2xl font-semibold ${textClass}`}>{name}</span>
                    </div>
                  ))}
                </div>
                {/* Duplicate set for seamless loop */}
                <div className="flex items-center space-x-6 sm:space-x-8 lg:space-x-12">
                  {brands.map(({ name, Icon, textClass, badgeClass }) => (
                    <div key={`b-${name}`} className="flex items-center gap-1.5 sm:gap-2 opacity-80 hover:opacity-100 transition">
                      <span className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full grid place-content-center ${badgeClass}`}>
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      </span>
                      <span className={`text-lg sm:text-xl lg:text-2xl font-semibold ${textClass}`}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


