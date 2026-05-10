"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-xl lg:px-6">
      <Button variant="ghost" className="lg:hidden" onClick={onOpenMobile}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="hidden text-sm text-slate-400 lg:block">Run AI tools and automations in one place.</div>
      <Button variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </header>
  );
}
