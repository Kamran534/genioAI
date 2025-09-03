import { useUser, Protect, UserButton } from '@clerk/clerk-react';
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
  Bell,
  Search
} from 'lucide-react';
import { useState } from 'react';
import NotLoggedIn from '../components/LoginRequired';

export default function Dashboard() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '#', icon: Home, current: true },
    { name: 'Write Article', href: '#', icon: PenTool, current: false },
    { name: 'Blog Titles', href: '#', icon: Hash, current: false },
    { name: 'Generate Images', href: '#', icon: ImageIcon, current: false },
    { name: 'Remove Background', href: '#', icon: Layers, current: false },
    { name: 'Remove Object', href: '#', icon: Scissors, current: false },
    { name: 'Review Resume', href: '#', icon: FileText, current: false },
  ];

  const stats = [
    { name: 'Total Articles', value: '24', change: '+4.75%', changeType: 'positive' },
    { name: 'Images Generated', value: '156', change: '+12.5%', changeType: 'positive' },
    { name: 'Active Projects', value: '8', change: '+2.1%', changeType: 'positive' },
    { name: 'Storage Used', value: '2.4 GB', change: '+0.8%', changeType: 'positive' },
  ];

  const recentActivity = [
    { id: 1, action: 'Created new article', time: '2 hours ago', type: 'article' },
    { id: 2, action: 'Generated 5 images', time: '4 hours ago', type: 'image' },
    { id: 3, action: 'Updated project settings', time: '1 day ago', type: 'settings' },
    { id: 4, action: 'Published article', time: '2 days ago', type: 'article' },
  ];

  return (
    <Protect
      fallback={<NotLoggedIn />}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-xl font-bold text-gray-900">GenioAI</h1>
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
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
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
            <div className="flex h-16 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">GenioAI</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
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

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1 items-center">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                <input
                  className="block h-10 w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Search..."
                />
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                </button>
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
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
                    <span className="ml-2 text-sm font-semibold leading-6 text-gray-900">
                      {user?.fullName || 'User'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Welcome back, {user?.firstName || 'User'}! Here's what's happening with your projects.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">📊</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stat.change}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {recentActivity.map((activity, activityIdx) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {activityIdx !== recentActivity.length - 1 ? (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    activity.type === 'article' ? 'bg-blue-500' :
                                    activity.type === 'image' ? 'bg-green-500' : 'bg-gray-500'
                                  }`}>
                                    {activity.type === 'article' ? '📝' : 
                                     activity.type === 'image' ? '🖼️' : '⚙️'}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-500">{activity.action}</p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    {activity.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Write Article</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Generate Image</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <Layers className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Remove Background</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Review Resume</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Protect>
  );
}
