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
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center mt-10">
        <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
          Unleash your best work
          <br className="hidden sm:block" />
          <span className="text-indigo-600"> with AI that feels magical</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Write, design, and ship standout content in minutes—not hours. Smart tools, beautiful results.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button 
            className="px-5 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Start creating content with AI tools"
          >
            Start creating now
          </button>
          <button 
            className="px-5 py-3 rounded-md border border-slate-300 hover:bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Watch a demonstration of our AI tools"
          >
            Watch demo
          </button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            {/* Client images are imported from src/assets */}
            {[client01, client02, client03].map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Happy client ${index + 1} using GenioAI`}
                className="h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                loading="lazy"
                width="36"
                height="36"
              />
            ))}
          </div>
          <div className="text-sm text-slate-600">Trusted by 10k+ people</div>
        </div>
        
        {/* Company Logos Carousel */}
        <div className="mt-16">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              <div className="flex items-center space-x-12 whitespace-nowrap">
                {/* First set of logos */}
                <div className="flex items-center space-x-12">
                  {brands.map(({ name, Icon, textClass, badgeClass }) => (
                    <div key={`a-${name}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
                      <span className={`h-8 w-8 rounded-full grid place-content-center ${badgeClass}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={`text-2xl font-semibold ${textClass}`}>{name}</span>
                    </div>
                  ))}
                </div>
                {/* Duplicate set for seamless loop */}
                <div className="flex items-center space-x-12">
                  {brands.map(({ name, Icon, textClass, badgeClass }) => (
                    <div key={`b-${name}`} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
                      <span className={`h-8 w-8 rounded-full grid place-content-center ${badgeClass}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={`text-2xl font-semibold ${textClass}`}>{name}</span>
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


