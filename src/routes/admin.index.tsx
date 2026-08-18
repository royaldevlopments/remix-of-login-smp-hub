import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { CrudManager, type Field } from "@/components/admin/crud-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { categoriesQuery, faqCategoriesQuery, settingsQuery } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Login SMP" },
      {
        name: "description",
        content: "Manage the Login SMP store, pages, orders and settings.",
      },
      { property: "og:title", content: "Admin Panel — Login SMP" },
      { property: "og:description", content: "Login SMP staff control panel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  "Store",
  "Categories",
  "Orders",
  "FAQs",
  "Rules",
  "Team",
  "Messages",
  "Settings",
] as const;

type Tab = (typeof tabs)[number];

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("Store");
  const { data: categories } = useQuery(categoriesQuery);
  const { data: faqCategories } = useQuery(faqCategoriesQuery);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-16">Loading...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <PixelHeading as="h1">STAFF ONLY</PixelHeading>
        <p className="mt-5 text-muted-foreground">
          This area is restricted.{" "}
          <Link to="/admin/login" className="text-primary underline">
            Sign in with a staff account
          </Link>
          .
        </p>
      </div>
    );
  }

  const productFields: Field[] = [
    { name: "name", label: "Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price (INR)", type: "number" },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      options: (categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "image_url", label: "Image URL", type: "text" },
    {
      name: "commands",
      label: "RCON commands",
      type: "list",
      help: "One command per line. Use {player} for the buyer's username, e.g. lp user {player} parent add knight",
    },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_active", label: "Visible in store", type: "boolean" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <PixelHeading as="h1">ADMIN PANEL</PixelHeading>
      <p className="mt-4 text-muted-foreground">Signed in as {user.email}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "pixel-border text-pixel px-4 py-3 text-[10px]",
              t === tab ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === "Store" ? (
          <CrudManager
            table="products"
            title="Products"
            titleField="name"
            subtitleField="description"
            fields={productFields}
          />
        ) : null}

        {tab === "Categories" ? (
          <CrudManager
            table="categories"
            title="Store categories"
            titleField="name"
            subtitleField="slug"
            fields={[
              { name: "name", label: "Name", type: "text" },
              { name: "slug", label: "Slug", type: "text", help: "Lowercase, no spaces" },
              { name: "description", label: "Description", type: "textarea" },
              { name: "sort_order", label: "Sort order", type: "number" },
              { name: "is_active", label: "Visible", type: "boolean" },
            ]}
          />
        ) : null}

        {tab === "Orders" ? <OrdersPanel /> : null}

        {tab === "FAQs" ? (
          <div className="space-y-12">
            <CrudManager
              table="faq_categories"
              title="FAQ categories"
              titleField="name"
              fields={[
                { name: "name", label: "Name", type: "text" },
                { name: "sort_order", label: "Sort order", type: "number" },
              ]}
            />
            <CrudManager
              table="faqs"
              title="FAQs"
              titleField="question"
              subtitleField="answer"
              fields={[
                { name: "question", label: "Question", type: "text" },
                { name: "answer", label: "Answer", type: "textarea" },
                {
                  name: "category_id",
                  label: "Category",
                  type: "select",
                  options: (faqCategories ?? []).map((c) => ({ value: c.id, label: c.name })),
                },
                { name: "sort_order", label: "Sort order", type: "number" },
              ]}
            />
          </div>
        ) : null}

        {tab === "Rules" ? (
          <CrudManager
            table="rules"
            title="Rules"
            titleField="title"
            subtitleField="body"
            fields={[
              { name: "title", label: "Title", type: "text" },
              { name: "body", label: "Details", type: "textarea" },
              { name: "sort_order", label: "Sort order", type: "number" },
            ]}
          />
        ) : null}

        {tab === "Team" ? (
          <CrudManager
            table="team_members"
            title="Team members"
            titleField="name"
            subtitleField="role"
            fields={[
              { name: "name", label: "Name", type: "text" },
              { name: "role", label: "Role", type: "text" },
              { name: "bio", label: "Bio", type: "textarea" },
              { name: "avatar_url", label: "Avatar URL", type: "text" },
              { name: "discord_tag", label: "Discord tag", type: "text" },
              { name: "sort_order", label: "Sort order", type: "number" },
            ]}
          />
        ) : null}

        {tab === "Messages" ? <MessagesPanel /> : null}
        {tab === "Settings" ? <SettingsPanel /> : null}
      </div>
    </div>
  );
}

