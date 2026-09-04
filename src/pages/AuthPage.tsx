import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Heart, Mail, Lock, UserPlus, LogIn, Sparkles } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { HeartIcon } from "@/components/icons";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada com sucesso!");
          navigate({ to: "/onboarding" });
        } else {
          toast.success("Conta criada! Por favor confirme seu email antes de entrar.");
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_complete")
            .eq("id", data.user.id)
            .maybeSingle();

          if (profile?.onboarding_complete) {
            navigate({ to: "/descobrir" });
          } else {
            navigate({ to: "/onboarding" });
          }
        } else {
          navigate({ to: "/descobrir" });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-6 sm:py-12 overflow-y-auto">
      <AnimatedBackground variant="auth" />

      <div className="w-full max-w-md space-y-8 animate-in fade-in-50 zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center">
          <div className="relative mx-auto mb-2 flex h-40 sm:h-48 items-center justify-center">
             <img src="/logo.png" alt="Afinni Logo" className="h-full object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
          </div>
          <p className="mt-0 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground/90">
            <span>Conexões reais, baseadas em afinidade real</span>
            <Sparkles className="h-4 w-4 text-amber-400 animate-twinkle" />
          </p>
        </div>

        {/* Auth Glass Card */}
        <Card className="relative overflow-hidden border-white/10 bg-[#1f1925]/75 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {/* Subtle top gradient accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-primary to-amber-400" />

          <CardHeader className="text-center pb-4 pt-6">
            <CardTitle className="font-display text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Criar sua conta" : "Entrar no Afinni"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/90">
              {isSignUp
                ? "Preencha seus dados para descobrir conexões"
                : "Entre com sua conta para continuar suas conversas"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  E-mail
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-white/10 bg-white/5 backdrop-blur-md transition-all focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-white/10 bg-white/5 backdrop-blur-md transition-all focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/20"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="relative mt-2 h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-rose-500 to-amber-500 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/50 active:scale-[0.98]"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isSignUp ? (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Criar conta
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <Separator className="bg-white/10" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#201a26] px-3 py-0.5 text-xs text-muted-foreground border border-white/5">
                ou
              </span>
            </div>

            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-white/10 bg-white/5 text-sm font-semibold text-foreground/90 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
              size="lg"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Já tenho uma conta" : "Criar nova conta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
