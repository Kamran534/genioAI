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
    <section id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-indigo-600" />
          <h2 className="text-5xl font-semibold tracking-tight">Powerful AI Tools</h2>
          <Sparkles className="h-8 w-8 text-indigo-600" />
        </div>
        <p className="text-slate-600">Everything you need to create, enhance, and optimize your content.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={card.title} 
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-12 w-12 rounded-lg ${card.bgColor} ${card.color} grid place-content-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold group-hover:text-indigo-600 transition-colors duration-300">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">{card.desc}</p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Try it now →
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


