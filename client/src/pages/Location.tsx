import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import MapComponent from "@/components/MapComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Taxi } from "@shared/schema";

export default function Location() {
  const { data: taxis, isLoading } = useQuery<Taxi[]>({
    queryKey: ['/api/taxis'],
  });

  const [currentTaxiIndex, setCurrentTaxiIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Filter out taxis with missing coordinate data
  const validTaxis = taxis?.filter(taxi => 
    taxi.currentLatitude !== null && 
    taxi.currentLongitude !== null &&
    taxi.currentLocation
  ) || [];

  const currentTaxi = validTaxis[currentTaxiIndex];

  const nextTaxi = () => {
    if (validTaxis.length > 0) {
      setCurrentTaxiIndex((prev) => (prev + 1) % validTaxis.length);
    }
  };

  const prevTaxi = () => {
    if (validTaxis.length > 0) {
      setCurrentTaxiIndex((prev) => (prev - 1 + validTaxis.length) % validTaxis.length);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocationLoading(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Auto-request location on component mount
  useEffect(() => {
    console.log('Location component mounted, requesting location...');
    getCurrentLocation();
  }, []);
  
  // Debug location state
  useEffect(() => {
    console.log('Location state:', { userLocation, locationError, isLocationLoading });
  }, [userLocation, locationError, isLocationLoading]);

  return (
    <div className="h-full flex flex-col pb-16">
      <Header title="TAXI LOCATION" />
      
      {isLoading ? (
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      ) : validTaxis.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <MapComponent
            latitude={userLocation?.lat || currentTaxi?.currentLatitude || undefined}
            longitude={userLocation?.lng || currentTaxi?.currentLongitude || undefined}
            location={userLocation ? `Your Current Location` : currentTaxi?.currentLocation || undefined}
            showCoordinates={true}
          />
          
          {/* Location Status */}
          <div className="absolute top-4 left-4 right-4 z-10">
            {userLocation && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-2" data-testid="location-success">
                <i className="fas fa-map-marker-alt mr-2"></i>
                Using your current location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </div>
            )}
            {!userLocation && currentTaxi && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-2" data-testid="location-taxi">
                <i className="fas fa-taxi mr-2"></i>
                Showing {currentTaxi.name} location ({currentTaxi.currentLatitude?.toFixed(4)}, {currentTaxi.currentLongitude?.toFixed(4)})
              </div>
            )}
            {locationError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-2" data-testid="location-error">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {locationError}
                <button 
                  onClick={getCurrentLocation}
                  className="ml-2 text-yellow-800 underline"
                  data-testid="button-retry-location"
                >
                  Retry
                </button>
              </div>
            )}
            {isLocationLoading && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-2" data-testid="location-loading">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Getting your location...
              </div>
            )}
          </div>
          
          {/* Location and Taxi Navigation Controls */}
          <div className="bg-gray-800 p-4 border-t flex items-center justify-between">
            {/* Location Toggle Button */}
            <Button
              onClick={getCurrentLocation}
              disabled={isLocationLoading}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-get-location"
            >
              <i className={`fas ${isLocationLoading ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'} mr-2`}></i>
              {userLocation ? 'Update Location' : 'Use My Location'}
            </Button>
            
            {/* Taxi Navigation Controls */}
            {validTaxis.length > 1 && (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTaxi}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  data-testid="button-prev-taxi"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center" data-testid="taxi-counter">
                  <div className="text-sm font-medium text-white">{currentTaxi.name}</div>
                  <div className="text-xs text-gray-400">
                    {currentTaxiIndex + 1}/{validTaxis.length}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTaxi}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  data-testid="button-next-taxi"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center" data-testid="empty-state-taxis">
            <i className="fas fa-map-marker-alt text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Taxis Available</h3>
            <p className="text-muted-foreground">No active taxis found in the system.</p>
          </div>
        </div>
      )}
      
      {/* Fixed Main Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <Navigation />
      </div>
    </div>
  );
}
