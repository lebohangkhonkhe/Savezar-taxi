import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Taxi, Driver } from "@shared/schema";

export default function Broadcast() {
  const [isLive, setIsLive] = useState(true);
  const [selectedTaxiId, setSelectedTaxiId] = useState<string>("");

  const { data: taxis, isLoading: taxisLoading } = useQuery<Taxi[]>({
    queryKey: ['/api/taxis'],
  });

  // Set default selected taxi when taxis load
  const activeTaxi = taxis?.find(taxi => taxi.isOnline) || taxis?.[0];
  const currentTaxiId = selectedTaxiId || activeTaxi?.id || "";

  const { data: driver, isLoading: driverLoading } = useQuery<Driver>({
    queryKey: ['/api/drivers/taxi', currentTaxiId],
    enabled: !!currentTaxiId,
  });

  const handleToggleRecording = () => {
    setIsLive(!isLive);
  };

  const handleNextTaxi = () => {
    if (taxis && taxis.length > 1) {
      const currentIndex = taxis.findIndex(taxi => taxi.id === currentTaxiId);
      const nextIndex = (currentIndex + 1) % taxis.length;
      setSelectedTaxiId(taxis[nextIndex].id);
    }
  };

  const isLoading = taxisLoading || driverLoading;

  if (!currentTaxiId && !taxisLoading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="LIVE BROADCAST" />
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white" data-testid="empty-state-no-broadcast">
            <i className="fas fa-video text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No Broadcast Available</h3>
            <p className="text-gray-300">No active taxis available for live broadcast.</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="LIVE BROADCAST" />
      
      <div className="flex-1 bg-gray-900 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {/* Taxi Selection */}
            <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-md p-3 z-10">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-full mr-3"></div>
                <h3 className="font-semibold text-foreground" data-testid="text-broadcast-taxi">
                  TAXI 1 ({driver?.name || 'Driver'})
                </h3>
                <button className="ml-auto" onClick={handleNextTaxi} data-testid="button-select-taxi">
                  <i className="fas fa-chevron-down text-muted-foreground"></i>
                </button>
              </div>
            </div>
            
            {/* Video Feed Simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Interior view of taxi with passengers" 
                className="w-full h-full object-cover"
                data-testid="video-feed"
              />
              
              {/* Video Overlay */}
              {!isLive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <i className="fas fa-play text-6xl mb-4"></i>
                    <p className="text-xl font-semibold">Broadcast Paused</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Live Indicator */}
            {isLive && (
              <div className="absolute top-20 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center" data-testid="status-live">
                <div className="w-2 h-2 bg-white rounded-full mr-2 pulse-dot"></div>
                GO LIVE
              </div>
            )}
            
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
              <Button
                onClick={handleToggleRecording}
                className={`rounded-full p-4 shadow-lg ${
                  isLive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-primary hover:bg-primary/90'
                } text-white`}
                data-testid="button-toggle-broadcast"
              >
                <i className={`fas ${isLive ? 'fa-stop' : 'fa-play'} text-xl`}></i>
              </Button>
            </div>
            
            {/* Next Taxi Button */}
            {taxis && taxis.length > 1 && (
              <button 
                onClick={handleNextTaxi}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
                data-testid="button-next-taxi"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            )}
          </>
        )}
      </div>
      
      <Navigation />
    </div>
  );
}
