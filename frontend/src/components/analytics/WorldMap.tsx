import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Globe from 'react-globe.gl';
import { Globe as GlobeIcon, Loader, Maximize2, X, RotateCw, Pause } from 'lucide-react';
import type { CountryStats } from '../../types';

interface WorldMapProps {
  data: CountryStats[];
  loading?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({ data, loading }) => {
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 600 });

  // Country code to coordinates mapping
  const countryCoordinates: Record<string, { lat: number; lng: number }> = {
    'US': { lat: 37.0902, lng: -95.7129 },
    'CA': { lat: 56.1304, lng: -106.3468 },
    'GB': { lat: 55.3781, lng: -3.4360 },
    'DE': { lat: 51.1657, lng: 10.4515 },
    'FR': { lat: 46.2276, lng: 2.2137 },
    'ES': { lat: 40.4637, lng: -3.7492 },
    'IT': { lat: 41.8719, lng: 12.5674 },
    'JP': { lat: 36.2048, lng: 138.2529 },
    'CN': { lat: 35.8617, lng: 104.1954 },
    'IN': { lat: 20.5937, lng: 78.9629 },
    'BR': { lat: -14.2350, lng: -51.9253 },
    'AU': { lat: -25.2744, lng: 133.7751 },
    'RU': { lat: 61.5240, lng: 105.3188 },
    'MX': { lat: 23.6345, lng: -102.5528 },
    'KR': { lat: 35.9078, lng: 127.7669 },
    'SA': { lat: 23.8859, lng: 45.0792 },
    'AE': { lat: 23.4241, lng: 53.8478 },
    'SG': { lat: 1.3521, lng: 103.8198 },
    'NL': { lat: 52.1326, lng: 5.2913 },
    'SE': { lat: 60.1282, lng: 18.6435 },
    'NO': { lat: 60.4720, lng: 8.4689 },
    'DK': { lat: 56.2639, lng: 9.5018 },
    'FI': { lat: 61.9241, lng: 25.7482 },
    'PL': { lat: 51.9194, lng: 19.1451 },
    'TR': { lat: 38.9637, lng: 35.2433 },
    'EG': { lat: 26.8206, lng: 30.8025 },
    'ZA': { lat: -30.5595, lng: 22.9375 },
    'NG': { lat: 9.0820, lng: 8.6753 },
    'AR': { lat: -38.4161, lng: -63.6167 },
    'CL': { lat: -35.6751, lng: -71.5430 },
    'CO': { lat: 4.5709, lng: -74.2973 },
  };

  // Transform data for the globe
  const pointsData = data
    .map(country => {
      const coords = countryCoordinates[country.country_code];
      if (!coords) return null;

      return {
        lat: coords.lat,
        lng: coords.lng,
        size: Math.max(0.2, (country.visitors / Math.max(...data.map(d => d.visitors), 1)) * 1.5),
        color: '#3b82f6',
        label: `${country.country_name}: ${country.visitors} visitors (${country.percentage.toFixed(1)}%)`,
        visitors: country.visitors,
        countryName: country.country_name,
        percentage: country.percentage
      };
    })
    .filter(Boolean);

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && !isFullscreen) {
        const width = containerRef.current.offsetWidth;
        const size = Math.min(width, 700);
        setContainerSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);

  // Initialize globe
  useEffect(() => {
    if (globeEl.current && !loading) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
      globeEl.current.controls().enableZoom = true;
    }
  }, [loading]);

  // Handle auto-rotate
  useEffect(() => {
    if (globeEl.current && !loading) {
      globeEl.current.controls().autoRotate = autoRotate;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, [autoRotate, loading]);

  const toggleAutoRotate = () => setAutoRotate(!autoRotate);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
            <GlobeIcon className="text-primary-600" size={24} />
            Interactive Visitor Globe
          </h2>
          <p className="text-sm text-slate-300 mt-1">3D geographic distribution of visitors</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 min-h-[400px]">
          <Loader className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  // Fullscreen Portal Content
  const fullscreenModal = isFullscreen && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-slate-900 p-6 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-50 flex items-center gap-3">
              <GlobeIcon className="text-primary-600" size={32} />
              Interactive Visitor Globe
            </h2>
            <p className="text-base text-slate-300 mt-2">
              3D view of {data.reduce((sum, d) => sum + d.visitors, 0)} visitors across {data.length} countries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleAutoRotate}
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                autoRotate
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {autoRotate ? <RotateCw size={22} className="animate-spin" style={{ animationDuration: '3s' }} /> : <Pause size={22} />}
              <span className="text-sm font-medium">{autoRotate ? 'Rotating' : 'Paused'}</span>
            </motion.button>
            <motion.button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={22} />
              <span className="text-sm font-medium">Exit Fullscreen</span>
            </motion.button>
          </div>
        </div>

        {/* Globe Container */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="relative w-full h-full max-w-[min(90vh,90vw)] max-h-[min(90vh,90vw)] mx-auto">
            <Globe
              ref={globeEl}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={pointsData}
              pointAltitude="size"
              pointColor="color"
              pointRadius={0.6}
              pointLabel="label"
              pointsMerge={false}
              arcsData={[]}
              atmosphereColor="#3b82f6"
              atmosphereAltitude={0.15}
              enablePointerInteraction={true}
              animateIn={true}
            />
          </div>
        </div>

        {/* Controls & Legend */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-xl">🖱️</span>
              </div>
              <span>Click & drag to rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-xl">🔍</span>
              </div>
              <span>Scroll to zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${autoRotate ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <span className="text-xl">🔄</span>
              </div>
              <span>Auto-rotate: <strong className={autoRotate ? 'text-blue-400' : 'text-slate-300'}>{autoRotate ? 'ON' : 'OFF'}</strong></span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-8 text-base text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Small: Fewer visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500"></div>
              <span>Large: More visitors</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

  // Normal View
  return (
    <>
      {fullscreenModal}

      <motion.div
        ref={containerRef}
        className="h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
              <GlobeIcon className="text-primary-600" size={22} />
              Interactive Visitor Globe
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {data.reduce((sum, d) => sum + d.visitors, 0)} visitors across {data.length} countries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleAutoRotate}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                autoRotate
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={autoRotate ? 'Pause rotation' : 'Enable rotation'}
            >
              {autoRotate ? <RotateCw size={18} className="animate-spin" style={{ animationDuration: '3s' }} /> : <Pause size={18} />}
            </motion.button>
            <motion.button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Enter fullscreen"
            >
              <Maximize2 size={18} />
            </motion.button>
          </div>
        </div>

        {/* Globe */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div
            className="relative bg-slate-900/50 rounded-xl overflow-visible"
            style={{
              width: containerSize.width,
              height: containerSize.height,
            }}
          >
            <Globe
              ref={globeEl}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={pointsData}
              pointAltitude="size"
              pointColor="color"
              pointRadius={0.6}
              pointLabel="label"
              pointsMerge={false}
              arcsData={[]}
              atmosphereColor="#3b82f6"
              atmosphereAltitude={0.15}
              enablePointerInteraction={true}
              animateIn={true}
              width={containerSize.width}
              height={containerSize.height}
            />
          </div>
        </div>

        {/* Controls & Legend */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm">🖱️</span>
              </div>
              <span>Drag</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm">🔍</span>
              </div>
              <span>Zoom</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${autoRotate ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <span className="text-sm">🔄</span>
              </div>
              <span className={autoRotate ? 'text-blue-400' : ''}>{autoRotate ? 'ON' : 'OFF'}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Fewer</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>More</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
