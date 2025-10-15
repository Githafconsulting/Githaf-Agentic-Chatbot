import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Copy, CheckCircle, Code, Eye, Palette, Layout, MessageSquare, TestTube } from 'lucide-react';
import type { WidgetConfig } from '../../types';
import { ChatWidget } from '../../components/chat/ChatWidget';
import { staggerContainer, staggerItem } from '../../utils/animations';

type TabType = 'appearance' | 'embed' | 'test';

export const WidgetSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [config, setConfig] = useState<WidgetConfig>({
    apiUrl: window.location.origin,
    position: 'bottom-right',
    primaryColor: '#1e40af',
    accentColor: '#0ea5e9',
    buttonSize: 'medium',
    greeting: 'Hi! How can I help you today?',
    title: 'Githaf AI Assistant',
    subtitle: 'Always here to help',
    zIndex: 9999,
    theme: 'modern',
    showNotificationBadge: true,
    paddingX: 20,
    paddingY: 20,
  });

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateEmbedCode = () => {
    return `<!-- Githaf Chat Widget -->
<script>
  window.GithafChatConfig = {
    apiUrl: '${config.apiUrl}',
    position: '${config.position}',
    primaryColor: '${config.primaryColor}',
    accentColor: '${config.accentColor}',
    buttonSize: '${config.buttonSize}',
    greeting: '${config.greeting}',
    title: '${config.title}',
    subtitle: '${config.subtitle}',
    zIndex: ${config.zIndex},
    theme: '${config.theme}',
    showNotificationBadge: ${config.showNotificationBadge},
    paddingX: ${config.paddingX},
    paddingY: ${config.paddingY}
  };
</script>
<script src="${config.apiUrl}/embed.js" async></script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // TODO: Save to backend
    localStorage.setItem('widgetConfig', JSON.stringify(config));
    alert('Widget settings saved successfully!');
  };

  useEffect(() => {
    // TODO: Load from backend
    const saved = localStorage.getItem('widgetConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <Settings className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Widget Settings</h1>
            <p className="text-slate-300 mt-1 flex items-center gap-2">
              <Code size={16} />
              Customize, embed, and test your chatbot
            </p>
          </div>
        </div>

        {activeTab === 'appearance' && (
          <motion.button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle size={20} />
            Save Settings
          </motion.button>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={staggerItem} className="flex gap-2 border-b border-slate-700 pb-0">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'appearance'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Palette size={18} />
          Appearance & Embed
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'test'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <TestTube size={18} />
          Test Chatbot (Admin Mode)
        </button>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <motion.div variants={staggerItem} className="space-y-6">
          {/* Appearance Section */}
          <div className="card-hover rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <Palette size={24} className="text-purple-400" />
              Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Widget Theme
                </label>
                <select
                  value={config.theme}
                  onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="modern">Modern (Gradient with animation)</option>
                  <option value="minimal">Minimal (Flat with border)</option>
                  <option value="classic">Classic (Simple gradient)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {config.theme === 'modern' && '✨ Animated gradient button with notification badge'}
                  {config.theme === 'minimal' && '🎯 Clean flat design with accent border'}
                  {config.theme === 'classic' && '📱 Traditional gradient style'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded-lg cursor-pointer border-2 border-slate-600"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="input flex-1"
                    placeholder="#1e40af"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-16 h-10 rounded-lg cursor-pointer border-2 border-slate-600"
                  />
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="input flex-1"
                    placeholder="#0ea5e9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Button Size
                </label>
                <select
                  value={config.buttonSize}
                  onChange={(e) => setConfig({ ...config, buttonSize: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="small">Small (50px)</option>
                  <option value="medium">Medium (60px)</option>
                  <option value="large">Large (70px)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Notification Badge
                  </label>
                  <p className="text-xs text-slate-400">
                    Show pulsing notification dot
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showNotificationBadge}
                    onChange={(e) => setConfig({ ...config, showNotificationBadge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Position Section */}
          <div className="card-hover rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <Layout size={24} className="text-blue-400" />
              Position
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Widget Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setConfig({ ...config, position: pos })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        config.position === pos
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Horizontal Padding (px)
                  </label>
                  <input
                    type="number"
                    value={config.paddingX}
                    onChange={(e) => setConfig({ ...config, paddingX: parseInt(e.target.value) || 0 })}
                    className="input w-full"
                    placeholder="20"
                    min="0"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Vertical Padding (px)
                  </label>
                  <input
                    type="number"
                    value={config.paddingY}
                    onChange={(e) => setConfig({ ...config, paddingY: parseInt(e.target.value) || 0 })}
                    className="input w-full"
                    placeholder="20"
                    min="0"
                    max="200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Z-Index
                </label>
                <input
                  type="number"
                  value={config.zIndex}
                  onChange={(e) => setConfig({ ...config, zIndex: parseInt(e.target.value) || 9999 })}
                  className="input w-full"
                  placeholder="9999"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="card-hover rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <MessageSquare size={24} className="text-green-400" />
              Content
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="input w-full"
                  placeholder="Githaf AI Assistant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="input w-full"
                  placeholder="Always here to help"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={config.greeting}
                  onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Hi! How can I help you today?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  API URL
                </label>
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  className="input w-full"
                  placeholder="https://your-domain.com"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Embed Code & Preview */}
        <motion.div variants={staggerItem} className="space-y-6">
          {/* Embed Code */}
          <div className="card-hover rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
                <Code size={24} className="text-cyan-400" />
                Embed Code
              </h2>
              <motion.button
                onClick={copyToClipboard}
                className={`btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                  copied ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Code
                  </>
                )}
              </motion.button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <pre className="text-xs text-green-400 overflow-x-auto">
                <code>{generateEmbedCode()}</code>
              </pre>
            </div>

            <div className="mt-4 text-sm text-slate-300 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <p className="font-medium text-blue-300 mb-2">📋 How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Copy the code above</li>
                <li>Paste it before the closing &lt;/body&gt; tag of your website</li>
                <li>The chat widget will appear automatically</li>
              </ol>
            </div>
          </div>

          {/* Preview */}
          <div className="card-hover rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
                <Eye size={24} className="text-yellow-400" />
                Preview
              </h2>
            </div>

            <div className="bg-slate-900 rounded-xl p-8 border border-slate-700 relative h-96 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>

              {/* Preview Widget Button */}
              <div
                className="absolute"
                style={{
                  [config.position.includes('bottom') ? 'bottom' : 'top']: `${config.paddingY}px`,
                  [config.position.includes('right') ? 'right' : 'left']: `${config.paddingX}px`,
                }}
              >
                <div className="relative">
                  <div
                    className="rounded-full flex items-center justify-center cursor-pointer"
                    style={{
                      width: config.buttonSize === 'small' ? '50px' : config.buttonSize === 'medium' ? '60px' : '70px',
                      height: config.buttonSize === 'small' ? '50px' : config.buttonSize === 'medium' ? '60px' : '70px',
                      background: config.theme === 'modern'
                        ? `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`
                        : config.theme === 'minimal'
                        ? config.primaryColor
                        : `linear-gradient(to bottom, ${config.primaryColor}, ${config.accentColor})`,
                      border: config.theme === 'minimal' ? `2px solid ${config.accentColor}` : config.theme === 'classic' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      boxShadow: config.theme === 'modern'
                        ? '0 10px 30px rgba(0,0,0,0.2)'
                        : config.theme === 'minimal'
                        ? '0 4px 12px rgba(0,0,0,0.1)'
                        : '0 8px 20px rgba(0,0,0,0.15)',
                    }}
                  >
                    <svg width={config.buttonSize === 'small' ? '20' : config.buttonSize === 'medium' ? '24' : '28'} height={config.buttonSize === 'small' ? '20' : config.buttonSize === 'medium' ? '24' : '28'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  {/* Notification Badge */}
                  {config.showNotificationBadge && (config.theme === 'modern' || config.theme === 'classic') && (
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"
                    />
                  )}
                </div>
              </div>

              <div className="absolute top-4 left-4 text-slate-500 text-sm">
                Preview: Widget will appear here on your website
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}

      {/* Test Chatbot Tab */}
      {activeTab === 'test' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card-hover rounded-2xl shadow-soft p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TestTube className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-50 mb-2">Admin Chatbot Tester</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Test the chatbot with full <strong>source citations</strong> and <strong>similarity scores</strong> visible.
                  This admin mode allows you to verify the AI's responses and understand which knowledge base documents are being retrieved.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/30 border border-green-600/50 text-green-300 text-xs">
                    ✓ Source Citations Visible
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-600/50 text-blue-300 text-xs">
                    ✓ Similarity Scores Shown
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-600/50 text-purple-300 text-xs">
                    ✓ Full RAG Pipeline Details
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Live Test Environment</h3>
              <div className="bg-slate-900 rounded-xl p-6 border-2 border-dashed border-slate-700 min-h-[400px] relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-slate-500">
                    <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Click the chat button below to start testing →</p>
                  </div>
                </div>
                {/* Admin Mode ChatWidget */}
                <div className="relative z-10">
                  <ChatWidget adminMode={true} />
                </div>
              </div>

              <div className="mt-4 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 text-sm text-blue-200">
                <p className="font-medium mb-2">💡 Testing Tips:</p>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  <li>Ask questions related to your knowledge base to see source retrieval</li>
                  <li>Check similarity scores to evaluate context relevance (higher = better match)</li>
                  <li>Test edge cases and ambiguous queries to identify gaps</li>
                  <li>Sources are <strong>hidden from end-users</strong> on the public landing page</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
