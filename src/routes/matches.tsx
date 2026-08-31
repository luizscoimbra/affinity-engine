import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import MatchesPage from "@/pages/MatchesPage";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/matches")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <AppLayout>
      <MatchesPage />
    </AppLayout>
  ),
});
