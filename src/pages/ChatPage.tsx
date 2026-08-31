import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMessages,
  sendMessage,
  markMessagesRead,
  subscribeToMessages,
  getMatchDetails,
  unsubscribeChannel,
  getPhotoUrl,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeftIcon, SendIcon } from "@/components/icons";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Photo = Database["public"]["Tables"]["profile_photos"]["Row"];

export default function ChatPage() {
  const { matchId } = useParams({ from: "/chat/$matchId" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [otherPhotos, setOtherPhotos] = useState<Photo[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !matchId) return;

    const load = async () => {
      try {
        const [msgs, profileData] = await Promise.all([
          getMessages(matchId),
          getMatchDetails(matchId, user.id),
        ]);
        setMessages(msgs);
        setOtherProfile(profileData.profile);
        setOtherPhotos(profileData.photos);
        await markMessagesRead(matchId);
      } catch {
        toast.error("Erro ao carregar conversa");
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = subscribeToMessages(matchId, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.sender_id !== user.id) {
        markMessagesRead(matchId);
      }
    });

    return () => {
      unsubscribeChannel(channel);
    };
  }, [user, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !matchId) return;

    setSending(true);
    try {
      const msg = await sendMessage(matchId, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const initials = otherProfile?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/matches" })}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>

        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/20">
          {otherPhotos.length > 0 ? (
            <img
              src={getPhotoUrl(otherPhotos[0]?.path)}
              alt={otherProfile?.display_name ?? "Perfil"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm font-bold text-primary">{initials ?? "?"}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {otherProfile?.display_name}
          </h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border/50 bg-background/80 px-4 py-3 backdrop-blur-lg"
      >
        <Input
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
