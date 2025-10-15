import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from '../utils/animations';
import { Lock, Mail, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username: email, password });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-theme-primary">

      {/* Top Bar with Back, Language & Theme */}
      <motion.div
        className="absolute top-8 left-8 right-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t('nav.backToHome')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </motion.div>

      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo & Header */}
        <motion.div variants={staggerItem} className="text-center">
          <motion.div
            className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg mb-6"
            variants={scaleIn}
          >
            <ShieldCheck className="text-white" size={40} />
          </motion.div>

          <h2 className="text-4xl font-display font-bold text-theme-primary">
            {t('auth.welcomeBack')}
          </h2>
          <p className="mt-2 text-theme-secondary">
            {t('auth.signInToDashboard')}
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={staggerItem}
          className="card backdrop-blur-md rounded-2xl shadow-strong p-8"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <Lock size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-theme-primary">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="text-slate-400" size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  placeholder={t('auth.enterEmail')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-theme-primary">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="text-slate-400" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                  placeholder={t('auth.enterPassword')}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>{t('auth.signingIn')}</span>
                </div>
              ) : (
                t('auth.signIn')
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          variants={fadeInUp}
          className="text-center text-sm card backdrop-blur-sm px-6 py-4 rounded-xl text-theme-secondary"
        >
          <p className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-primary-400" />
            Secure admin access only
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
