import { Link } from "@tanstack/react-router";
import { Flame, Heart, User } from "lucide-react";

const itens = [
  { to: "/descobrir", label: "Descobrir", Icon: Flame },
  { to: "/matches", label: "Matches", Icon: Heart },
  { to: "/perfil", label: "Perfil", Icon: User },
] as const;

export function NavInferior() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch">
        {itens.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
