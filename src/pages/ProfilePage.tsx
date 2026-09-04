import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, getProfileInterests, getProfilePhotos, upsertProfile, upsertInterests } from "@/lib/queries";
import { calcularIdade, calcularSigno, ELEMENTO_LABEL, INTERESSES, GENEROS } from "@/lib/dating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SettingsIcon, MapPinIcon, SparklesIcon, LogOutIcon } from "@/components/icons";
import { PhotoGallery } from "@/components/PhotoGallery";
import { BrandHeader } from "@/components/BrandHeader";
import { CityInput } from "@/components/CityInput";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInterest = Database["public"]["Tables"]["profile_interests"]["Row"];
type ProfilePhoto = Database["public"]["Tables"]["profile_photos"]["Row"];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<ProfileInterest[]>([]);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLon, setCityLon] = useState<number | null>(null);
  const [gender, setGender] = useState("");
  const [seeking, setSeeking] = useState<string[]>([]);
  const [heightCm, setHeightCm] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("50");
  const [maxDistance, setMaxDistance] = useState("100");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [p, i, ph] = await Promise.all([
          getMyProfile(user.id),
          getProfileInterests(user.id),
          getProfilePhotos(user.id),
        ]);
        setProfile(p);
        setInterests(i);
        setPhotos(ph);

        setDisplayName(p.display_name ?? "");
        setBio(p.bio ?? "");
        setCity(p.city ?? "");
        setCityLat(p.latitude ?? null);
        setCityLon(p.longitude ?? null);
        setGender(p.gender ?? "");
        setSeeking(p.seeking ?? []);
        setHeightCm(p.height_cm?.toString() ?? "");
        setBodyType(p.body_type ?? "");
        setEyeColor(p.eye_color ?? "");
        setHairColor(p.hair_color ?? "");
        setSelectedTags(i.map((t) => t.tag));
        setMinAge(p.min_age?.toString() ?? "18");
        setMaxAge(p.max_age?.toString() ?? "50");
        setMaxDistance(p.max_distance_km?.toString() ?? "100");
      } catch {
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { signo, elemento } = profile?.birth_date
        ? calcularSigno(profile.birth_date)
        : { signo: null, elemento: null };

      await upsertProfile({
        id: user.id,
        display_name: displayName,
        bio,
        city: city || null,
        latitude: cityLat,
        longitude: cityLon,
        gender: gender || null,
        seeking,
        height_cm: heightCm ? parseInt(heightCm) : null,
        body_type: bodyType || null,
        eye_color: eyeColor || null,
        hair_color: hairColor || null,
        min_age: parseInt(minAge) || 18,
        max_age: parseInt(maxAge) || 60,
        max_distance_km: parseInt(maxDistance) || 50,
        signo,
        elemento,
      });

      const interestsData = selectedTags.map((tag) => {
        const cat = INTERESSES.find((c) => c.tags.includes(tag));
        return {
          profile_id: user.id,
          tag,
          categoria: cat?.categoria ?? "Outros",
        };
      });
      await upsertInterests(interestsData);

      toast.success("Perfil atualizado com sucesso!");
      setEditing(false);

      const updated = await getMyProfile(user.id);
      setProfile(updated);
      const updatedInterests = await getProfileInterests(user.id);
      setInterests(updatedInterests);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-3 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  const idade = profile ? calcularIdade(profile.birth_date) : null;

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden">
      <BrandHeader
        subtitle="Gerencie suas fotos e preferências"
        rightElement={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-white/20 hover:bg-white/10 hover:text-foreground active:scale-95"
              title="Editar Perfil"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-rose-400 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
              title="Sair da Conta"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="mx-auto flex-1 w-full max-w-lg px-4 py-4 pb-24 space-y-6">
        {/* Profile Card */}
        <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-[#1e1724]/80 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-rose-500 to-amber-400" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
                  <span>{displayName || "Seu Nome"}</span>
                  {idade && <span className="text-lg font-light text-muted-foreground">{idade}</span>}
                </h2>
                {city && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <MapPinIcon className="h-3.5 w-3.5 text-primary" />
                    <span>{city}</span>
                  </div>
                )}
                {profile?.signo && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                    <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      {profile.signo} · Elemento {ELEMENTO_LABEL[profile.elemento ?? ""] ?? profile.elemento}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(!editing)}
                className="rounded-xl border-white/10 bg-white/5 text-xs font-semibold text-foreground hover:bg-white/10"
              >
                {editing ? "Fechar" : "Editar"}
              </Button>
            </div>

            <PhotoGallery
              userId={user?.id ?? ""}
              photos={photos}
              onPhotosChange={setPhotos}
              compact
            />

            {bio && (
              <>
                <Separator className="my-5 bg-white/10" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Sobre Mim
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed italic bg-white/5 p-3 rounded-2xl border border-white/5">
                    "{bio}"
                  </p>
                </div>
              </>
            )}

            {interests.length > 0 && (
              <>
                <Separator className="my-5 bg-white/10" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Meus Interesses
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((i) => (
                      <Badge
                        key={i.tag}
                        variant="secondary"
                        className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-white/20 transition-colors"
                      >
                        {i.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editing && (
          <Card className="relative overflow-hidden rounded-3xl border-white/15 bg-[#1f1826]/90 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
            <CardContent className="p-6 space-y-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="font-display text-xl font-bold">Editar Informações</CardTitle>
              </CardHeader>

              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground uppercase">Nome exibido</Label>
                <Input
                  id="edit-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-xl border-white/10 bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bio" className="text-xs font-semibold text-muted-foreground uppercase">Sua Bio</Label>
                <Textarea
                  id="edit-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  className="rounded-xl border-white/10 bg-white/5"
                />
                <p className="text-[11px] text-muted-foreground text-right">{bio.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Cidade</Label>
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

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Gênero</Label>
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
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Procurando por</Label>
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
                        onClick={() =>
                          setSeeking((p) =>
                            p.includes(g.value) ? p.filter((s) => s !== g.value) : [...p, g.value],
                          )
                        }
                      >
                        {g.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Idade Mín</Label>
                  <Input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="rounded-xl border-white/10 bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Idade Máx</Label>
                  <Input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="rounded-xl border-white/10 bg-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Distância Máxima (km)</Label>
                <Input
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="rounded-xl border-white/10 bg-white/5"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Interesses & Tags</Label>
                <div className="space-y-3">
                  {INTERESSES.map((cat) => (
                    <div key={cat.categoria}>
                      <p className="text-[11px] font-semibold text-primary mb-1.5">{cat.categoria}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.tags.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <Badge
                              key={tag}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-primary to-rose-500 text-white border-transparent"
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
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-white/10 bg-white/5"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-rose-500 font-bold text-white shadow-lg shadow-primary/30"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Salvar Perfil"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
