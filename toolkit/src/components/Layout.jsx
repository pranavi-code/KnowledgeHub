import {
  Bell,
  Brain,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Upload,
  X,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload', icon: Upload },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/onboarding', label: 'Onboarding', icon: MapPin },
    { to: '/knowledge-paths', label: 'Knowledge Paths', icon: Brain },
    { to: '/ai', label: 'AI Assist', icon: Brain },
    { to: '/pulse', label: 'Weekly Pulse', icon: BarChart3 }
  ];

  const isWeeklyPage = location.pathname === '/pulse';

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                {isWeeklyPage ? (
                  <BarChart3 className="w-6 h-6 text-white" />
                ) : (
                  <Brain className="w-6 h-6 text-white" />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {isWeeklyPage ? 'Weekly Dashboard' : 'KnowledgeHub'}
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-blue-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Settings Link */}
              <NavLink to="/settings" className="p-2 rounded-lg hover:bg-blue-50" title="Settings">
                <Settings className="w-5 h-5 text-gray-600" />
              </NavLink>

              
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 flex flex-col gap-2 pb-4">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 rounded-lg ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-blue-50'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}

              {/* Mobile Right Actions */}
              <div className="flex flex-col gap-2 px-4 py-3">
                <button
                  onClick={() => {
                    document.documentElement.classList.toggle('dark');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-50"
                >
                  <Sun className="w-4 h-4 dark:hidden text-gray-600" />
                  <Moon className="w-4 h-4 hidden dark:block text-gray-600" />
                  Toggle Dark Mode
                </button>

                <NavLink
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  Settings
                </NavLink>

                <button
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <img
                    src="https://via.placeholder.com/24"
                    alt="Profile"
                    className="w-6 h-6 rounded-full"
                  />
                  Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
