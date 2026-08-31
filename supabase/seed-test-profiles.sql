-- =====================================================
-- SEED: Perfis de teste para Affinity Engine
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Criar 8 usuários de teste no auth.users
-- (Senhas: "teste123" para todos)

-- 1. Marina
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'marina@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 2. Rafael
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'rafael@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 3. Camila
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c3333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'camila@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 4. Lucas
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd4444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated',
  'lucas@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 5. Ana
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e5555555-5555-5555-5555-555555555555',
  'authenticated', 'authenticated',
  'ana@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 6. Pedro
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f6666666-6666-6666-6666-666666666666',
  'authenticated', 'authenticated',
  'pedro@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 7. Julia
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '77777777-7777-7777-7777-777777777777',
  'authenticated', 'authenticated',
  'julia@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- 8. Thiago
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '88888888-8888-8888-8888-888888888888',
  'authenticated', 'authenticated',
  'thiago@teste.com',
  crypt('teste123', gen_salt('bf')),
  now(), now(), now(), '', ''
);

-- =====================================================
-- Desabilitar trigger auto-create profile temporariamente
-- =====================================================
ALTER TABLE profiles DISABLE TRIGGER on_auth_user_created;

-- =====================================================
-- PROFILES (UPSERT para conflitar com trigger se necessário)
-- =====================================================

-- Marina (25 anos, São Paulo, signo de fogo)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Marina Costa',
  '2001-03-25',
  'mulher',
  ARRAY['homem'],
  'Amo fotografia de rua e café em qualquer esquina. Estou sempre explorando SP em busca de boas histórias. Adoro jazz e sambas aos domingos.',
  165, 'curvilíneo', 'castanhos', 'castanho',
  'São Paulo, SP', -23.5505, -46.6333,
  22, 35, 30,
  'Áries', 'fogo', true
);

-- Rafael (28 anos, Rio de Janeiro, signo de terra)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Rafael Oliveira',
  '1998-06-15',
  'homem',
  ARRAY['mulher'],
  'Engenheiro de software nos dias de semana, surfista nos fins de semana. Busco alguém que curta trilhas e praia tanto quanto eu.',
  182, 'atlético', 'pretos', 'preto',
  'Rio de Janeiro, RJ', -22.9068, -43.1729,
  23, 32, 50,
  'Gêmeos', 'ar', true
);

-- Camila (26 anos, Belo Horizonte, signo de água)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'Camila Santos',
  '2000-07-28',
  'mulher',
  ARRAY['homem'],
  'Professora de yoga e amante de livros. Minha playlist vai de MPB a eletrônica. Procuro alguém tranquilo mas que não tenha medo de aventura.',
  160, 'magro', 'verdes', 'loiro',
  'Belo Horizonte, MG', -19.9167, -43.9345,
  24, 35, 40,
  'Leão', 'fogo', true
);

-- Lucas (30 anos, Curitiba, signo de terra)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  'd4444444-4444-4444-4444-444444444444',
  'Lucas Ferreira',
  '1996-09-12',
  'homem',
  ARRAY['mulher', 'não-binario'],
  'Chef de cozinha, formado em gastronomia. Acredito que a melhor forma de conhecer alguém é compartilhando uma boa refeição. Cozinho melhor do que escolho filmes.',
  178, 'médio', 'castanhos', 'castanho',
  'Curitiba, PR', -25.4284, -49.2733,
  25, 38, 35,
  'Virgem', 'terra', true
);

-- Ana (24 anos, Porto Alegre, signo de ar)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  'e5555555-5555-5555-5555-555555555555',
  'Ana Ribeiro',
  '2002-10-05',
  'mulher',
  ARRAY['homem'],
  'Designer gráfica e ilustradora. coleciono vinis e sou fã de rock clássico. Adoro noites de cinema independente e brunch no domingo.',
  168, 'curvilíneo', 'mel', 'ruivo',
  'Porto Alegre, RS', -30.0346, -51.2177,
  22, 30, 25,
  'Libra', 'ar', true
);

