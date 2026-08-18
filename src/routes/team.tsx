import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { teamQuery } from "@/lib/site-data";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Staff Team — Login SMP" },
      {
        name: "description",
        content:
          "Meet the owners, admins and moderators keeping Login SMP fair, stable and friendly.",
      },
      { property: "og:title", content: "Staff Team — Login SMP" },
      {
        property: "og:description",
        content: "The people behind Login SMP: owners, admins and moderators.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data: team } = useQuery(teamQuery);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <PixelHeading as="h1">OUR TEAM</PixelHeading>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        The crew running Login SMP day to day. Need help in game? Ping any of them in
        Discord.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(team ?? []).map((member) => (
          <PixelPanel key={member.id} className="text-center">
            <img
              src={
                member.avatar_url ||
                `https://mc-heads.net/avatar/${encodeURIComponent(member.name)}/128`
              }
              alt={`${member.name} Minecraft skin head`}
              className="mx-auto size-24 [image-rendering:pixelated]"
              loading="lazy"
            />
            <h2 className="text-pixel mt-4 text-xs text-foreground">{member.name}</h2>
            <p className="text-pixel mt-2 text-[10px] text-primary">
              {member.role.toUpperCase()}
            </p>
            {member.bio ? <p className="mt-3 text-muted-foreground">{member.bio}</p> : null}
            {member.discord_tag ? (
              <p className="mt-3 text-sm text-accent">{member.discord_tag}</p>
            ) : null}
          </PixelPanel>
        ))}
      </div>
    </div>
  );
}
