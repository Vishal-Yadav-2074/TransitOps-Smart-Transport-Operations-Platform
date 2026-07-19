import React, { useEffect, useRef } from 'react';

export default function InteractiveMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Locations definition - Centered on Gujarat Hubs & Western Corridor
  const ahmedabad = [23.0225, 72.5714];
  const destinations = [
    { name: 'Surat', coords: [21.1702, 72.8311], truck: 'Ashok Leyland 2820 (GJ-01-AB-4587)' },
    { name: 'Rajkot', coords: [22.3039, 70.8022], truck: 'Mahindra Blazo X (RJ-14-TA-2298)' },
    { name: 'Vadodara', coords: [22.3072, 73.1812], truck: 'Tata Prima 5530.S (GJ-18-KL-2281)' },
    { name: 'Bhavnagar', coords: [21.7645, 72.1519], truck: 'Force Traveller (GJ-06-MP-3344)' },
    { name: 'Gandhinagar', coords: [23.2156, 72.6369], truck: 'Tata Ace Gold (GJ-27-BA-9911)' },
    { name: 'Mumbai', coords: [19.0760, 72.8777], truck: 'BharatBenz 3528R (MH-12-TR-8541)' },
    { name: 'Pune', coords: [18.5204, 73.8567], truck: 'Eicher Pro 6048 (KA-03-HA-8877)' }
  ];

  // Interpolation helper to get intermediate position (0 to 1)
  const interpolate = (start, end, fraction) => {
    return [
      start[0] + (end[0] - start[0]) * fraction,
      start[1] + (end[1] - start[1]) * fraction
    ];
  };

  useEffect(() => {
    const L = window.L;
    if (!L || !mapContainerRef.current) return;

    // Determine current theme
    const isDark = document.documentElement.classList.contains('dark');
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    // 1. Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [22.25, 71.85],
      zoom: 7.5,
      zoomControl: false,
      attributionControl: false
    });
    mapRef.current = map;

    // Add visual zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // 2. Add Base Tile Layer
    const tileLayer = L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map);
    tileLayerRef.current = tileLayer;

    // 3. Define Custom Icons
    const hubIcon = L.divIcon({
      html: `<div class="flex items-center justify-center bg-rose-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const destIcon = L.divIcon({
      html: `<div class="flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full p-1 shadow-md border border-white dark:border-slate-800"><div class="h-2.5 w-2.5 rounded-full bg-indigo-600"></div></div>`,
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const truckIcon = L.divIcon({
      html: `<div class="flex items-center justify-center bg-indigo-600 text-white rounded-full p-1.5 shadow-md border border-white hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // 4. Place Ahmedabad Central Hub Marker
    L.marker(ahmedabad, { icon: hubIcon })
      .addTo(map)
      .bindPopup('<div class="font-bold text-xs text-slate-800 dark:text-slate-200">Ahmedabad Central Hub</div>');

    // 5. Build Dotted Route Polylines and Interactive Markers
    const truckMarkers = [];
    destinations.forEach(dest => {
      // Trace polyline route
      L.polyline([ahmedabad, dest.coords], {
        color: isDark ? '#4f46e5' : '#6366f1',
        weight: 2,
        dashArray: '5, 8',
        opacity: 0.6
      }).addTo(map);

      // Place Destination City Marker
      L.marker(dest.coords, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<div class="text-xs text-slate-800 dark:text-slate-200 font-semibold">${dest.name} Terminal</div>`);

      // Place Initial Truck Marker (interpolated halfway 50%)
      const initPos = interpolate(ahmedabad, dest.coords, 0.5);
      const marker = L.marker(initPos, { icon: truckIcon }).addTo(map);
      marker.bindPopup(`<div class="text-xs font-semibold text-slate-800 dark:text-slate-200">${dest.truck}</div><div class="text-[10px] text-slate-500 mt-0.5">Route: Ahmedabad ➔ ${dest.name}</div>`);
      
      truckMarkers.push({
        marker,
        start: ahmedabad,
        end: dest.coords,
        fraction: Math.random(), // Randomize starting positions
        speed: 0.02 + Math.random() * 0.02 // Random speed steps
      });
    });

    // 6. Set Location Update Animation Loops
    const interval = setInterval(() => {
      truckMarkers.forEach(t => {
        t.fraction += t.speed;
        if (t.fraction > 1.0) {
          t.fraction = 0; // Reset back to Hub
        }
        const nextPos = interpolate(t.start, t.end, t.fraction);
        t.marker.setLatLng(nextPos);
      });
    }, 1000);

    // Listen to global changes in dark mode class to swap tiles
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      const nextTileUrl = isDarkNow
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(nextTileUrl);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Cleanups
    return () => {
      clearInterval(interval);
      observer.disconnect();
      map.remove();
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Live Fleet Dispatch Map</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Simulated real-time tracking of route deliveries inside Gujarat region</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-250 dark:border-emerald-900/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Active Telemetry
        </div>
      </div>
      <div 
        ref={mapContainerRef} 
        className="h-96 w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden z-10" 
      />
    </div>
  );
}
