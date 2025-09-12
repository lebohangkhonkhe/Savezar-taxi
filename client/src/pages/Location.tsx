import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

  // Filter out taxis with missing coordinate data
  const validTaxis = taxis?.filter(taxi => 
    taxi.currentLatitude !== null && 
    taxi.currentLongitude !== null &&
    taxi.currentLocation
  ) || [];

  const currentTaxi = validTaxis[currentTaxiIndex];

  const nextTaxi = () => {
    setCurrentTaxiIndex((prev) => (prev + 1) % validTaxis.length);
  };

  const prevTaxi = () => {
    setCurrentTaxiIndex((prev) => (prev - 1 + validTaxis.length) % validTaxis.length);
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="TAXI LOCATION" />
      
      {isLoading ? (
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      ) : validTaxis.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <MapComponent
            latitude={currentTaxi.currentLatitude || undefined}
            longitude={currentTaxi.currentLongitude || undefined}
            location={currentTaxi.currentLocation || undefined}
          />
          
          {/* Taxi Navigation Controls */}
          {validTaxis.length > 1 && (
            <div className="bg-white p-4 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTaxi}
                data-testid="button-prev-taxi"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center" data-testid="taxi-counter">
                <div className="text-sm font-medium">{currentTaxi.name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentTaxiIndex + 1}/{validTaxis.length}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTaxi}
                data-testid="button-next-taxi"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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
      
      <Navigation />
    </div>
  );
}
