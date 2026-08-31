import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCandidates, swipe, getSponsoredProfiles, trackAdEvent, getPhotoUrl } from "@/lib/queries";
import { calcularIdade, formatarDistancia, fraseAfinidade, ELEMENTO_LABEL } from "@/lib/dating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { HeartIcon, XIcon, UndoIcon, SparklesIcon } from "@/components/icons";
import type { Database } from "@/integrations/supabase/types";

type Candidate = Database["public"]["Functions"]["buscar_candidatos"]["Returns"][number];
type Sponsored = Database["public"]["Tables"]["sponsored_profiles"]["Row"];

type FeedItem =
  | { type: "candidate"; data: Candidate }
  | { type: "sponsored"; data: Sponsored };

export default function DiscoveryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedName, setMatchedName] = useState("");

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const [candidates, sponsored] = await Promise.all([
        getCandidates(30),
        getSponsoredProfiles(),
      ]);

      const feed: FeedItem[] = [];
      let sponsoredIdx = 0;

      for (const candidate of candidates) {
        feed.push({ type: "candidate", data: candidate });
        if ((feed.length % 8 === 0 || feed.length % 9 === 0) && sponsoredIdx < sponsored.length) {
          const sp = sponsored[sponsoredIdx];
          if (sp) {
            feed.push({ type: "sponsored", data: sp });
            sponsoredIdx++;
          }
        }
      }

      setItems(feed);
      setCurrentIndex(0);
    } catch {
      toast.error("Erro ao carregar candidatos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleSwipe = async (liked: boolean) => {
    const item = items[currentIndex];
    if (!item || item.type !== "candidate" || swiping) return;

    setSwiping(true);
    try {
      const result = await swipe(item.data.id, liked);
      if (result.newMatch) {
        setMatchedName(item.data.display_name);
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
      }
      setCurrentIndex((i) => i + 1);
    } catch {
      toast.error("Erro ao registrar voto");
    } finally {
      setSwiping(false);
    }
  };

  const handleAdImpression = useCallback(async (sponsored: Sponsored) => {
    await trackAdEvent(sponsored.id, "feed", "impression");
  }, []);

  const handleAdClick = async (sponsored: Sponsored) => {
    await trackAdEvent(sponsored.id, "feed", "click");
    if (sponsored.cta_url) {
      window.open(sponsored.cta_url, "_blank");
    }
  };

  const currentItem = items[currentIndex];

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Encontrando pessoas incríveis...</p>
        </div>
      </div>
    );
  }

  if (!currentItem || currentIndex >= items.length) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="text-center">
          <SparklesIcon className="mx-auto mb-4 h-16 w-16 text-primary/50" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Sem mais perfis
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Volte mais tarde para ver novas pessoas
          </p>
          <Button className="mt-6" onClick={loadCandidates}>
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-4">
      {showMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
              <HeartIcon className="h-12 w-12 text-primary" filled />
            </div>
            <h2 className="font-display text-3xl font-bold text-primary">
              É um match!
            </h2>
            <p className="mt-2 text-lg text-foreground">
              Você e <span className="font-semibold">{matchedName}</span> se curtiram!
            </p>
          </div>
        </div>
      )}

      {currentItem.type === "candidate" ? (
        <CandidateCard candidate={currentItem.data} />
      ) : (
        <SponsoredCard
          sponsored={currentItem.data}
          onImpression={handleAdImpression}
          onClick={() => handleAdClick(currentItem.data)}
        />
      )}

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-border hover:border-foreground/30"
          onClick={() => {
            if (currentIndex > 0) setCurrentIndex((i) => i - 1);
          }}
          disabled={currentIndex === 0}
        >
          <UndoIcon className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-destructive/50 hover:border-destructive hover:bg-destructive/10"
          onClick={() => handleSwipe(false)}
          disabled={swiping || currentItem.type !== "candidate"}
        >
          <XIcon className="h-8 w-8 text-destructive" />
        </Button>

        <Button
          size="icon"
          className="h-16 w-16 rounded-full"
          onClick={() => handleSwipe(true)}
          disabled={swiping || currentItem.type !== "candidate"}
        >
          <HeartIcon className="h-8 w-8" />
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {currentIndex + 1} de {items.length} perfis
      </p>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const idade = candidate.idade;
  const signo = candidate.signo;
  const elemento = candidate.elemento;
  const distance = candidate.distance_km;
  const affinity = candidate.affinity;
  const sharedTags = candidate.shared_tags ?? [];
  const sameElement = candidate.same_element;

  const phrase = fraseAfinidade(affinity, sharedTags, sameElement, elemento);

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card shadow-lg">
      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-card via-muted to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full bg-primary/20 shadow-inner">
              <span className="text-5xl font-bold text-primary">
                {candidate.display_name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Perfil verificado</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/85 to-transparent p-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {candidate.display_name}
                {idade && <span className="ml-2 text-lg font-normal text-muted-foreground">{idade}</span>}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                {candidate.city && <span>{candidate.city}</span>}
                {distance !== null && distance !== undefined && <span>· {formatarDistancia(distance)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 shadow-sm">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{affinity}%</span>
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{phrase}</p>

          {candidate.bio && (
            <p className="mt-2 text-xs text-foreground/80 line-clamp-2 italic">
              "{candidate.bio}"
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap gap-1">
            {sharedTags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {signo && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{signo}</span>
              {elemento && <span>· {ELEMENTO_LABEL[elemento] ?? elemento}</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SponsoredCard({
  sponsored,
  onImpression,
  onClick,
}: {
  sponsored: Sponsored;
  onImpression: (s: Sponsored) => void;
  onClick: () => void;
}) {
  useEffect(() => {
    onImpression(sponsored);
  }, [sponsored.id, onImpression, sponsored]);

  return (
    <Card
      className="relative overflow-hidden border-sponsor/30 bg-card shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="border-sponsor text-sponsor text-xs">
            Patrocinado
          </Badge>
          <span className="text-xs text-muted-foreground">{sponsored.categoria}</span>
        </div>

        <h3 className="font-display text-xl font-bold" style={{ color: sponsored.accent }}>
          {sponsored.headline}
        </h3>
        <p className="mt-1 text-sm font-medium text-foreground">{sponsored.brand_name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sponsored.tagline}</p>

        <p className="mt-3 text-sm text-muted-foreground">{sponsored.description}</p>

        {sponsored.coupon_code && (
          <div className="mt-3 rounded-lg bg-sponsor/10 p-3">
            <p className="text-xs text-sponsor font-medium">
              Cupom: {sponsored.coupon_code}
            </p>
            {sponsored.coupon_text && (
              <p className="text-xs text-muted-foreground">{sponsored.coupon_text}</p>
            )}
          </div>
        )}

        <Button className="mt-3 w-full" size="sm" style={{ backgroundColor: sponsored.accent }}>
          {sponsored.cta_label}
        </Button>
      </div>
    </Card>
  );
}
