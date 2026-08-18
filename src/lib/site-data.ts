import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SERVER_IP_FALLBACK = "play.loginsmp.fun";

export type Settings = Record<string, string>;

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<Settings> => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    const map: Settings = {};
    for (const row of data ?? []) map[row.key] = row.value ?? "";
    return map;
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const faqCategoriesQuery = queryOptions({
  queryKey: ["faq_categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("faq_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const rulesQuery = queryOptions({
  queryKey: ["rules"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("rules")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const teamQuery = queryOptions({
  queryKey: ["team_members"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});
