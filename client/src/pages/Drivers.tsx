import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="flex-1 flex items-center justify-center bg-gray-900">
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
    <div className="h-full flex flex-col pb-16">
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
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                  <h3 className="font-semibold text-white" data-testid="text-selected-driver">
                    Driver {(drivers?.findIndex(d => d.id === currentDriverId) || 0) + 1}: {currentDriver.name}
                  </h3>
                </div>
                
                {/* Navigation Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      const currentIndex = drivers?.findIndex(d => d.id === currentDriverId) || 0;
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : (drivers?.length || 1) - 1;
                      const prevDriver = drivers?.[prevIndex];
                      if (prevDriver) setSelectedDriverId(prevDriver.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    data-testid="button-prev-driver"
                  >
                    <i className="fas fa-chevron-left text-sm"></i>
                  </Button>
                  <span className="text-sm text-muted-foreground" data-testid="text-driver-counter">
                    {(drivers?.findIndex(d => d.id === currentDriverId) || 0) + 1}/{drivers?.length || 0}
                  </span>
                  <Button
                    onClick={() => {
                      const currentIndex = drivers?.findIndex(d => d.id === currentDriverId) || 0;
                      const nextIndex = currentIndex < (drivers?.length || 1) - 1 ? currentIndex + 1 : 0;
                      const nextDriver = drivers?.[nextIndex];
                      if (nextDriver) setSelectedDriverId(nextDriver.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    data-testid="button-next-driver"
                  >
                    <i className="fas fa-chevron-right text-sm"></i>
                  </Button>
                </div>
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
            
            {/* Driver Information - Scrollable Content */}
            <div className="bg-gray-900 p-6 pb-32">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1" data-testid="text-driver-name">
                  NAME: {currentDriver.name}
                </h2>
                <p className="text-lg text-gray-400" data-testid="text-driver-age">
                  AGE: {currentDriver.age}
                </p>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-gray-400 mb-2">AVERAGE PASSENGERS PER DAY:</p>
                <p className="text-3xl font-bold text-primary" data-testid="stat-avg-passengers">
                  {currentDriver.avgPassengersPerDay}
                </p>
              </div>
              
              {/* Driver Rating */}
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-gray-400 mb-2">DRIVER RATING</p>
                <div className="flex justify-center space-x-1" data-testid="rating-stars">
                  {renderStars(currentDriver.rating)}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {currentDriver.rating.toFixed(1)} out of 5
                </p>
              </div>
              
              {/* Contact Actions */}
              <div className="flex justify-center space-x-4 mb-6">
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
              
              {/* Additional Driver Details */}
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Driver Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white">{currentDriver.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`${currentDriver.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {currentDriver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experience:</span>
                      <span className="text-white">{Math.floor(Math.random() * 10) + 1} years</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Recent Performance</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">TRIPS TODAY</p>
                      <p className="text-lg font-bold text-primary">{Math.floor(Math.random() * 20) + 5}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">EARNINGS TODAY</p>
                      <p className="text-lg font-bold text-primary">R{(Math.random() * 2000 + 500).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center" data-testid="empty-state-driver-not-found">
              <i className="fas fa-user-slash text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold text-white mb-2">Driver Not Found</h3>
              <p className="text-gray-400">The selected driver could not be found.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Sticky Tabs */}
      <div className="bg-gray-900 border-t border-gray-700 sticky bottom-16 z-10">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-none">
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-profile">
              Profile
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-performance">
              Performance
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-contact">
              Contact
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="px-4 py-2">
            <p className="text-sm text-gray-400 text-center">Driver profile information and details</p>
          </TabsContent>
          
          <TabsContent value="performance" className="px-4 py-2">
            <p className="text-sm text-gray-400 text-center">Performance metrics and statistics</p>
          </TabsContent>
          
          <TabsContent value="contact" className="px-4 py-2">
            <p className="text-sm text-gray-400 text-center">Contact options and communication history</p>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Fixed Main Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <Navigation />
      </div>
    </div>
  );
}
