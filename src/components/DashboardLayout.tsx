import { useUser, UserButton, Protect } from '@clerk/clerk-react';
import { 
  Home,
  PenTool, 
  Hash,
  Image as ImageIcon, 
  Layers,
  Scissors,
  FileText,
  Menu,
  X,
  Users,
  Crown
} from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import NotLoggedIn from './LoginRequired';

export default function DashboardLayout() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, gradient: 'from-blue-500 to-cyan-500', premium: false },
    { name: 'Write Article', href: '/dashboard/write-article', icon: PenTool, gradient: 'from-purple-500 to-pink-500', premium: false },
    { name: 'Blog Titles', href: '/dashboard/blog-titles', icon: Hash, gradient: 'from-green-500 to-emerald-500', premium: false },
    { name: 'Generate Images', href: '/dashboard/generate-images', icon: ImageIcon, gradient: 'from-orange-500 to-red-500', premium: true },
    { name: 'Remove Background', href: '/dashboard/remove-background', icon: Layers, gradient: 'from-indigo-500 to-purple-500', premium: true },
    { name: 'Remove Object', href: '/dashboard/remove-object', icon: Scissors, gradient: 'from-teal-500 to-blue-500', premium: true },
    { name: 'Review Resume', href: '/dashboard/review-resume', icon: FileText, gradient: 'from-rose-500 to-pink-500', premium: true },
    { name: 'Community', href: '/dashboard/community', icon: Users, gradient: 'from-violet-500 to-purple-500', premium: false },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const getCurrentPageInfo = () => {
    const currentPath = location.pathname;
    const currentNav = navigation.find(item => {
      if (item.href === '/dashboard') {
        return currentPath === '/dashboard';
      }
      return currentPath.startsWith(item.href);
    });
    return currentNav || { name: 'Dashboard', icon: Home, premium: false };
  };

  const getGradientClasses = (gradient: string) => {
    const gradientMap: { [key: string]: string } = {
      'from-blue-500 to-cyan-500': 'hover:from-blue-500 hover:to-cyan-500',
      'from-purple-500 to-pink-500': 'hover:from-purple-500 hover:to-pink-500',
      'from-green-500 to-emerald-500': 'hover:from-green-500 hover:to-emerald-500',
      'from-orange-500 to-red-500': 'hover:from-orange-500 hover:to-red-500',
      'from-indigo-500 to-purple-500': 'hover:from-indigo-500 hover:to-purple-500',
      'from-teal-500 to-blue-500': 'hover:from-teal-500 hover:to-blue-500',
      'from-rose-500 to-pink-500': 'hover:from-rose-500 hover:to-pink-500',
      'from-violet-500 to-purple-500': 'hover:from-violet-500 hover:to-purple-500'
    };
    return gradientMap[gradient] || 'hover:from-gray-500 hover:to-gray-600';
  };

  return (
    <Protect
      fallback={<NotLoggedIn />}
    >
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-2">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src="/genio_logo.png" alt="GenioAI" className="h-10 w-10 rounded" />
              <span className="text-2xl font-bold text-gray-900">GenioAI</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `text-gray-600 hover:bg-gradient-to-r ${getGradientClasses(item.gradient)} hover:text-white hover:shadow-lg`
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center w-full">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.premium && (
                      <Crown className="h-4 w-4 text-yellow-500 ml-auto flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 border-2 border-gray-200 hover:border-indigo-300 transition-colors",
                      userButtonPopoverCard: "shadow-lg border border-gray-200",
                      userButtonPopoverActionButton: "hover:bg-gray-50",
                      userButtonPopoverActionButtonText: "text-gray-700",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 mt-2">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src="/genio_logo.png" alt="GenioAI" className="h-10 w-10 rounded" />
              <span className="text-2xl font-bold text-gray-800">GenioAI</span>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `text-gray-600 hover:bg-gradient-to-r ${getGradientClasses(item.gradient)} hover:text-white hover:shadow-lg`
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                >
                  <div className="flex items-center w-full">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.premium && (
                      <Crown className="h-4 w-4 text-yellow-500 ml-auto flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 border-2 border-gray-200 hover:border-indigo-300 transition-colors",
                        userButtonPopoverCard: "shadow-lg border border-gray-200",
                        userButtonPopoverActionButton: "hover:bg-gray-50",
                        userButtonPopoverActionButtonText: "text-gray-700",
                        userButtonPopoverFooter: "hidden"
                      }
                    }}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between px-2">        
            {/* Page Title with Icon */}
            <div className="flex items-center gap-3">
              {(() => {
                const currentPage = getCurrentPageInfo();
                const IconComponent = currentPage.icon;
                return (
                  <>
                    <IconComponent className="h-6 w-6 text-indigo-600" />
                    <h1 className="text-xl font-semibold text-gray-900">{currentPage.name}</h1>
                    {currentPage.premium && (
                      <Crown className="h-5 w-5 text-yellow-500" fill="currentColor" />
                    )}
                  </>
                );
              })()}
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-2">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 border-2 border-gray-200 hover:border-indigo-300 transition-colors",
                      userButtonPopoverCard: "shadow-lg border border-gray-200",
                      userButtonPopoverActionButton: "hover:bg-gray-50",
                      userButtonPopoverActionButtonText: "text-gray-700",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
                <span className="hidden lg:flex lg:items-center">
                  <button 
                    onClick={() => {
                      // Trigger the UserButton click programmatically
                      const userButton = document.querySelector('[data-clerk-user-button]') as HTMLElement;
                      if (userButton) {
                        userButton.click();
                      }
                    }}
                    className="ml-2 text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {user?.fullName || 'User'}
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </Protect>
  );
}
