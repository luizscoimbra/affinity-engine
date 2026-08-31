import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, getProfileInterests, getProfilePhotos, upsertProfile, upsertInterests, uploadPhoto, getPhotoUrl } from "@/lib/queries";
import { calcularIdade, calcularSigno, ELEMENTO_LABEL, INTERESSES, CIDADES, GENEROS, TIPOS_FISICOS, CORES_OLHOS, CORES_CABELO } from "@/lib/dating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SettingsIcon, CameraIcon, MapPinIcon, SparklesIcon, LogOutIcon } from "@/components/icons";
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
      const cidade = CIDADES.find((c) => c.nome === city);
      const { signo, elemento } = profile?.birth_date
        ? calcularSigno(profile.birth_date)
        : { signo: null, elemento: null };

      await upsertProfile({
        id: user.id,
        display_name: displayName,
        bio,
        city: city || null,
        latitude: cidade?.lat ?? null,
        longitude: cidade?.lon ?? null,
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

      toast.success("Perfil atualizado!");
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

  const handlePhotoUpload = async (position: number, file: File) => {
    if (!user) return;
    try {
      await uploadPhoto(user.id, file, position);
      const updated = await getProfilePhotos(user.id);
      setPhotos(updated);
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao enviar foto");
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const idade = profile ? calcularIdade(profile.birth_date) : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Meu Perfil
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setEditing(!editing)}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleSignOut}>
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/80 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-primary/20">
                {photos.length > 0 ? (
                  <img
                    src={getPhotoUrl(photos[0]?.path)}
                    alt={displayName || "Perfil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {displayName?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <CameraIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(0, file);
                  }}
                />
              </label>
            </div>

            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">
                {displayName}
                {idade && <span className="ml-2 text-base font-normal text-muted-foreground">{idade}</span>}
              </h2>
              {city && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {city}
                </div>
              )}
              {profile?.signo && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  {profile.signo} · {ELEMENTO_LABEL[profile.elemento ?? ""] ?? profile.elemento}
                </div>
              )}
            </div>
          </div>

          {bio && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">{bio}</p>
            </>
          )}

          {interests.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-1.5">
                {interests.map((i) => (
                  <Badge key={i.tag} variant="secondary" className="text-xs">
                    {i.tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-lg">Editar perfil</CardTitle>
            </CardHeader>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea id="edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CIDADES.map((c) => (
                    <SelectItem key={c.nome} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gênero</Label>
              <div className="flex flex-wrap gap-2">
                {GENEROS.map((g) => (
                  <Badge key={g.value} variant={gender === g.value ? "default" : "outline"} className="cursor-pointer" onClick={() => setGender(g.value)}>
                    {g.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Procurando por</Label>
              <div className="flex flex-wrap gap-2">
                {GENEROS.map((g) => (
                  <Badge key={g.value} variant={seeking.includes(g.value) ? "default" : "outline"} className="cursor-pointer" onClick={() => setSeeking((p) => p.includes(g.value) ? p.filter((s) => s !== g.value) : [...p, g.value])}>
                    {g.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Idade mín</Label>
                <Input type="number" value={minAge} onChange={(e) => setMinAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Idade máx</Label>
                <Input type="number" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Distância (km)</Label>
              <Input type="number" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Interesses</Label>
              <div className="space-y-3">
                {INTERESSES.map((cat) => (
                  <div key={cat.categoria}>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{cat.categoria}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.tags.map((tag) => (
                        <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleTag(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
