import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavigationNew } from '../components/NavigationNew';
import { Footer } from '../components/Footer';
import { Card, Badge, Button, Input, Textarea } from '../components/ui';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement contact form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <NavigationNew />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="secondary" size="lg" rounded className="mb-6">
                <MessageSquare className="w-4 h-4" />
                <span className="ml-2">Get in Touch</span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl font-display font-bold mb-6 text-theme-primary"
            >
              We'd Love to{' '}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Hear From You
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-theme-secondary"
            >
              Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card glass variant="elevated" className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4`}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">{method.title}</h3>
                    <p className="text-theme-secondary text-sm mb-3">{method.description}</p>
                    <a href={method.link} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      {method.value}
                    </a>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card glass variant="elevated" className="p-8">
                  <h2 className="text-2xl font-bold text-theme-primary mb-6">Send us a Message</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      fullWidth
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      icon={<Mail className="w-5 h-5" />}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      fullWidth
                    />

                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      fullWidth
                    />

                    <Textarea
                      label="Message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      fullWidth
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isSubmitting}
                      icon={<Send />}
                      iconPosition="right"
                    >
                      Send Message
                    </Button>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email anytime',
    value: 'support@githaforge.com',
    link: 'mailto:support@githaforge.com',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Fri from 9am to 6pm',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Come say hello',
    value: '123 AI Street, San Francisco, CA 94105',
    link: 'https://maps.google.com',
    gradient: 'from-purple-500 to-pink-500'
  }
];
