import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Taxi, TaxiStats, Driver } from "@shared/schema";

export default function Statistics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTaxiId, setSelectedTaxiId] = useState<string>("");

  const { data: taxis, isLoading: taxisLoading } = useQuery<Taxi[]>({
    queryKey: ['/api/taxis'],
  });

  // Set default selected taxi when taxis load
  const activeTaxi = taxis?.find(taxi => taxi.isOnline) || taxis?.[0];
  const currentTaxiId = selectedTaxiId || activeTaxi?.id || "";

  const { data: stats, isLoading: statsLoading } = useQuery<TaxiStats>({
    queryKey: ['/api/stats/taxi', currentTaxiId],
    enabled: !!currentTaxiId,
  });

  const { data: driver, isLoading: driverLoading } = useQuery<Driver>({
    queryKey: ['/api/drivers/taxi', currentTaxiId],
    enabled: !!currentTaxiId,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Simulate refreshing stats with slight variations
      const newStats = {
        passengersToday: (stats?.passengersToday || 142) + Math.floor(Math.random() * 10),
        distanceTraveled: (stats?.distanceTraveled || 285.6) + Math.random() * 5,
        routeEfficiency: (stats?.routeEfficiency || 87.2) + (Math.random() - 0.5) * 2,
        fuelConsumption: (stats?.fuelConsumption || 34.8) + (Math.random() - 0.5) * 2,
        totalEarnings: (stats?.totalEarnings || 28500) + Math.random() * 1000,
      };
      
      const response = await apiRequest("PATCH", `/api/stats/taxi/${currentTaxiId}`, newStats);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats/taxi', currentTaxiId] });
      toast({
        title: "Stats refreshed",
        description: "Statistics have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = taxisLoading || statsLoading || driverLoading;

  if (!currentTaxiId && !taxisLoading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="TAXI STATISTICS" />
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center" data-testid="empty-state-no-taxis">
            <i className="fas fa-chart-bar text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Taxis Available</h3>
            <p className="text-muted-foreground">No taxis found to display statistics for.</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-16">
      <Header title="TAXI STATISTICS" />
      
      <div className="flex-1 bg-gray-900 p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32 mx-auto" />
          </div>
        ) : (
          <>
            {/* Taxi Selection */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                <h3 className="font-semibold text-white" data-testid="text-selected-taxi">
                  Taxi 1
                </h3>
              </div>
            </div>
            
            {/* Driver Photo */}
            <div className="text-center mb-6">
              {driver?.photoUrl ? (
                <img 
                  src={driver.photoUrl}
                  alt={`Photo of ${driver.name}`}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-primary object-cover"
                  data-testid="img-driver-photo"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto border-4 border-primary bg-muted flex items-center justify-center">
                  <i className="fas fa-user text-2xl text-muted-foreground"></i>
                </div>
              )}
            </div>
            
            {/* Statistics - Scrollable Content */}
            <div className="space-y-6 pb-20">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400 mb-1">PASSENGERS TODAY</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-passengers">
                  {stats?.passengersToday || 0} passengers
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400 mb-1">DISTANCE TRAVELED</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-distance">
                  {stats?.distanceTraveled?.toFixed(1) || 0} km
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400 mb-1">ROUTE EFFICIENCY</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-efficiency">
                  {stats?.routeEfficiency?.toFixed(1) || 0}%
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400 mb-1">FUEL CONSUMPTION</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-fuel">
                  {stats?.fuelConsumption?.toFixed(1) || 0} L
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400 mb-1">TOTAL EARNINGS</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-earnings">
                  R{stats?.totalEarnings?.toLocaleString() || 0}
                </p>
              </div>
              
              {/* Refresh Button */}
              <div className="text-center mt-8">
                <Button 
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-medium"
                  data-testid="button-refresh"
                >
                  {refreshMutation.isPending ? "refreshing..." : "refresh"}
                </Button>
              </div>
              
              {/* Extra content to demonstrate scrolling */}
              <div className="space-y-4 mt-8">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400 mb-1">DAILY PERFORMANCE</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400">AVG SPEED</p>
                      <p className="text-base font-bold text-white">45 km/h</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400">BREAK TIME</p>
                      <p className="text-base font-bold text-white">2.5 hrs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Sticky Tabs */}
      <div className="bg-gray-900 border-t border-gray-700 sticky bottom-16 z-10">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-none">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-daily">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-weekly">
              Weekly
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="px-4 py-2">
            <p className="text-sm text-gray-400 text-center">Current day overview - main statistics displayed above</p>
          </TabsContent>
          
          <TabsContent value="daily" className="px-4 py-2">
            <p className="text-sm text-gray-400 text-center">Daily performance tracking and trends</p>
          </TabsContent>
          
          <TabsContent value="weekly" className="px-4 py-2">
            <p className="text-sm text-gray-400 text-center">Weekly statistics and performance analysis</p>
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
