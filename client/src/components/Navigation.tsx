import { Link, useLocation } from "wouter";

const navigationItems = [
  { path: "/", icon: "fas fa-home", label: "Home" },
  { path: "/location", icon: "fas fa-map-marker-alt", label: "Location" },
  { path: "/broadcast", icon: "fas fa-video", label: "Broadcast" },
  { path: "/statistics", icon: "fas fa-chart-bar", label: "Stats" },
  { path: "/drivers", icon: "fas fa-users", label: "Drivers" },
  { path: "/phone", icon: "fas fa-phone", label: "Phone" },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
      <div className="flex justify-around">
        {navigationItems.map(({ path, icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button 
                className={`flex flex-col items-center py-2 ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <i className={`${icon} mb-1`}></i>
                <span className="text-xs">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