function OrdersPanel() {
  const queryClient = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const retry = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("command_queue")
        .update({ status: "pending", last_error: null })
        .eq("order_id", orderId);
      if (error) throw error;
      const { error: orderError } = await supabase
        .from("orders")
        .update({ delivery_status: "pending" })
        .eq("id", orderId);
      if (orderError) throw orderError;
    },
    onSuccess: () => {
      toast.success("Queued for delivery again");
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <h2 className="text-pixel text-xs text-accent">ORDERS</h2>
      <div className="mt-5 space-y-3">
        {(orders ?? []).map((order) => (
          <PixelPanel key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-pixel text-[11px]">{order.product_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.minecraft_username} · ₹{Number(order.amount).toFixed(0)} ·{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-pixel text-[10px] text-primary">{order.status.toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{order.delivery_status}</p>
              </div>
              <Button
                variant="secondary"
                className="pixel-border text-pixel h-10 text-[10px]"
                onClick={() => retry.mutate(order.id)}
              >
                REDELIVER
              </Button>
            </div>
          </PixelPanel>
        ))}
        {(orders ?? []).length === 0 ? <p className="text-muted-foreground">No orders yet.</p> : null}
      </div>
    </div>
  );
}

function MessagesPanel() {
  const queryClient = useQueryClient();
  const { data: messages } = useQuery({
    queryKey: ["admin", "contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
    },
  });

  return (
    <div>
      <h2 className="text-pixel text-xs text-accent">CONTACT MESSAGES</h2>
      <div className="mt-5 space-y-3">
        {(messages ?? []).map((message) => (
          <PixelPanel key={message.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-pixel text-[11px]">{message.subject || "No subject"}</p>
              <Button
                variant="destructive"
                className="pixel-border h-9 text-[10px]"
                onClick={() => remove.mutate(message.id)}
              >
                DELETE
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {message.name} · {message.email} · {new Date(message.created_at).toLocaleString()}
            </p>
            <p className="mt-3">{message.message}</p>
          </PixelPanel>
        ))}
        {(messages ?? []).length === 0 ? (
          <p className="text-muted-foreground">No messages yet.</p>
        ) : null}
      </div>
    </div>
  );
}

const settingFields = [
  { key: "server_name", label: "Server name" },
  { key: "server_ip", label: "Server IP" },
  { key: "discord_invite", label: "Discord invite link" },
  { key: "discord_members", label: "Discord member count" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_intro", label: "Contact page intro" },
];

function SettingsPanel() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(settingsQuery);

  const save = useMutation({
    mutationFn: async (values: { key: string; value: string }[]) => {
      const { error } = await supabase.from("site_settings").upsert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate(
      settingFields.map((field) => ({
        key: field.key,
        value: String(form.get(field.key) ?? ""),
      })),
    );
  }

  return (
    <div>
      <h2 className="text-pixel text-xs text-accent">SITE SETTINGS</h2>
      <PixelPanel className="mt-5">
        <form className="space-y-4" onSubmit={onSubmit} key={JSON.stringify(settings ?? {})}>
          {settingFields.map((field) => (
            <div key={field.key}>
              <Label className="text-pixel text-[10px]">{field.label.toUpperCase()}</Label>
              <Input
                name={field.key}
                defaultValue={settings?.[field.key] ?? ""}
                className="pixel-inset mt-2 h-12 bg-input"
              />
            </div>
          ))}
          <Button disabled={save.isPending} className="pixel-border text-pixel h-12 text-[10px]">
            {save.isPending ? "SAVING..." : "SAVE SETTINGS"}
          </Button>
        </form>
      </PixelPanel>
    </div>
  );
}