-- Pedro (29 anos, Salvador, signo de fogo)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  'f6666666-6666-6666-6666-666666666666',
  'Pedro Almeida',
  '1997-04-18',
  'homem',
  ARRAY['mulher'],
  'Músico e produtor. Toco violão e baixo. Salvador é minha inspiração diária. Busco alguém que aprecie um bom som e conversas profundas.',
  175, 'forte', 'pretos', 'preto',
  'Salvador, BA', -12.9777, -38.5016,
  23, 35, 40,
  'Áries', 'fogo', true
);

-- Julia (27 anos, Florianópolis, signo de água)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'Julia Mendes',
  '1999-02-10',
  'mulher',
  ARRAY['homem'],
  'Triathaleta e nutricionista. Meu lugar favorito é a praia de manhã cedo. Amo viagens e já passei por 12 países. Busco companhia para a próxima aventura.',
  170, 'atlético', 'castanhos', 'preto',
  'Florianópolis, SC', -27.5954, -48.548,
  25, 35, 30,
  'Aquário', 'ar', true
);

-- Thiago (31 anos, Brasília, signo de terra)
INSERT INTO profiles (id, display_name, birth_date, gender, seeking, bio, height_cm, body_type, eye_color, hair_color, city, latitude, longitude, min_age, max_age, max_distance_km, signo, elemento, onboarding_complete)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'Thiago Lima',
  '1995-08-22',
  'homem',
  ARRAY['mulher'],
  'Advogado e escritor nas horas vagas. Curto museus, cafeterias artesanais e conversas sobrefilosóficas. Sou brônco mas leal.',
  185, 'médio', 'castanhos', 'grisalho',
  'Brasília, DF', -15.7939, -47.8828,
  25, 40, 50,
  'Virgem', 'terra', true
);

-- =====================================================
-- INTERESTES (3-5 tags por perfil)
-- =====================================================

-- Marina
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'fotografia', 'Hobbies'),
  ('a1111111-1111-1111-1111-111111111111', 'jazz', 'Música'),
  ('a1111111-1111-1111-1111-111111111111', 'samba', 'Música'),
  ('a1111111-1111-1111-1111-111111111111', 'viagens', 'Hobbies'),
  ('a1111111-1111-1111-1111-111111111111', 'café', 'Rolês');

-- Rafael
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'surf', 'Hobbies'),
  ('b2222222-2222-2222-2222-222222222222', 'trilhas', 'Hobbies'),
  ('b2222222-2222-2222-2222-222222222222', 'academia', 'Hobbies'),
  ('b2222222-2222-2222-2222-222222222222', 'praia', 'Rolês'),
  ('b2222222-2222-2222-2222-222222222222', 'pop', 'Música');

-- Camila
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'leitura', 'Hobbies'),
  ('c3333333-3333-3333-3333-333333333333', 'eletrônica', 'Música'),
  ('c3333333-3333-3333-3333-333333333333', 'viagens', 'Hobbies'),
  ('c3333333-3333-3333-3333-333333333333', 'cozinhar', 'Hobbies'),
  ('c3333333-3333-3333-3333-333333333333', 'não fumo', 'Estilo de vida');

-- Lucas
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('d4444444-4444-4444-4444-444444444444', 'cozinhar', 'Hobbies'),
  ('d4444444-4444-4444-4444-444444444444', 'cinema', 'Hobbies'),
  ('d4444444-4444-4444-4444-444444444444', 'jazz', 'Música'),
  ('d4444444-4444-4444-4444-444444444444', 'café', 'Rolês'),
  ('d4444444-4444-4444-4444-444444444444', 'vinil', 'Música');

