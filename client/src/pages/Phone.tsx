import { useState, useEffect, useRef } from "react";
import { Phone as PhoneIcon, PhoneCall, PhoneOff, Delete, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Device } from "@twilio/voice-sdk";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface VoiceToken {
  token: string;
  identity: string;
}

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  vehicleModel: string;
  licenseNumber: string;
  taxiId: string;
}

export default function Phone() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("Ready to call");
  const { toast } = useToast();
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<any>(null);
  const [, setLocation] = useLocation();

  // Fetch Twilio access token
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery<VoiceToken>({
    queryKey: ['/api/voice/token'],
    retry: false
  });

  // Fetch drivers for quick dial
  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
    retry: false
  });

  // Initialize Twilio Device
  useEffect(() => {
    if (tokenData?.token && !deviceRef.current) {
      try {
        const device = new Device(tokenData.token, {
          logLevel: 1,
        });

        device.on("registered", () => {
          setIsConnected(true);
          setCallStatus("Connected - Ready to call");
          toast({
            title: "Phone Ready",
            description: "You can now make calls through the app",
          });
        });

        device.on("error", (error) => {
          console.error("Device error:", error);
          setCallStatus("Connection error");
          toast({
            title: "Phone Error", 
            description: "Failed to connect to phone service",
            variant: "destructive"
          });
        });

        device.on("incoming", (call) => {
          setCallStatus(`Incoming call from ${call.parameters.From}`);
          toast({
            title: "Incoming Call",
            description: `Call from ${call.parameters.From}`,
          });
          
          // Auto-accept for demo (in real app, show accept/decline UI)
          call.accept();
          callRef.current = call;
          setIsCallActive(true);
          setCallStatus("Call in progress");
        });

        device.register();
        deviceRef.current = device;
      } catch (error) {
        console.error("Failed to initialize device:", error);
        setCallStatus("Failed to initialize");
        toast({
          title: "Phone Error",
          description: "Failed to initialize phone service",
          variant: "destructive"
        });
      }
    }
  }, [tokenData, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
    };
  }, []);

  const makeCall = async () => {
    if (!deviceRef.current || !phoneNumber.trim()) {
      toast({
        title: "Invalid Call",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setCallStatus("Connecting...");
      const call = await deviceRef.current.connect({
        params: { To: phoneNumber }
      });

      callRef.current = call;
      setIsCallActive(true);
      setCallStatus("Call in progress");

      call.on("accept", () => {
        setCallStatus("Call connected");
      });

      call.on("disconnect", () => {
        setIsCallActive(false);
        setCallStatus("Call ended");
        callRef.current = null;
      });

      call.on("reject", () => {
        setIsCallActive(false);
        setCallStatus("Call rejected");
        callRef.current = null;
      });

      toast({
        title: "Calling",
        description: `Calling ${phoneNumber}...`,
      });
    } catch (error) {
      console.error("Call failed:", error);
      setCallStatus("Call failed");
      toast({
        title: "Call Failed",
        description: "Unable to place call",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    if (callRef.current) {
      callRef.current.disconnect();
      setIsCallActive(false);
      setCallStatus("Call ended");
      callRef.current = null;
    }
  };

  const dialPadNumbers = [
    ["1", "2", "3"],
    ["4", "5", "6"], 
    ["7", "8", "9"],
    ["*", "0", "#"]
  ];

  const addDigit = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const removeDigit = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const goBack = () => {
    setLocation("/");
  };

  if (tokenLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <PhoneIcon className="h-12 w-12 animate-spin mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Initializing phone service...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show the phone interface even with connection errors
  const hasConnectionError = tokenError || (!tokenData && !tokenLoading);

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-5 w-5 text-red-500" />
              <span>Phone</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="p-2"
              data-testid="button-go-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Error Alert */}
          {hasConnectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm font-medium">Phone Service Offline</span>
              </div>
              <p className="text-red-600 text-xs mt-1">
                Voice calling unavailable. Dial pad works for testing.
              </p>
            </div>
          )}

          {/* Status Display */}
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-gray-600" data-testid="text-call-status">{hasConnectionError ? "Service offline - UI testing only" : callStatus}</p>
          </div>

          {/* Phone Number Display */}
          <div className="relative">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="text-lg text-center pr-12"
              data-testid="input-phone-number"
            />
            {phoneNumber && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeDigit}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                data-testid="button-backspace"
              >
                <Delete className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Dial Pad */}
          <div className="grid grid-cols-3 gap-3">
            {dialPadNumbers.flat().map((digit) => (
              <Button
                key={digit}
                variant="outline"
                size="lg"
                onClick={() => addDigit(digit)}
                className="aspect-square text-xl font-semibold"
                data-testid={`button-dial-${digit}`}
              >
                {digit}
              </Button>
            ))}
          </div>

          {/* Call Controls */}
          <div className="flex space-x-4 pt-4">
            {!isCallActive ? (
              <Button
                onClick={makeCall}
                disabled={!isConnected || !phoneNumber.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                data-testid="button-start-call"
              >
                <PhoneCall className="h-5 w-5 mr-2" />
                Call
              </Button>
            ) : (
              <Button
                onClick={endCall}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                data-testid="button-end-call"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setPhoneNumber("911")}
                className="w-full justify-start"
                data-testid="button-emergency"
              >
                <PhoneIcon className="h-4 w-4 mr-2 text-red-500" />
                Emergency (911)
              </Button>
              <Button
                variant="outline"
                onClick={() => setPhoneNumber("+1234567890")}
                className="w-full justify-start"
                data-testid="button-dispatch"
              >
                <PhoneIcon className="h-4 w-4 mr-2 text-blue-500" />
                Taxi Dispatch
              </Button>
            </div>

            {/* Driver Quick Dial */}
            {drivers && drivers.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Call Drivers</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {drivers.slice(0, 5).map((driver) => (
                    <Button
                      key={driver.id}
                      variant="outline"
                      onClick={() => setPhoneNumber(driver.phoneNumber)}
                      className="w-full justify-start text-left"
                      data-testid={`button-call-driver-${driver.id}`}
                    >
                      <PhoneIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{driver.name}</div>
                        <div className="text-xs text-gray-500 truncate">{driver.vehicleModel}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}