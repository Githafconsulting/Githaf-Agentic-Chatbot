import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChatWidget } from '../components/chat/ChatWidget';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { staggerContainer, staggerItem, fadeInUp } from '../utils/animations';
import { Bot, Zap, Brain, Clock, Shield, MessageCircle, ArrowRight, Target, Sparkles, Database, Languages, Search } from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const chatWidgetRef = useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    const chatWidget = document.querySelector('.chat-widget-container') as HTMLElement;
    if (chatWidget) {
      chatWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Open the chat widget after scrolling
      setTimeout(() => {
        const chatButton = document.querySelector('[data-chat-toggle]') as HTMLButtonElement;
        chatButton?.click();
      }, 600);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Video Background Hero Section */}
      <div className="relative min-h-screen">
        {/* Video Background (Placeholder - replace with actual video) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950"></div>
          {/* Animated Grid Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full" style={{
              backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}></div>
          </div>
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"
            animate={{
              x: [0, -80, 0],
              y: [0, 80, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>

        {/* Top Navigation Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(51, 65, 85, 0.5)',
          }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot size={32} className="text-blue-400" />
              <span className="text-xl font-bold text-white">Githaf AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-32 mt-16 min-h-screen flex items-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div variants={staggerItem} className="mb-6 inline-flex">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-lg">
                <Sparkles size={16} className="animate-pulse" />
                Powered by Advanced AI & RAG Technology
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight text-white"
            >
              Your Intelligent{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Support Assistant
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={staggerItem}
              className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-blue-100"
            >
              Get instant, accurate answers 24/7. Our AI chatbot uses cutting-edge RAG technology to provide context-aware support powered by your knowledge base.
            </motion.p>

            {/* CTA Section */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.button
                onClick={scrollToChat}
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={20} />
                Try the AI Assistant
                <ArrowRight size={20} />
              </motion.button>

              <motion.a
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg rounded-xl border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Admin Dashboard
              </motion.a>
            </motion.div>

            {/* Chat Hint */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-blue-400/30 bg-blue-500/10"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Bot size={18} className="text-blue-400" />
              </motion.div>
              <span className="text-sm text-blue-200">Click below to start chatting with our AI</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <motion.div
        className="py-20 relative"
        style={{ backgroundColor: 'var(--bg-primary)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How Our AI Assistant Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              A sophisticated RAG (Retrieval-Augmented Generation) pipeline that delivers accurate, context-aware responses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: MessageCircle, title: 'You Ask', desc: 'Type your question in natural language' },
              { step: '2', icon: Search, title: 'AI Searches', desc: 'Semantic search finds relevant information' },
              { step: '3', icon: Brain, title: 'AI Processes', desc: 'LLM generates contextual response' },
              { step: '4', icon: Zap, title: 'You Receive', desc: 'Get accurate answer in seconds' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="relative"
              >
                <motion.div
                  className="rounded-2xl p-6 h-full border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                  whileHover={{ y: -8, boxShadow: 'var(--shadow-medium)' }}
                >
                  <div className="text-5xl font-bold text-blue-500 mb-4 opacity-20">{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <item.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </motion.div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-400">
                    <ArrowRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Features Section */}
      <motion.div
        className="py-20"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerItem} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Why Choose Our AI Assistant
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Cutting-edge technology meets intuitive design for exceptional customer support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                custom={index}
                className="group"
              >
                <motion.div
                  className="rounded-2xl p-8 h-full border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                  whileHover={{ y: -8, boxShadow: 'var(--shadow-medium)' }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-md"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="text-white" size={28} />
                  </motion.div>

                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>

                  <motion.div
                    className="mt-6 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="py-20"
        style={{ backgroundColor: 'var(--bg-primary)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-8 lg:p-16 shadow-strong relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {aiStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="space-y-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="w-12 h-12 mx-auto bg-white/20 rounded-xl flex items-center justify-center mb-2">
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <motion.div
                    className="text-4xl lg:text-5xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-blue-100 font-semibold text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trusted By Section */}
      <motion.div
        className="py-12"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={staggerItem}>
            <p className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Trusted By</p>
            <div className="flex items-center justify-center gap-3">
              <Target size={32} className="text-pink-500" />
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Githaf Consulting
              </h3>
            </div>
            <p className="mt-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Delivering exceptional customer support with AI-powered assistance
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Chat Widget */}
      <div ref={chatWidgetRef} className="chat-widget-container">
        <ChatWidget />
      </div>
    </div>
  );
};

const aiFeatures = [
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Never miss a customer query. Our AI assistant is always online, providing instant responses at any time of day or night.',
  },
  {
    icon: Brain,
    title: 'Context-Aware Responses',
    description: 'Powered by RAG technology, the AI understands context and retrieves relevant information from your knowledge base for accurate answers.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get responses in under 2 seconds. Our optimized pipeline ensures minimal latency for a seamless user experience.',
  },
  {
    icon: Database,
    title: 'Knowledge Base Integration',
    description: 'Upload documents, PDFs, or scrape URLs. The AI learns from your content to provide accurate, branded responses.',
  },
  {
    icon: Languages,
    title: 'Multi-Language Support',
    description: 'Communicate in 5 languages (EN, FR, DE, ES, AR) with full RTL support for Arabic. Break language barriers effortlessly.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with rate limiting, JWT authentication, and GDPR-compliant data handling.',
  },
];

const aiStats = [
  { value: '<2s', label: 'Average Response Time', icon: Zap },
  { value: '24/7', label: 'Always Available', icon: Clock },
  { value: '5', label: 'Languages Supported', icon: Languages },
  { value: '100%', label: 'AI-Powered Accuracy', icon: Brain },
];
