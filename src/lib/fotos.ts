import { supabase } from "@/integrations/supabase/client";

/** Comprime a imagem no navegador para WebP antes do upload. */
export async function comprimirParaWebp(arquivo: File, maxLado = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem");
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82),
  );
  if (!blob) throw new Error("Não foi possível comprimir a imagem");
  return blob;
}

export async function enviarFoto(userId: string, arquivo: File, position: number) {
  const blob = await comprimirParaWebp(arquivo);
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("fotos-perfil")
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  const { error: erroBanco } = await supabase
    .from("profile_photos")
    .insert({ profile_id: userId, path, position });
  if (erroBanco) throw erroBanco;
  return path;
}

export async function removerFoto(id: string, path: string) {
  await supabase.storage.from("fotos-perfil").remove([path]);
  const { error } = await supabase.from("profile_photos").delete().eq("id", id);
  if (error) throw error;
}
