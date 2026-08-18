import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { getOrderStatus } from "@/lib/checkout.functions";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Status — Login SMP" },
      {
        name: "description",
        content: "Check the payment and in-game delivery status of your Login SMP order.",
      },
      { property: "og:title", content: "Order Status — Login SMP" },
      { property: "og:description", content: "Payment and delivery status for your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const fetchStatus = useServerFn(getOrderStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchStatus({ data: { orderId } }),
    refetchInterval: 5000,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <PixelHeading as="h1">ORDER STATUS</PixelHeading>
      <PixelPanel className="mt-8">
        {isLoading ? (
          <p className="text-muted-foreground">Checking your order...</p>
        ) : !data ? (
          <p className="text-muted-foreground">We could not find that order.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-pixel text-xs text-accent">{data.product_name}</p>
            <p className="text-muted-foreground">Player: {data.minecraft_username}</p>
            <p className="text-muted-foreground">Amount: ₹{Number(data.amount).toFixed(0)}</p>
            <p className="text-pixel text-[11px] text-primary">
              PAYMENT: {data.status.toUpperCase()}
            </p>
            <p className="text-pixel text-[11px] text-gold">
              DELIVERY: {data.delivery_status.toUpperCase()}
            </p>
            <p className="text-muted-foreground">
              Delivery runs automatically once payment is confirmed. Stay online in game.
            </p>
          </div>
        )}
      </PixelPanel>
      <Link to="/store" className="mt-6 inline-block text-primary underline">
        Back to store
      </Link>
    </div>
  );
}
