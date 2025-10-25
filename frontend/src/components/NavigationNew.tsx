import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

export const NavigationNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Update scroll state for background opacity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <motion.nav
        className="container mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
          {/* Logo - Enhanced */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Githaforge
              </span>
              <p className="text-xs text-theme-muted -mt-1">AI Chatbot Builder</p>
            </div>
          </Link>

          {/* Desktop Menu - Modern Design */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 group"
              >
                <span
                  className={`relative z-10 font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {item.label}
                </span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side - Enhanced */}
          <div className="flex items-center gap-3">
            {/* Theme & Language */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => navigate('/login')}
                className="font-medium"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-medium"
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-theme-secondary transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-theme-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-theme-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Modern Slide-in Design */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-theme-primary border-l border-theme shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-display font-bold text-theme-primary">
                      Githaforge
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-theme-secondary transition-colors"
                  >
                    <X className="w-6 h-6 text-theme-primary" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-2 mb-8">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                          isActive(item.path)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                            : 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Theme & Language */}
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-theme">
                  <div className="flex-1">
                    <p className="text-xs text-theme-muted mb-2">Appearance</p>
                    <ThemeToggle />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-theme-muted mb-2">Language</p>
                    <LanguageSelector />
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    Get Started Free
                  </Button>
                </div>

                {/* Mobile Footer */}
                <div className="mt-8 pt-8 border-t border-theme">
                  <p className="text-xs text-center text-theme-muted">
                    © 2025 Githaforge. All rights reserved.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </motion.nav>
    </div>
  );
};
