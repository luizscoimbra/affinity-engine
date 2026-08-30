CREATE EXTENSION IF NOT EXISTS vector;

-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.calc_signo(d date)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN (extract(month from d)=3 AND extract(day from d)>=21) OR (extract(month from d)=4 AND extract(day from d)<=19) THEN 'Áries'
    WHEN (extract(month from d)=4 AND extract(day from d)>=20) OR (extract(month from d)=5 AND extract(day from d)<=20) THEN 'Touro'
    WHEN (extract(month from d)=5 AND extract(day from d)>=21) OR (extract(month from d)=6 AND extract(day from d)<=20) THEN 'Gêmeos'
    WHEN (extract(month from d)=6 AND extract(day from d)>=21) OR (extract(month from d)=7 AND extract(day from d)<=22) THEN 'Câncer'
    WHEN (extract(month from d)=7 AND extract(day from d)>=23) OR (extract(month from d)=8 AND extract(day from d)<=22) THEN 'Leão'
    WHEN (extract(month from d)=8 AND extract(day from d)>=23) OR (extract(month from d)=9 AND extract(day from d)<=22) THEN 'Virgem'
    WHEN (extract(month from d)=9 AND extract(day from d)>=23) OR (extract(month from d)=10 AND extract(day from d)<=22) THEN 'Libra'
    WHEN (extract(month from d)=10 AND extract(day from d)>=23) OR (extract(month from d)=11 AND extract(day from d)<=21) THEN 'Escorpião'
    WHEN (extract(month from d)=11 AND extract(day from d)>=22) OR (extract(month from d)=12 AND extract(day from d)<=21) THEN 'Sagitário'
    WHEN (extract(month from d)=12 AND extract(day from d)>=22) OR (extract(month from d)=1 AND extract(day from d)<=19) THEN 'Capricórnio'
    WHEN (extract(month from d)=1 AND extract(day from d)>=20) OR (extract(month from d)=2 AND extract(day from d)<=18) THEN 'Aquário'
    ELSE 'Peixes'
  END;
$$;

CREATE OR REPLACE FUNCTION public.calc_elemento(signo text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE signo
    WHEN 'Áries' THEN 'fogo' WHEN 'Leão' THEN 'fogo' WHEN 'Sagitário' THEN 'fogo'
    WHEN 'Touro' THEN 'terra' WHEN 'Virgem' THEN 'terra' WHEN 'Capricórnio' THEN 'terra'
    WHEN 'Gêmeos' THEN 'ar' WHEN 'Libra' THEN 'ar' WHEN 'Aquário' THEN 'ar'
    ELSE 'água'
  END;
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  birth_date date,
  gender text,
  seeking text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL DEFAULT '',
  height_cm int,
  body_type text,
  eye_color text,
  hair_color text,
  city text,
  latitude double precision,
  longitude double precision,
  location_source text,
  min_age int NOT NULL DEFAULT 18,
  max_age int NOT NULL DEFAULT 60,
  max_distance_km int NOT NULL DEFAULT 50,
  signo text,
  elemento text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_signo()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL THEN
    NEW.signo := public.calc_signo(NEW.birth_date);
    NEW.elemento := public.calc_elemento(NEW.signo);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER profiles_set_signo BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_signo();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ blocks (needed by profile policies) ============
CREATE TABLE public.blocks (
  blocker_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE public.profile_interests (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag text NOT NULL,
  categoria text NOT NULL DEFAULT 'interesse',
  PRIMARY KEY (profile_id, tag)
);

CREATE TABLE public.profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_photos_profile_idx ON public.profile_photos(profile_id, position);

CREATE TABLE public.profile_embeddings (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding vector(1536),
  source_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  liked boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (actor_id, target_id)
);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE (user_a, user_b)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX messages_match_idx ON public.messages(match_id, created_at);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sponsored_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  categoria text NOT NULL,
  headline text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  coupon_code text,
  coupon_text text,
  cta_label text NOT NULL DEFAULT 'Ver oferta',
  cta_url text,
  city text,
  latitude double precision,
  longitude double precision,
  accent text NOT NULL DEFAULT 'amber',
  tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  sponsored_id uuid REFERENCES public.sponsored_profiles(id) ON DELETE CASCADE,
  placement text NOT NULL,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ match creation on mutual like ============
CREATE OR REPLACE FUNCTION public.handle_swipe()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.liked AND EXISTS (
    SELECT 1 FROM public.swipes s
    WHERE s.actor_id = NEW.target_id AND s.target_id = NEW.actor_id AND s.liked
  ) THEN
    INSERT INTO public.matches (user_a, user_b)
    VALUES (least(NEW.actor_id, NEW.target_id), greatest(NEW.actor_id, NEW.target_id))
    ON CONFLICT (user_a, user_b) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER swipes_match AFTER INSERT ON public.swipes
FOR EACH ROW EXECUTE FUNCTION public.handle_swipe();

CREATE OR REPLACE FUNCTION public.bump_match()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.matches SET last_message_at = NEW.created_at WHERE id = NEW.match_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER messages_bump AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.bump_match();

-- ============ grants ============
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_interests TO authenticated;
GRANT ALL ON public.profile_interests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_photos TO authenticated;
GRANT ALL ON public.profile_photos TO service_role;
GRANT SELECT ON public.profile_embeddings TO authenticated;
GRANT ALL ON public.profile_embeddings TO service_role;
GRANT SELECT, INSERT, DELETE ON public.swipes TO authenticated;
GRANT ALL ON public.swipes TO service_role;
GRANT SELECT, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
GRANT SELECT ON public.sponsored_profiles TO authenticated, anon;
GRANT ALL ON public.sponsored_profiles TO service_role;
GRANT INSERT ON public.ad_events TO authenticated;
GRANT ALL ON public.ad_events TO service_role;

-- ============ RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_blocked(a uuid, b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = a AND blocked_id = b) OR (blocker_id = b AND blocked_id = a)
  );
$$;

CREATE OR REPLACE FUNCTION public.in_match(m uuid, u uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.matches WHERE id = m AND (user_a = u OR user_b = u));
$$;

CREATE POLICY "perfis visiveis para logados" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR NOT public.is_blocked(auth.uid(), id));
CREATE POLICY "cria proprio perfil" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "edita proprio perfil" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "apaga proprio perfil" ON public.profiles FOR DELETE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "interesses visiveis" ON public.profile_interests FOR SELECT TO authenticated USING (true);
CREATE POLICY "gerencia proprios interesses" ON public.profile_interests FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE POLICY "fotos visiveis" ON public.profile_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "gerencia proprias fotos" ON public.profile_photos FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE POLICY "le proprio vetor" ON public.profile_embeddings FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "le proprias curtidas" ON public.swipes FOR SELECT TO authenticated USING (actor_id = auth.uid());
CREATE POLICY "cria curtidas" ON public.swipes FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());
CREATE POLICY "desfaz curtida" ON public.swipes FOR DELETE TO authenticated USING (actor_id = auth.uid());

