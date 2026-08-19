import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  productId: z.string().uuid(),
  minecraftUsername: z
    .string()
    .trim()
    .min(3)
    .max(16)
    .regex(/^[A-Za-z0-9_]+$/, "Invalid Minecraft username"),
  email: z.string().trim().email().max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10 digit phone number"),
  userId: z.string().uuid().nullable().optional(),
});

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const appId = process.env["CASHFREE_APP_ID"];
    const secret = process.env["CASHFREE_SECRET_KEY"];
    const env = process.env["CASHFREE_ENV"] ?? "sandbox";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_active")
      .eq("id", data.productId)
      .maybeSingle();

    if (productError) throw new Error(productError.message);
    if (!product || !product.is_active) throw new Error("This item is not available.");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: data.userId ?? null,
        product_id: product.id,
        product_name: product.name,
        minecraft_username: data.minecraftUsername,
        email: data.email,
        amount: product.price,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError) throw new Error(orderError.message);

    if (!appId || !secret) {
      return {
        ok: false as const,
        orderId: order.id,
        message:
          "Payments are not configured yet. Ask the owner to add the Cashfree credentials.",
      };
    }

    const base =
      env === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

    const response = await fetch(`${base}/links`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secret,
      },
      body: JSON.stringify({
        link_id: `vayumc_${order.id}`,
        link_amount: Number(product.price),
        link_currency: "INR",
        link_purpose: `${product.name} for ${data.minecraftUsername}`,
        customer_details: {
          customer_name: data.minecraftUsername,
          customer_email: data.email,
          customer_phone: data.phone,
        },
        link_notify: { send_email: false, send_sms: false },
        link_meta: {
          return_url: `${process.env["SITE_URL"] ?? "https://vayumc.fun"}/order/${order.id}`,
        },
        link_notes: { order_id: order.id },
      }),
    });

    const payload = (await response.json()) as { link_url?: string; message?: string };

    if (!response.ok || !payload.link_url) {
      console.error("Cashfree error", response.status, payload);
      await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return {
        ok: false as const,
        orderId: order.id,
        message: payload.message ?? "Could not start the payment. Please try again.",
      };
    }

    await supabaseAdmin
      .from("orders")
      .update({ cf_order_id: `vayumc_${order.id}` })
      .eq("id", order.id);

    return { ok: true as const, orderId: order.id, paymentUrl: payload.link_url };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, product_name, minecraft_username, amount, status, delivery_status, created_at")
      .eq("id", data.orderId)
      .maybeSingle();
    return order ?? null;
  });
