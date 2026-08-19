import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Staff Login — VAYU MC" },
      {
        name: "description",
        content: "Restricted staff area for managing the VAYU MC website and store.",
      },
      { property: "og:title", content: "Staff Login — VAYU MC" },
      { property: "og:description", content: "Restricted staff area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) void navigate({ to: "/admin" });
  }, [user, isAdmin, navigate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Login failed");
      return;
    }

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    setLoading(false);

    if (!role) {
      await supabase.auth.signOut();
      toast.error("This account is not a staff account.");
      return;
    }

    toast.success("Welcome back, staff.");
    void navigate({ to: "/admin" });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-8 text-gold" />
        <PixelHeading as="h1">STAFF LOGIN</PixelHeading>
      </div>
      <PixelPanel className="mt-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label className="text-pixel text-[10px]">STAFF EMAIL</Label>
            <Input name="email" type="email" className="pixel-inset mt-2 h-12 bg-input" />
          </div>
          <div>
            <Label className="text-pixel text-[10px]">PASSWORD</Label>
            <Input name="password" type="password" className="pixel-inset mt-2 h-12 bg-input" />
          </div>
          <Button disabled={loading} className="pixel-border text-pixel h-12 w-full text-[10px]">
            {loading ? "CHECKING..." : "ENTER PANEL"}
          </Button>
        </form>
      </PixelPanel>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Player?{" "}
        <Link to="/login" className="text-primary underline">
          Use the player login
        </Link>
      </p>
    </div>
  );
}
