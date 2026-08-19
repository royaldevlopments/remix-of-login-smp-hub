import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { rulesQuery } from "@/lib/site-data";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Server Rules — VAYU MC" },
      {
        name: "description",
        content:
          "The rules every VAYU MC player agrees to: no griefing, no cheating, keep chat friendly.",
      },
      { property: "og:title", content: "Server Rules — VAYU MC" },
      {
        property: "og:description",
        content: "Read the VAYU MC rules before you join play.vayumc.fun.",
      },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const { data: rules } = useQuery(rulesQuery);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <PixelHeading as="h1">SERVER RULES</PixelHeading>
      <p className="mt-4 text-muted-foreground">
        Joining the server means you agree to these. Breaking them can cost you your base
        or your account.
      </p>

      <div className="mt-10 space-y-5">
        {(rules ?? []).map((rule, index) => (
          <PixelPanel key={rule.id}>
            <h2 className="text-pixel text-xs text-primary">
              {String(index + 1).padStart(2, "0")}. {rule.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{rule.body}</p>
          </PixelPanel>
        ))}
      </div>
    </div>
  );
}
