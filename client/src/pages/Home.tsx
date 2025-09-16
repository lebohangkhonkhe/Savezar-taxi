import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Video, 
  BarChart3, 
  Users, 
  Phone,
  ArrowRight,
  Home as HomeIcon,
  LogOut
} from "lucide-react";
import { logout } from "@/lib/auth";

const menuItems = [
  {
    path: "/location",
    title: "Location",
    description: "Track taxi locations and routes in real-time",
    icon: MapPin,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    testId: "menu-location"
  },
  {
    path: "/broadcast",
    title: "Broadcast", 
    description: "Live video feeds and camera management",
    icon: Video,
    color: "text-green-500",
    bgColor: "bg-green-50",
    testId: "menu-broadcast"
  },
  {
    path: "/statistics",
    title: "Statistics",
    description: "Performance metrics and analytics",
    icon: BarChart3,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    testId: "menu-statistics"
  },
  {
    path: "/drivers",
    title: "Drivers",
    description: "Driver profiles and management",
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    testId: "menu-drivers"
  },
  {
    path: "/phone",
    title: "Phone",
    description: "Call drivers and emergency services",
    icon: Phone,
    color: "text-red-500",
    bgColor: "bg-red-50",
    testId: "menu-phone"
  }
];

export default function Home() {
  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className="p-6">
      {/* Header with Home Icon and Sign Out */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <HomeIcon className="h-6 w-6 text-red-500" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="button-sign-out"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* SaveZar Branding */}
      <div className="text-center mb-6">
        <div className="savezar-logo text-3xl mb-1">
          <div className="logo-icon"></div>
          SaveZar
        </div>
        <p className="text-sm text-muted-foreground">Taxi Management System</p>
      </div>

      {/* Menu Grid - Compact 2x3 Layout */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
        {menuItems.map(({ path, title, description, icon: Icon, color, bgColor, testId }) => (
          <Link key={path} href={path}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid={testId}>
              <CardContent className="p-4 text-center">
                <div className={`p-3 rounded-lg ${bgColor} mx-auto w-fit mb-3`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-tight">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white text-center">
        <h3 className="text-base font-semibold mb-2">System Status</h3>
        <div className="flex justify-around text-sm">
          <div>
            <div className="font-bold">Active</div>
            <div className="text-red-100 text-xs">Fleet Online</div>
          </div>
          <div>
            <div className="font-bold">24/7</div>
            <div className="text-red-100 text-xs">Monitoring</div>
          </div>
          <div>
            <div className="font-bold">Real-time</div>
            <div className="text-red-100 text-xs">Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
}