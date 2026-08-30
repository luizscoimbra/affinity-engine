# Plataforma de relacionamento com IA e anúncios nativos

Interface em português. Fluxo completo essencial + anúncios simulados. Backend com Lovable Cloud (banco, login, storage e funções de servidor já inclusos, sem contas externas).

## O que será construído

### 1. Contas e perfil
- Cadastro/login por e-mail e senha, com sessão persistente.
- Onboarding em etapas: dados básicos (nome, data de nascimento, gênero, quem quer conhecer), físico (altura, tipo físico, cor de olhos e cabelo), estilo de vida e interesses (tags de hobbies, música, bebida/fumo, pets), bio livre.
- Signo calculado automaticamente pela data de nascimento (e o elemento: fogo, terra, ar, água).
- Fotos: até 6 por perfil, comprimidas no navegador para WebP antes do upload e servidas via CDN do storage.
- Preferências: faixa de idade e raio de distância ajustável de 5 a 100 km.

### 2. Localização
- Botão "usar minha localização" (GPS do navegador) e campo alternativo de cidade, com busca por nome e coordenadas resolvidas na base de cidades.
- Distância calculada por Haversine dentro da própria consulta ao banco, respeitando o raio escolhido.
- Exibição arredondada ("a ~7 km de você"), nunca coordenadas exatas.

### 3. Matchmaking com IA (Affinity Score)
- Ao salvar o perfil, um texto-resumo (interesses, estilo de vida, signo, bio) é convertido em vetor de embedding e guardado no banco vetorial.
- Pontuação Hard: filtra distância, faixa de idade e preferência de gênero.
- Pontuação Soft: similaridade de cosseno entre os vetores dos dois perfis.
- Score final combinado exibido como porcentagem no card, com frase explicativa gerada a partir dos pontos em comum reais: "88% compatíveis — vocês dois curtem trilhas, rock clássico e são de signos de terra".
- Ordenação do feed pelo score, com destaque das tags coincidentes.

### 4. Descoberta, curtidas e chat
- Feed de cards em pilha: curtir / passar, com desfazer da última ação.
- Match quando há curtida mútua, com tela de celebração e lista de matches.
- Chat 1:1 por match, com mensagens em tempo real, indicador de lida e ordenação por última mensagem.
- Denunciar e bloquear usuário; perfis bloqueados saem do feed dos dois lados.

### 5. Anúncios não intrusivos (simulados, com dados internos)
- Card nativo in-feed inserido a cada 8–10 perfis, visual idêntico a um perfil, com selo "Patrocinado" e CTA.
- Banner fixo 320x50 no rodapé da tela de conversa, discreto e sem cobrir o campo de digitação.
- Perfil patrocinado de marca (bar, cinema, restaurante) com cupom de desconto para encontros, abrindo detalhe próprio.
- Registro de impressões e cliques para permitir métricas futuras.

### 6. Design
Direção visual própria: escuro quente, tipografia expressiva nos títulos, cartões com profundidade suave e um acento vibrante único; nada de gradiente roxo genérico. Tudo em tokens semânticos, responsivo e pensado primeiro para o celular.

## Detalhes técnicos

- TanStack Start (React 19) + Tailwind v4; rotas separadas para `/` (landing), `/auth`, `/onboarding`, `/descobrir`, `/matches`, `/chat/$matchId`, `/perfil`, `/patrocinado/$id`, cada uma com metadados próprios.
- Lovable Cloud (Postgres) com `pgvector` para embeddings e colunas `latitude`/`longitude`; função SQL `buscar_candidatos` aplicando Haversine + filtros hard + `<=>` de cosseno, chamada por server function.
- Tabelas: `profiles`, `profile_photos`, `profile_interests`, `profile_embeddings`, `swipes`, `matches`, `messages`, `blocks`, `reports`, `sponsored_profiles`, `ad_events`. RLS em todas, com GRANTs explícitos; perfis visíveis apenas para usuários autenticados e não bloqueados.
- Embeddings via Lovable AI Gateway (`openai/text-embedding-3-small`) dentro de server function; a chave nunca vai ao cliente. Erros do gateway (402/429) são exibidos com mensagem clara e o feed cai no ranking sem IA.
- Storage privado para fotos com URLs assinadas; compressão para WebP no cliente antes do upload.
- Marcas patrocinadas e cupons entram por migração com dados de exemplo, para o feed já nascer populado.

## Ordem de execução

1. Cloud + schema, RLS e dados de exemplo (marcas/cupons).
2. Autenticação, onboarding e perfil com fotos.
3. Localização (GPS + cidade) e função de busca com Haversine.
4. Embeddings e Affinity Score no feed de descoberta.
5. Curtidas, matches e chat em tempo real.
6. Formatos de anúncio e métricas de impressão/clique.
7. Polimento visual, estados vazios, segurança (bloquear/denunciar) e revisão final.
