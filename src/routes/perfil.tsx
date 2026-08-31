import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import ProfilePage from "@/pages/ProfilePage";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/perfil")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  ),
});
