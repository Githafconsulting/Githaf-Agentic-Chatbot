import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('30d');

  const presets = [
    { label: t('dashboard.last7Days'), value: '7d', days: 7 },
    { label: t('dashboard.last30Days'), value: '30d', days: 30 },
    { label: t('dashboard.last90Days'), value: '90d', days: 90 },
    { label: t('dashboard.customRange'), value: 'custom', days: 0 },
  ];

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);

    if (preset !== 'custom') {
      const presetData = presets.find(p => p.value === preset);
      if (presetData && presetData.days > 0) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - presetData.days);

        onChange({ startDate, endDate });
        setIsOpen(false);
      }
    }
  };

  const handleCustomDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start && end) {
      onChange({ startDate: start, endDate: end });
      setSelectedPreset('custom');
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = value.startDate.toLocaleDateString(undefined, options);
    const end = value.endDate.toLocaleDateString(undefined, options);
    return `${start} - ${end}`;
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all shadow-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Calendar size={18} className="text-primary-400" />
        <span className="text-sm font-medium">{formatDateRange()}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-strong overflow-hidden z-50 min-w-[320px]"
            >
              {/* Presets */}
              <div className="p-3 border-b border-slate-700">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                  {t('dashboard.selectDateRange')}
                </p>
                <div className="space-y-1">
                  {presets.map((preset) => (
                    <motion.button
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        selectedPreset === preset.value
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-slate-200 hover:bg-slate-700'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm font-medium">{preset.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Date Picker */}
              {selectedPreset === 'custom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 custom-datepicker-container"
                >
                  <DatePicker
                    selected={value.startDate}
                    onChange={handleCustomDateChange}
                    startDate={value.startDate}
                    endDate={value.endDate}
                    selectsRange
                    inline
                    maxDate={new Date()}
                    calendarClassName="custom-datepicker"
                  />
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-datepicker-container .react-datepicker {
          background-color: transparent;
          border: none;
          font-family: inherit;
        }

        .custom-datepicker-container .react-datepicker__header {
          background-color: rgb(30 41 59);
          border-bottom: 1px solid rgb(51 65 85);
          padding: 8px 0;
        }

        .custom-datepicker-container .react-datepicker__current-month,
        .custom-datepicker-container .react-datepicker__day-name {
          color: rgb(226 232 240);
        }

        .custom-datepicker-container .react-datepicker__day {
          color: rgb(203 213 225);
        }

        .custom-datepicker-container .react-datepicker__day:hover {
          background-color: rgb(51 65 85);
          color: white;
        }

        .custom-datepicker-container .react-datepicker__day--selected,
        .custom-datepicker-container .react-datepicker__day--in-range {
          background-color: rgb(37 99 235);
          color: white;
        }

        .custom-datepicker-container .react-datepicker__day--keyboard-selected {
          background-color: rgb(30 64 175);
          color: white;
        }

        .custom-datepicker-container .react-datepicker__day--disabled {
          color: rgb(71 85 105);
          cursor: not-allowed;
        }

        .custom-datepicker-container .react-datepicker__day--outside-month {
          color: rgb(71 85 105);
        }

        .custom-datepicker-container .react-datepicker__navigation-icon::before {
          border-color: rgb(148 163 184);
        }

        .custom-datepicker-container .react-datepicker__navigation:hover *::before {
          border-color: white;
        }
      `}</style>
    </div>
  );
};
