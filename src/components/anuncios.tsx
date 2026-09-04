import { BadgeCheck, Ticket, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export type Patrocinado = {
  id: string;
  brand_name: string;
  categoria: string;
  headline: string;
  tagline: string;
  description: string;
  coupon_code: string | null;
  coupon_text: string | null;
  cta_label: string;
  cta_url: string | null;
  city: string | null;
  tags: string[];
};

export async function registrarEventoAnuncio(
  sponsoredId: string | null,
  placement: string,
  eventType: "impressao" | "clique",
) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("ad_events").insert({
    user_id: data.user.id,
    sponsored_id: sponsoredId,
    placement,
    event_type: eventType,
  });
}

function useImpressao(id: string | null, placement: string) {
  const marcado = useRef(false);
  useEffect(() => {
    if (!id || marcado.current) return;
    marcado.current = true;
    registrarEventoAnuncio(id, placement, "impressao").catch(() => {});
  }, [id, placement]);
}

/** Card nativo in-feed: mesmo formato de um perfil, com selo "Patrocinado". */
export function CardPatrocinado({ item }: { item: Patrocinado }) {
  useImpressao(item.id, "feed");
  return (
    <article className="overflow-hidden rounded-3xl border border-sponsor/40 bg-card shadow-lift">
      <div className="flex items-center justify-between border-b border-border/60 bg-sponsor/10 px-5 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sponsor">
          <BadgeCheck className="size-3.5" /> Patrocinado
        </span>
        <span className="text-xs text-muted-foreground">{item.categoria}</span>
      </div>
      <div className="space-y-3 p-6">
        <h3 className="font-display text-2xl">{item.headline}</h3>
        <p className="text-sm text-muted-foreground">{item.tagline}</p>
        {item.coupon_text && (
          <p className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-sm text-gold">
            <Ticket className="size-4" /> {item.coupon_text}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {item.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <Button asChild className="mt-2 w-full" variant="secondary">
          <a
            href={item.cta_url ?? "#"}
            target={item.cta_url ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={() => registrarEventoAnuncio(item.id, "feed", "clique")}
          >
            {item.cta_label}
          </a>
        </Button>
      </div>
    </article>
  );
}

/** Banner fixo 320x50 no rodapé da conversa. */
export function BannerChat({ item }: { item: Patrocinado }) {
  const [visivel, setVisivel] = useState(true);
  useImpressao(visivel ? item.id : null, "chat_banner");
  if (!visivel) return null;
  return (
    <div className="flex items-center gap-3 border-t border-border bg-surface px-3 py-2">
      <a
        href={item.cta_url ?? "#"}
        target={item.cta_url ? "_blank" : undefined}
        rel="noopener noreferrer"
        onClick={() => registrarEventoAnuncio(item.id, "chat_banner", "clique")}
        className="flex h-[50px] flex-1 items-center gap-3 overflow-hidden rounded-lg bg-sponsor/10 px-3"
      >
        <span className="rounded bg-sponsor/20 px-1.5 py-0.5 text-[10px] uppercase text-sponsor">
          Ad
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">{item.brand_name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {item.coupon_text ?? item.tagline}
          </span>
        </span>
      </a>
      <button
        type="button"
        aria-label="Ocultar anúncio"
        onClick={() => setVisivel(false)}
        className="text-muted-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
