import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

type WebhookBody = {
  type?: string;
  data?: {
    link_status?: string;
    link_notes?: { order_id?: string };
    order?: { order_status?: string };
    link_id?: string;
  };
};

export const Route = createFileRoute("/api/public/cashfree-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CASHFREE_SECRET_KEY"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const raw = await request.text();
        const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
        const signature = request.headers.get("x-webhook-signature") ?? "";

        const expected = createHmac("sha256", secret)
          .update(timestamp + raw)
          .digest("base64");

        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const body = JSON.parse(raw) as WebhookBody;
        const orderId =
          body.data?.link_notes?.order_id ??
          body.data?.link_id?.replace("vayumc_", "") ??
          null;
        const paid =
          body.data?.link_status === "PAID" || body.data?.order?.order_status === "PAID";

        if (!orderId) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (!paid) {
          await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", orderId);
          return new Response("ok");
        }

        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, status, product_id, minecraft_username")
          .eq("id", orderId)
          .maybeSingle();

        if (!order || order.status === "paid") return new Response("ok");

        await supabaseAdmin
          .from("orders")
          .update({ status: "paid", payment_ref: body.data?.link_id ?? null })
          .eq("id", orderId);

        if (order.product_id) {
          const { data: product } = await supabaseAdmin
            .from("products")
            .select("commands")
            .eq("id", order.product_id)
            .maybeSingle();

          const commands = (product?.commands ?? []).map((command: string) => ({
            order_id: order.id,
            command: command.replaceAll("{player}", order.minecraft_username),
          }));

          if (commands.length > 0) {
            await supabaseAdmin.from("command_queue").insert(commands);
          } else {
            await supabaseAdmin
              .from("orders")
              .update({ delivery_status: "delivered" })
              .eq("id", order.id);
          }
        }

        return new Response("ok");
      },
    },
  },
});
