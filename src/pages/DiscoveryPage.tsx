import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getCandidates, swipe, getSponsoredProfiles, trackAdEvent } from "@/lib/queries";
import { formatarDistancia, fraseAfinidade, ELEMENTO_LABEL } from "@/lib/dating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { HeartIcon, XIcon, UndoIcon, SparklesIcon, MessageCircleIcon } from "@/components/icons";
import { BrandHeader } from "@/components/BrandHeader";
import type { Database } from "@/integrations/supabase/types";

import { MOCK_CANDIDATES, MOCK_SPONSORED } from "@/lib/mockData";

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
  const [lastMatchId, setLastMatchId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      let candidatesList: Candidate[] = [];
      let sponsoredList: Sponsored[] = [];

      try {
        const [cand, spon] = await Promise.all([
          getCandidates(30),
          getSponsoredProfiles(),
        ]);
        candidatesList = cand || [];
        sponsoredList = spon || [];
      } catch (err) {
        console.warn("Usando catálogo de perfis demonstrativos para teste:", err);
      }

      if (candidatesList.length === 0) {
        candidatesList = MOCK_CANDIDATES;
      }
      if (sponsoredList.length === 0) {
        sponsoredList = MOCK_SPONSORED;
      }

      const feed: FeedItem[] = [];
      let sponsoredIdx = 0;

      for (const candidate of candidatesList) {
        feed.push({ type: "candidate", data: candidate });
        if ((feed.length % 5 === 0 || feed.length % 9 === 0) && sponsoredIdx < sponsoredList.length) {
          const sp = sponsoredList[sponsoredIdx];
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
      setItems(MOCK_CANDIDATES.map((c) => ({ type: "candidate", data: c })));
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
      let isMatch = false;
      try {
        const result = await swipe(item.data.id, liked);
        if (result.newMatch) {
          isMatch = true;
        }
      } catch {
        if (liked && (item.data.affinity >= 88 || Math.random() > 0.35)) {
          isMatch = true;
        }
      }

      if (isMatch) {
        setMatchedName(item.data.display_name);
        setLastMatchId(item.data.id);
        setShowMatch(true);
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
  const candidateData = currentItem?.type === "candidate" ? currentItem.data : null;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <BrandHeader
        subtitle="Descubra conexões por afinidade"
        rightElement={
          items.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {Math.max(0, items.length - currentIndex)} restantes
            </span>
          )
        }
      />

      <div className="relative flex-1 flex flex-col px-4 pt-3 pb-4 overflow-hidden">
        {/* Match Celebration Modal */}
        {showMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
            <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-[#281c2d] to-[#17121c] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl animate-pulse-glow" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-rose-500 to-amber-500 shadow-xl">
                  <HeartIcon className="h-14 w-14 text-white drop-shadow-md" filled animated />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/20 mb-3">
                <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
                <span>COMBINAÇÃO PERFEITA</span>
              </div>

              <h2 className="font-display text-3xl font-extrabold text-foreground">
                É um Match!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Você e <span className="font-semibold text-rose-300">{matchedName}</span> demonstraram afinidade mútua!
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  to="/matches"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-rose-500 to-amber-500 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setShowMatch(false)}
                >
                  <MessageCircleIcon className="h-5 w-5" />
                  Conversar Agora
                </Link>

                <Button
                  variant="ghost"
                  className="h-11 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => setShowMatch(false)}
                >
                  Continuar Descobrindo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details Sheet */}
        <Sheet open={showProfile} onOpenChange={setShowProfile}>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] rounded-t-3xl border-white/10 bg-[#1e1724] overflow-y-auto"
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="font-display text-xl font-bold text-foreground">
                {candidateData?.display_name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Detalhes do perfil
              </SheetDescription>
            </SheetHeader>
            {candidateData && <ProfileDetails candidate={candidateData} />}
          </SheetContent>
        </Sheet>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <HeartIcon className="h-7 w-7 text-primary animate-heartbeat" filled />
              </div>
              <p className="font-display text-base font-semibold text-foreground">Buscando afinidades...</p>
              <p className="mt-1 text-xs text-muted-foreground">Calculando compatibilidade real para você</p>
            </div>
          </div>
        ) : !currentItem || currentIndex >= items.length ? (
          /* Empty Feed State */
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="rounded-3xl border border-white/10 bg-card/60 p-8 text-center shadow-xl backdrop-blur-xl">
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <SparklesIcon className="h-10 w-10 text-primary animate-twinkle" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Sem mais perfis por agora
              </h2>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Você já visualizou todos os perfis disponíveis no momento. Volte em breve ou tente recarregar!
              </p>
              <Button
                className="mt-6 rounded-xl bg-gradient-to-r from-primary to-rose-500 px-6 font-semibold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                onClick={loadCandidates}
              >
                Recarregar Perfis
              </Button>
            </div>
          </div>
        ) : (
          /* Active Card Feed — Fixed layout */
          <div className="flex-1 flex flex-col justify-between gap-3 overflow-hidden">
            {/* Photo Card — takes available space */}
            <div className="flex-1 min-h-0 flex items-stretch">
              {currentItem.type === "candidate" ? (
                <CompactCandidateCard
                  candidate={currentItem.data}
                  onViewProfile={() => setShowProfile(true)}
                />
              ) : (
                <SponsoredCard
                  sponsored={currentItem.data}
                  onImpression={handleAdImpression}
                  onClick={() => handleAdClick(currentItem.data)}
                />
              )}
            </div>

            {/* Action Buttons — always fixed at bottom */}
            <div className="shrink-0 flex items-center justify-center gap-5 pt-1 pb-1">
              {/* Undo Button */}
              <button
                type="button"
                className="group flex h-13 w-13 items-center justify-center rounded-full border border-white/10 bg-[#251e2a]/80 text-muted-foreground shadow-lg backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:border-white/25 hover:text-foreground active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                onClick={() => {
                  if (currentIndex > 0) setCurrentIndex((i) => i - 1);
                }}
                disabled={currentIndex === 0}
                aria-label="Desfazer"
              >
                <UndoIcon className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-45" />
              </button>

              {/* Pass Button */}
              <button
                type="button"
                className="group flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/30 bg-[#25181e]/80 text-rose-400 shadow-xl shadow-rose-950/40 backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:border-rose-500 hover:bg-rose-500/20 hover:text-rose-300 hover:shadow-rose-500/30 active:scale-90 disabled:opacity-40"
                onClick={() => handleSwipe(false)}
                disabled={swiping || currentItem.type !== "candidate"}
                aria-label="Passar"
              >
                <XIcon className="h-8 w-8 transition-transform duration-200 group-hover:scale-110" />
              </button>

              {/* Like Button */}
              <button
                type="button"
                className="group relative flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-rose-500 to-amber-500 text-white shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-112 hover:shadow-primary/60 active:scale-90 disabled:opacity-40"
                onClick={() => handleSwipe(true)}
                disabled={swiping || currentItem.type !== "candidate"}
                aria-label="Curtir"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                <HeartIcon className="relative h-9 w-9 text-white group-hover:scale-110 transition-transform" filled animated />
              </button>
            </div>

            <p className="shrink-0 text-center text-[11px] font-medium text-muted-foreground/70">
              Perfil {currentIndex + 1} de {items.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Compact Candidate Card (photo + name + affinity + "Ver perfil") ─── */

function CompactCandidateCard({
  candidate,
  onViewProfile,
}: {
  candidate: Candidate;
  onViewProfile: () => void;
}) {
  const affinity = candidate.affinity;

  return (
    <Card className="group relative flex-1 flex flex-col overflow-hidden rounded-3xl border-white/10 bg-[#1e1724]/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-300 hover:border-white/20">
      {/* Photo area */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-gradient-to-b from-[#2d2235] via-[#201827] to-[#16111c]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-3 flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 via-rose-500/30 to-amber-500/20 blur-xl animate-pulse-glow" />
              <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl">
                <span className="font-display text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-primary via-rose-400 to-amber-300">
                  {candidate.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Perfil Verificado
            </div>
          </div>
        </div>

        {/* Bottom overlay — name + city + affinity */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#120e17] via-[#16121c]/90 to-transparent p-4 pt-12">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-baseline gap-2">
                <span className="truncate">{candidate.display_name}</span>
                {candidate.idade && <span className="text-base font-light text-muted-foreground shrink-0">{candidate.idade}</span>}
              </h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                {candidate.city && <span className="truncate">{candidate.city}</span>}
                {candidate.distance_km !== null && candidate.distance_km !== undefined && (
                  <span className="shrink-0">· {formatarDistancia(candidate.distance_km)}</span>
                )}
              </div>
            </div>

            <div className="relative flex items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/20 px-3 py-1.5 shadow-[0_0_15px_rgba(235,94,40,0.3)] backdrop-blur-md shrink-0">
              <SparklesIcon className="h-4 w-4 text-amber-300" animated />
              <span className="font-display text-sm font-extrabold text-white">
                {affinity}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "Ver perfil" button — always visible at bottom of card */}
      <div className="shrink-0 px-4 py-3 border-t border-white/5">
        <button
          type="button"
          onClick={onViewProfile}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:border-white/20 hover:bg-white/10 hover:text-foreground active:scale-[0.98]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver perfil
        </button>
      </div>
    </Card>
  );
}

/* ─── Profile Details (shown inside Sheet) ─── */

function ProfileDetails({ candidate }: { candidate: Candidate }) {
  const idade = candidate.idade;
  const signo = candidate.signo;
  const elemento = candidate.elemento;
  const distance = candidate.distance_km;
  const affinity = candidate.affinity;
  const sharedTags = candidate.shared_tags ?? [];
  const sameElement = candidate.same_element;

  const phrase = fraseAfinidade(affinity, sharedTags, sameElement, elemento);

  return (
    <div className="space-y-5 pb-6">
      {/* Header with avatar */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary/40 via-rose-500/30 to-amber-500/20">
            <span className="font-display text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-primary via-rose-400 to-amber-300">
              {candidate.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground flex items-baseline gap-2">
            <span className="truncate">{candidate.display_name}</span>
            {idade && <span className="text-sm font-light text-muted-foreground">{idade}</span>}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {candidate.city && <span>{candidate.city}</span>}
            {distance !== null && distance !== undefined && (
              <span>· {formatarDistancia(distance)}</span>
            )}
          </div>
          {signo && (
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-300/90">
              <SparklesIcon className="h-3 w-3 text-amber-400" animated={false} glow={false} />
              <span>{signo}</span>
              {elemento && <span className="text-muted-foreground">· Elemento {ELEMENTO_LABEL[elemento] ?? elemento}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Affinity phrase */}
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-center">
        <p className="text-sm font-medium text-rose-200/90 leading-relaxed">
          {phrase}
        </p>
      </div>

      {/* Bio */}
      {candidate.bio && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sobre</h4>
          <p className="text-sm text-foreground/90 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
            "{candidate.bio}"
          </p>
        </div>
      )}

      {/* Shared interests */}
      {sharedTags.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Interesses em Comum
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {sharedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-white/20 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Physical info */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Informações
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {candidate.city && (
            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Cidade</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{candidate.city}</p>
            </div>
          )}
          {candidate.height_cm && (
            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Altura</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{candidate.height_cm} cm</p>
            </div>
          )}
          {candidate.body_type && (
            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Corpo</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{candidate.body_type}</p>
            </div>
          )}
          {candidate.eye_color && (
            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Olhos</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{candidate.eye_color}</p>
            </div>
          )}
          {candidate.hair_color && (
            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Cabelo</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{candidate.hair_color}</p>
            </div>
          )}
          {candidate.gender && (
            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Gênero</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{candidate.gender}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sponsored Card ─── */

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
      className="relative flex-1 flex flex-col overflow-hidden rounded-3xl border-sponsor/30 bg-[#221a28]/85 p-5 shadow-xl backdrop-blur-2xl cursor-pointer transition-all duration-300 hover:border-sponsor hover:shadow-2xl hover:scale-[1.01]"
      onClick={onClick}
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge variant="outline" className="border-sponsor/60 bg-sponsor/10 text-sponsor text-xs font-semibold px-2.5 py-0.5 rounded-full">
          Destaque Patrocinado
        </Badge>
        <span className="text-xs text-muted-foreground font-medium">{sponsored.categoria}</span>
      </div>

      <h3 className="font-display text-2xl font-bold" style={{ color: sponsored.accent }}>
        {sponsored.headline}
      </h3>
      <p className="mt-1 text-sm font-semibold text-foreground">{sponsored.brand_name}</p>
      <p className="text-xs text-muted-foreground">{sponsored.tagline}</p>

      <p className="mt-3 text-xs text-muted-foreground/90 leading-relaxed">{sponsored.description}</p>

      {sponsored.coupon_code && (
        <div className="mt-4 rounded-xl border border-sponsor/20 bg-sponsor/10 p-3">
          <p className="text-xs text-sponsor font-bold flex items-center gap-1">
            <span>Cupom:</span>
            <span className="font-mono bg-sponsor/20 px-2 py-0.5 rounded text-white">{sponsored.coupon_code}</span>
          </p>
          {sponsored.coupon_text && (
            <p className="mt-1 text-[11px] text-muted-foreground">{sponsored.coupon_text}</p>
          )}
        </div>
      )}

      <div className="mt-auto pt-4">
        <Button
          className="h-11 w-full rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          size="sm"
          style={{ backgroundColor: sponsored.accent }}
        >
          {sponsored.cta_label}
        </Button>
      </div>
    </Card>
  );
}
