import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Taxi, Driver } from "@shared/schema";

export default function Broadcast() {
  const [isLive, setIsLive] = useState(false);
  const [selectedTaxiId, setSelectedTaxiId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [autoStartRecording, setAutoStartRecording] = useState(false);
  const [audioRecording, setAudioRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleToggleRecording = async () => {
    console.log('handleToggleRecording called, current isRecording:', isRecording);
    
    if (!isRecording) {
      try {
        console.log('Requesting camera and microphone access...');
        
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }
        
        // Request camera and microphone permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        
        console.log('Media stream obtained:', stream);
        
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Create MediaRecorder with fallback MIME types
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          setRecordedChunks(chunks);
          // You can save the recording here
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          console.log('Recording saved:', url);
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Record in 1-second chunks to manage memory
        
        console.log('Setting recording state to true');
        setIsRecording(true);
        setIsLive(true);
        
        console.log('Recording started successfully');
        
      } catch (error) {
        console.error('Error starting recording:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorName = error instanceof Error ? error.name : 'Error';
        console.error('Error details:', errorMessage, errorName);
        alert(`Could not access camera/microphone: ${errorMessage}. Please check permissions.`);
      }
    } else {
      // Stop recording
      console.log('Stopping recording...');
      stopRecording();
    }
  };

  const handleNextTaxi = () => {
    if (taxis && taxis.length > 1) {
      // Stop recording when switching taxis
      if (isRecording) {
        stopRecording();
      }
      const currentIndex = taxis.findIndex(taxi => taxi.id === currentTaxiId);
      const nextIndex = (currentIndex + 1) % taxis.length;
      setSelectedTaxiId(taxis[nextIndex].id);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setIsLive(false);
  };

  const isLoading = taxisLoading || driverLoading;
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);
  
  // Debug logging for recording state
  useEffect(() => {
    console.log('Recording state changed:', { isRecording, isLive, mediaStream: !!mediaStream, autoStartRecording });
  }, [isRecording, isLive, mediaStream, autoStartRecording]);
  
  // Auto-start recording when enabled and taxi changes
  useEffect(() => {
    if (autoStartRecording && currentTaxiId && !isRecording) {
      console.log('Auto-starting recording for taxi:', currentTaxiId);
      handleToggleRecording();
    }
  }, [currentTaxiId, autoStartRecording]); // Don't include isRecording to avoid loops

  if (!currentTaxiId && !taxisLoading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="BROADCAST" />
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
    <div className="h-full flex flex-col bg-gray-900">
      <Header title="BROADCAST" />
      
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {/* Taxi Selection */}
            <div className="absolute top-4 left-4 right-4 bg-gray-800 rounded-lg shadow-md p-3 z-10">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-full mr-3"></div>
                <h3 className="font-semibold text-white" data-testid="text-selected-taxi">
                  {activeTaxi?.name || 'Taxi 1'}: {driver?.name || 'Driver'}
                </h3>
                <button className="ml-auto" onClick={handleNextTaxi} data-testid="button-select-taxi">
                  <i className="fas fa-chevron-down text-gray-400"></i>
                </button>
              </div>
            </div>
            
            {/* Video Feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              {mediaStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  data-testid="video-feed-live"
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Interior view of taxi with passengers" 
                  className="w-full h-full object-cover"
                  data-testid="video-feed"
                />
              )}
              
              {/* Video Overlay */}
              {!isLive && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center" data-testid="video-placeholder">
                  <div className="text-center text-white">
                    <i className="fas fa-play text-6xl mb-4"></i>
                    <p className="text-xl font-semibold">Ready to Broadcast</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Live Indicator */}
            {isLive && (
              <div className="absolute top-20 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center" data-testid="indicator-live">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </div>
            )}
            
            {/* Video Controls */}
            <div className="absolute bottom-20 left-4 right-4 flex justify-center">
              <Button
                onClick={handleToggleRecording}
                className={`px-8 py-3 rounded-full shadow-lg font-bold ${
                  isLive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
              >
                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-video'} mr-2`}></i>
                {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
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
      
      {/* Sticky Tabs Section */}
      <div className="bg-gray-900 p-4 sticky bottom-16 z-10 border-t border-gray-700 mb-16">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="live" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-live">
              Live
            </TabsTrigger>
            <TabsTrigger value="recordings" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-recordings">
              Recordings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-schedule">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gray-700" data-testid="tab-settings">
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="mt-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Live Broadcast Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto-start recording</span>
                  <button
                    onClick={() => setAutoStartRecording(!autoStartRecording)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                      autoStartRecording ? 'bg-primary' : 'bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={autoStartRecording}
                    aria-label="Auto-start recording"
                    data-testid="switch-auto-start"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                      autoStartRecording ? 'right-1 translate-x-0' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Audio recording</span>
                  <button
                    onClick={() => setAudioRecording(!audioRecording)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                      audioRecording ? 'bg-primary' : 'bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={audioRecording}
                    aria-label="Audio recording"
                    data-testid="switch-audio-recording"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                      audioRecording ? 'right-1 translate-x-0' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recordings" className="mt-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Recent Recordings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div>
                    <p className="text-white">Today 14:30 - Taxi 1</p>
                    <p className="text-gray-400 text-sm">Duration: 45 min</p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <i className="fas fa-play mr-2"></i>
                    Play
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div>
                    <p className="text-white">Today 12:15 - Taxi 2</p>
                    <p className="text-gray-400 text-sm">Duration: 32 min</p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <i className="fas fa-play mr-2"></i>
                    Play
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Broadcast Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Scheduled broadcasts</span>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <i className="fas fa-plus mr-2"></i>
                    Add
                  </Button>
                </div>
                <div className="text-gray-400 text-center py-6">
                  No scheduled broadcasts
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Broadcast Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 block mb-2">Video Quality</label>
                  <select className="w-full bg-gray-700 text-white p-2 rounded">
                    <option>HD (720p)</option>
                    <option>Full HD (1080p)</option>
                    <option>4K (2160p)</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 block mb-2">Storage Location</label>
                  <select className="w-full bg-gray-700 text-white p-2 rounded">
                    <option>Local Storage</option>
                    <option>Cloud Storage</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sticky Main Navigation */}
      <div className="sticky bottom-0 z-20">
        <Navigation />
      </div>
    </div>
  );
}