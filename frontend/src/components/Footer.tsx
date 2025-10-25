import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-theme-secondary border-t border-theme">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-theme-primary">
                Githaforge
              </span>
            </div>
            <p className="text-theme-secondary text-sm mb-4">
              Build intelligent AI chatbots in minutes. No coding required. Powered by advanced RAG technology.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-theme-primary hover:bg-primary-500 hover:text-white transition-colors flex items-center justify-center text-theme-secondary"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-theme-primary hover:bg-primary-500 hover:text-white transition-colors flex items-center justify-center text-theme-secondary"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-theme-primary hover:bg-primary-500 hover:text-white transition-colors flex items-center justify-center text-theme-secondary"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-theme-primary mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/signup" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-theme-primary mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Press Kit
                </a>
              </li>
              <li>
                <a href="#contact" className="text-theme-secondary hover:text-primary-600 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold text-theme-primary mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-theme-secondary">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@githaforge.com" className="hover:text-primary-600 transition-colors">
                  support@githaforge.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-theme-secondary">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-theme-secondary">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 AI Street<br />San Francisco, CA 94105</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-theme flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-theme-muted">
            © {currentYear} Githaforge. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-theme-muted">
            <a href="#" className="hover:text-primary-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
