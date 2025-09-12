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
  return (
    <div className="flex-1 relative bg-gray-100">
      <div className="absolute inset-0 map-pattern"></div>
      
      {/* Location Info Card */}
      <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-md p-4">
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
      
      {/* Taxi Marker */}
      <div 
        className="absolute" 
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg" data-testid="taxi-marker"></div>
      </div>
      
      {/* Center Location Button */}
      <div className="absolute bottom-4 right-4">
        <button 
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          data-testid="button-center-location"
        >
          <i className="fas fa-crosshairs text-primary text-xl"></i>
        </button>
      </div>
    </div>
  );
}
