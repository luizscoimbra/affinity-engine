import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMatches,
  getMatchProfile,
  getLastMessage,
  getUnreadCount,
  unmatch,
  subscribeToMatches,
  unsubscribeChannel,
} from "@/lib/queries";
import { useUrlsAssinadas } from "@/hooks/use-sessao";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon, MessageCircleIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { BrandHeader } from "@/components/BrandHeader";
import { MOCK_MATCHES_MAP } from "@/lib/mockData";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Photo = Database["public"]["Tables"]["profile_photos"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];

interface MatchWithProfile {
  match: Match;
  profile: Profile;
  photos: Photo[];
}

interface ConversationItem extends MatchWithProfile {
  lastMessage: Message | null;
  unreadCount: number;
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [newMatches, setNewMatches] = useState<MatchWithProfile[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmatchingId, setUnmatchingId] = useState<string | null>(null);

  const allPhotoPaths = [
    ...newMatches.flatMap((m) => m.photos.map((p) => p.path)),
    ...conversations.flatMap((m) => m.photos.map((p) => p.path)),
  ].filter(Boolean);
  const { data: signedUrls } = useUrlsAssinadas(allPhotoPaths);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const matchList = await getMatches();
      const profiles = await Promise.all(matchList.map((m) => getMatchProfile(m, user.id)));

      const newM: MatchWithProfile[] = [];
      const convos: ConversationItem[] = [];

      for (let i = 0; i < matchList.length; i++) {
        const m = matchList[i];
        const pData = profiles[i];
        if (!m || !pData) continue;

        const entry: MatchWithProfile = {
          match: m,
          profile: pData.profile,
          photos: pData.photos,
        };

        if (m.last_message_at) {
          const [lastMsg, unread] = await Promise.all([getLastMessage(m.id), getUnreadCount(m.id)]);
          convos.push({ ...entry, lastMessage: lastMsg, unreadCount: unread });
        } else {
          newM.push(entry);
        }
      }

