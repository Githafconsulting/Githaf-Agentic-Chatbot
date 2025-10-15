import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, Star, User, Bot, ThumbsUp, ThumbsDown, MessageCircle, Hash, Calendar, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Conversation, ConversationMessage } from '../../types';
import { staggerContainer, staggerItem } from '../../utils/animations';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('Loading conversations...');
      const data = await apiService.getConversations();
      console.log('Conversations loaded:', data);
      // Handle both array and object responses
      const conversationsList = Array.isArray(data) ? data : (data.conversations || []);
      setConversations(conversationsList);
      setError('');
    } catch (err: any) {
      console.error('Conversations error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async (id: string) => {
    try {
      const data = await apiService.getConversation(id);
      setSelectedConversation(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load conversation details');
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem} className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
          <MessageCircle className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Conversations</h1>
          <p className="text-slate-300 mt-1 flex items-center gap-2">
            <User size={16} />
            View all customer interactions
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-soft"
          >
            <AlertCircle size={20} />
            <span className="flex-1">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <motion.div variants={staggerItem} className="card-hover rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-secondary-50">
            <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
              <MessageSquare size={24} className="text-primary-600" />
              All Conversations
            </h2>
          </div>

          <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
                />
                <p className="text-slate-300">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mx-auto mb-4"
                >
                  <MessageSquare size={40} className="text-primary-600" />
                </motion.div>
                <p className="text-slate-300 text-lg">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => loadConversationDetails(conv.id)}
                  className={`p-4 hover:bg-slate-700 cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-primary-900/30 border-l-4 border-primary-400' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                          <Hash size={16} className="text-white" />
                        </div>
                        <span className="font-medium text-slate-50 text-sm font-mono">
                          {conv.session_id.substring(0, 12)}...
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(conv.created_at).toLocaleDateString()}
                        </span>
                        {conv.message_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {conv.message_count} msgs
                          </span>
                        )}
                        {conv.avg_rating !== null && conv.avg_rating !== undefined && (
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            {(conv.avg_rating * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Conversation Details */}
        <motion.div variants={staggerItem} className="card-hover rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-secondary-50 to-primary-50">
            <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
              <Bot size={24} className="text-secondary-600" />
              Conversation Details
            </h2>
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto">
            {!selectedConversation ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mx-auto mb-4"
                >
                  <MessageSquare size={40} className="text-slate-500" />
                </motion.div>
                <p className="text-slate-400">Select a conversation to view details</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Conversation Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-xl shadow-lg shadow-blue-500/30"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/90 font-medium flex items-center gap-1">
                        <Hash size={14} />
                        Session ID:
                      </span>
                      <p className="font-mono text-xs mt-1 text-white">{selectedConversation.session_id}</p>
                    </div>
                    <div>
                      <span className="text-white/90 font-medium flex items-center gap-1">
                        <Clock size={14} />
                        Started:
                      </span>
                      <p className="mt-1 text-white">{new Date(selectedConversation.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Messages */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {selectedConversation.messages?.map((msg: ConversationMessage, index: number) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        {msg.role === 'user' ? (
                          /* User Message */
                          <div className="flex justify-end gap-2">
                            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl rounded-tr-sm py-3 px-4 max-w-[80%] shadow-soft">
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                              <User size={16} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          /* Assistant Message */
                          <div className="flex justify-start gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center flex-shrink-0">
                              <Bot size={16} className="text-white" />
                            </div>
                            <div className="bg-slate-700 rounded-2xl rounded-tl-sm py-3 px-4 max-w-[80%] border border-slate-600">
                              <p className="text-sm text-white">{msg.content}</p>

                              {/* Context Used */}
                              {msg.context_used && Object.keys(msg.context_used).length > 0 && (
                                <details className="mt-2 pt-2 border-t border-slate-600">
                                  <summary className="text-xs text-primary-400 cursor-pointer hover:text-primary-300">
                                    View context sources
                                  </summary>
                                  <div className="mt-2 text-xs text-slate-300">
                                    {JSON.stringify(msg.context_used, null, 2)}
                                  </div>
                                </details>
                              )}
                            </div>
                          </div>
                        )}

                        <div className={`text-xs text-slate-400 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start ml-10'}`}>
                          <Clock size={10} />
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
