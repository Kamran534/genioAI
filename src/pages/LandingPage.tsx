import Hero from '../components/Hero';
import ToolsGrid from '../components/ToolsGrid';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white text-slate-800">
      <Hero />
      <ToolsGrid />
      <Testimonials />
      <Pricing />
      <Newsletter />
      <Footer />
    </div>
  );
}
