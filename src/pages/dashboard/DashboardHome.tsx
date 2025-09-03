import { 
  PenTool, 
  ImageIcon, 
  Layers,
  FileText,
  Crown,
  Clock,
  TrendingUp,
  CheckCircle,
  Grid3X3,
  List,
  ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardHome() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFlipped, setIsFlipped] = useState(false);

  // Account plan data
  const accountPlan = {
    name: 'Premium Plan',
    isPremium: true,
    features: [
      { name: 'Unlimited Articles', included: true },
      { name: 'AI Image Generation', included: true },
      { name: 'Background Removal', included: true },
      { name: 'Object Removal', included: true },
      { name: 'Resume Review', included: true },
      { name: 'Priority Support', included: true },
    ],
    usage: {
      articles: { used: 24, limit: 'Unlimited' },
      images: { used: 156, limit: 'Unlimited' },
      storage: { used: '2.4 GB', limit: '50 GB' }
    },
    nextBilling: '2024-02-15',
    price: '$29.99/month'
  };



  // Recent activities data
  const recentActivities = [
    { 
      id: 1, 
      title: 'Created "AI in Healthcare" article', 
      type: 'article', 
      time: '2 hours ago',
      icon: PenTool,
      status: 'completed'
    },
    { 
      id: 2, 
      title: 'Generated 5 product images', 
      type: 'image', 
      time: '4 hours ago',
      icon: ImageIcon,
      status: 'completed'
    },
    { 
      id: 3, 
      title: 'Removed background from 12 photos', 
      type: 'background', 
      time: '1 day ago',
      icon: Layers,
      status: 'completed'
    },
    { 
      id: 4, 
      title: 'Reviewed marketing resume', 
      type: 'resume', 
      time: '2 days ago',
      icon: FileText,
      status: 'completed'
    },
    { 
      id: 5, 
      title: 'Removed objects from 8 images', 
      type: 'object', 
      time: '3 days ago',
      icon: Layers,
      status: 'completed'
    },
    { 
      id: 6, 
      title: 'Published "Future of AI" article', 
      type: 'article', 
      time: '1 week ago',
      icon: PenTool,
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{
        __html: `
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `
      }} />
      {/* Top Row - Account Plan & Total Creations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Plan Card with Glassy Effect and Flip */}
        <div className="relative h-80 perspective-1000">
          <div 
            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front Side - Plan Details */}
            <div className="absolute inset-0 w-full h-full backface-hidden">
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl text-white p-6 h-full">
                {/* Glassy overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-xl"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md border border-white/30">
                        <Crown className="h-6 w-6 text-yellow-400" fill="currentColor" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{accountPlan.name}</h3>
                        <p className="text-white/90 text-sm font-medium">Active Plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{accountPlan.price}</p>
                      <p className="text-white/90 text-sm font-medium">Monthly</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-xl">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white/90 text-sm font-medium">Click to view details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side - User Card Details */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
              <div className="relative bg-gradient-to-br from-red-500 to-orange-500 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl text-white p-6 h-full">
                {/* Glassy overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-xl"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Card Details</h3>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                      <span className="text-xs font-bold">💳</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    {/* Card Number */}
                    <div>
                      <p className="text-white/60 text-xs mb-2">CARD NUMBER</p>
                      <p className="text-white font-mono text-lg tracking-wider">4532 1234 5678 9012</p>
                    </div>

                    {/* Card Holder Name */}
                    <div>
                      <p className="text-white/60 text-xs mb-1">CARD HOLDER</p>
                      <p className="text-white font-semibold text-sm">JOHN DOE</p>
                    </div>

                    {/* Expiry and CVV */}
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-white/60 text-xs mb-1">EXPIRES</p>
                        <p className="text-white font-mono text-sm">12/25</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-1">CVV</p>
                        <p className="text-white font-mono text-sm">123</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

                {/* ATM Style Creation Card */}
        <div className="relative h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl overflow-hidden">
            {/* Card Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Card Content */}
            <div className="relative z-10 p-6 h-full flex flex-col text-white">
              {/* Header */}
              <div className="flex items-center justify-between m4-6">
                <div>
                  <p className="text-white/60 text-sm font-medium">GENIO AI</p>
                  <p className="text-white/80 text-xs">CREATIVE CARD</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-4">
                  <p className="text-white/60 text-sm mb-2">TOTAL CREATIONS</p>
                  <p className="text-4xl font-bold tracking-wider">326</p>
                </div>

                {/* Creation Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">ARTICLES</span>
                    <span className="text-white font-mono text-lg">024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">IMAGES</span>
                    <span className="text-white font-mono text-lg">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">EDITS</span>
                    <span className="text-white font-mono text-lg">134</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs">VALID THRU</p>
                  <p className="text-white font-mono text-sm">12/25</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-4 bg-white/20 rounded-sm"></div>
                  <div className="w-6 h-4 bg-white/20 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Recent Activities Section */}
      
    </div>
    <div className="bg-white rounded-xl shadow-lg mt-10 ">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
              <p className="text-gray-500 text-sm">Your latest creative work</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">Completed</span>
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
