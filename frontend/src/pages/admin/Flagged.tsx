import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, AlertCircle, User, Bot, ThumbsDown, ThumbsUp, MessageSquare, Hash, Clock, Lightbulb, Info, Filter, X } from 'lucide-react';
import { apiService } from '../../services/api';
import type { FlaggedQuery } from '../../types';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { DateRangePicker } from '../../components/DateRangePicker';

type RatingFilter = 'all' | 'positive' | 'negative';

export const FlaggedPage: React.FC = () => {
  const [flaggedQueries, setFlaggedQueries] = useState<FlaggedQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<FlaggedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
  });
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadFlaggedQueries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [flaggedQueries, ratingFilter, dateRange]);

  const loadFlaggedQueries = async () => {
    try {
      setLoading(true);
      console.log('Loading all feedback...');

      // Load all feedback (backend will return all by default if no rating filter)
      const data = await apiService.getFlaggedQueries();
      console.log('Feedback loaded:', data);

      // Handle both array and object responses
      const feedbackList = Array.isArray(data) ? data : (data.flagged_queries || data.queries || []);

      // Debug: Log first item to check field names
      if (feedbackList.length > 0) {
        console.log('First feedback item:', feedbackList[0]);
        console.log('Available fields:', Object.keys(feedbackList[0]));
      }

      setFlaggedQueries(feedbackList);
      setError('');
    } catch (err: any) {
      console.error('Feedback error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...flaggedQueries];

    // Rating filter
    if (ratingFilter === 'positive') {
      filtered = filtered.filter(q => q.rating === 1);
    } else if (ratingFilter === 'negative') {
      filtered = filtered.filter(q => q.rating === 0);
    }

    // Date filter
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter(q => {
      const date = new Date(q.created_at);
      return date >= start && date <= end;
    });

    setFilteredQueries(filtered);
  };

  const clearFilters = () => {
    setRatingFilter('all');
    setDateRange({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
  };

  // Calculate overall stats from ALL feedback (not filtered)
  const getOverallStats = () => {
    const total = flaggedQueries.length;
    const positive = flaggedQueries.filter(q => q.rating === 1).length;
    const negative = flaggedQueries.filter(q => q.rating === 0).length;
    const positiveRate = total > 0 ? ((positive / total) * 100).toFixed(1) : '0';

    return { total, positive, negative, positiveRate };
  };

  const stats = getOverallStats();

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <MessageSquare className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">User Feedback</h1>
            <p className="text-slate-300 mt-1 flex items-center gap-2">
              <Filter size={16} />
              Review all user feedback and ratings
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-100">{stats.positiveRate}%</div>
            <div className="text-xs text-slate-400">Satisfaction Rate</div>
          </div>
          <div className="h-12 w-px bg-slate-700"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{stats.positive}</div>
            <div className="text-xs text-slate-400">Positive</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">{stats.negative}</div>
            <div className="text-xs text-slate-400">Negative</div>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
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

      {/* Filters */}
      <motion.div variants={staggerItem} className="card-hover rounded-2xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={clearFilters}
              className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={14} />
              Clear Filters
            </motion.button>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-900/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showFilters ? 'Hide' : 'Show'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Rating Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    onClick={() => setRatingFilter('all')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      ratingFilter === 'all'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    All
                  </motion.button>
                  <motion.button
                    onClick={() => setRatingFilter('positive')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-1 ${
                      ratingFilter === 'positive'
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThumbsUp size={14} />
                    Positive
                  </motion.button>
                  <motion.button
                    onClick={() => setRatingFilter('negative')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-1 ${
                      ratingFilter === 'negative'
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThumbsDown size={14} />
                    Negative
                  </motion.button>
                </div>
              </div>

              {/* Date Range Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Date Range
                </label>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Count */}
      {!loading && (
        <motion.div variants={staggerItem} className="text-sm text-slate-400">
          Showing <span className="font-semibold text-slate-200">{filteredQueries.length}</span> of{' '}
          <span className="font-semibold text-slate-200">{flaggedQueries.length}</span> feedback entries
        </motion.div>
      )}

      {/* Feedback List */}
      <motion.div variants={staggerItem} className="card-hover rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
            />
            <p className="text-slate-300">Loading feedback...</p>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4"
            >
              <MessageSquare size={40} className="text-purple-600" />
            </motion.div>
            <p className="text-slate-300 text-lg">
              {flaggedQueries.length === 0 ? 'No feedback yet' : 'No feedback matching filters'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {flaggedQueries.length === 0
                ? 'User feedback will appear here once they rate responses'
                : 'Try adjusting your filters to see more results'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            <AnimatePresence>
              {filteredQueries.map((query, index) => {
                const isPositive = query.rating === 1;

                return (
                  <motion.div
                    key={query.message_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rating Icon */}
                      <div className="flex-shrink-0">
                        <motion.div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isPositive
                              ? 'bg-gradient-to-br from-green-100 to-emerald-200'
                              : 'bg-gradient-to-br from-red-100 to-red-200'
                          }`}
                          whileHover={{ scale: 1.1, rotate: isPositive ? 15 : -15 }}
                        >
                          {isPositive ? (
                            <ThumbsUp size={24} className="text-green-600" />
                          ) : (
                            <ThumbsDown size={24} className="text-red-600" />
                          )}
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
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                              isPositive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isPositive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                            {isPositive ? 'Helpful' : 'Not Helpful'}
                          </span>
                        </div>

                        {/* User Query */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                            <User size={16} className="text-blue-400" />
                            User Query:
                          </h3>
                          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                            <p className="text-slate-100">{query.query}</p>
                          </div>
                        </div>

                        {/* Bot Response */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                            <Bot size={16} className="text-cyan-400" />
                            Bot Response:
                          </h3>
                          <div className="bg-slate-800 border-l-4 border-slate-600 p-4 rounded-lg">
                            <p className="text-slate-100">{query.response}</p>
                          </div>
                        </div>

                        {/* User Comment */}
                        {query.comment && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                              <MessageSquare size={16} className="text-yellow-400" />
                              User Feedback:
                            </h3>
                            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
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
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Action Items */}
      <AnimatePresence>
        {filteredQueries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            variants={staggerItem}
            className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Lightbulb size={24} className="text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-200 text-lg flex items-center gap-2">
                  <Info size={20} />
                  Insights & Actions
                </h3>
                <div className="space-y-2 mt-3">
                  {stats.negative > 0 && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      • <strong>{stats.negative} negative feedback entries</strong> - Review these to identify knowledge gaps and improve responses.
                    </p>
                  )}
                  {stats.positive > 0 && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      • <strong>{stats.positive} positive feedback entries</strong> - These indicate successful responses. Analyze patterns for best practices.
                    </p>
                  )}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    • Consider adding more relevant documentation to the knowledge base for queries with negative feedback.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
