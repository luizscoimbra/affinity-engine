import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const FAKE_USERS = [
  {
    email: "marina.costa@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Marina Costa",
      birth_date: "2001-03-25",
      gender: "mulher",
      seeking: ["homem", "mulher"],
      bio: "Amo fotografia de rua, café especial e explorar cantinhos secretos de SP aos fins de semana. Apaixonada por jazz e MPB.",
      height_cm: 165,
      body_type: "curvilíneo",
      eye_color: "castanhos",
      hair_color: "castanho",
      city: "São Paulo, SP",
      latitude: -23.5505,
      longitude: -46.6333,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Áries",
      elemento: "fogo",
      onboarding_complete: true,
    },
    interests: [
      { tag: "fotografia", categoria: "Hobbies" },
      { tag: "jazz", categoria: "Música" },
      { tag: "café", categoria: "Gastronomia" },
      { tag: "viagens", categoria: "Estilo de vida" },
      { tag: "arte", categoria: "Cultura" },
    ],
  },
  {
    email: "rafael.oliveira@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Rafael Oliveira",
      birth_date: "1998-06-15",
      gender: "homem",
      seeking: ["mulher"],
      bio: "Engenheiro de software e surfista nos dias de folga. Se tiver trilha com vista pro mar, pode me chamar.",
      height_cm: 182,
      body_type: "atlético",
      eye_color: "pretos",
      hair_color: "preto",
      city: "Rio de Janeiro, RJ",
      latitude: -22.9068,
      longitude: -43.1729,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Gêmeos",
      elemento: "ar",
      onboarding_complete: true,
    },
    interests: [
      { tag: "surf", categoria: "Esportes" },
      { tag: "tecnologia", categoria: "Hobbies" },
      { tag: "trilha", categoria: "Natureza" },
      { tag: "praia", categoria: "Viagem" },
      { tag: "rock", categoria: "Música" },
    ],
  },
  {
    email: "camila.santos@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Camila Santos",
      birth_date: "2000-07-28",
      gender: "mulher",
      seeking: ["homem"],
      bio: "Professora de yoga, viciada em livros de ficção e culinária vegetariana. Procuro alguém para boas conversas sobre o universo.",
      height_cm: 160,
      body_type: "magro",
      eye_color: "verdes",
      hair_color: "loiro",
      city: "Belo Horizonte, MG",
      latitude: -19.9167,
      longitude: -43.9345,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Leão",
      elemento: "fogo",
      onboarding_complete: true,
    },
    interests: [
      { tag: "yoga", categoria: "Saúde" },
      { tag: "leitura", categoria: "Hobbies" },
      { tag: "astronomia", categoria: "Ciência" },
      { tag: "gastronomia", categoria: "Gastronomia" },
      { tag: "meditação", categoria: "Espiritualidade" },
    ],
  },
  {
    email: "lucas.ferreira@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Lucas Ferreira",
      birth_date: "1996-09-12",
      gender: "homem",
      seeking: ["mulher", "não-binario"],
      bio: "Chef de cozinha e amante de vinhos. Acredito que a melhor conversa acontece ao redor de uma mesa cheia de comida boa.",
      height_cm: 178,
      body_type: "médio",
      eye_color: "castanhos",
      hair_color: "castanho",
      city: "Curitiba, PR",
      latitude: -25.4284,
      longitude: -49.2733,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Virgem",
      elemento: "terra",
      onboarding_complete: true,
    },
    interests: [
      { tag: "gastronomia", categoria: "Gastronomia" },
      { tag: "vinho", categoria: "Gastronomia" },
      { tag: "cinema", categoria: "Cultura" },
      { tag: "jazz", categoria: "Música" },
      { tag: "viagens", categoria: "Estilo de vida" },
    ],
  },
  {
    email: "ana.ribeiro@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Ana Ribeiro",
      birth_date: "2002-10-05",
      gender: "mulher",
      seeking: ["homem", "mulher"],
      bio: "Designer gráfica e ilustradora digital. Apaixonada por feirinhas de vinil, gatos e cinema clássico.",
      height_cm: 168,
      body_type: "curvilíneo",
      eye_color: "mel",
      hair_color: "ruivo",
      city: "Porto Alegre, RS",
      latitude: -30.0346,
      longitude: -51.2177,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Libra",
      elemento: "ar",
      onboarding_complete: true,
    },
    interests: [
      { tag: "design", categoria: "Arte" },
      { tag: "cinema", categoria: "Cultura" },
      { tag: "ilustração", categoria: "Arte" },
      { tag: "café", categoria: "Gastronomia" },
      { tag: "gatos", categoria: "Pets" },
    ],
  },
  {
    email: "pedro.almeida@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Pedro Almeida",
      birth_date: "1997-04-18",
      gender: "homem",
      seeking: ["mulher"],
      bio: "Músico e produtor musical. Toco violão, guitarra e piano. Busco alguém para dividir fones de ouvido e boas risadas.",
      height_cm: 175,
      body_type: "forte",
      eye_color: "pretos",
      hair_color: "preto",
      city: "Salvador, BA",
      latitude: -12.9777,
      longitude: -38.5016,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Áries",
      elemento: "fogo",
      onboarding_complete: true,
    },
    interests: [
      { tag: "música", categoria: "Música" },
      { tag: "shows", categoria: "Eventos" },
      { tag: "violão", categoria: "Música" },
      { tag: "praia", categoria: "Viagem" },
      { tag: "samba", categoria: "Música" },
    ],
  },
  {
    email: "julia.mendes@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Julia Mendes",
      birth_date: "1999-02-10",
      gender: "mulher",
      seeking: ["homem"],
      bio: "Nutricionista esportiva e triatleta amadora. Amo acordar cedo para correr na orla e tomar água de coco.",
      height_cm: 170,
      body_type: "atlético",
      eye_color: "castanhos",
      hair_color: "preto",
      city: "Florianópolis, SC",
      latitude: -27.5954,
      longitude: -48.548,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Aquário",
      elemento: "ar",
      onboarding_complete: true,
    },
    interests: [
      { tag: "corrida", categoria: "Esportes" },
      { tag: "praia", categoria: "Viagem" },
      { tag: "viagens", categoria: "Estilo de vida" },
      { tag: "fitness", categoria: "Saúde" },
      { tag: "natureza", categoria: "Natureza" },
    ],
  },
  {
    email: "thiago.lima@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Thiago Lima",
      birth_date: "1995-08-22",
      gender: "homem",
      seeking: ["mulher"],
      bio: "Arquiteto apaixonado por design modernista, museus e cervejas artesanais. Gosto de conversas longas sobre qualquer assunto.",
      height_cm: 185,
      body_type: "médio",
      eye_color: "castanhos",
      hair_color: "castanho",
      city: "Brasília, DF",
      latitude: -15.7939,
      longitude: -47.8828,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Virgem",
      elemento: "terra",
      onboarding_complete: true,
    },
    interests: [
      { tag: "arquitetura", categoria: "Cultura" },
      { tag: "design", categoria: "Arte" },
      { tag: "cerveja artesanal", categoria: "Gastronomia" },
      { tag: "museus", categoria: "Cultura" },
      { tag: "fotografia", categoria: "Hobbies" },
    ],
  },
  {
    email: "beatriz.souza@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Beatriz Souza",
      birth_date: "2001-11-14",
      gender: "mulher",
      seeking: ["homem", "mulher"],
      bio: "Bióloga marinha e mergulhadora. Apaixonada pela vida marinha, sustentabilidade e acampamentos sob as estrelas.",
      height_cm: 164,
      body_type: "atlético",
      eye_color: "azuis",
      hair_color: "loiro",
      city: "Recife, PE",
      latitude: -8.0476,
      longitude: -34.877,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Escorpião",
      elemento: "água",
      onboarding_complete: true,
    },
    interests: [
      { tag: "mergulho", categoria: "Esportes" },
      { tag: "natureza", categoria: "Natureza" },
      { tag: "biologia", categoria: "Ciência" },
      { tag: "praia", categoria: "Viagem" },
      { tag: "viagens", categoria: "Estilo de vida" },
    ],
  },
  {
    email: "gabriel.martins@teste.com",
    password: "Affinity#2026!Sec",
    profile: {
      display_name: "Gabriel Martins",
      birth_date: "1997-12-03",
      gender: "homem",
      seeking: ["mulher"],
      bio: "Fotógrafo de vida selvagem e montanhista. Adoro acampar, ouvir sons da floresta e cozinhar no fogareiro.",
      height_cm: 180,
      body_type: "atlético",
      eye_color: "castanhos",
      hair_color: "castanho",
      city: "Campinas, SP",
      latitude: -22.9099,
      longitude: -47.0626,
      min_age: 20,
      max_age: 45,
      max_distance_km: 1000,
      signo: "Sagitário",
      elemento: "fogo",
      onboarding_complete: true,
    },
    interests: [
      { tag: "fotografia", categoria: "Hobbies" },
      { tag: "trilha", categoria: "Natureza" },
      { tag: "escalada", categoria: "Esportes" },
      { tag: "natureza", categoria: "Natureza" },
      { tag: "café", categoria: "Gastronomia" },
    ],
  },
];

async function seed() {
  for (const fake of FAKE_USERS) {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const signInRes = await client.auth.signInWithPassword({
      email: fake.email,
      password: fake.password,
    });

    console.log(`SignIn para ${fake.email}:`, {
      hasUser: !!signInRes.data?.user,
      hasSession: !!signInRes.data?.session,
      error: signInRes.error?.message,
    });

    if (signInRes.data?.session) {
      // User is authenticated, update with client
      const { error: pErr } = await client.from("profiles").update(fake.profile).eq("id", signInRes.data.user.id);
      console.log(`  -> Update profile:`, pErr ? pErr.message : "Sucesso!");

      await client.from("profile_interests").delete().eq("profile_id", signInRes.data.user.id);
      const interestRows = fake.interests.map((i) => ({
        profile_id: signInRes.data.user.id,
        tag: i.tag,
        categoria: i.categoria,
      }));
      const { error: iErr } = await client.from("profile_interests").insert(interestRows);
      console.log(`  -> Insert interests:`, iErr ? iErr.message : "Sucesso!");
    }
  }
}

seed();
