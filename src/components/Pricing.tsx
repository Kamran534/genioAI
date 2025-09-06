import { Check, Star, Zap, Sparkles, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function Pricing() {
  const { user, isLoaded } = useUser();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  // Detect user's current plan
  useEffect(() => {
    if (!isLoaded) return;
    
    type Meta = { plan?: unknown; isPremium?: unknown; tier?: unknown; currentPlan?: unknown } | undefined;
    const pub = user?.publicMetadata as Meta;
    const unsafe = user?.unsafeMetadata as Meta;
    const norm = (v: unknown) => (v == null ? '' : String(v).toLowerCase().trim());
    const plan = norm(pub?.plan ?? unsafe?.plan ?? pub?.tier ?? unsafe?.tier ?? pub?.currentPlan ?? unsafe?.currentPlan);
    const flag = norm(pub?.isPremium ?? unsafe?.isPremium);
    const premium = ['premium', 'pro', 'paid', 'active'].includes(plan) || ['true', 'yes', '1'].includes(flag);
    
    setCurrentPlan(premium ? 'premium' : 'free');
  }, [isLoaded, user]);
  
  const plans = [
    { 
      name: 'Free', 
      price: '$0', 
      per: '', 
      description: 'Always free',
      icon: Star,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Title Generation',
        'Article Generation'
      ], 
      cta: currentPlan === 'free' ? 'Current Plan' : 'Subscribe',
      popular: false,
      isCurrent: currentPlan === 'free'
    },
    { 
      name: 'Premium', 
      price: isAnnual ? '$16' : '$20', 
      per: '/month', 
      description: 'Full access to all features',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Title Generation',
        'Article Generation',
        'Generate Images',
        'Remove Background',
        'Remove Object',
        'Resume Review'
      ], 
      cta: currentPlan === 'premium' ? 'Current Plan' : 'Subscribe',
      popular: true,
      isCurrent: currentPlan === 'premium'
    },
    { 
      name: 'Business', 
      price: 'Contact', 
      per: '', 
      description: 'Custom solutions for teams',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      features: [
        'Everything in Premium',
        'Custom AI Models',
        'Priority Support',
        'Team Collaboration',
        'Advanced Analytics',
        'API Access',
        'Custom Integrations'
      ], 
      cta: 'Contact Sales',
      popular: false,
      isCurrent: false
    },
  ];

  return (
    <section id="pricing" className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {isLoaded && user ? 'Your Plan' : 'Choose Your Plan'}
            </h2>
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
          </div>
          {isLoaded && user ? (
            <div className="space-y-2">
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl sm:max-w-2xl mx-auto px-4">
                You're currently on the <span className="font-semibold text-indigo-600">{currentPlan === 'premium' ? 'Premium' : 'Free'}</span> plan
              </p>
              <p className="text-sm text-slate-500 max-w-lg mx-auto px-4">
                {currentPlan === 'premium' 
                  ? 'You have access to all premium features. Upgrade to Business for team features.'
                  : 'Upgrade to Premium to unlock all features and unlimited usage.'
                }
              </p>
            </div>
          ) : (
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl sm:max-w-2xl mx-auto px-4">Start for free and scale as you grow. No hidden fees, cancel anytime.</p>
          )}
        </div>

        {/* Annual Billing Toggle - Only show for non-logged in users */}
        {(!isLoaded || !user) && (
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-4 bg-white rounded-2xl p-2 shadow-lg border border-slate-200">
              <span className={`px-4 py-2 text-sm font-medium transition-colors ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                  isAnnual ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`px-4 py-2 text-sm font-medium transition-colors ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Billed annually
              </span>
            </div>
          </div>
        )}

        {/* Current Plan Status for Logged-in Users */}
        {/* {isLoaded && user && (
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Plan Active</span>
              </div>
              <p className="text-sm text-green-700 text-center">
                You're enjoying all the benefits of your {currentPlan === 'premium' ? 'Premium' : 'Free'} plan
              </p>
            </div>
          </div>
        )} */}

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center gap-0 sm:gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={plan.name} 
                className="relative group animate-fade-in-up w-full max-w-sm mx-auto lg:w-84"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Popular Badge or Current Plan Badge */}
                {plan.isCurrent && isLoaded && user ? (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Current Plan
                    </div>
                  </div>
                ) : plan.popular && (!isLoaded || !user) ? (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                ) : null}
                
                {/* Card */}
                <div className={`relative rounded-2xl border ${plan.isCurrent && isLoaded && user ? 'border-orange-200' : plan.borderColor} ${plan.isCurrent && isLoaded && user ? 'bg-gradient-to-br from-orange-50 to-red-50' : plan.bgColor} p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col`}>
                  {/* Gradient overlay on hover or current plan */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.isCurrent && isLoaded && user ? 'from-orange-500 to-red-500' : plan.color} ${plan.isCurrent && isLoaded && user ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'} transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${plan.isCurrent && isLoaded && user ? 'from-orange-500 to-red-500' : plan.color} text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  
                  {/* Plan Info */}
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-xs sm:text-sm text-slate-500 ml-1">{plan.per}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li 
                        key={feature} 
                        className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300"
                        style={{ transitionDelay: `${featureIndex * 30}ms` }}
                      >
                        <div className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br ${plan.isCurrent && isLoaded && user ? 'from-orange-500 to-red-500' : plan.color} flex items-center justify-center mt-0.5`}>
                          <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <button 
                    className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 group-hover:scale-105 ${
                      plan.isCurrent && isLoaded && user
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md cursor-default'
                        : plan.popular && (!isLoaded || !user)
                        ? `bg-gradient-to-r ${plan.color} text-white shadow-md hover:shadow-lg cursor-pointer` 
                        : 'bg-white border border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                    disabled={plan.isCurrent && isLoaded && !!user}
                  >
                    {plan.isCurrent && isLoaded && user ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" />
                        {plan.cta}
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


