import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/team", label: "Team" },
  { to: "/rules", label: "Rules" },
  { to: "/faq", label: "FAQs" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo.url} alt="Login SMP logo" className="size-12" />
          <span className="text-pixel text-sm text-primary md:text-base">LOGIN SMP</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-pixel px-3 py-2 text-[10px] text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
          {isAdmin ? (
            <Link to="/admin" className="text-pixel px-3 py-2 text-[10px] text-gold">
              ADMIN
            </Link>
          ) : null}
          {user ? (
            <Button
              variant="secondary"
              className="pixel-border text-pixel ml-2 h-10 text-[10px]"
              onClick={() => void supabase.auth.signOut()}
            >
              LOGOUT
            </Button>
          ) : (
            <Button asChild className="pixel-border text-pixel ml-2 h-10 text-[10px]">
              <Link to="/login">LOGIN</Link>
            </Button>
          )}
        </nav>

        <button
          className="ml-auto md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col gap-1 border-t-4 border-border px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-pixel py-2 text-[10px]"
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
          {isAdmin ? (
            <Link to="/admin" onClick={() => setOpen(false)} className="text-pixel py-2 text-[10px] text-gold">
              ADMIN
            </Link>
          ) : null}
          {user ? (
            <button
              className="text-pixel py-2 text-left text-[10px]"
              onClick={() => void supabase.auth.signOut()}
            >
              LOGOUT
            </button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="text-pixel py-2 text-[10px]">
              LOGIN
            </Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}
