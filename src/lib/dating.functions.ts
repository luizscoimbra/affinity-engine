import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const entrada = z.object({ texto: z.string().min(3).max(4000) });

/**
 * Gera o vetor de compatibilidade do perfil do usuário logado a partir de um
 * texto-resumo (interesses, estilo de vida, signo, bio) e guarda no banco.
 */
export const gerarVetorPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => entrada.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, motivo: "sem-chave" };

    let resposta: Response;
    try {
      resposta = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: data.texto,
        }),
      });
    } catch (erro) {
      console.error("[embeddings] falha de rede", erro);
      return { ok: false as const, motivo: "rede" };
    }

    if (resposta.status === 429) return { ok: false as const, motivo: "limite" };
    if (resposta.status === 402) return { ok: false as const, motivo: "creditos" };
    if (!resposta.ok) {
      console.error("[embeddings] erro do gateway", resposta.status, await resposta.text());
      return { ok: false as const, motivo: "gateway" };
    }

    const json = (await resposta.json()) as { data?: { embedding?: number[] }[] };
    const embedding = json.data?.[0]?.embedding;
    if (!embedding || embedding.length === 0) return { ok: false as const, motivo: "vazio" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profile_embeddings").upsert(
      {
        profile_id: context.userId,
        embedding: JSON.stringify(embedding),
        source_text: data.texto,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "profile_id" },
    );
    if (error) {
      console.error("[embeddings] falha ao salvar", error.message);
      return { ok: false as const, motivo: "banco" };
    }

    return { ok: true as const };
  });
