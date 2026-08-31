import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getMatches, getMatchProfile, subscribeToMatches, unsubscribeChannel, getPhotoUrl } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { ChatIcon } from "@/components/icons";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Photo = Database["public"]["Tables"]["profile_photos"]["Row"];

interface MatchWithProfile {
  match: Match;
  profile: Profile;
  photos: Photo[];
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadMatches = async () => {
      try {
        const matchList = await getMatches();
        const profiles = await Promise.all(
          matchList.map((m) => getMatchProfile(m, user.id)),
        );
        const mapped: MatchWithProfile[] = [];
        for (let i = 0; i < matchList.length; i++) {
          const m = matchList[i];
          const pData = profiles[i];
          if (m && pData) {
            mapped.push({
              match: m,
              profile: pData.profile,
              photos: pData.photos,
            });
          }
        }
        setMatches(mapped);
      } catch {
        toast.error("Erro ao carregar matches");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();

    const channel = subscribeToMatches(() => {
      loadMatches();
    });

    return () => {
      unsubscribeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">
        Matches
      </h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ChatIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Nenhum match ainda
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue descobrindo pessoas para encontrar seus matches
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(({ match, profile, photos }) => {
            const initials = profile.display_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            const photoUrl = photos.length > 0 ? getPhotoUrl(photos[0]?.path) : null;

            return (
              <Link key={match.id} to="/chat/$matchId" params={{ matchId: match.id }}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/50 cursor-pointer">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={profile.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/20">
                        <span className="text-lg font-bold text-primary">{initials || "?"}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-semibold text-foreground">
                        {profile.display_name}
                      </h3>
                      {match.last_message_at && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(match.last_message_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {profile.city ?? "Cidade não informada"}
                      {profile.signo && ` · ${profile.signo}`}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
