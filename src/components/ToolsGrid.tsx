import { 
  PenTool, 
  Type, 
  Image, 
  Scissors, 
  Eraser, 
  FileText,
  Sparkles
} from 'lucide-react';

export default function ToolsGrid() {
  const cards = [
    { 
      title: 'AI Article Writer', 
      desc: 'Generate high-quality, engaging articles on any topic.',
      icon: PenTool,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Blog Title Generator', 
      desc: 'Find the perfect, catchy title for your blog posts.',
      icon: Type,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'AI Image Generation', 
      desc: 'Create stunning visuals with our AI image generation.',
      icon: Image,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Background Removal', 
      desc: 'Effortlessly remove backgrounds from your images.',
      icon: Scissors,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      title: 'Object Removal', 
      desc: 'Remove unwanted objects from your images seamlessly.',
      icon: Eraser,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      title: 'Resume Reviewer', 
      desc: 'Get your resume reviewed by AI to improve your chances.',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
  ];

  return (
    <section id="tools" className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Powerful AI Tools</h2>
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
        </div>
        <p className="text-sm sm:text-base text-slate-600 px-4">Everything you need to create, enhance, and optimize your content.</p>
      </div>
      <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={card.title} 
              className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${card.bgColor} ${card.color} grid place-content-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold group-hover:text-indigo-600 transition-colors duration-300">{card.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300 leading-relaxed">{card.desc}</p>
              <div className="mt-3 sm:mt-4 flex items-center text-indigo-600 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Try it now →
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


