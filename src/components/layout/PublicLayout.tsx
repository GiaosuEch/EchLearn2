import { Outlet, Link, useLocation } from 'react-router';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Languages', path: '/languages' },
    { label: 'IELTS', path: '/ielts-program' },
    { label: 'Community', path: '/community-preview' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">🐸</span>
              <span className="text-xl font-bold text-gradient">Ech Lern</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200
                    ${location.pathname === link.path
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25">
                Start Free
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-dark-400">
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-dark-700/30 bg-dark-900/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-dark-700 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-center rounded-xl text-dark-300 border border-dark-600 hover:bg-dark-800">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-center rounded-xl bg-primary-500 text-white font-semibold">
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🐸</span>
                <span className="font-bold text-gradient">Ech Lern</span>
              </div>
              <p className="text-sm text-dark-400">Jump into every language. Learn, play, and grow with AI-powered tools and a global community.</p>
            </div>
            <div>
              <h4 className="font-semibold text-dark-200 mb-3">Product</h4>
              <div className="space-y-2 text-sm text-dark-400">
                <Link to="/languages" className="block hover:text-primary-400 transition-colors">Languages</Link>
                <Link to="/ielts-program" className="block hover:text-primary-400 transition-colors">IELTS Program</Link>
                <Link to="/pricing" className="block hover:text-primary-400 transition-colors">Pricing</Link>
                <Link to="/about" className="block hover:text-primary-400 transition-colors">About Us</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-dark-200 mb-3">Features</h4>
              <div className="space-y-2 text-sm text-dark-400">
                <p className="hover:text-primary-400 cursor-pointer transition-colors">AI Speaking Coach</p>
                <p className="hover:text-primary-400 cursor-pointer transition-colors">AI Writing Feedback</p>
                <p className="hover:text-primary-400 cursor-pointer transition-colors">Study Groups</p>
                <p className="hover:text-primary-400 cursor-pointer transition-colors">Voice Rooms</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-dark-200 mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-dark-400">
                <p className="hover:text-primary-400 cursor-pointer transition-colors">Privacy Policy</p>
                <p className="hover:text-primary-400 cursor-pointer transition-colors">Terms of Service</p>
                <p className="hover:text-primary-400 cursor-pointer transition-colors">Cookie Policy</p>
                <p className="hover:text-primary-400 cursor-pointer transition-colors">Contact Us</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-500">© 2025 Ech Lern. All rights reserved.</p>
            <p className="text-sm text-dark-500">Made with 🐸 for language learners worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
