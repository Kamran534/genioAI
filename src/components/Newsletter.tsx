import { Mail, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useSubscribeToNewsletterMutation } from '../services/api';
import { validateNewsletterForm, sanitizeEmail, isRateLimited, setRateLimit } from '../utils/validation';
import type { FormErrors } from '../utils/validation';
import type { NewsletterState } from '../types';

export default function Newsletter() {
  const [subscribeToNewsletter, { isLoading: isSubscribing }] = useSubscribeToNewsletterMutation();
  
  const [state, setState] = useState<NewsletterState>({
    email: '',
    isSubscribed: false,
    isLoading: false,
    error: null
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setErrors({});
    setState(prev => ({ ...prev, error: null }));
    
    // Validate form
    const validationErrors = validateNewsletterForm(state.email);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Check rate limiting
    if (isRateLimited()) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please wait a moment before submitting again.' 
      }));
      return;
    }
    
    // Sanitize email
    sanitizeEmail(state.email);
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Call the real newsletter subscription API
      const response = await subscribeToNewsletter({
        email: state.email,
        preferences: {
          frequency: 'weekly'
        }
      }).unwrap();
      
      if (response.success) {
        // Set rate limit
        setRateLimit();
        
        setState(prev => ({ 
          ...prev, 
          isSubscribed: true, 
          isLoading: false,
          email: '' 
        }));
        
        // Reset success state after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, isSubscribed: false }));
        }, 5000);
      } else {
        throw new Error(response.message || 'Failed to subscribe');
      }
      
    } catch (error: any) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (errorMessage.includes('already subscribed')) {
        errorMessage = 'This email is already subscribed to our newsletter.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage 
      }));
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-4xl px-3 sm:px-4 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 sm:mb-6 shadow-lg">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Stay Updated</h2>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
          </div>
          
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto px-4">
            Get the latest AI tools, tips, and exclusive content delivered to your inbox. 
            Join thousands of creators who are already ahead of the curve.
          </p>
          
          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-sm sm:max-w-md mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 shadow-sm transition-colors text-sm sm:text-base ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  aria-label="Email address"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                />
                {errors.email && (
                  <div id="email-error" className="mt-1 flex items-center gap-1 text-red-600 text-xs sm:text-sm">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    {errors.email}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={state.isLoading || isSubscribing || state.isSubscribed}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                aria-label="Subscribe to newsletter"
              >
                {(state.isLoading || isSubscribing) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : state.isSubscribed ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Error Message */}
          {state.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {state.error}
            </div>
          )}
          
          {/* Success Message */}
          {state.isSubscribed && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
              🎉 Welcome to our community! Check your email for confirmation.
            </div>
          )}
          
          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-slate-500 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
              <span>Unsubscribe anytime</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
              <span>10k+ subscribers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
