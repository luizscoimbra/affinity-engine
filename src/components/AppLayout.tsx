import { Link, useLocation } from "@tanstack/react-router";
import { DiscoverIcon, MatchesIcon, ProfileIcon } from "@/components/icons";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/descobrir", label: "Descobrir", icon: DiscoverIcon },
  { to: "/matches", label: "Matches", icon: MatchesIcon },
  { to: "/perfil", label: "Perfil", icon: ProfileIcon },
] as const;

export function TopNav() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex flex-1 flex-row items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-all duration-300 rounded-xl select-none",
                active
                  ? "text-primary"
                  : "text-muted-foreground/70 hover:text-foreground",
              )}
            >
              {active && (
                <div className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20" />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-4 w-4 transition-transform duration-300",
                  active && "scale-110 text-primary",
                )}
                active={active}
                animated={false}
              />
              <span className={cn(
                "relative z-10 text-[11px] tracking-tight transition-colors",
                active ? "font-bold text-foreground" : "font-medium",
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] text-foreground selection:bg-primary/30 selection:text-white">
      <AnimatedBackground variant="discovery" />
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
