import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInterest = Database["public"]["Tables"]["profile_interests"]["Row"];
type ProfilePhoto = Database["public"]["Tables"]["profile_photos"]["Row"];
type Match = Database["public"]["Tables"]["matches"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type SponsoredProfile = Database["public"]["Tables"]["sponsored_profiles"]["Row"];
type Candidate = Database["public"]["Functions"]["buscar_candidatos"]["Returns"][number];

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile: Database["public"]["Tables"]["profiles"]["Insert"]) {
  const { data, error } = await supabase.from("profiles").upsert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function getProfileInterests(profileId: string) {
  const { data, error } = await supabase
    .from("profile_interests")
    .select("*")
    .eq("profile_id", profileId);
  if (error) throw error;
  return data;
}

export async function upsertInterests(
  interests: Database["public"]["Tables"]["profile_interests"]["Insert"][],
) {
  if (interests.length === 0) return [];
  const firstInterest = interests[0];
  if (!firstInterest) return [];
  const profileId = firstInterest.profile_id;
  await supabase.from("profile_interests").delete().eq("profile_id", profileId);
  const { data, error } = await supabase.from("profile_interests").insert(interests).select();
  if (error) throw error;
  return data;
}

export async function getProfilePhotos(profileId: string) {
  const { data, error } = await supabase
    .from("profile_photos")
    .select("*")
    .eq("profile_id", profileId)
    .order("position");
  if (error) throw error;
  return data;
}

export async function uploadPhoto(userId: string, file: File, position: number) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${position}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("fotos-perfil")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: signedData } = await supabase.storage
    .from("fotos-perfil")
    .createSignedUrl(path, 3600);

  const existing = await getProfilePhotos(userId);
  const existingForPosition = existing.find((p) => p.position === position);

  if (existingForPosition) {
    await supabase.from("profile_photos").update({ path }).eq("id", existingForPosition.id);
  } else {
    await supabase.from("profile_photos").insert({
      profile_id: userId,
      path,
      position,
    });
  }

  return { path, url: signedData?.signedUrl ?? null };
}

export async function deletePhoto(userId: string, photoId: string, path: string) {
  await supabase.storage.from("fotos-perfil").remove([path]);
  const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
  if (error) throw error;
}

export async function reorderPhotos(photos: { id: string; position: number }[]) {
  const updates = photos.map((p) =>
    supabase.from("profile_photos").update({ position: p.position }).eq("id", p.id),
  );
  await Promise.all(updates);
}

export async function getCandidates(limit = 20) {
  const { data, error } = await supabase.rpc("buscar_candidatos", { p_limit: limit });
  if (error) throw error;
  return data as Candidate[];
}

export async function swipe(targetId: string, liked: boolean) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("swipes")
    .upsert({ actor_id: user.id, target_id: targetId, liked }, { onConflict: "actor_id,target_id" })
    .select()
    .single();
  if (error) throw error;

  let newMatch: Match | null = null;
  if (liked) {
    const userA = user.id < targetId ? user.id : targetId;
    const userB = user.id < targetId ? targetId : user.id;
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("user_a", userA)
      .eq("user_b", userB)
      .maybeSingle();
    newMatch = match;
  }

  return { swipe: data, newMatch };
}

export async function getMatches() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function getMatchById(matchId: string) {
  const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (error) throw error;
  return data;
}

export async function getMatchProfile(match: Match, userId: string) {
  const otherId = match.user_a === userId ? match.user_b : match.user_a;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", otherId).single();
  if (error) throw error;

  const { data: photos } = await supabase
    .from("profile_photos")
    .select("*")
    .eq("profile_id", otherId)
    .order("position");

  return { profile: data, photos: photos ?? [] };
}

export async function getMatchDetails(matchId: string, currentUserId: string) {
  const match = await getMatchById(matchId);
  return getMatchProfile(match, currentUserId);
}

export async function getMessages(matchId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getLastMessage(matchId: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function sendMessage(matchId: string, body: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markMessagesRead(matchId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}

export async function unmatch(matchId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw error;
}

export async function getUnreadCount(matchId: string): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("match_id", matchId)
    .neq("sender_id", user.id)
    .is("read_at", null);
  if (error) return 0;
  return count ?? 0;
}

export async function blockUser(blockedId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: blockedId });
  if (error) throw error;
}

export async function reportUser(reportedId: string, reason: string, details?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: user.id, reported_id: reportedId, reason, details: details ?? null });
  if (error) throw error;
}

export async function getSponsoredProfiles() {
  const { data, error } = await supabase
    .from("sponsored_profiles")
    .select("*")
    .eq("active", true)
    .limit(10);
  if (error) throw error;
  return data;
}

export async function trackAdEvent(sponsoredId: string, placement: string, eventType: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("ad_events").insert({
    user_id: user?.id ?? null,
    sponsored_id: sponsoredId,
    placement,
    event_type: eventType,
  });
}

export function subscribeToMessages(matchId: string, callback: (msg: Message) => void) {
  return supabase
    .channel(`messages:${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload) => callback(payload.new as Message),
    )
    .subscribe();
}

export function subscribeToMatches(callback: (match: Match) => void) {
  return supabase
    .channel("matches")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "matches" }, (payload) =>
      callback(payload.new as Match),
    )
    .subscribe();
}

export function unsubscribeChannel(channel: ReturnType<typeof supabase.channel>) {
  supabase.removeChannel(channel);
}
