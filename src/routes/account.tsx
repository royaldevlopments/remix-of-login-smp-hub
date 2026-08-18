import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Login SMP" },
      {
        name: "description",
        content: "View your Login SMP purchases and their in-game delivery status.",
      },
      { property: "og:title", content: "My Account — Login SMP" },
      { property: "og:description", content: "Your Login SMP purchases and delivery status." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16">Loading...</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <PixelHeading as="h1">MY ACCOUNT</PixelHeading>
        <p className="mt-4 text-muted-foreground">
          You need to{" "}
          <Link to="/login" className="text-primary underline">
            log in
          </Link>{" "}
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <PixelHeading as="h1">MY ACCOUNT</PixelHeading>
      <p className="mt-4 text-muted-foreground">{user.email}</p>

      <h2 className="text-pixel mt-10 text-xs text-accent">MY ORDERS</h2>
      <div className="mt-5 space-y-4">
        {(orders ?? []).map((order) => (
          <PixelPanel key={order.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-pixel text-[11px]">{order.product_name}</p>
              <p className="mt-2 text-muted-foreground">
                {order.minecraft_username} · ₹{Number(order.amount).toFixed(0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-pixel text-[10px] text-primary">
                {order.status.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Delivery: {order.delivery_status}
              </p>
            </div>
          </PixelPanel>
        ))}
        {(orders ?? []).length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : null}
      </div>
    </div>
  );
}
