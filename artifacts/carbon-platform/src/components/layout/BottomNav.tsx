import { Link, useLocation } from "wouter";
import { Home, PlusCircle, Lightbulb, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/track", label: "Track", icon: PlusCircle },
  { href: "/actions", label: "Actions", icon: Lightbulb },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Profile", icon: Settings },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex items-center justify-around pb-safe z-50">
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-3 text-xs font-medium transition-colors flex-1",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
