import { supabase } from "@/integrations/supabase/client";
import { calcularSigno, ELEMENTO_LABEL } from "@/lib/dating";

export type DadosPerfil = {
  display_name: string;
  birth_date: string | null;
  gender: string | null;
  seeking: string[];
  bio: string;
  height_cm: number | null;
  body_type: string | null;
  eye_color: string | null;
  hair_color: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  location_source: string | null;
  min_age: number;
  max_age: number;
  max_distance_km: number;
};

export function textoResumo(dados: DadosPerfil, tags: string[]) {
  const signo = dados.birth_date ? calcularSigno(dados.birth_date) : null;
  return [
    `Nome: ${dados.display_name}`,
    dados.gender ? `Gênero: ${dados.gender}` : "",
    dados.city ? `Cidade: ${dados.city}` : "",
    dados.body_type ? `Tipo físico: ${dados.body_type}` : "",
    dados.height_cm ? `Altura: ${dados.height_cm} cm` : "",
    dados.eye_color ? `Olhos: ${dados.eye_color}` : "",
    dados.hair_color ? `Cabelo: ${dados.hair_color}` : "",
    signo ? `Signo: ${signo.signo} (${ELEMENTO_LABEL[signo.elemento]})` : "",
    tags.length ? `Interesses e estilo de vida: ${tags.join(", ")}` : "",
    dados.bio ? `Bio: ${dados.bio}` : "",
  ]
    .filter(Boolean)
    .join(". ");
}

export async function salvarPerfil(
  userId: string,
  dados: DadosPerfil,
  tags: string[],
  concluirOnboarding: boolean,
) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, ...dados, ...(concluirOnboarding ? { onboarding_complete: true } : {}) },
      { onConflict: "id" },
    );
  if (error) throw error;

  await supabase.from("profile_interests").delete().eq("profile_id", userId);
  if (tags.length) {
    const { error: erroTags } = await supabase
      .from("profile_interests")
      .insert(tags.map((tag) => ({ profile_id: userId, tag })));
    if (erroTags) throw erroTags;
  }

  const { gerarVetorPerfil } = await import("@/lib/dating.functions");
  try {
    return await gerarVetorPerfil({ data: { texto: textoResumo(dados, tags) } });
  } catch (erro) {
    console.error("[perfil] vetor de compatibilidade não gerado", erro);
    return { ok: false as const, motivo: "erro" };
  }
}
