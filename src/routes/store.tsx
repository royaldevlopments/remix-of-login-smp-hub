import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoriesQuery, productsQuery } from "@/lib/site-data";
import { createCheckout } from "@/lib/checkout.functions";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store — Login SMP Ranks, Keys & Coins" },
      {
        name: "description",
        content:
          "Buy ranks, crate keys and coins for Login SMP. Paid securely with Cashfree and delivered in game instantly.",
      },
      { property: "og:title", content: "Store — Login SMP" },
      {
        property: "og:description",
        content: "Ranks, crate keys and coins with instant in-game delivery.",
      },
    ],
  }),
  component: StorePage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  category_id: string | null;
  is_active: boolean;
};

function StorePage() {
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products } = useQuery(productsQuery);
  const [active, setActive] = useState<string | null>(null);
  const [buying, setBuying] = useState<Product | null>(null);

  const cats = (categories ?? []).filter((c) => c.is_active);
  const selected = active ?? cats[0]?.id ?? null;
  const visible = (products ?? []).filter(
    (p) => p.is_active && p.category_id === selected,
  ) as Product[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <PixelHeading as="h1">STORE</PixelHeading>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Every purchase supports the server and is delivered to your Minecraft account
        automatically. Make sure you type your username exactly.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "pixel-border text-pixel px-4 py-3 text-[10px]",
              c.id === selected ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {c.name.toUpperCase()}
          </button>
        ))}
      </div>

      {cats.find((c) => c.id === selected)?.description ? (
        <p className="mt-5 text-muted-foreground">
          {cats.find((c) => c.id === selected)?.description}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {visible.map((product) => (
          <PixelPanel key={product.id} className="flex flex-col">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="mb-4 h-40 w-full object-cover [image-rendering:pixelated]"
                loading="lazy"
              />
            ) : null}
            <h2 className="text-pixel text-xs text-accent">{product.name}</h2>
            <p className="mt-3 flex-1 text-muted-foreground">{product.description}</p>
            <p className="text-pixel mt-4 text-sm text-gold">
              ₹{Number(product.price).toFixed(0)}
            </p>
            <Button
              className="pixel-border text-pixel mt-5 h-12 text-[10px]"
              onClick={() => setBuying(product)}
            >
              BUY NOW
            </Button>
          </PixelPanel>
        ))}
        {visible.length === 0 ? (
          <p className="text-muted-foreground">Nothing in this category yet.</p>
        ) : null}
      </div>

      <BuyDialog product={buying} onClose={() => setBuying(null)} />
    </div>
  );
}

function BuyDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const checkout = useServerFn(createCheckout);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const result = await checkout({
        data: {
          productId: product.id,
          minecraftUsername: String(form.get("username") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          userId: user?.id ?? null,
        },
      });
      if (result.ok) {
        window.location.href = result.paymentUrl;
        return;
      }
      toast.error(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="pixel-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-pixel text-xs text-primary">
            {product?.name}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label className="text-pixel text-[10px]">MINECRAFT USERNAME</Label>
            <Input
              name="username"
              maxLength={16}
              defaultValue=""
              className="pixel-inset mt-2 h-12 bg-input"
            />
          </div>
          <div>
            <Label className="text-pixel text-[10px]">EMAIL</Label>
            <Input
              name="email"
              type="email"
              defaultValue={user?.email ?? ""}
              className="pixel-inset mt-2 h-12 bg-input"
            />
          </div>
          <div>
            <Label className="text-pixel text-[10px]">PHONE (10 DIGITS)</Label>
            <Input name="phone" maxLength={10} className="pixel-inset mt-2 h-12 bg-input" />
          </div>
          <p className="text-sm text-muted-foreground">
            Total: ₹{product ? Number(product.price).toFixed(0) : 0} · paid securely via
            Cashfree.
          </p>
          <Button disabled={loading} className="pixel-border text-pixel h-12 w-full text-[10px]">
            {loading ? "STARTING..." : "PAY WITH CASHFREE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
