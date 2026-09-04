import { Link } from "@tanstack/react-router";
import { SparklesIcon } from "@/components/icons";

interface BrandHeaderProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function BrandHeader({
  title = "Afinni",
  subtitle,
  rightElement,
}: BrandHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link to="/descobrir" className="group flex items-center gap-2 transition-transform active:scale-95">
          <div className="relative flex h-8 w-8 items-center justify-center transition-all duration-300">
             <img src="/logo.png" alt="Afinni Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {title}
              </span>
              <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
            </div>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground -mt-1 font-medium">{subtitle}</p>
            )}
          </div>
        </Link>

        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
}
