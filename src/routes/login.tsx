import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Player Login — VAYU MC" },
      {
        name: "description",
        content: "Sign in to your VAYU MC player account to track your store orders.",
      },
      { property: "og:title", content: "Player Login — VAYU MC" },
      { property: "og:description", content: "Sign in to your VAYU MC account." },
    ],
  }),
  component: LoginPage,
});

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void navigate({ to: "/account" });
  }, [user, navigate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = credentials.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            minecraft_username: String(form.get("minecraft_username") ?? ""),
            display_name: String(form.get("minecraft_username") ?? ""),
          },
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created — check your email to confirm it.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PixelHeading as="h1">PLAYER {mode === "signin" ? "LOGIN" : "SIGN UP"}</PixelHeading>
      <PixelPanel className="mt-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div>
              <Label className="text-pixel text-[10px]">MINECRAFT USERNAME</Label>
              <Input name="minecraft_username" maxLength={16} className="pixel-inset mt-2 h-12 bg-input" />
            </div>
          ) : null}
          <div>
            <Label className="text-pixel text-[10px]">EMAIL</Label>
            <Input name="email" type="email" className="pixel-inset mt-2 h-12 bg-input" />
          </div>
          <div>
            <Label className="text-pixel text-[10px]">PASSWORD</Label>
            <Input name="password" type="password" className="pixel-inset mt-2 h-12 bg-input" />
          </div>
          <Button disabled={loading} className="pixel-border text-pixel h-12 w-full text-[10px]">
            {loading ? "PLEASE WAIT..." : mode === "signin" ? "LOGIN" : "CREATE ACCOUNT"}
          </Button>
        </form>
        <button
          className="mt-5 text-sm text-accent underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Login"}
        </button>
      </PixelPanel>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Staff member?{" "}
        <Link to="/admin/login" className="text-primary underline">
          Use the staff login
        </Link>
      </p>
    </div>
  );
}
