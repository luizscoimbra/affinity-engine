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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import {
  GENEROS,
  TIPOS_FISICOS,
  CORES_OLHOS,
  CORES_CABELO,
  INTERESSES,
  CIDADES,
} from "@/lib/dating";

const STEPS = ["Básico", "Corpo", "Estilo", "Interesses", "Bio"];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [seeking, setSeeking] = useState<string[]>([]);
  const [city, setCity] = useState("");
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
      const cidade = CIDADES.find((c) => c.nome === city);

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
        latitude: cidade?.lat ?? null,
        longitude: cidade?.lon ?? null,
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
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Crie seu perfil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Passo {step + 1} de {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-display text-lg">
                  Informações básicas
                </CardTitle>
              </CardHeader>

              <div className="space-y-2">
                <Label htmlFor="name">Como quer ser chamado?</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth">Data de nascimento</Label>
                <Input
                  id="birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Seu gênero</Label>
                <div className="flex flex-wrap gap-2">
                  {GENEROS.map((g) => (
                    <Badge
                      key={g.value}
                      variant={gender === g.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setGender(g.value)}
                    >
                      {g.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quem você procura?</Label>
                <div className="flex flex-wrap gap-2">
                  {GENEROS.map((g) => (
                    <Badge
                      key={g.value}
                      variant={seeking.includes(g.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSeeking(g.value)}
                    >
                      {g.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {CIDADES.map((c) => (
                      <SelectItem key={c.nome} value={c.nome}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-display text-lg">
                  Aparência física
                </CardTitle>
              </CardHeader>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Corpo</Label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_FISICOS.map((t) => (
                    <Badge
                      key={t}
                      variant={bodyType === t ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setBodyType(t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor dos olhos</Label>
                <div className="flex flex-wrap gap-2">
                  {CORES_OLHOS.map((c) => (
                    <Badge
                      key={c}
                      variant={eyeColor === c ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setEyeColor(c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor do cabelo</Label>
                <div className="flex flex-wrap gap-2">
                  {CORES_CABELO.map((c) => (
                    <Badge
                      key={c}
                      variant={hairColor === c ? "default" : "outline"}
                      className="cursor-pointer"
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
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-display text-lg">
                  Preferências
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAge">Idade mínima</Label>
                  <Input
                    id="minAge"
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAge">Idade máxima</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance">Distância máxima (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-display text-lg">
                  Seus interesses
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione pelo menos 3
                </p>
              </CardHeader>

              {INTERESSES.map((cat) => (
                <div key={cat.categoria} className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {cat.categoria}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-display text-lg">
                  Conte sobre você
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Uma boa bio aumenta suas chances em até 3x
                </p>
              </CardHeader>

              <div className="space-y-2">
                <Label htmlFor="bio">Sua bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte algo sobre você, seus hobbies, o que te faz rir..."
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/500
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button
            className="flex-1"
            onClick={() => setStep((s) => s + 1)}
          >
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={handleFinish}
            disabled={saving || !displayName}
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Começar a curtir
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
