export const GENEROS = [
  { value: "mulher", label: "Mulher" },
  { value: "homem", label: "Homem" },
  { value: "nao-binario", label: "Não binário" },
] as const;

export const TIPOS_FISICOS = [
  "magro",
  "atlético",
  "médio",
  "curvilíneo",
  "forte",
  "plus size",
] as const;

export const CORES_OLHOS = ["castanhos", "pretos", "verdes", "azuis", "mel", "cinzas"] as const;
export const CORES_CABELO = [
  "preto",
  "castanho",
  "loiro",
  "ruivo",
  "grisalho",
  "colorido",
  "raspado",
] as const;

export const INTERESSES: { categoria: string; tags: string[] }[] = [
  {
    categoria: "Música",
    tags: ["rock clássico", "MPB", "samba", "eletrônica", "rap", "sertanejo", "jazz", "pop", "vinil"],
  },
  {
    categoria: "Hobbies",
    tags: [
      "trilhas",
      "academia",
      "corrida",
      "surf",
      "cozinhar",
      "fotografia",
      "leitura",
      "games",
      "cinema",
      "dança",
      "pintura",
      "viagens",
    ],
  },
  {
    categoria: "Estilo de vida",
    tags: [
      "vegetariano",
      "não bebo",
      "bebo socialmente",
      "não fumo",
      "acordo cedo",
      "coruja",
      "quero filhos",
      "não quero filhos",
      "tenho pets",
      "vida fitness",
      "religioso",
      "ateu",
    ],
  },
  {
    categoria: "Rolês",
    tags: ["bar", "café", "praia", "show ao vivo", "museu", "brunch", "camping", "futebol"],
  },
];

export const TODAS_AS_TAGS = INTERESSES.flatMap((g) => g.tags);

export const CIDADES = [
  { nome: "São Paulo, SP", lat: -23.5505, lon: -46.6333 },
  { nome: "Rio de Janeiro, RJ", lat: -22.9068, lon: -43.1729 },
  { nome: "Belo Horizonte, MG", lat: -19.9167, lon: -43.9345 },
  { nome: "Curitiba, PR", lat: -25.4284, lon: -49.2733 },
  { nome: "Porto Alegre, RS", lat: -30.0346, lon: -51.2177 },
  { nome: "Salvador, BA", lat: -12.9777, lon: -38.5016 },
  { nome: "Recife, PE", lat: -8.0476, lon: -34.877 },
  { nome: "Fortaleza, CE", lat: -3.7319, lon: -38.5267 },
  { nome: "Brasília, DF", lat: -15.7939, lon: -47.8828 },
  { nome: "Campinas, SP", lat: -22.9099, lon: -47.0626 },
  { nome: "Florianópolis, SC", lat: -27.5954, lon: -48.548 },
  { nome: "Goiânia, GO", lat: -16.6869, lon: -49.2648 },
  { nome: "Manaus, AM", lat: -3.119, lon: -60.0217 },
  { nome: "Belém, PA", lat: -1.4558, lon: -48.4902 },
  { nome: "Santos, SP", lat: -23.9608, lon: -46.3336 },
  { nome: "Niterói, RJ", lat: -22.8832, lon: -43.1034 },
];

export const ELEMENTO_LABEL: Record<string, string> = {
  fogo: "signo de fogo",
  terra: "signo de terra",
  ar: "signo de ar",
  "água": "signo de água",
};

export function calcularIdade(nascimento: string | null | undefined): number | null {
  if (!nascimento) return null;
  const d = new Date(nascimento + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
  return idade;
}

export function calcularSigno(nascimento: string): { signo: string; elemento: string } {
  const d = new Date(nascimento + "T00:00:00");
  const mes = d.getMonth() + 1;
  const dia = d.getDate();
  const tabela: [string, number, number][] = [
    ["Áries", 3, 21],
    ["Touro", 4, 20],
    ["Gêmeos", 5, 21],
    ["Câncer", 6, 21],
    ["Leão", 7, 23],
    ["Virgem", 8, 23],
    ["Libra", 9, 23],
    ["Escorpião", 10, 23],
    ["Sagitário", 11, 22],
    ["Capricórnio", 12, 22],
    ["Aquário", 1, 20],
    ["Peixes", 2, 19],
  ];
  let signo = "Peixes";
  for (const [nome, m, dd] of tabela) {
    if (mes === m && dia >= dd) signo = nome;
    else if (mes === m + 1 || (m === 12 && mes === 1)) {
      const proximo = tabela.find(([, mm]) => mm === mes);
      if (proximo && dia < proximo[2]) signo = nome;
    }
  }
  const fogo = ["Áries", "Leão", "Sagitário"];
  const terra = ["Touro", "Virgem", "Capricórnio"];
  const ar = ["Gêmeos", "Libra", "Aquário"];
  const elemento = fogo.includes(signo)
    ? "fogo"
    : terra.includes(signo)
      ? "terra"
      : ar.includes(signo)
        ? "ar"
        : "água";
  return { signo, elemento };
}

export function formatarDistancia(km: number | null | undefined): string {
  if (km === null || km === undefined) return "distância indisponível";
  if (km < 1) return "a menos de 1 km de você";
  return `a ~${Math.round(km)} km de você`;
}

export function fraseAfinidade(
  affinity: number,
  sharedTags: string[],
  sameElement: boolean,
  elemento: string | null,
): string {
  const partes: string[] = [];
  const tags = sharedTags.slice(0, 3);
  if (tags.length === 1) partes.push(`vocês dois curtem ${tags[0]}`);
  if (tags.length === 2) partes.push(`vocês dois curtem ${tags[0]} e ${tags[1]}`);
  if (tags.length >= 3) partes.push(`vocês dois curtem ${tags[0]}, ${tags[1]} e ${tags[2]}`);
  if (sameElement && elemento) partes.push(`são do mesmo elemento (${elemento})`);
  if (partes.length === 0) return `${affinity}% compatíveis — vale trocar uma ideia`;
  return `${affinity}% compatíveis — ${partes.join(" e ")}`;
}
