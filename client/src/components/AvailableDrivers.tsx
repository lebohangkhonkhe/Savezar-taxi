import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { availableDriverSchema, type AvailableDriverRequest, type AvailableDriver } from "@shared/schema";
import { UserPlus, Phone, Mail, Clock, Star, Trash2 } from "lucide-react";

export default function AvailableDrivers() {
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const { data: availableDrivers = [], isLoading } = useQuery<AvailableDriver[]>({
    queryKey: ["/api/available-drivers"],
  });

  const form = useForm<AvailableDriverRequest>({
    resolver: zodResolver(availableDriverSchema),
    defaultValues: {
      fullName: "",
      age: 18,
      drivingExperience: 0,
      availability: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: AvailableDriverRequest) => {
      const response = await apiRequest("POST", "/api/available-drivers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/available-drivers"] });
      toast({
        title: "Success!",
        description: "Driver registered successfully",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register driver",
        variant: "destructive",
      });
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/available-drivers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/available-drivers"] });
      toast({
        title: "Success!",
        description: "Driver removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove driver",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AvailableDriverRequest) => {
    createDriverMutation.mutate(data);
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm("Are you sure you want to remove this driver?")) {
      deleteDriverMutation.mutate(id);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-indigo-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="icon-available-drivers"
          >
            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900">
              <UserPlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                Available Drivers
              </CardTitle>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                {availableDrivers.length} driver{availableDrivers.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          {isExpanded && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="button-toggle-form"
            >
              {showForm ? "Cancel" : "Register"}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-indigo-200 dark:border-gray-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-indigo-600 dark:text-indigo-400">
                Register as Available Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              data-testid="input-fullname"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="25"
                              data-testid="input-age"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="drivingExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driving Experience (years)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="5"
                              data-testid="input-experience"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-availability">
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Weekends only">Weekends only</SelectItem>
                              <SelectItem value="Flexible">Flexible</SelectItem>
                              <SelectItem value="Night shifts">Night shifts</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+27 81 123 4567"
                              data-testid="input-phone"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="driver@example.com"
                              data-testid="input-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information..."
                            data-testid="input-notes"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createDriverMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    data-testid="button-submit"
                  >
                    {createDriverMutation.isPending ? "Registering..." : "Register as Driver"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Available Drivers List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
            Available Drivers ({availableDrivers.length})
          </h3>
          
          {isLoading ? (
            <div className="text-center py-4" data-testid="loading-drivers">
              Loading available drivers...
            </div>
          ) : availableDrivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="no-drivers">
              <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No available drivers yet</p>
              <p className="text-sm">Click Register to add the first driver</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {availableDrivers.map((driver: AvailableDriver) => (
                <Card 
                  key={driver.id} 
                  className="border-indigo-100 dark:border-gray-600"
                  data-testid={`card-driver-${driver.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100" data-testid={`text-name-${driver.id}`}>
                            {driver.fullName}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                          >
                            {driver.availability}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span data-testid={`text-age-${driver.id}`}>Age: {driver.age}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            <span data-testid={`text-experience-${driver.id}`}>{driver.drivingExperience} years exp.</span>
                          </div>
                          
                          {driver.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span data-testid={`text-phone-${driver.id}`}>{driver.phone}</span>
                            </div>
                          )}
                          
                          {driver.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span data-testid={`text-email-${driver.id}`}>{driver.email}</span>
                            </div>
                          )}
                        </div>

                        {driver.notes && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" data-testid={`text-notes-${driver.id}`}>
                            {driver.notes}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-gray-400">
                          Registered: {driver.registeredAt ? new Date(driver.registeredAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDriver(driver.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-${driver.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      )}
    </Card>
  );
}