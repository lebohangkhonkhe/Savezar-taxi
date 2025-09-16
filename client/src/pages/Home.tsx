import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Video, 
  BarChart3, 
  Users, 
  Phone,
  ArrowRight
} from "lucide-react";

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
  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="savezar-logo text-4xl mb-2">
          <div className="logo-icon"></div>
          SaveZar
        </div>
        <p className="text-lg text-muted-foreground">Taxi Management System</p>
        <p className="text-sm text-muted-foreground mt-1">Choose a feature to get started</p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {menuItems.map(({ path, title, description, icon: Icon, color, bgColor, testId }) => (
          <Link key={path} href={path}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={testId}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white text-center">
        <h3 className="text-lg font-semibold mb-2">System Status</h3>
        <div className="flex justify-around text-sm">
          <div>
            <div className="font-bold">Active</div>
            <div className="text-red-100">Fleet Online</div>
          </div>
          <div>
            <div className="font-bold">24/7</div>
            <div className="text-red-100">Monitoring</div>
          </div>
          <div>
            <div className="font-bold">Real-time</div>
            <div className="text-red-100">Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
}