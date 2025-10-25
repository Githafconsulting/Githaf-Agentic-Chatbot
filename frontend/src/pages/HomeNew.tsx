import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NavigationNew } from '../components/NavigationNew';
import { Footer } from '../components/Footer';
import { Button, Card, Badge } from '../components/ui';
import {
  Zap, MessageSquare, Shield, Check, ArrowRight, Sparkles, Brain, Rocket
} from 'lucide-react';
import { ChatWidget } from '../components/chat/ChatWidget';

export const HomeNew: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <NavigationNew />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="primary" size="lg" rounded className="mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="ml-2">AI-Powered Customer Support</span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 text-theme-primary"
            >
              Build Intelligent Chatbots{' '}
              <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                in Minutes
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl text-theme-secondary mb-8 max-w-3xl mx-auto"
            >
              Transform your customer support with AI chatbots powered by RAG technology.
              Upload your documents, customize your bot, and deploy in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                variant="primary"
                size="xl"
                icon={<Rocket />}
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                icon={<MessageSquare />}
                onClick={() => {
                  const chatButton = document.querySelector('[data-chat-toggle]') as HTMLButtonElement;
                  chatButton?.click();
                }}
              >
                Try Demo Chat
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-6 text-sm text-theme-muted flex-wrap"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-20 bg-theme-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="md" rounded className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-theme-primary">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
              Powerful features to create, manage, and scale your AI chatbots
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast Setup',
                description: 'Deploy in minutes with no coding required',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Brain,
                title: 'RAG Technology',
                description: 'Context-aware responses using advanced AI',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption and GDPR compliance',
                gradient: 'from-red-500 to-rose-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card glass hover variant="elevated" className="h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-theme-primary">{feature.title}</h3>
                  <p className="text-theme-secondary">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/features')}
              icon={<ArrowRight />}
              iconPosition="right"
            >
              View All Features
            </Button>
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
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-white">
              Ready to Transform Your Customer Support?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses using Githaforge to automate support with AI
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
            <p className="text-sm text-blue-100 mt-4">No credit card required • 14-day free trial</p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

