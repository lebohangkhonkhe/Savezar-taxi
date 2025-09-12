import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Driver } from "@shared/schema";

export default function Drivers() {
  const { toast } = useToast();
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const { data: drivers, isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  // Set default selected driver when drivers load
  const activeDriver = drivers?.find(driver => driver.isActive) || drivers?.[0];
  const currentDriverId = selectedDriverId || activeDriver?.id || "";
  const currentDriver = drivers?.find(driver => driver.id === currentDriverId);

  const handleCall = () => {
    if (currentDriver?.phone) {
      toast({
        title: "Calling driver",
        description: `Calling ${currentDriver.name} at ${currentDriver.phone}`,
      });
    }
  };

  const handleMessage = () => {
    if (currentDriver) {
      toast({
        title: "Messaging driver",
        description: `Opening chat with ${currentDriver.name}`,
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400 text-xl"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400 text-xl"></i>);
      } else {
        stars.push(<i key={i} className="fas fa-star text-gray-300 text-xl"></i>);
      }
    }
    return stars;
  };

  if (!currentDriverId && !driversLoading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="DRIVERS" />
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center" data-testid="empty-state-no-drivers">
            <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Drivers Available</h3>
            <p className="text-muted-foreground">No drivers found in the system.</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="DRIVERS" />
      
      <div className="flex-1">
        {driversLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : currentDriver ? (
          <>
            {/* Driver Selection */}
            <div className="bg-white border-b border-border px-4 py-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                <h3 className="font-semibold text-foreground" data-testid="text-selected-driver">
                  Driver 1: {currentDriver.name}
                </h3>
              </div>
            </div>
            
            {/* Driver Photo */}
            <div className="bg-gray-900 relative h-64">
              {currentDriver.photoUrl ? (
                <img 
                  src={currentDriver.photoUrl}
                  alt={`Photo of ${currentDriver.name}`}
                  className="w-full h-full object-cover"
                  data-testid="img-driver-profile"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <i className="fas fa-user text-6xl text-gray-400"></i>
                </div>
              )}
            </div>
            
            {/* Driver Information */}
            <div className="bg-white p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1" data-testid="text-driver-name">
                  NAME: {currentDriver.name}
                </h2>
                <p className="text-lg text-muted-foreground" data-testid="text-driver-age">
                  AGE: {currentDriver.age}
                </p>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">AVERAGE PASSENGERS PER DAY:</p>
                <p className="text-3xl font-bold text-primary" data-testid="stat-avg-passengers">
                  {currentDriver.avgPassengersPerDay}
                </p>
              </div>
              
              {/* Driver Rating */}
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">DRIVER RATING</p>
                <div className="flex justify-center space-x-1" data-testid="rating-stars">
                  {renderStars(currentDriver.rating)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentDriver.rating.toFixed(1)} out of 5
                </p>
              </div>
              
              {/* Contact Actions */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleCall}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3"
                  data-testid="button-call"
                >
                  <i className="fas fa-phone"></i>
                </Button>
                <Button
                  onClick={handleMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3"
                  data-testid="button-message"
                >
                  <i className="fas fa-comment"></i>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center" data-testid="empty-state-driver-not-found">
              <i className="fas fa-user-slash text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Driver Not Found</h3>
              <p className="text-muted-foreground">The selected driver could not be found.</p>
            </div>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
}
