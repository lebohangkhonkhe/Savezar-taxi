import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import Login from "@/pages/Login";
import Location from "@/pages/Location";
import Statistics from "@/pages/Statistics";
import Broadcast from "@/pages/Broadcast";
import Drivers from "@/pages/Drivers";
import { authStorage } from "@/lib/auth";

interface AuthData {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: authData, isLoading } = useQuery<AuthData>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center red-gradient">
        <div className="phone-container">
          <div className="status-bar">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            </div>
            <div></div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-battery-full text-green-400"></i>
            </div>
          </div>
          <div className="flex items-center justify-center h-full min-h-[600px]">
            <div className="text-center">
              <div className="savezar-logo text-3xl mb-2">
                <div className="logo-icon"></div>
                saveZar
              </div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAuthenticated = authData?.user || authStorage.isAuthenticated();

  if (!isAuthenticated) {
    return <Login />;
  }

  // Save user data if we got it from the server
  if (authData?.user) {
    authStorage.setUser(authData.user);
  }

  return <>{children}</>;
}

function Router() {
  return (
    <div className="min-h-screen red-gradient">
      <div className="phone-container">
        <div className="status-bar">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
          <div></div>
          <div className="flex items-center space-x-1">
            <i className="fas fa-battery-full text-green-400"></i>
          </div>
        </div>
        
        <div className="min-h-[600px]">
          <AuthWrapper>
            <Switch>
              <Route path="/" component={() => <Redirect to="/location" />} />
              <Route path="/location" component={Location} />
              <Route path="/broadcast" component={Broadcast} />
              <Route path="/statistics" component={Statistics} />
              <Route path="/drivers" component={Drivers} />
              <Route component={() => <Redirect to="/location" />} />
            </Switch>
          </AuthWrapper>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          rel="stylesheet" 
        />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
