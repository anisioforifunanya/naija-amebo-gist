'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '@/styles/interactive-map.css';

interface UserLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  activity: number; // 0-100 engagement score
  users: number; // number of users in that location
  lastActive: string;
  avatar?: string;
}

interface InteractiveAnalyticsMapProps {
  data?: UserLocation[];
  showHeatmap?: boolean;
  showClusters?: boolean;
  zoomLevel?: number;
}

export default function InteractiveAnalyticsMap({
  data,
  showHeatmap = true,
  showClusters = true,
  zoomLevel = 6,
}: InteractiveAnalyticsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mounted, setMounted] = useState(false);
  const markerClusterGroupRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);

  // Mock data for Nigerian regions - real live locations
  const mockUserLocations: UserLocation[] = [
    {
      id: 'lg-001',
      name: 'Lagos Hub',
      latitude: 6.5244,
      longitude: 3.3792,
      city: 'Lagos',
      state: 'Lagos',
      activity: 95,
      users: 2500,
      lastActive: '2 mins ago',
      avatar: '👨‍💻',
    },
    {
      id: 'ab-001',
      name: 'Abuja Central',
      latitude: 9.0765,
      longitude: 7.3986,
      city: 'Abuja',
      state: 'FCT',
      activity: 87,
      users: 1800,
      lastActive: '5 mins ago',
      avatar: '🎬',
    },
    {
      id: 'kn-001',
      name: 'Kano Metro',
      latitude: 12.0022,
      longitude: 8.6753,
      city: 'Kano',
      state: 'Kano',
      activity: 76,
      users: 1200,
      lastActive: '8 mins ago',
      avatar: '🛍️',
    },
    {
      id: 'ph-001',
      name: 'Port Harcourt District',
      latitude: 4.7527,
      longitude: 7.0087,
      city: 'Port Harcourt',
      state: 'Rivers',
      activity: 82,
      users: 950,
      lastActive: '3 mins ago',
      avatar: '🎤',
    },
    {
      id: 'ib-001',
      name: 'Ibadan City',
      latitude: 7.3869,
      longitude: 3.8956,
      city: 'Ibadan',
      state: 'Oyo',
      activity: 71,
      users: 780,
      lastActive: '10 mins ago',
      avatar: '📸',
    },
    {
      id: 'en-001',
      name: 'Enugu Central',
      latitude: 6.4969,
      longitude: 7.5519,
      city: 'Enugu',
      state: 'Enugu',
      activity: 68,
      users: 620,
      lastActive: '12 mins ago',
      avatar: '💬',
    },
    {
      id: 'cl-001',
      name: 'Calabar Beach',
      latitude: 4.9515,
      longitude: 8.3304,
      city: 'Calabar',
      state: 'Cross River',
      activity: 59,
      users: 480,
      lastActive: '15 mins ago',
      avatar: '🏖️',
    },
    {
      id: 'lr-001',
      name: 'Ilorin Hub',
      latitude: 8.495,
      longitude: 4.5431,
      city: 'Ilorin',
      state: 'Kwara',
      activity: 65,
      users: 370,
      lastActive: '7 mins ago',
      avatar: '🎮',
    },
  ];

  const locations = data || mockUserLocations;

  useEffect(() => {
    setMounted(true);

    if (!mapRef.current) {
      // Initialize map
      const map = L.map('analytics-map').setView([9.0765, 7.3986], zoomLevel);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Create custom icons with activity colors
      const getMarkerColor = (activity: number) => {
        if (activity >= 80) return '#ef4444'; // red
        if (activity >= 60) return '#f97316'; // orange
        if (activity >= 40) return '#eab308'; // yellow
        return '#22c55e'; // green
      };

      // Create marker cluster group if clustering is enabled
      if (showClusters) {
        const MarkerClusterGroup = (L as any).markerClusterGroup;
        markerClusterGroupRef.current = new MarkerClusterGroup({
          maxClusterRadius: 80,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
        });
        map.addLayer(markerClusterGroupRef.current);
      }

      // Add markers for each location
      locations.forEach((location) => {
        const markerColor = getMarkerColor(location.activity);

        const html = `
          <div class="flex flex-col items-center">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mb-2 min-w-max border-2" style="border-color: ${markerColor}">
              <div class="flex items-center gap-2">
                <span class="text-2xl">${location.avatar || '📍'}</span>
                <div>
                  <div class="font-bold text-sm text-gray-900 dark:text-white">${location.name}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">${location.city}, ${location.state}</div>
                </div>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                <div class="flex justify-between gap-4">
                  <span class="text-gray-600 dark:text-gray-300">👥 ${location.users.toLocaleString()} users</span>
                  <span class="text-gray-600 dark:text-gray-300">⚡ ${location.activity}% active</span>
                </div>
                <div class="text-gray-500 dark:text-gray-400 mt-1">Last: ${location.lastActive}</div>
              </div>
            </div>
            <div class="w-4 h-4 rounded-full" style="background-color: ${markerColor}; box-shadow: 0 0 10px ${markerColor}80;"></div>
          </div>
        `;

        const marker = L.marker([location.latitude, location.longitude], {
          icon: L.divIcon({
            html,
            className: 'custom-marker',
            iconSize: [0, 0],
            popupAnchor: [0, -35],
          }),
          title: location.name,
        });

        const popupContent = `
          <div class="popup-content">
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">${location.name}</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-gray-600 dark:text-gray-400">Location</p>
                <p class="font-semibold text-gray-900 dark:text-white">${location.city}</p>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400">Users</p>
                <p class="font-semibold text-gray-900 dark:text-white">${location.users}</p>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400">Activity</p>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    style="width: ${location.activity}%"
                  ></div>
                </div>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400">Status</p>
                <p class="font-semibold text-green-600">${location.lastActive}</p>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'analytics-popup',
        });

        if (showClusters && markerClusterGroupRef.current) {
          markerClusterGroupRef.current.addLayer(marker);
        } else {
          marker.addTo(map);
        }
      });

      // Add heatmap layer if enabled
      if (showHeatmap) {
        const heatmapData = locations.map((loc) => [
          loc.latitude,
          loc.longitude,
          loc.activity / 100, // normalize to 0-1
        ]);

        const HeatmapLayer = (L as any).heatLayer;
        if (HeatmapLayer) {
          heatmapLayerRef.current = HeatmapLayer(heatmapData, {
            radius: 50,
            blur: 15,
            maxZoom: 17,
            gradient: {
              0.0: '#0000ff',
              0.25: '#00ff00',
              0.5: '#ffff00',
              0.75: '#ff7f00',
              1.0: '#ff0000',
            },
          }).addTo(map);
        }
      }
    }

    return () => {
      // Cleanup is handled by Leaflet
    };
  }, [locations, showHeatmap, showClusters, zoomLevel]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <div
        id="analytics-map"
        className="w-full h-full min-h-[500px]"
        style={{ background: '#f0f0f0' }}
      />
    </div>
  );
}
