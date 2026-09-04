import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

function NavigationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("transition-transform duration-200", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

interface Cidade {
  nome: string;
  uf: string;
}

interface CityInputProps {
  value: string;
  onChange: (cidade: { nome: string; lat: number; lon: number } | null) => void;
  placeholder?: string;
  className?: string;
}

interface IbgeMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: { UF: { sigla: string } };
  };
}

let cachedCities: Cidade[] | null = null;

async function fetchAllCities(): Promise<Cidade[]> {
  if (cachedCities) return cachedCities;
  const res = await fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
  );
  const data: IbgeMunicipio[] = await res.json();
  cachedCities = data.map((m) => ({
    nome: `${m.nome}, ${m.microrregiao.mesorregiao.UF.sigla}`,
    uf: m.microrregiao.mesorregiao.UF.sigla,
  }));
  return cachedCities;
}

async function geocodeCity(cityName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName + ", Brasil")}&limit=1&addressdetails=1`,
      { headers: { "User-Agent": "AfinniApp/1.0" } },
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {
    // geocoding failed
  }
  return null;
}

export function CityInput({ value, onChange, placeholder, className }: CityInputProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Cidade[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchCities = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingCities(true);
    try {
      const cities = await fetchAllCities();
      const lower = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = cities
        .filter((c) => {
          const normalized = c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return normalized.includes(lower);
        })
        .slice(0, 20);
      setSuggestions(filtered);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(val), 300);
  };

  const handleSelect = async (cidade: Cidade) => {
    setQuery(cidade.nome);
    setOpen(false);
    setGeocoding(true);
    try {
      const coords = await geocodeCity(cidade.nome);
      onChange({
        nome: cidade.nome,
        lat: coords?.lat ?? 0,
        lon: coords?.lon ?? 0,
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) return;
    setLoadingGeo(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      const { latitude, longitude } = position.coords;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        { headers: { "User-Agent": "AfinniApp/1.0" } },
      );
      const data = await res.json();

      let cityName = "";
      const addr = data.address;
      if (addr) {
        const city = addr.city || addr.town || addr.village || addr.municipality || "";
        const state = addr.state || "";
        cityName = city ? `${city}, ${state}` : data.display_name.split(",").slice(0, 2).join(",").trim();
      }

      if (cityName) {
        setQuery(cityName);
        setOpen(false);
        onChange({ nome: cityName, lat: latitude, lon: longitude });
      }
    } catch {
      // geolocation or reverse geocoding failed
    } finally {
      setLoadingGeo(false);
    }
  };

  const showDropdown = open && (suggestions.length > 0 || (loadingCities && query.length >= 2));

  return (
    <div className={className}>
      <Popover open={showDropdown} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (query.length >= 2) {
                  setOpen(true);
                  searchCities(query);
                }
              }}
              placeholder={placeholder || "Digite o nome da cidade"}
              className="h-11 rounded-xl border-white/10 bg-white/5 pl-9 pr-10"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loadingGeo}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-primary disabled:opacity-50"
              title="Usar localização atual"
            >
              {loadingGeo ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <NavigationIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] max-h-64 overflow-y-auto rounded-xl border-white/10 bg-[#221829] p-1.5 shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {loadingCities && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Carregando cidades...
            </div>
          )}
          {!loadingCities && suggestions.length === 0 && query.length >= 2 && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma cidade encontrada
            </div>
          )}
          {suggestions.map((c) => (
            <button
              key={c.nome}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 text-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(c);
              }}
            >
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{c.nome}</span>
            </button>
          ))}
          {geocoding && (
            <div className="px-3 py-2 text-center text-xs text-muted-foreground">
              Buscando coordenadas...
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
