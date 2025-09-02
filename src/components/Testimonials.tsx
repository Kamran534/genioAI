import { Heart, MessageCircle, Share2, Sparkles, Star } from 'lucide-react';
import client01 from "../assets/client 01.png";
import client02 from "../assets/client 02.png";
import client03 from "../assets/client 03.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Testimonials() {
  const items = [
    { 
      name: 'John Doe', 
      role: 'Marketing Director, TechCorp', 
      quote: 'GenioAI has revolutionized our content workflow. Quality is outstanding and we save hours weekly.',
      image: client01,
      likes: 24,
      comments: 8,
      rating: 5
    },
    { 
      name: 'Jane Smith', 
      role: 'Content Creator, TechCorp', 
      quote: 'Our creation process is effortless. The tools help produce high-quality content faster than before.',
      image: client02,
      likes: 31,
      comments: 12,
      rating: 5
    },
    { 
      name: 'David Lee', 
      role: 'Content Writer, TechCorp', 
      quote: 'It transformed our content process. We ship higher-quality content faster than ever.',
      image: client03,
      likes: 19,
      comments: 6,
      rating: 5
    },
    { 
      name: 'Emily Carter', 
      role: 'Social Media Manager, TechCorp', 
      quote: 'With GenioAI, our campaigns are more creative and engaging. It saves us tons of brainstorming time.',
      image: client01,
      likes: 27,
      comments: 10,
      rating: 5
    },
    { 
      name: 'Michael Brown', 
      role: 'Project Manager, TechCorp', 
      quote: 'GenioAI improved our team’s productivity significantly. Collaboration and content delivery are smoother than ever.',
      image: client02,
      likes: 22,
      comments: 7,
      rating: 5
    }
    
  ];

  return (
    <section id="testimonials" className="bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Loved by Creators</h2>
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-lg text-slate-600">Real stories from people using GenioAI to create faster.</p>
        </div>
        
        {/* Swiper Carousel Container */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="testimonials-swiper"
        >
          {items.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 h-full">
                {/* Header with profile */}
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={t.image} 
                    alt={`${t.name}, ${t.role} - testimonial photo`}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100"
                    loading="lazy"
                    width="48"
                    height="48"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">{t.name}</h4>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-slate-700 mb-4 leading-relaxed">
                  "{t.quote}"
                </blockquote>
                
                {/* Engagement stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{t.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{t.comments}</span>
                    </button>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
      
        
        {/* Custom Pagination */}
        <div className="swiper-pagination-custom flex justify-center gap-2 mt-6"></div>
      </div>
    </section>
  );
}


