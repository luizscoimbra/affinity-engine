import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { upsertProfile, upsertInterests } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  GENEROS,
  TIPOS_FISICOS,
  CORES_OLHOS,
  CORES_CABELO,
  INTERESSES,
} from "@/lib/dating";
import { PhotoGallery } from "@/components/PhotoGallery";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { HeartIcon, SparklesIcon } from "@/components/icons";
import { CityInput } from "@/components/CityInput";
import type { Database } from "@/integrations/supabase/types";

type ProfilePhoto = Database["public"]["Tables"]["profile_photos"]["Row"];

const STEPS = ["Básico", "Aparência", "Fotos", "Preferências", "Interesses", "Bio"];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);

  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [seeking, setSeeking] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLon, setCityLon] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("50");
  const [maxDistance, setMaxDistance] = useState("100");

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleSeeking = (val: string) => {
    setSeeking((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await upsertProfile({
        id: user.id,
        display_name: displayName,
        birth_date: birthDate || null,
        gender: gender || null,
        seeking,
        bio,
        height_cm: heightCm ? parseInt(heightCm) : null,
        body_type: bodyType || null,
        eye_color: eyeColor || null,
        hair_color: hairColor || null,
        city: city || null,
        latitude: cityLat,
        longitude: cityLon,
        min_age: parseInt(minAge) || 18,
        max_age: parseInt(maxAge) || 60,
        max_distance_km: parseInt(maxDistance) || 50,
        onboarding_complete: true,
      });

      if (selectedTags.length > 0) {
        const interests = selectedTags.map((tag) => {
          const cat = INTERESSES.find((c) => c.tags.includes(tag));
          return {
            profile_id: user.id,
            tag,
            categoria: cat?.categoria ?? "Outros",
          };
        });
        await upsertInterests(interests);
      }

      toast.success("Perfil criado com sucesso!");
      navigate({ to: "/descobrir" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar perfil";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-center px-4 py-6 sm:py-10 overflow-y-auto">
      <AnimatedBackground variant="auth" />

      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Onboarding Header */}
        <div className="text-center">
          <div className="relative mx-auto mb-4 flex h-20 items-center justify-center">
             <img src="/logo.png" alt="Afinni Logo" className="h-full object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            Crie seu perfil
          </h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Passo {step + 1} de {STEPS.length}: {STEPS[step]}</span>
            <SparklesIcon className="h-3 w-3 text-amber-400" />
          </p>
        </div>

        {/* Glowing Progress Bar */}
        <div className="space-y-1.5">
          <Progress value={progress} className="h-2 rounded-full bg-white/10" />
          <div className="flex justify-between px-1 text-[10px] font-semibold text-muted-foreground/80">
            {STEPS.map((s, idx) => (
              <span
                key={s}
                className={idx <= step ? "text-primary font-bold" : "text-muted-foreground/40"}
              >
                {idx + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Step Glass Card */}
        <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-[#1e1724]/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-rose-500 to-amber-400" />
          <CardContent className="p-6">
            {step === 0 && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-display text-xl font-bold">
                    Informações Básicas
                  </CardTitle>
                </CardHeader>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase text-muted-foreground">Como quer ser chamado?</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 rounded-xl border-white/10 bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth" className="text-xs font-semibold uppercase text-muted-foreground">Data de nascimento</Label>
                  <Input
                    id="birth"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-11 rounded-xl border-white/10 bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Seu gênero</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENEROS.map((g) => (
                      <Badge
                        key={g.value}
                        variant={gender === g.value ? "default" : "outline"}
                        className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs transition-all ${
                          gender === g.value
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                        }`}
                        onClick={() => setGender(g.value)}
                      >
                        {g.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Quem você procura?</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENEROS.map((g) => {
                      const isSelected = seeking.includes(g.value);
                      return (
                        <Badge
                          key={g.value}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs transition-all ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                          }`}
                          onClick={() => toggleSeeking(g.value)}
                        >
                          {g.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Sua cidade</Label>
                  <CityInput
                    value={city}
                    onChange={(c) => {
                      setCity(c?.nome ?? "");
                      setCityLat(c?.lat ?? null);
                      setCityLon(c?.lon ?? null);
                    }}
                    placeholder="Digite o nome da sua cidade"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-display text-xl font-bold">
                    Aparência Física
                  </CardTitle>
                </CardHeader>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs font-semibold uppercase text-muted-foreground">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="h-11 rounded-xl border-white/10 bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Tipo de Corpo</Label>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS_FISICOS.map((t) => (
                      <Badge
                        key={t}
                        variant={bodyType === t ? "default" : "outline"}
                        className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs transition-all ${
                          bodyType === t
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                        }`}
                        onClick={() => setBodyType(t)}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Cor dos olhos</Label>
                  <div className="flex flex-wrap gap-2">
                    {CORES_OLHOS.map((c) => (
                      <Badge
                        key={c}
                        variant={eyeColor === c ? "default" : "outline"}
                        className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs transition-all ${
                          eyeColor === c
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                        }`}
                        onClick={() => setEyeColor(c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Cor do cabelo</Label>
                  <div className="flex flex-wrap gap-2">
                    {CORES_CABELO.map((c) => (
                      <Badge
                        key={c}
                        variant={hairColor === c ? "default" : "outline"}
                        className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs transition-all ${
                          hairColor === c
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                        }`}
                        onClick={() => setHairColor(c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-display text-xl font-bold">
                    Suas Fotos
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Perfis com fotos recebem até 10x mais curtidas e conexões de qualidade
                  </p>
                </CardHeader>

                {user && (
                  <PhotoGallery
                    userId={user.id}
                    photos={photos}
                    onPhotosChange={setPhotos}
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-display text-xl font-bold">
                    Preferências de Idade e Distância
                  </CardTitle>
                </CardHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge" className="text-xs font-semibold uppercase text-muted-foreground">Idade Mínima</Label>
                    <Input
                      id="minAge"
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      className="h-11 rounded-xl border-white/10 bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAge" className="text-xs font-semibold uppercase text-muted-foreground">Idade Máxima</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      className="h-11 rounded-xl border-white/10 bg-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance" className="text-xs font-semibold uppercase text-muted-foreground">Distância máxima (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="h-11 rounded-xl border-white/10 bg-white/5"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-display text-xl font-bold">
                    Seus Interesses
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Selecione tags que expressam quem você é e o que gosta de fazer
                  </p>
                </CardHeader>

                {INTERESSES.map((cat) => (
                  <div key={cat.categoria} className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {cat.categoria}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-all ${
                              isSelected
                                ? "bg-gradient-to-r from-primary to-rose-500 text-white border-transparent shadow-sm"
                                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                            }`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="font-display text-xl font-bold">
                    Conte Sobre Você
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Uma biografia autêntica gera conversas mais interessantes
                  </p>
                </CardHeader>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-semibold uppercase text-muted-foreground">Sua bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte algo sobre você, seus hobbies, séries favoritas ou o que te faz sorrir..."
                    rows={5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    className="rounded-xl border-white/10 bg-white/5"
                  />
                  <p className="text-[11px] text-muted-foreground text-right">
                    {bio.length}/500
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-sm font-semibold"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Voltar
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary via-rose-500 to-amber-500 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setStep((s) => s + 1)}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary via-rose-500 to-amber-500 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleFinish}
              disabled={saving || !displayName}
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Começar a Explorar
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
