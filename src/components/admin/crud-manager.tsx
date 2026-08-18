import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PixelPanel } from "@/components/site/pixel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// The admin panel edits many different tables through one generic form, so the
// generated per-table types cannot be applied here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "list";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
};

type Row = Record<string, unknown> & { id: string };

export function CrudManager({
  table,
  title,
  fields,
  titleField,
  subtitleField,
  orderBy = "sort_order",
}: {
  table: string;
  title: string;
  fields: Field[];
  titleField: string;
  subtitleField?: string;
  orderBy?: string;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await db
        .from(table)
        .select("*")
        .order(orderBy, { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", table] });
    void queryClient.invalidateQueries();
  };

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (editing) {
        const { error } = await db.from(table).update(values).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db.from(table).insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form.get(field.name);
      if (field.type === "number") values[field.name] = Number(raw ?? 0);
      else if (field.type === "boolean") values[field.name] = form.get(field.name) === "on";
      else if (field.type === "list")
        values[field.name] = String(raw ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      else if (field.type === "select") values[field.name] = raw ? String(raw) : null;
      else values[field.name] = raw === "" ? null : String(raw);
    }
    save.mutate(values);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-pixel text-xs text-accent">{title.toUpperCase()}</h2>
        <Button
          className="pixel-border text-pixel h-11 text-[10px]"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" /> NEW
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {(rows ?? []).map((row) => (
          <PixelPanel key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-pixel text-[11px]">{String(row[titleField] ?? "")}</p>
              {subtitleField ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {String(row[subtitleField] ?? "")}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="pixel-border h-10"
                onClick={() => {
                  setEditing(row);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="destructive"
                className="pixel-border h-10"
                onClick={() => {
                  if (confirm("Delete this item?")) remove.mutate(row.id);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </PixelPanel>
        ))}
        {(rows ?? []).length === 0 ? (
          <p className="text-muted-foreground">Nothing here yet.</p>
        ) : null}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent className="pixel-border max-h-[85vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-pixel text-xs text-primary">
              {editing ? "EDIT" : "NEW"} {title.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit} key={editing?.id ?? "new"}>
            {fields.map((field) => {
              const value = editing?.[field.name];
              return (
                <div key={field.name}>
                  <Label className="text-pixel text-[10px]">{field.label.toUpperCase()}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      name={field.name}
                      rows={4}
                      defaultValue={value ? String(value) : ""}
                      className="pixel-inset mt-2 bg-input"
                    />
                  ) : field.type === "list" ? (
                    <Textarea
                      name={field.name}
                      rows={4}
                      defaultValue={Array.isArray(value) ? value.join("\n") : ""}
                      className="pixel-inset mt-2 bg-input"
                    />
                  ) : field.type === "boolean" ? (
                    <div className="mt-2">
                      <Switch name={field.name} defaultChecked={value !== false} />
                    </div>
                  ) : field.type === "select" ? (
                    <select
                      name={field.name}
                      defaultValue={value ? String(value) : ""}
                      className="pixel-inset mt-2 h-12 w-full bg-input px-3"
                    >
                      <option value="">— none —</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      name={field.name}
                      type={field.type === "number" ? "number" : "text"}
                      step={field.type === "number" ? "any" : undefined}
                      defaultValue={value !== null && value !== undefined ? String(value) : ""}
                      className="pixel-inset mt-2 h-12 bg-input"
                    />
                  )}
                  {field.help ? (
                    <p className="mt-1 text-sm text-muted-foreground">{field.help}</p>
                  ) : null}
                </div>
              );
            })}
            <Button
              disabled={save.isPending}
              className="pixel-border text-pixel h-12 w-full text-[10px]"
            >
              {save.isPending ? "SAVING..." : "SAVE"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
