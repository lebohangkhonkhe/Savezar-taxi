import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  location?: string;
  showCoordinates?: boolean;
}

export default function MapComponent({ 
  latitude = 6.5244, 
  longitude = 3.3792, 
  location = "Akina Jola St",
  showCoordinates = true
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Fix for default markers in Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
  });

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Update map center and marker position
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 13);
      
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Create custom taxi icon
      const taxiIcon = L.divIcon({
        className: 'custom-taxi-marker',
        html: '<div class="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><i class="fas fa-taxi text-white text-xs"></i></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Add new marker
      markerRef.current = L.marker([latitude, longitude], { icon: taxiIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<div class="text-center"><strong>${location}</strong><br/>${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>`);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
    };
  }, [latitude, longitude, location]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const centerMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }
  };

  return (
    <div className="flex-1 relative bg-gray-100">
      {/* Leaflet Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0"></div>
      
      {/* Location Info Card */}
      <div className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 z-10">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3" data-testid="status-online"></div>
          <div>
            <h3 className="font-semibold text-foreground" data-testid="text-location">
              {location}
            </h3>
            {showCoordinates && (
              <p className="text-sm text-muted-foreground">
                {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Center Location Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button 
          onClick={centerMap}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          data-testid="button-center-location"
        >
          <i className="fas fa-crosshairs text-primary text-xl"></i>
        </button>
      </div>
    </div>
  );
}
