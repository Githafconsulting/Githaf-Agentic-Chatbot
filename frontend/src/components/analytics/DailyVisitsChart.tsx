import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DailyStats } from '../../types';

interface DailyVisitsChartProps {
  data: DailyStats[];
  loading?: boolean;
}

export const DailyVisitsChart: React.FC<DailyVisitsChartProps> = ({ data, loading = false }) => {
  const { t } = useTranslation();

  // Format data for chart
  const chartData = data.map(stat => ({
    date: new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    conversations: stat.conversations || 0,
    messages: stat.messages || 0,
    satisfaction: (stat.avg_satisfaction || 0) * 100, // Convert to percentage
  }));

  // Calculate trends
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    return ((recent - older) / older) * 100;
  };

  const conversationsTrend = calculateTrend(chartData.map(d => d.conversations));
  const messagesTrend = calculateTrend(chartData.map(d => d.messages));

  if (loading) {
    return (
      <div className="card-hover rounded-2xl p-8">
        <div className="flex items-center justify-center h-80">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-hover rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center h-80 text-slate-400">
          <Activity size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm mt-2">Daily analytics will appear here once you have visitor data</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="card-hover rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-50">{t('dashboard.dailyVisits')}</h3>
            <p className="text-sm text-slate-400">Activity trends over time</p>
          </div>
        </div>

        {/* Trend indicators */}
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Conversations</p>
            <p className={`text-sm font-semibold ${conversationsTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {conversationsTrend >= 0 ? '+' : ''}{conversationsTrend.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Messages</p>
            <p className={`text-sm font-semibold ${messagesTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {messagesTrend >= 0 ? '+' : ''}{messagesTrend.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={{ stroke: '#475569' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={{ stroke: '#475569' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '8px' }}
            itemStyle={{ color: '#cbd5e1', fontSize: '13px' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="conversations"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorConversations)"
            name="Conversations"
          />
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#colorMessages)"
            name="Messages"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
