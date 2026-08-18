import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ackSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.string().uuid(),
        ok: z.boolean(),
        error: z.string().max(500).optional(),
      }),
    )
    .max(100),
});

/**
 * RCON bridge endpoint.
 * The small helper that sits next to the Minecraft server (and holds the RCON
 * connection) polls this endpoint with the bridge token, runs the commands over
 * RCON and reports back. Raw TCP RCON cannot be opened from the web runtime, so
 * this queue is the delivery channel.
 */
export const Route = createFileRoute("/api/public/rcon-queue")({
  server: {
    handlers: {
      // Pull pending commands
      GET: async ({ request }) => {
        const token = process.env["RCON_BRIDGE_TOKEN"];
        if (!token) return new Response("Not configured", { status: 503 });
        if (request.headers.get("x-bridge-token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("command_queue")
          .select("id, command, order_id")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(50);

        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ commands: data ?? [] });
      },

      // Report execution results
      POST: async ({ request }) => {
        const token = process.env["RCON_BRIDGE_TOKEN"];
        if (!token) return new Response("Not configured", { status: 503 });
        if (request.headers.get("x-bridge-token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const parsed = ackSchema.safeParse(await request.json());
        if (!parsed.success) return new Response("Invalid body", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        for (const result of parsed.data.results) {
          const { data: row } = await supabaseAdmin
            .from("command_queue")
            .update({
              status: result.ok ? "done" : "failed",
              last_error: result.error ?? null,
              executed_at: new Date().toISOString(),
            })
            .eq("id", result.id)
            .select("order_id")
            .maybeSingle();

          if (row?.order_id) {
            const { count } = await supabaseAdmin
              .from("command_queue")
              .select("id", { count: "exact", head: true })
              .eq("order_id", row.order_id)
              .neq("status", "done");

            await supabaseAdmin
              .from("orders")
              .update({
                delivery_status: (count ?? 0) === 0 ? "delivered" : result.ok ? "pending" : "failed",
              })
              .eq("id", row.order_id);
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