-- Ana
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'pintura', 'Hobbies'),
  ('e5555555-5555-5555-5555-555555555555', 'rock clássico', 'Música'),
  ('e5555555-5555-5555-5555-555555555555', 'cinema', 'Hobbies'),
  ('e5555555-5555-5555-5555-555555555555', 'brunch', 'Rolês'),
  ('e5555555-5555-5555-5555-555555555555', 'vinil', 'Música');

-- Pedro
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('f6666666-6666-6666-6666-666666666666', 'rock clássico', 'Música'),
  ('f6666666-6666-6666-6666-666666666666', 'jazz', 'Música'),
  ('f6666666-6666-6666-6666-666666666666', 'show ao vivo', 'Rolês'),
  ('f6666666-6666-6666-6666-666666666666', 'vinil', 'Música'),
  ('f6666666-6666-6666-6666-666666666666', 'praia', 'Rolês');

-- Julia
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('77777777-7777-7777-7777-777777777777', 'corrida', 'Hobbies'),
  ('77777777-7777-7777-7777-777777777777', 'academia', 'Hobbies'),
  ('77777777-7777-7777-7777-777777777777', 'viagens', 'Hobbies'),
  ('77777777-7777-7777-7777-777777777777', 'praia', 'Rolês'),
  ('77777777-7777-7777-7777-777777777777', 'vida fitness', 'Estilo de vida');

-- Thiago
INSERT INTO profile_interests (profile_id, tag, categoria) VALUES
  ('88888888-8888-8888-8888-888888888888', 'leitura', 'Hobbies'),
  ('88888888-8888-8888-8888-888888888888', 'museu', 'Rolês'),
  ('88888888-8888-8888-8888-888888888888', 'café', 'Rolês'),
  ('88888888-8888-8888-8888-888888888888', 'fotografia', 'Hobbies'),
  ('88888888-8888-8888-8888-888888888888', 'pop', 'Música');

-- =====================================================
-- SWIPES (simular interações prévias)
-- =====================================================

-- Marina curtiu Rafael
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', true);

-- Rafael curtiu Marina (match!)
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', true);

-- Camila curtiu Lucas
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'd4444444-4444-4444-4444-444444444444', true);

-- Lucas curtiu Camila (match!)
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('d4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', true);

-- Ana curtiu Thiago
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('e5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', true);

-- Thiago curtiu Ana (match!)
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('88888888-8888-8888-8888-888888888888', 'e5555555-5555-5555-5555-555555555555', true);

-- Pedro curtiu Julia
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('f6666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', true);

-- Julia NÃO curtiu Pedro (sem match)
INSERT INTO swipes (actor_id, target_id, liked) VALUES
  ('77777777-7777-7777-7777-777777777777', 'f6666666-6666-6666-6666-666666666666', false);

-- =====================================================
-- MATCHES (os que deram match acima)
-- =====================================================

INSERT INTO matches (user_a, user_b, last_message_at) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', now() - interval '2 hours');

INSERT INTO matches (user_a, user_b, last_message_at) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'd4444444-4444-4444-4444-444444444444', now() - interval '1 hour');

INSERT INTO matches (user_a, user_b, last_message_at) VALUES
  ('e5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', now() - interval '30 minutes');

-- =====================================================
-- MENSAGENS (conversas nos matches)
-- =====================================================

