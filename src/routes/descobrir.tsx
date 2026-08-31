import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import DiscoveryPage from "@/pages/DiscoveryPage";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/descobrir")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <AppLayout>
      <DiscoveryPage />
    </AppLayout>
  ),
});
