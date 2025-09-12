import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import MapComponent from "@/components/MapComponent";
import { Skeleton } from "@/components/ui/skeleton";
import type { Taxi } from "@shared/schema";

export default function Location() {
  const { data: taxis, isLoading } = useQuery<Taxi[]>({
    queryKey: ['/api/taxis'],
  });

  const activeTaxi = taxis?.find(taxi => taxi.isOnline) || taxis?.[0];

  return (
    <div className="h-full flex flex-col">
      <Header title="TAXI LOCATION" />
      
      {isLoading ? (
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      ) : activeTaxi ? (
        <MapComponent
          latitude={activeTaxi.currentLatitude || undefined}
          longitude={activeTaxi.currentLongitude || undefined}
          location={activeTaxi.currentLocation || undefined}
        />
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
