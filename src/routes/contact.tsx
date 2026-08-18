import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, SERVER_IP_FALLBACK } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Login SMP" },
      {
        name: "description",
        content:
          "Reach the Login SMP staff team about reports, appeals, store issues or partnerships.",
      },
      { property: "og:title", content: "Contact — Login SMP" },
      {
        property: "og:description",
        content: "Message the Login SMP staff team.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Add a bit more detail").max(2000),
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? null,
      message: parsed.data.message,
    });
    setSending(false);

    if (error) {
      toast.error("Could not send your message. Try again.");
      return;
    }
    toast.success("Message sent! Staff will reply by email.");
    event.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <PixelHeading as="h1">CONTACT</PixelHeading>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {settings?.["contact_intro"] ??
          "Got a question, a report or a partnership idea? Drop us a message."}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <PixelPanel>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label className="text-pixel text-[10px]">NAME</Label>
              <Input name="name" maxLength={80} className="pixel-inset mt-2 h-12 bg-input" />
            </div>
            <div>
              <Label className="text-pixel text-[10px]">EMAIL</Label>
              <Input name="email" type="email" maxLength={255} className="pixel-inset mt-2 h-12 bg-input" />
            </div>
            <div>
              <Label className="text-pixel text-[10px]">SUBJECT</Label>
              <Input name="subject" maxLength={120} className="pixel-inset mt-2 h-12 bg-input" />
            </div>
            <div>
              <Label className="text-pixel text-[10px]">MESSAGE</Label>
              <Textarea name="message" rows={6} maxLength={2000} className="pixel-inset mt-2 bg-input" />
            </div>
            <Button disabled={sending} className="pixel-border text-pixel h-12 text-[10px]">
              {sending ? "SENDING..." : "SEND MESSAGE"}
            </Button>
          </form>
        </PixelPanel>

        <div className="space-y-6">
          <PixelPanel>
            <h2 className="text-pixel text-xs text-accent">SERVER IP</h2>
            <p className="mt-3 text-muted-foreground">
              {settings?.["server_ip"] || SERVER_IP_FALLBACK}
            </p>
          </PixelPanel>
          <PixelPanel>
            <h2 className="text-pixel text-xs text-accent">EMAIL</h2>
            <p className="mt-3 break-all text-muted-foreground">
              {settings?.["contact_email"] || "support@loginsmp.fun"}
            </p>
          </PixelPanel>
          <PixelPanel>
            <h2 className="text-pixel text-xs text-accent">DISCORD</h2>
            <a
              href={settings?.["discord_invite"] || "#"}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block break-all text-primary"
            >
              {settings?.["discord_invite"] || "Join our Discord"}
            </a>
          </PixelPanel>
        </div>
      </div>
    </div>
  );
}
