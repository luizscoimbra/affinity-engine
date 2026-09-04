import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSessao() {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!ativo) return;
      setUser(data.user ?? null);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUser(sessao?.user ?? null);
      setCarregando(false);
    });
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, carregando };
}

export function useMeuPerfil(userId: string | undefined) {
  return useQuery({
    queryKey: ["perfil", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: perfil, error }, { data: tags }, { data: fotos }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("profile_interests").select("tag").eq("profile_id", userId!),
        supabase
          .from("profile_photos")
          .select("id, path, position")
          .eq("profile_id", userId!)
          .order("position"),
      ]);
      if (error) throw error;
      return {
        perfil,
        tags: (tags ?? []).map((t) => t.tag),
        fotos: fotos ?? [],
      };
    },
  });
}

export function useUrlsAssinadas(paths: string[]) {
  return useQuery({
    queryKey: ["fotos-url", paths.join("|")],
    enabled: paths.length > 0,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("fotos-perfil")
        .createSignedUrls(paths, 60 * 60);
      if (error) throw error;
      const mapa: Record<string, string> = {};
      (data ?? []).forEach((item) => {
        if (item.path && item.signedUrl) mapa[item.path] = item.signedUrl;
      });
      return mapa;
    },
  });
}
