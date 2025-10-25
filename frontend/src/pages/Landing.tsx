import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardBody, Badge } from '../components/ui';
import {
  Bot, Sparkles, Zap, MessageSquare, BarChart3, Globe,
  Shield, Clock, Users, ArrowRight, Check, Star,
  Palette, Code, Puzzle, Rocket
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-theme"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-theme-primary">Githaforge</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-theme-secondary hover:text-theme-primary transition-colors">Features</a>
            <a href="#pricing" className="text-theme-secondary hover:text-theme-primary transition-colors">Pricing</a>
            <a href="#faq" className="text-theme-secondary hover:text-theme-primary transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Badge variant="primary" size="lg" rounded>
                <Sparkles className="w-4 h-4" />
                <span className="ml-2">AI-Powered Chatbot Builder</span>
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 text-theme-primary"
            >
              Build Intelligent Chatbots{' '}
              <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                in Minutes
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl sm:text-2xl text-theme-secondary mb-8 max-w-3xl mx-auto"
            >
              Empower your business with AI chatbots. No coding required.
              Upload your documents, customize your bot, and deploy in minutes.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                variant="primary"
                size="lg"
                icon={<Rocket />}
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/demo')}
              >
                View Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-6 text-sm text-theme-muted"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <Card glass variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-24 h-24 text-primary-500 mx-auto mb-4" />
                  <p className="text-lg text-theme-secondary">Dashboard Preview Coming Soon</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-theme-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="md" rounded className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-theme-primary">
              Everything You Need
            </h2>
            <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
              Powerful features to create, manage, and scale your AI chatbots
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover variant="elevated" className="h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="accent" size="md" rounded className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-theme-primary">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
              Choose the perfect plan for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  variant={plan.featured ? 'elevated' : 'outlined'}
                  className={`h-full relative ${plan.featured ? 'border-primary-500 shadow-primary' : ''}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="primary" size="sm" rounded>
                        <Star className="w-3 h-3" />
                        <span className="ml-1">Most Popular</span>
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-5xl font-bold text-theme-primary">${plan.price}</span>
                      <span className="text-theme-muted">/month</span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardBody>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-theme-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.featured ? 'primary' : 'outline'}
                      fullWidth
                      onClick={() => navigate('/signup?plan=' + plan.name.toLowerCase())}
                    >
                      {plan.cta}
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-white">
              Ready to Build Your AI Chatbot?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses using Githaforge to automate customer support
            </p>
            <Button
              variant="secondary"
              size="xl"
              icon={<Rocket />}
              onClick={() => navigate('/signup')}
              className="bg-white text-primary-600 hover:bg-blue-50"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-theme-secondary border-t border-theme">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-theme-primary">Githaforge</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-theme-muted">
              <a href="#" className="hover:text-theme-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-theme-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-theme-primary transition-colors">Support</a>
            </div>

            <p className="text-sm text-theme-muted">
              © 2025 Githaforge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'Create your chatbot in minutes. No technical knowledge required.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: MessageSquare,
    title: 'RAG Technology',
    description: 'Advanced retrieval-augmented generation for accurate, context-aware responses.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Palette,
    title: 'Full Customization',
    description: 'Brand your chatbot with custom colors, logos, and messaging.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track conversations, satisfaction rates, and user insights in real-time.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Support 5+ languages with automatic translation and RTL support.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, GDPR compliance, and role-based access control.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: Code,
    title: 'Easy Integration',
    description: 'Embed chatbot with one line of code. Works on any website.',
    gradient: 'from-slate-500 to-gray-600',
  },
  {
    icon: Puzzle,
    title: 'Knowledge Base',
    description: 'Upload PDFs, Word docs, URLs. AI learns from your content automatically.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members with different roles and permissions.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out Githaforge',
    features: [
      '1 chatbot',
      '100 messages/month',
      '10 documents',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For growing businesses',
    features: [
      '5 chatbots',
      '10,000 messages/month',
      'Unlimited documents',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Team collaboration',
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For large organizations',
    features: [
      'Unlimited chatbots',
      'Unlimited messages',
      'Unlimited documents',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];
