import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
        passengersToday: (stats?.passengersToday || 140) + Math.floor(Math.random() * 10),
        kilometersToday: (stats?.kilometersToday || 146) + Math.random() * 5,
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
        <Header title="TAXIstats." />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
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
    <div className="h-full flex flex-col">
      <Header title="TAXIstats." />
      
      <div className="flex-1 bg-gray-50 p-4">
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
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                <h3 className="font-semibold text-foreground" data-testid="text-selected-taxi">
                  Taxi 1: {driver?.name || 'Driver'}
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
            
            {/* Statistics */}
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">PASSENGERS TODAY</p>
                <p className="text-4xl font-bold text-primary" data-testid="stat-passengers">
                  {stats?.passengersToday || 0}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">KILOMETRES DRIVEN TODAY</p>
                <p className="text-4xl font-bold text-primary" data-testid="stat-kilometers">
                  {stats?.kilometersToday?.toFixed(0) || 0} kMs
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
            </div>
          </>
        )}
      </div>
      
      <Navigation />
    </div>
  );
}