-- Conversa Marina ↔ Rafael
INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'a1111111-1111-1111-1111-111111111111' AND user_b = 'b2222222-2222-2222-2222-222222222222'),
   'a1111111-1111-1111-1111-111111111111',
   'Oi! Vi que você curte surfar. Qual sua praia favorita no RJ?',
   now() - interval '2 hours');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'a1111111-1111-1111-1111-111111111111' AND user_b = 'b2222222-2222-2222-2222-222222222222'),
   'b2222222-2222-2222-2222-222222222222',
   'Opa Marina! Prainha é meu paraíso. E você, já veio surfar por aqui?',
   now() - interval '1 hour 50 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'a1111111-1111-1111-1111-111111111111' AND user_b = 'b2222222-2222-2222-2222-222222222222'),
   'a1111111-1111-1111-1111-111111111111',
   'Ainda não, mas agora que te conheci tenho uma boa desculpa pra ir! 🏄‍♀️',
   now() - interval '1 hour 40 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'a1111111-1111-1111-1111-111111111111' AND user_b = 'b2222222-2222-2222-2222-222222222222'),
   'b2222222-2222-2222-2222-222222222222',
   'Haha, bora! Eu te ensino e você me mostra os melhores pontos fotográficos da cidade 😄',
   now() - interval '1 hour 30 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'a1111111-1111-1111-1111-111111111111' AND user_b = 'b2222222-2222-2222-2222-222222222222'),
   'a1111111-1111-1111-1111-111111111111',
   'Fechou! Estou amando essa combinação 🤩',
   now() - interval '2 hours');

-- Conversa Camila ↔ Lucas
INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'c3333333-3333-3333-3333-333333333333' AND user_b = 'd4444444-4444-4444-4444-444444444444'),
   'd4444444-4444-4444-4444-444444444444',
   'Oi Camila! Vi que você também curte cozinhar. Qual sua receita favorita?',
   now() - interval '1 hour');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'c3333333-3333-3333-3333-333333333333' AND user_b = 'd4444444-4444-4444-4444-444444444444'),
   'c3333333-3333-3333-3333-333333333333',
   'Oi Lucas! Adoro fazer risoto de funghi. E você, o que gosta de preparar?',
   now() - interval '50 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'c3333333-3333-3333-3333-333333333333' AND user_b = 'd4444444-4444-4444-4444-444444444444'),
   'd4444444-4444-4444-4444-444444444444',
   'Risoto de funghi é perfeito! Eu curto massas artesanais. Bora trocar receitas algum dia?',
   now() - interval '40 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'c3333333-3333-3333-3333-333333333333' AND user_b = 'd4444444-4444-4444-4444-444444444444'),
   'c3333333-3333-3333-3333-333333333333',
   'Claro! Adoraria. Podemos marcar um brunch 🍳',
   now() - interval '30 minutes');

-- Conversa Ana ↔ Thiago
INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'e5555555-5555-5555-5555-555555555555' AND user_b = '88888888-8888-8888-8888-888888888888'),
   'e5555555-5555-5555-5555-555555555555',
   'Oi Thiago! Vi que você curte museus. Qual foi o último que visitou?',
   now() - interval '30 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'e5555555-5555-5555-5555-555555555555' AND user_b = '88888888-8888-8888-8888-888888888888'),
   '88888888-8888-8888-8888-888888888888',
   'Oi Ana! Foi o CCBB, exposição de arte moderna. E você, gosta de qual tipo de arte?',
   now() - interval '20 minutes');

INSERT INTO messages (match_id, sender_id, body, created_at) VALUES
  ((SELECT id FROM matches WHERE user_a = 'e5555555-5555-5555-5555-555555555555' AND user_b = '88888888-8888-8888-8888-888888888888'),
   'e5555555-5555-5555-5555-555555555555',
   'Curto muito arte contemporânea e ilustração. Tenho uns quadros pra te mostrar 😉',
   now() - interval '10 minutes');

-- =====================================================
-- Reabilitar trigger
-- =====================================================
ALTER TABLE profiles ENABLE TRIGGER on_auth_user_created;

-- =====================================================
-- PRONTO! Agora você pode testar com:
--
-- Marina:  marina@teste.com  / teste123
-- Rafael:  rafael@teste.com  / teste123
-- Camila:  camila@teste.com  / teste123
-- Lucas:   lucas@teste.com   / teste123
-- Ana:     ana@teste.com     / teste123
-- Pedro:   pedro@teste.com   / teste123
-- Julia:   julia@teste.com   / teste123
-- Thiago:  thiago@teste.com  / teste123
-- =====================================================
