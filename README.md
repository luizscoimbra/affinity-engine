# Affinity Engine

Para estruturar uma plataforma de relacionamento gratuita, escalável e com monetização não intrusiva, o projeto precisa ser dividido em três pilares: arquitetura de software, monetização estratégica e o motor de matchmaking via IA.




1. Estrutura do Sistema & Funcionalidades

Autenticação e Perfil:




Dados Físicos: Altura, tipo físico, cor dos olhos/cabelo.

Personalidade & Interesses: Tags de estilo de vida, hobbies, música e signo (calculado automaticamente pela data de nascimento).

Upload de Mídia: Armazenamento otimizado de fotos usando CDN (ex: Cloudflare R2 ou AWS S3) com compressão automática (WebP).

Geolocalização Dinâmica:




Uso de coordenadas GPS (Latitude/Longitude) salvas no perfil.

Cálculo de distância por fórmula de Haversine diretamente na consulta do banco de dados.

Filtro configurável pelo usuário (ex: de 5 km a 100 km).

2. Matchmaking com Agente de IA

Em vez de usar apenas buscas simples de banco de dados, o agente de IA processa o perfil de forma vetorial para encontrar compatibilidades profundas.




Vetorização de Perfis (Embeddings): O agente converte o texto do perfil, interesses, respostas a questionários e signo em um vetor numérico.

Cruzamento de Dados:




Pontuação Hard: Valida filtros diretos (distância e faixa etária).

Pontuação Soft (IA): Calcula a similaridade de cosseno entre os vetores de dois usuários.

Apresentação de Affinity Score: O sistema exibe porcentagens de compatibilidade destacando os pontos em comum (ex: "88% compatíveis — Vocês dois curtem trilhas, rock clássico e são do signo de terra").

3. Modelo de Anúncios Não Intrusivos (Ad-Supported)

Para manter a experiência limpa e não irritar o usuário durante o uso, utilize formatos integrados ao fluxo nativo da aplicação:




Formato de AnúncioOnde Posição no AppComo FuncionaNative In-Feed (Cards)Entre os cards de perfisExibido a cada 8-10 perfis deslizados. Tem visual idêntico a um perfil de usuário, mas com selo "Patrocinado".Banners de Rodapé FixosNa tela de bate-papoBanner discreto (320x50) que permanece estático na parte inferior da tela de mensagens.Perfil Patrocinado de MarcaNo feed de sugestõesEmpresas (como bares, cinemas ou restaurantes) criam perfis promocionais com cupons de desconto para encontros.

4. Arquitetura Tecnológica Recomendada

Frontend: React / Next.js (Web) ou React Native / Flutter (Mobile).

Backend: Node.js (NestJS) ou Python (FastAPI — ideal para integração com bibliotecas de IA).

Banco de Dados Relacional & Vetorial: PostgreSQL com extensão pgvector (para armazenar coordenadas e vetores de IA no mesmo banco).

Motor de IA: OpenAI API (text-embedding-3-small) ou modelos open-source locais via Ollama/HuggingFace para redução de custos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ed4ff71-7d4a-4010-8167-de8d304aebe1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
