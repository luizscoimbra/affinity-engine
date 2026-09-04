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
} from "@/lib/queries";
import { useUrlsAssinadas } from "@/hooks/use-sessao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeftIcon, SendIcon, SparklesIcon } from "@/components/icons";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AudioMessagePlayer } from "@/components/AudioMessagePlayer";
import { EmojiPickerPopover } from "@/components/EmojiPickerPopover";
import { getMockMatchData, isValidUUID } from "@/lib/mockData";
import { Smile, Mic, Camera, Paperclip, X, Square, Image as ImageIcon } from "lucide-react";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherPhotoPaths = otherPhotos.map((p) => p.path).filter(Boolean);
  const { data: signedUrls } = useUrlsAssinadas(otherPhotoPaths);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    const load = async () => {
      try {
        const mock = getMockMatchData(matchId);
        if (mock) {
          setIsMockMode(true);
          setMessages(mock.messages);
          setOtherProfile(mock.profile);
          setOtherPhotos(mock.photos);
          setLoading(false);
          return;
        }

        if (user && isValidUUID(matchId)) {
          const [msgs, profileData] = await Promise.all([
            getMessages(matchId),
            getMatchDetails(matchId, user.id),
          ]);
          setMessages(msgs);
          setOtherProfile(profileData.profile);
          setOtherPhotos(profileData.photos);
          await markMessagesRead(matchId);
        } else {
          const defaultMock = getMockMatchData("11111111-0000-0000-0000-000000000001");
          if (defaultMock) {
            setIsMockMode(true);
            setMessages(defaultMock.messages);
            setOtherProfile(defaultMock.profile);
            setOtherPhotos(defaultMock.photos);
          }
        }
      } catch (err) {
        console.warn("Carregando modo de conversa demonstrativa:", err);
        const fallbackMock = getMockMatchData(matchId) || getMockMatchData("11111111-0000-0000-0000-000000000001");
        if (fallbackMock) {
          setIsMockMode(true);
          setMessages(fallbackMock.messages);
          setOtherProfile(fallbackMock.profile);
          setOtherPhotos(fallbackMock.photos);
        }
      } finally {
        setLoading(false);
      }
    };

    load();

    let cleanup: (() => void) | undefined;

    if (user && isValidUUID(matchId)) {
      const channel = subscribeToMessages(matchId, (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.sender_id !== user.id) {
          markMessagesRead(matchId);
        }
      });

      cleanup = () => {
        unsubscribeChannel(channel);
      };
    }

    return () => {
      cleanup?.();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [user, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dispatch message helper (handles both text, audio, image)
  const dispatchMessage = async (content: string) => {
    if (!content.trim() || sending || !matchId) return;

    setSending(true);
    try {
      if (isMockMode || !user || !isValidUUID(matchId)) {
        const userMsg: Message = {
          id: `msg-${Date.now()}`,
          match_id: matchId,
          sender_id: user?.id ?? "me",
          body: content,
          created_at: new Date().toISOString(),
          read_at: null,
        };
        setMessages((prev) => [...prev, userMsg]);

        // Simulated auto response
        setTimeout(() => {
          let replyText = "Que legal! Concordo com você!";
          if (content.startsWith("[audio:")) {
            replyText = "Adorei seu áudio! Sua voz é muito agradável 😊";
          } else if (content.startsWith("[image:")) {
            replyText = "Uau, que foto incrível! Amei ver! 😍";
          } else {
            const autoReplies = [
              "Adorei sua mensagem! O que mais você gosta de fazer no tempo livre?",
              "Muito bom conversar com você! Temos muitas afinidades mesmo!",
              "Com certeza! Vamos marcar de tomar um café qualquer dia desses? ☕",
              "Super concordo! Acho que nos daríamos muito bem conversando pessoalmente!",
            ];
            replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)] || "Que bacana!";
          }

          const replyMsg: Message = {
            id: `reply-${Date.now()}`,
            match_id: matchId,
            sender_id: otherProfile?.id || "a1111111-1111-1111-1111-111111111111",
            body: replyText,
            created_at: new Date().toISOString(),
            read_at: null,
          };
          setMessages((prev) => [...prev, replyMsg]);
        }, 1300);
      } else {
        const msg = await sendMessage(matchId, content);
        setMessages((prev) => [...prev, msg]);
      }
    } catch {
      const fallbackMsg: Message = {
        id: `msg-${Date.now()}`,
        match_id: matchId,
        sender_id: user?.id || "me",
        body: content,
        created_at: new Date().toISOString(),
        read_at: null,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    dispatchMessage(newMessage.trim());
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (base64Audio) {
            dispatchMessage(`[audio:${base64Audio}]`);
          }
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      toast.error("Permissão de microfone não concedida.");
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.ondataavailable = null;
    mediaRecorderRef.current.onstop = null;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    setRecordingDuration(0);
    toast.info("Gravação de áudio cancelada");
  };

  // Photo / Camera File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        dispatchMessage(`[image:${dataUrl}]`);
        toast.success("Foto enviada!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AnimatedBackground variant="subtle" />
        <div className="text-center">
          <div className="relative mx-auto mb-3 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Abrindo conversa...</p>
        </div>
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
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <AnimatedBackground variant="subtle" showHearts={false} />

      {/* Hidden File Inputs for Gallery and Camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Image Preview Zoom Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in-50"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-xl max-h-[85dvh] overflow-hidden rounded-2xl border border-white/20">
            <button
              type="button"
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              onClick={() => setSelectedImageModal(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <img src={selectedImageModal} alt="Foto ampliada" className="max-h-[80vh] w-auto object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#1e1724]/80 px-4 py-3 shadow-md backdrop-blur-2xl">
        <button
          type="button"
          onClick={() => navigate({ to: "/matches" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        {/* Profile Avatar */}
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/20 bg-gradient-to-tr from-primary via-rose-500 to-amber-400 p-[2px] shadow-md">
          <div className="h-full w-full overflow-hidden rounded-full bg-[#201827]">
            {otherPhotos.length > 0 && signedUrls?.[otherPhotos[0]?.path ?? ""] ? (
              <img
                src={signedUrls[otherPhotos[0]?.path ?? ""]}
                alt={otherProfile?.display_name ?? "Perfil"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/20">
                <span className="font-display text-sm font-bold text-primary">{initials ?? "?"}</span>
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1724] bg-emerald-400 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-display text-base font-bold text-foreground">
              {otherProfile?.display_name}
            </h2>
            <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Conectados por Afinidade
          </p>
        </div>
      </header>

      {/* Messages Feed */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-lg space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <SparklesIcon className="h-8 w-8 text-amber-400 animate-twinkle" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Início da Conversa</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
                Vocês deram match! Envie uma mensagem, um emoji, um áudio ou compartilhe uma foto para quebrar o gelo.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === (user?.id ?? "me");
            const isAudio = msg.body.startsWith("[audio:") && msg.body.endsWith("]");
            const isImage = msg.body.startsWith("[image:") && msg.body.endsWith("]");

            const audioSrc = isAudio ? msg.body.slice(7, -1) : "";
            const imageSrc = isImage ? msg.body.slice(7, -1) : "";

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in-50 slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${
                    isMine
                      ? "bg-gradient-to-r from-primary via-rose-500 to-rose-600 text-white rounded-br-xs shadow-primary/20"
                      : "border border-white/10 bg-[#251d2c]/85 text-foreground rounded-bl-xs backdrop-blur-xl shadow-black/40"
                  }`}
                >
                  {isAudio ? (
                    <AudioMessagePlayer src={audioSrc} isMine={isMine} />
                  ) : isImage ? (
                    <div className="space-y-1.5">
                      <div
                        className="overflow-hidden rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setSelectedImageModal(imageSrc)}
                      >
                        <img src={imageSrc} alt="Foto enviada" className="max-h-60 w-full object-cover rounded-xl" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-normal leading-relaxed break-words">{msg.body}</p>
                  )}

                  <p
                    className={`mt-1 text-right text-[10px] font-medium ${
                      isMine ? "text-white/75" : "text-muted-foreground"
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

      {/* Audio Recording Live Bar OR Message Input Box */}
      <div className="relative border-t border-white/10 bg-[#1e1724]/90 p-3 pb-6 backdrop-blur-2xl">
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <EmojiPickerPopover
            onSelectEmoji={(emoji) => {
              setNewMessage((prev) => prev + emoji);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {isRecording ? (
          /* Live Audio Recording State */
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full border border-rose-500/40 bg-rose-950/40 p-2 px-4 shadow-lg backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-300">Gravando áudio...</span>
              <span className="text-xs font-mono font-bold text-white ml-2">{formatTimer(recordingDuration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-white"
                title="Cancelar gravação"
              >
                <X className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={stopAndSendRecording}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:scale-105 active:scale-95"
                title="Enviar áudio"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Standard Input Bar with Media Buttons */
          <form
            onSubmit={handleSendText}
            className="mx-auto flex max-w-lg items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5 pl-3 shadow-inner backdrop-blur-md focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
          >
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/80 hover:bg-white/10 hover:text-amber-400 transition-colors"
              title="Inserir Emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Photo Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/80 hover:bg-white/10 hover:text-rose-400 transition-colors"
              title="Anexar Foto"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Camera Snap Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/80 hover:bg-white/10 hover:text-emerald-400 transition-colors"
              title="Tirar Foto com a Câmera"
            >
              <Camera className="h-4 w-4" />
            </button>

            {/* Text Input */}
            <Input
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="h-10 flex-1 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              disabled={sending}
            />

            {/* Send or Record Mic Button */}
            {newMessage.trim() ? (
              <button
                type="submit"
                disabled={sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-rose-500 text-white shadow-md shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                aria-label="Enviar mensagem"
              >
                {sending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-rose-400 shadow-md hover:bg-rose-500 hover:text-white transition-all hover:scale-105 active:scale-95"
                title="Gravar Áudio"
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
