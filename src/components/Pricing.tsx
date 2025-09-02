import { Check, Star, Zap, Sparkles, Crown } from 'lucide-react';
import { useState } from 'react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  
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
      cta: 'Subscribe',
      popular: false
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
      cta: 'Subscribe',
      popular: true
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
      popular: false
    },
  ];

  return (
    <section id="pricing" className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Choose Your Plan</h2>
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Start for free and scale as you grow. No hidden fees, cancel anytime.</p>
        </div>

        {/* Annual Billing Toggle */}
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

        {/* Pricing Cards */}
        <div className="flex justify-center gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={plan.name} 
                className="relative group animate-fade-in-up w-72"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {/* Card */}
                <div className={`relative rounded-2xl border ${plan.borderColor} ${plan.bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  {/* Plan Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-sm text-slate-500 ml-1">{plan.per}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li 
                        key={feature} 
                        className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300"
                        style={{ transitionDelay: `${featureIndex * 30}ms` }}
                      >
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mt-0.5`}>
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <button className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 group-hover:scale-105 cursor-pointer ${
                    plan.popular 
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-md hover:shadow-lg` 
                      : 'bg-white border border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                    {plan.cta}
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


