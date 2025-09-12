import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

interface HeaderProps {
  title: string;
  showMenu?: boolean;
}

export default function Header({ title, showMenu = true }: HeaderProps) {
  const handleMenuClick = () => {
    // For now, just show logout option
    const shouldLogout = confirm("Do you want to log out?");
    if (shouldLogout) {
      logout();
    }
  };

  return (
    <div className="bg-white border-b border-border px-4 py-3 flex items-center">
      {showMenu && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMenuClick}
          className="mr-4 p-0"
          data-testid="button-menu"
        >
          <i className="fas fa-bars text-xl text-foreground"></i>
        </Button>
      )}
      <h1 className="text-xl font-bold text-foreground" data-testid="text-header-title">
        {title}
      </h1>
    </div>
  );
}
