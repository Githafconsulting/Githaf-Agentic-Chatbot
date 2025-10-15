import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, ThumbsUp, TrendingUp, Database, Sparkles, AlertCircle, GripVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../../styles/grid-layout.css';
import { apiService } from '../../services/api';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { CardSkeleton } from '../../components/ui';
import { DateRangePicker } from '../../components/DateRangePicker';
import { DailyVisitsChart } from '../../components/analytics/DailyVisitsChart';
import { CountryStats } from '../../components/analytics/CountryStats';
import { WorldMap } from '../../components/analytics/WorldMap';
import type { Analytics, DailyStats, CountryStats as CountryStatsType } from '../../types';

const COLORS = ['#1e40af', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Default grid layout configuration
// rowHeight is 80px, so h:6 = 480px, h:8 = 640px
const defaultLayout = [
  { i: 'daily-visits', x: 0, y: 0, w: 12, h: 7, minW: 6, minH: 6 },  // 560px min for chart
  { i: 'world-map', x: 0, y: 7, w: 6, h: 9, minW: 4, minH: 8 },      // 720px min for globe + controls
  { i: 'country-stats', x: 6, y: 7, w: 6, h: 9, minW: 4, minH: 7 },  // 640px min for country list
  { i: 'trending-queries', x: 0, y: 16, w: 12, h: 7, minW: 6, minH: 6 }, // 560px min for chart
];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // New state for date range and new analytics
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStatsType[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Grid layout state
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('analytics-layout');
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  // Update container width dynamically with ResizeObserver
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        console.log('Container width calculated:', width);
        setContainerWidth(width);
      }
    };

    updateWidth();

    // Use ResizeObserver for more reliable width detection
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        console.log('ResizeObserver detected width:', width);
        setContainerWidth(width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateWidth);

    // Fallback delays to ensure width is updated
    setTimeout(updateWidth, 100);
    setTimeout(updateWidth, 500);
    setTimeout(updateWidth, 1000);

    return () => {
      window.removeEventListener('resize', updateWidth);
      resizeObserver.disconnect();
    };
  }, []);

  // Save layout to localStorage when it changes
  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
    localStorage.setItem('analytics-layout', JSON.stringify(newLayout));
  };

  // Reset layout to default
  const resetLayout = () => {
    setLayout([...defaultLayout]); // Create new array to force re-render
    localStorage.removeItem('analytics-layout');

    // Force re-render of GridLayout
    setTimeout(() => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    }, 100);
  };

  useEffect(() => {
    loadAnalytics();
    loadNewAnalytics();
  }, []);

  useEffect(() => {
    loadNewAnalytics();
  }, [dateRange]);

  // Recalculate width when analytics data loads
  useEffect(() => {
    if (analytics && containerRef.current) {
      const updateWidth = () => {
        const width = containerRef.current?.offsetWidth || 1200;
        console.log('Width recalculated after data load:', width);
        setContainerWidth(width);
      };
      // Give time for the layout to fully render
      setTimeout(updateWidth, 100);
      setTimeout(updateWidth, 300);
      setTimeout(updateWidth, 600);
    }
  }, [analytics]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Loading analytics...');
      console.log('Auth token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
      const data = await apiService.getAnalytics();
      console.log('Analytics data loaded:', data);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Analytics error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadNewAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];

      // Load daily stats and country stats (will work once backend is implemented)
      const [daily, countries] = await Promise.all([
        apiService.getDailyStats(startDate, endDate).catch(() => []),
        apiService.getCountryStats(startDate, endDate).catch(() => []),
      ]);

      setDailyStats(daily);
      setCountryStats(countries);
    } catch (err) {
      console.error('Failed to load new analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          className="bg-red-500/10 border border-red-500/30 text-red-400 px-8 py-6 rounded-2xl flex items-center gap-3 max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold text-lg mb-1">Failed to Load Analytics</h3>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          className="bg-slate-800 border border-slate-700 text-slate-100 px-8 py-6 rounded-2xl flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle size={24} className="text-slate-300" />
          <div>
            <h3 className="font-semibold text-lg mb-1">No Analytics Data</h3>
            <p className="text-sm text-slate-300">Unable to load analytics at this time.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Conversations',
      value: analytics?.conversation_metrics?.total_conversations || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Messages',
      value: analytics?.conversation_metrics?.total_messages || 0,
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Satisfaction Score',
      value: `${((analytics?.satisfaction_metrics?.avg_satisfaction || 0) * 100).toFixed(1)}%`,
      icon: ThumbsUp,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Response Rate',
      value: `${((analytics?.satisfaction_metrics?.response_rate || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  // Prepare chart data
  const trendingQueriesData = analytics.trending_queries?.slice(0, 5).map(item => ({
    name: item.query.length > 20 ? item.query.substring(0, 20) + '...' : item.query,
    value: item.count,
    fullName: item.query
  })) || [];

  const kbData = [
    { name: 'Documents', value: analytics.knowledge_base_metrics?.total_documents || 0 },
    { name: 'Chunks', value: analytics.knowledge_base_metrics?.total_chunks || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-50">Analytics Overview</h1>
          <p className="text-slate-300 mt-2">Drag and resize boards to customize your dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetLayout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm font-medium"
          >
            Reset Layout
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Stats Grid - Fixed (not draggable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
              className="card-hover p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-300 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-50 mt-2">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-md`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Draggable Grid Layout */}
      <div ref={containerRef} className="w-full">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={80}
          width={containerWidth}
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
          isResizable={true}
          isDraggable={true}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {/* Daily Visits Chart */}
          <div key="daily-visits" className="card p-4 flex flex-col h-full overflow-visible">
            <div className="drag-handle cursor-move p-2 hover:bg-slate-700/20 rounded-lg transition-colors self-start mb-2">
              <GripVertical className="text-slate-400" size={20} />
            </div>
            <div className="flex-1 overflow-auto">
              <DailyVisitsChart data={dailyStats} loading={analyticsLoading} />
            </div>
          </div>

          {/* World Map */}
          <div key="world-map" className="card p-4 flex flex-col h-full overflow-visible">
            <div className="drag-handle cursor-move p-2 hover:bg-slate-700/20 rounded-lg transition-colors self-start mb-2">
              <GripVertical className="text-slate-400" size={20} />
            </div>
            <div className="flex-1 overflow-auto">
              <WorldMap data={countryStats} loading={analyticsLoading} />
            </div>
          </div>

          {/* Country Stats */}
          <div key="country-stats" className="card p-4 flex flex-col h-full overflow-visible">
            <div className="drag-handle cursor-move p-2 hover:bg-slate-700/20 rounded-lg transition-colors self-start mb-2">
              <GripVertical className="text-slate-400" size={20} />
            </div>
            <div className="flex-1 overflow-auto">
              <CountryStats data={countryStats} loading={analyticsLoading} />
            </div>
          </div>

          {/* Trending Queries */}
          <div key="trending-queries" className="card p-4 flex flex-col h-full overflow-visible">
            <div className="drag-handle cursor-move p-2 hover:bg-slate-700/20 rounded-lg transition-colors self-start mb-2">
              <GripVertical className="text-slate-400" size={20} />
            </div>
            <div className="flex-1 overflow-auto">
              <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2 mb-2">
                <TrendingUp className="text-primary-600" size={24} />
                Trending Queries
              </h2>
              <p className="text-sm text-slate-300 mb-4">Most frequently asked questions</p>

              {trendingQueriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendingQueriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, _name: string, props: any) => [value, props.payload.fullName]}
                    />
                    <Bar dataKey="value" fill="#1e40af" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <MessageSquare size={48} className="mb-3" />
                  <p>No trending queries yet</p>
                </div>
              )}
            </div>
          </div>
        </GridLayout>
      </div>
    </div>
  );
};