      setNewMatches(newM);
      setConversations(convos);
    } catch {
      toast.error("Erro ao carregar matches");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadData();
    const channel = subscribeToMatches(() => loadData());
    return () => {
      unsubscribeChannel(channel);
    };
  }, [user, loadData]);

  const handleUnmatch = async (matchId: string) => {
    setUnmatchingId(matchId);
    try {
      await unmatch(matchId);
      setNewMatches((prev) => prev.filter((m) => m.match.id !== matchId));
      setConversations((prev) => prev.filter((c) => c.match.id !== matchId));
      toast.success("Match desfeito com sucesso");
    } catch {
      toast.error("Erro ao desmanchar match");
    } finally {
      setUnmatchingId(null);
    }
  };

  const getInitials = (name: string | null) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const getPhotoUrl = (photos: Photo[]): string | null => {
    if (photos.length === 0 || !signedUrls) return null;
    const firstPath = photos[0]?.path;
    if (!firstPath) return null;
    return signedUrls[firstPath] ?? null;
  };

  const hasAnyMatches = newMatches.length > 0 || conversations.length > 0;

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden">
      <BrandHeader subtitle="Suas conexões recentes" />

      <div className="mx-auto flex-1 w-full max-w-lg px-4 py-4 pb-24 space-y-6">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto mb-3 h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Carregando seus matches...</p>
            </div>
          </div>
        ) : !hasAnyMatches ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#251e2b]/80 shadow-2xl backdrop-blur-xl">
              <HeartIcon className="h-12 w-12 text-rose-400 animate-heartbeat" glow />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Nenhum match ainda</h2>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
              Continue descobrindo pessoas incríveis na aba Descobrir para encontrar combinações com afinidade mútua.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <Link to="/descobrir" className="flex-1">
                <Button className="w-full rounded-xl bg-gradient-to-r from-primary via-rose-500 to-amber-500 font-bold text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                  Explorar Pessoas
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-white/10 bg-white/5 text-xs font-semibold hover:bg-white/10"
                onClick={() => {
                  const m1 = MOCK_MATCHES_MAP["11111111-0000-0000-0000-000000000001"];
                  const m2 = MOCK_MATCHES_MAP["22222222-0000-0000-0000-000000000002"];
                  const m3 = MOCK_MATCHES_MAP["33333333-0000-0000-0000-000000000003"];
                  const m4 = MOCK_MATCHES_MAP["44444444-0000-0000-0000-000000000004"];

                  const newMockList: MatchWithProfile[] = [];
                  const convMockList: ConversationItem[] = [];

                  if (m1) newMockList.push({ match: m1.match, profile: m1.profile, photos: m1.photos });
                  if (m2) newMockList.push({ match: m2.match, profile: m2.profile, photos: m2.photos });

                  if (m3) {
                    convMockList.push({
                      match: m3.match,
                      profile: m3.profile,
                      photos: m3.photos,
                      lastMessage: m3.messages[0] ?? null,
                      unreadCount: 1,
                    });
                  }
                  if (m4) {
                    convMockList.push({
                      match: m4.match,
                      profile: m4.profile,
                      photos: m4.photos,
                      lastMessage: m4.messages[m4.messages.length - 1] ?? null,
                      unreadCount: 0,
                    });
                  }

                  setNewMatches(newMockList);
                  setConversations(convMockList);
                  toast.success("Matches fictícios carregados para teste!");
                }}
              >
                Carregar Fakes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* New Matches Carousel */}
            {newMatches.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span>Novos Matches ({newMatches.length})</span>
                  </h2>
                </div>

                <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                  {newMatches.map(({ match, profile, photos }) => {
                    const photoUrl = getPhotoUrl(photos);
                    return (
                      <div
                        key={match.id}
                        className="group relative flex w-[128px] shrink-0 flex-col items-center rounded-2xl border border-white/10 bg-[#1e1724]/75 p-2 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:scale-[1.02]"
                      >
                        {/* Avatar with pulsing ring */}
                        <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-xl bg-gradient-to-tr from-primary via-rose-500 to-amber-400 p-[2px] shadow-md">
                          <div className="h-full w-full overflow-hidden rounded-[10px] bg-[#221829]">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={profile.display_name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/20">
                                <span className="font-display text-2xl font-bold text-primary">
                                  {getInitials(profile.display_name)}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleUnmatch(match.id)}
                            disabled={unmatchingId === match.id}
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/70 opacity-0 backdrop-blur-md transition-opacity hover:bg-rose-600 hover:text-white group-hover:opacity-100"
                            title="Remover match"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>

                        <p className="w-full truncate text-center text-xs font-bold text-foreground">
                          {profile.display_name}
                        </p>
                        <p className="w-full truncate text-center text-[10px] text-muted-foreground">
                          {profile.city ?? "Afinidade recente"}
                        </p>

                        <Link
                          to="/chat/$matchId"
                          params={{ matchId: match.id }}
                          className="mt-2 w-full"
                        >
                          <Button
                            size="sm"
                            className="h-7 w-full gap-1 rounded-lg bg-primary/20 text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-colors border border-primary/30"
                          >
                            <MessageCircleIcon className="h-3 w-3" />
                            Conversar
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Active Conversations List */}
            {conversations.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Conversas Recentes ({conversations.length})
                </h2>

                <div className="space-y-2">
                  {conversations.map(({ match, profile, photos, lastMessage, unreadCount }) => {
                    const photoUrl = getPhotoUrl(photos);
                    return (
                      <Link key={match.id} to="/chat/$matchId" params={{ matchId: match.id }}>
                        <Card className="group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#1e1724]/70 p-3.5 shadow-md backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-[#251d2c]/90 active:scale-[0.99] cursor-pointer">
                          {/* Avatar */}
                          <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-full border border-white/15 bg-[#251d2c] shadow-inner">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={profile.display_name}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/30 to-rose-500/20">
                                <span className="font-display text-sm font-bold text-primary">
                                  {getInitials(profile.display_name)}
                                </span>
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1724] bg-emerald-500" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="truncate font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {profile.display_name}
                              </h3>
                              {lastMessage && (
                                <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                                  {new Date(lastMessage.created_at).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>

                            <div className="mt-0.5 flex items-center justify-between gap-2">
                              <p className="truncate text-xs text-muted-foreground font-normal">
                                {lastMessage
                                  ? lastMessage.sender_id === user?.id
                                    ? `Você: ${lastMessage.body}`
                                    : lastMessage.body
                                  : "Toque para enviar uma mensagem"}
                              </p>

                              {unreadCount > 0 && (
                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-rose-500 px-1.5 text-[10px] font-extrabold text-white shadow-md shadow-primary/30 animate-pulse">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
