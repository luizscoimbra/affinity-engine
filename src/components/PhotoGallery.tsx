import { useState, useRef } from "react";
import { uploadPhoto, deletePhoto, reorderPhotos } from "@/lib/queries";
import { useUrlsAssinadas } from "@/hooks/use-sessao";
import { toast } from "sonner";
import { CameraIcon, XIcon, ArrowLeftIcon } from "@/components/icons";
import type { Database } from "@/integrations/supabase/types";

type ProfilePhoto = Database["public"]["Tables"]["profile_photos"]["Row"];

interface PhotoGalleryProps {
  userId: string;
  photos: ProfilePhoto[];
  onPhotosChange: (photos: ProfilePhoto[]) => void;
  maxPhotos?: number;
  compact?: boolean;
}

export function PhotoGallery({
  userId,
  photos,
  onPhotosChange,
  maxPhotos = 6,
  compact = false,
}: PhotoGalleryProps) {
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const photoPaths = photos.map((p) => p.path).filter(Boolean);
  const { data: signedUrls } = useUrlsAssinadas(photoPaths);

  const getPhotoUrl = (path: string | null | undefined): string => {
    if (!path) return "";
    return signedUrls?.[path] ?? "";
  };

  const slots = Array.from({ length: maxPhotos }, (_, i) => {
    const photo = photos.find((p) => p.position === i);
    return { position: i, photo };
  });

  const handleUpload = async (position: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(position);
    try {
      await uploadPhoto(userId, file, position);
      const updated = await import("@/lib/queries").then((q) => q.getProfilePhotos(userId));
      onPhotosChange(updated);
      toast.success(position === 0 ? "Foto principal atualizada!" : "Foto adicionada!");
    } catch {
      toast.error("Erro ao enviar foto");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (photo: ProfilePhoto) => {
    try {
      await deletePhoto(userId, photo.id, photo.path);
      const updated = await import("@/lib/queries").then((q) => q.getProfilePhotos(userId));
      onPhotosChange(updated);
      toast.success("Foto removida");
    } catch {
      toast.error("Erro ao remover foto");
    }
  };

  const handleMove = async (fromPos: number, toPos: number) => {
    if (toPos < 0 || toPos >= maxPhotos) return;
    const fromPhoto = photos.find((p) => p.position === fromPos);
    const toPhoto = photos.find((p) => p.position === toPos);
    if (!fromPhoto) return;

    const updates: { id: string; position: number }[] = [
      { id: fromPhoto.id, position: toPos },
    ];
    if (toPhoto) {
      updates.push({ id: toPhoto.id, position: fromPos });
    }

    try {
      await reorderPhotos(updates);
      const updated = await import("@/lib/queries").then((q) => q.getProfilePhotos(userId));
      onPhotosChange(updated);
    } catch {
      toast.error("Erro ao reordenar");
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {slots.map(({ position, photo }) => (
            <div
              key={position}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-muted"
            >
              {photo ? (
                <img
                  src={getPhotoUrl(photo.path)}
                  alt={`Foto ${position + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <button
                  onClick={() => fileInputRefs.current.get(position)?.click()}
                  disabled={uploading !== null}
                  className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {uploading === position ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <CameraIcon className="h-6 w-6" />
                      <span className="text-[10px]">
                        {position === 0 ? "Principal" : `+${position + 1}`}
                      </span>
                    </>
                  )}
                </button>
              )}

              {photo && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(photo)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                  {position > 0 && (
                    <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {position > 0 && (
                        <button
                          onClick={() => handleMove(position, position - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground"
                        >
                          <ArrowLeftIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                  {position === 0 && (
                    <div className="absolute bottom-1 left-1">
                      <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Principal
                      </span>
                    </div>
                  )}
                </>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => {
                  if (el) fileInputRefs.current.set(position, el);
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(position, file);
                  e.target.value = "";
                }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {photos.length}/{maxPhotos} fotos · Toque para adicionar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {slots.map(({ position, photo }) => (
          <div
            key={position}
            className={`group relative overflow-hidden rounded-xl border border-border/50 bg-muted ${
              position === 0 ? "col-span-2 aspect-[3/2]" : "aspect-square"
            }`}
          >
            {photo ? (
              <img
                src={getPhotoUrl(photo.path)}
                alt={`Foto ${position + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <button
                onClick={() => fileInputRefs.current.get(position)?.click()}
                disabled={uploading !== null}
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {uploading === position ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <CameraIcon className="h-8 w-8" />
                    <span className="text-xs">
                      {position === 0 ? "Adicionar foto principal" : `Adicionar foto ${position + 1}`}
                    </span>
                  </>
                )}
              </button>
            )}

            {photo && (
              <>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(photo)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {position > 0 && (
                    <button
                      onClick={() => handleMove(position, position - 1)}
                      className="flex h-8 items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs text-foreground"
                    >
                      <ArrowLeftIcon className="h-3 w-3" />
                      Mover
                    </button>
                  )}
                </div>
                {position === 0 && (
                  <div className="absolute bottom-2 left-2">
                    <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                      Foto principal
                    </span>
                  </div>
                )}
              </>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => {
                if (el) fileInputRefs.current.set(position, el);
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(position, file);
                e.target.value = "";
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {photos.length}/{maxPhotos} fotos · A primeira foto é a principal
      </p>
    </div>
  );
}