CREATE POLICY "le proprios matches" ON public.matches FOR SELECT TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid());
CREATE POLICY "desfaz match" ON public.matches FOR DELETE TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid());

CREATE POLICY "le mensagens do match" ON public.messages FOR SELECT TO authenticated
  USING (public.in_match(match_id, auth.uid()));
CREATE POLICY "envia mensagem no match" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.in_match(match_id, auth.uid()));
CREATE POLICY "marca como lida" ON public.messages FOR UPDATE TO authenticated
  USING (public.in_match(match_id, auth.uid()) AND sender_id <> auth.uid())
  WITH CHECK (public.in_match(match_id, auth.uid()));

CREATE POLICY "le proprios bloqueios" ON public.blocks FOR SELECT TO authenticated USING (blocker_id = auth.uid());
CREATE POLICY "cria bloqueio" ON public.blocks FOR INSERT TO authenticated WITH CHECK (blocker_id = auth.uid());
CREATE POLICY "remove bloqueio" ON public.blocks FOR DELETE TO authenticated USING (blocker_id = auth.uid());

CREATE POLICY "le proprias denuncias" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid());
CREATE POLICY "cria denuncia" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "patrocinados publicos" ON public.sponsored_profiles FOR SELECT TO anon, authenticated USING (active);

CREATE POLICY "registra evento de anuncio" ON public.ad_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============ matchmaking ============
CREATE OR REPLACE FUNCTION public.buscar_candidatos(p_limit int DEFAULT 30)
RETURNS TABLE (
  id uuid, display_name text, idade int, gender text, bio text, city text,
  height_cm int, body_type text, eye_color text, hair_color text,
  signo text, elemento text, distance_km double precision,
  soft_score double precision, affinity int, shared_tags text[],
  tags text[], same_element boolean
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.profiles; my_vec vector(1536); my_tags text[];
BEGIN
  SELECT * INTO me FROM public.profiles WHERE public.profiles.id = auth.uid();
  IF me.id IS NULL THEN RETURN; END IF;
  SELECT e.embedding INTO my_vec FROM public.profile_embeddings e WHERE e.profile_id = me.id;
  SELECT coalesce(array_agg(pi.tag), '{}') INTO my_tags FROM public.profile_interests pi WHERE pi.profile_id = me.id;

  RETURN QUERY
  WITH cand AS (
    SELECT p.*,
      CASE WHEN me.latitude IS NULL OR p.latitude IS NULL THEN NULL
        ELSE 6371 * acos(least(1, greatest(-1,
          cos(radians(me.latitude)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(me.longitude))
          + sin(radians(me.latitude)) * sin(radians(p.latitude))
        ))) END AS dist_km,
      (SELECT coalesce(array_agg(pi.tag), '{}') FROM public.profile_interests pi WHERE pi.profile_id = p.id) AS all_tags,
      (SELECT coalesce(array_agg(pi.tag), '{}') FROM public.profile_interests pi WHERE pi.profile_id = p.id AND pi.tag = ANY(my_tags)) AS common_tags,
      (SELECT CASE WHEN my_vec IS NULL OR e.embedding IS NULL THEN NULL
              ELSE 1 - (e.embedding <=> my_vec) END
       FROM public.profile_embeddings e WHERE e.profile_id = p.id) AS soft
    FROM public.profiles p
    WHERE p.id <> me.id
      AND p.onboarding_complete
      AND p.birth_date IS NOT NULL
      AND (cardinality(me.seeking) = 0 OR p.gender = ANY(me.seeking))
      AND (cardinality(p.seeking) = 0 OR me.gender = ANY(p.seeking))
      AND date_part('year', age(p.birth_date))::int BETWEEN me.min_age AND me.max_age
      AND date_part('year', age(me.birth_date))::int BETWEEN p.min_age AND p.max_age
      AND NOT EXISTS (SELECT 1 FROM public.swipes s WHERE s.actor_id = me.id AND s.target_id = p.id)
      AND NOT public.is_blocked(me.id, p.id)
  )
  SELECT c.id, c.display_name, date_part('year', age(c.birth_date))::int, c.gender, c.bio, c.city,
    c.height_cm, c.body_type, c.eye_color, c.hair_color, c.signo, c.elemento, c.dist_km,
    c.soft,
    round(100 * (
      0.6 * coalesce(c.soft, 0.5)
      + 0.3 * least(1, cardinality(c.common_tags)::numeric / 5)
      + 0.1 * CASE WHEN c.dist_km IS NULL THEN 0.5
              ELSE greatest(0, 1 - c.dist_km / greatest(me.max_distance_km, 1)) END
    ))::int,
    c.common_tags, c.all_tags,
    (c.elemento IS NOT NULL AND c.elemento = me.elemento)
  FROM cand c
  WHERE (me.latitude IS NULL OR c.dist_km IS NULL OR c.dist_km <= me.max_distance_km)
  ORDER BY 15 DESC, c.dist_km NULLS LAST
  LIMIT greatest(1, least(p_limit, 60));
END; $$;

GRANT EXECUTE ON FUNCTION public.buscar_candidatos(int) TO authenticated;

-- realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- ============ seed sponsored brands ============
INSERT INTO public.sponsored_profiles (brand_name, categoria, headline, tagline, description, coupon_code, coupon_text, cta_label, city, accent, tags) VALUES
('Bar Meia-Noite', 'Bar', 'Primeiro encontro sem pressão', 'Drinks autorais e música ao vivo às quintas', 'Um bar de esquina com luz baixa, vinis girando e carta de drinks que muda toda semana. Chega junto e mostra o cupom no caixa.', 'MATCH2POR1', '2 drinks pelo preço de 1 para casais que chegam juntos', 'Ver o bar', 'São Paulo', 'amber', '{"drinks","música ao vivo","rock"}'),
('Cine Aurora', 'Cinema', 'Sessão dupla para dois', 'Clássicos restaurados toda terça', 'Sala única, projeção 35mm e pipoca feita na hora. Programação de clássicos que rende assunto por semanas.', 'AURORA50', '50% no segundo ingresso nas sessões de terça', 'Ver programação', 'São Paulo', 'violet', '{"cinema","clássicos","cultura"}'),
('Cantina Dona Zeza', 'Restaurante', 'Massa fresca e conversa longa', 'Cozinha italiana de bairro desde 1974', 'Mesa de mármore, molho que cozinha seis horas e um tiramisù que vale o encontro inteiro.', 'ZEZA20', '20% de desconto no jantar para dois', 'Ver menu', 'São Paulo', 'rose', '{"comida italiana","vinho","jantar"}'),
('Trilha Livre', 'Aventura', 'Que tal um encontro na trilha?', 'Caminhadas guiadas em grupos pequenos', 'Saídas de fim de semana em trilhas leves e médias, com guia, transporte e café da manhã incluídos.', 'TRILHA2', 'Segunda vaga com 40% off nas saídas de sábado', 'Ver saídas', 'São Paulo', 'emerald', '{"trilhas","natureza","aventura"}'),
('Café Torrão', 'Café', 'Café da tarde sem compromisso', 'Torra própria e pão de fermentação natural', 'Balcão pequeno, café de origem e uma bancada perfeita para aquele encontro rápido que acaba durando três horas.', 'TORRAO1', 'Compre um café, leve dois nos dias de semana', 'Ver cafeteria', 'São Paulo', 'amber', '{"café","brunch","conversa"}'),
('Clube Vinil', 'Música', 'Pista pequena, playlist grande', 'Noites de rock clássico e soul', 'Discotecagem em vinil, som analógico e uma pista que caberia na sala da sua avó — no melhor sentido.', 'VINILDUO', 'Entrada gratuita para dois até meia-noite', 'Ver agenda', 'São Paulo', 'violet', '{"rock clássico","dança","vinil"}');