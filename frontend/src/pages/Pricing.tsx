import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { Card, Badge, Button } from '../components/ui';
import { Check, Star, Zap, HelpCircle } from 'lucide-react';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const discount = billingCycle === 'yearly' ? 0.2 : 0; // 20% off yearly

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="accent" size="lg" rounded className="mb-6">
                <Zap className="w-4 h-4" />
                <span className="ml-2">Simple Pricing</span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-display font-bold mb-6 text-theme-primary"
            >
              Choose the Perfect Plan for{' '}
              <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                Your Business
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-theme-secondary mb-8"
            >
              Transparent pricing with no hidden fees. Start free, upgrade anytime.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-3 glass p-2 rounded-xl"
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {pricingPlans.map((plan, index) => {
              const price = billingCycle === 'yearly'
                ? Math.round(plan.price * 12 * (1 - discount))
                : plan.price;
              const displayPrice = billingCycle === 'yearly' ? Math.round(price / 12) : price;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card
                    glass
                    variant={plan.featured ? 'elevated' : 'outlined'}
                    className={`h-full relative ${
                      plan.featured ? 'border-primary-500 shadow-primary scale-105' : ''
                    }`}
                  >
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge variant="primary" size="md" rounded>
                          <Star className="w-3 h-3" />
                          <span className="ml-1">Most Popular</span>
                        </Badge>
                      </div>
                    )}

                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-theme-primary mb-2">{plan.name}</h3>

                      <div className="mt-4 mb-2">
                        <span className="text-5xl font-bold text-theme-primary">${displayPrice}</span>
                        <span className="text-theme-muted">/{billingCycle === 'yearly' ? 'mo' : 'month'}</span>
                      </div>

                      {billingCycle === 'yearly' && plan.price > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                          Billed ${price}/year (save ${Math.round(plan.price * 12 * discount)})
                        </p>
                      )}

                      <p className="text-theme-secondary mb-6">{plan.description}</p>

                      <Button
                        variant={plan.featured ? 'primary' : 'outline'}
                        fullWidth
                        size="lg"
                        onClick={() => navigate(`/signup?plan=${plan.name.toLowerCase()}&billing=${billingCycle}`)}
                        className="mb-6"
                      >
                        {plan.cta}
                      </Button>

                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-theme-primary uppercase tracking-wide">
                          {plan.name} includes:
                        </p>
                        <ul className="space-y-3">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-theme-secondary text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center mb-12 text-theme-primary">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card glass variant="elevated" className="p-6">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-theme-primary mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-theme-secondary">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

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
      'Community access'
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
      'Team collaboration (up to 5)',
      'API access',
      'Export data'
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
      'SLA guarantee (99.9%)',
      'On-premise deployment option',
      'SSO (SAML, OAuth)',
      'Advanced security features',
      'Unlimited team members',
      'Custom training'
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
  },
  {
    question: 'What happens after the 14-day trial?',
    answer: 'After your trial ends, you\'ll be automatically subscribed to the Free plan unless you choose a paid plan. Your data and chatbots are always safe.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund you in full, no questions asked.'
  },
  {
    question: 'How does the message limit work?',
    answer: 'Message limits reset monthly. If you exceed your limit, your chatbot will still work but you\'ll be prompted to upgrade for continued service.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption, are GDPR and SOC 2 compliant, and never share your data with third parties. Your data belongs to you.'
  },
  {
    question: 'Can I get a custom Enterprise plan?',
    answer: 'Yes! Contact our sales team to discuss custom pricing, features, and SLAs tailored to your organization\'s needs.'
  }
];
