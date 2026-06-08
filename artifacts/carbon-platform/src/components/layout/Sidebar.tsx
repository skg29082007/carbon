import { Link, useLocation } from "wouter";
import { Home, PlusCircle, Lightbulb, History, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/track", label: "Track", icon: PlusCircle },
  { href: "/actions", label: "Actions", icon: Lightbulb },
  { href: "/history", label: "History", icon: History },
  { href: "/learn", label: "Learn", icon: BookOpen },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar border-sidebar-border min-h-[100dvh] sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>CarbonSync</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
            location === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
