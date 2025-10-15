import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, AlertCircle, User, Bot, ThumbsDown, MessageSquare, Hash, Clock, Lightbulb, Info } from 'lucide-react';
import { apiService } from '../../services/api';
import type { FlaggedQuery } from '../../types';
import { staggerContainer, staggerItem } from '../../utils/animations';

export const FlaggedPage: React.FC = () => {
  const [flaggedQueries, setFlaggedQueries] = useState<FlaggedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFlaggedQueries();
  }, []);

  const loadFlaggedQueries = async () => {
    try {
      setLoading(true);
      console.log('Loading flagged queries...');
      const data = await apiService.getFlaggedQueries();
      console.log('Flagged queries loaded:', data);
      // Handle both array and object responses
      const flaggedQueriesList = Array.isArray(data) ? data : (data.flagged_queries || data.queries || []);
      setFlaggedQueries(flaggedQueriesList);
      setError('');
    } catch (err: any) {
      console.error('Flagged queries error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load flagged queries');
    } finally {
      setLoading(false);
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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
          <Flag className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Flagged Queries</h1>
          <p className="text-slate-300 mt-1 flex items-center gap-2">
            <ThumbsDown size={16} />
            Review low-rated interactions to improve responses
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

      <motion.div variants={staggerItem} className="card-hover rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-4"
            />
            <p className="text-slate-300">Loading flagged queries...</p>
          </div>
        ) : flaggedQueries.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4"
            >
              <Flag size={40} className="text-green-600" />
            </motion.div>
            <p className="text-slate-300 text-lg">No flagged queries</p>
            <p className="text-slate-400 text-sm mt-2">Great job! All responses are well-received</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            <AnimatePresence>
              {flaggedQueries.map((query, index) => (
                <motion.div
                  key={query.message_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Flag Icon */}
                    <div className="flex-shrink-0">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                      >
                        <AlertCircle size={24} className="text-red-600" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(query.created_at).toLocaleString()}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                          query.rating === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          <ThumbsDown size={14} />
                          {query.rating === 0 ? 'Not Helpful' : `Rating: ${query.rating}`}
                        </span>
                      </div>

                      {/* User Query */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                          <User size={16} className="text-primary-600" />
                          User Query:
                        </h3>
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border-l-4 border-primary-500 p-4 rounded-lg">
                          <p className="text-slate-100">{query.query}</p>
                        </div>
                      </div>

                      {/* Bot Response */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                          <Bot size={16} className="text-secondary-600" />
                          Bot Response:
                        </h3>
                        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100/50 border-l-4 border-neutral-300 p-4 rounded-lg">
                          <p className="text-slate-100">{query.response}</p>
                        </div>
                      </div>

                      {/* User Comment */}
                      {query.comment && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                            <MessageSquare size={16} className="text-yellow-600" />
                            User Feedback:
                          </h3>
                          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-l-4 border-yellow-500 p-4 rounded-lg">
                            <p className="text-slate-100 italic">"{query.comment}"</p>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Hash size={12} />
                          Msg: {query.message_id.substring(0, 8)}...
                        </span>
                        {query.conversation_id && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            Conv: {query.conversation_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      <AnimatePresence>
        {flaggedQueries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            variants={staggerItem}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Lightbulb size={24} className="text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 text-lg flex items-center gap-2">
                  <Info size={20} />
                  Action Items
                </h3>
                <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                  Review these flagged queries to identify knowledge gaps and improve your chatbot's responses.
                  Consider adding more relevant documentation to the knowledge base for better accuracy.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
