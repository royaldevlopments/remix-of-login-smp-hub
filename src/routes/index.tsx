import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Pickaxe, ShieldCheck, Users, Zap } from "lucide-react";
import heroBg from "@/assets/hero.jpg";
import logo from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { ServerIp } from "@/components/site/server-ip";
import { settingsQuery, productsQuery, SERVER_IP_FALLBACK } from "@/lib/site-data";
import nightBg from "@/assets/bg-night.jpg";
import caveBg from "@/assets/bg-cave.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login SMP — Minecraft Survival Server | play.loginsmp.fun" },
      {
        name: "description",
        content:
          "Join Login SMP at play.loginsmp.fun. Lag-free survival, fair play, an active Discord and a store with instant in-game delivery.",
      },
      { property: "og:title", content: "Login SMP — Minecraft Survival Server" },
      {
        property: "og:description",
        content:
          "Survival multiplayer at play.loginsmp.fun. Ranks, crate keys and coins delivered instantly.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    body: "Store purchases run straight on the server the moment your payment clears.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheat & Grief Protection",
    body: "Claims, rollbacks and an active staff team keep your base exactly how you left it.",
  },
  {
    icon: Users,
    title: "Real Community",
    body: "Events, markets and shared towns. Play solo or build with everyone else.",
  },
  {
    icon: Pickaxe,
    title: "Vanilla+ Survival",
    body: "Quality of life plugins only. No pay-to-win gear, no broken economy.",
  },
];

const steps = [
  { n: "01", title: "Open Minecraft", body: "Java 1.21 or Bedrock — both worlds are connected." },
  { n: "02", title: "Add the server", body: "Multiplayer → Add Server → paste play.loginsmp.fun." },
  { n: "03", title: "Start building", body: "No whitelist, no application. Claim land and go." },
];

function Home() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: products } = useQuery(productsQuery);
  const featured = (products ?? [])
    .filter((p) => p.is_active)
    .slice(0, 3) as Array<{
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    price: number;
  }>;
  const ip = settings?.["server_ip"] || SERVER_IP_FALLBACK;
  const discord = settings?.["discord_invite"] || "#";
  const members = settings?.["discord_members"] || "";

  const stats = [
    { value: "1.21", label: "Java + Bedrock" },
    { value: "24/7", label: "Uptime" },
    { value: members ? `${members}+` : "Active", label: "Discord members" },
    { value: "0", label: "Pay-to-win" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b-4 border-border">
        <img
          src={heroBg}
          alt="Blocky Minecraft village at sunset"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="pixel-border text-pixel inline-flex items-center gap-2 bg-card px-3 py-2 text-[10px] text-primary">
                <span className="pixel-pulse size-2 bg-primary" />
                SERVER ONLINE
              </span>
              <span className="text-pixel text-[10px] text-accent">JAVA + BEDROCK · 1.21</span>
            </div>
            <PixelHeading as="h1" className="mt-5">
              LOGIN SMP
            </PixelHeading>
            <p className="mt-5 max-w-lg text-xl text-muted-foreground">
              A survival world worth logging into. Build big, trade fair, and keep what you
              make — with staff who actually show up.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <ServerIp ip={ip} />
              <Button asChild className="pixel-border pixel-lift text-pixel h-12 text-[10px]">
                <Link to="/store">VISIT STORE</Link>
              </Button>
              <a
                href={discord}
                target="_blank"
                rel="noreferrer"
                className="pixel-border pixel-lift text-pixel inline-flex h-12 items-center bg-discord px-5 text-[10px] text-discord-foreground"
              >
                DISCORD
              </a>
            </div>
            <p className="mt-6 text-muted-foreground">
              No whitelist · No pay-to-win · Grief protected
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={logo.url}
              alt="Login SMP crossed swords and shield logo"
              className="pixel-float w-64 drop-shadow-[8px_8px_0_rgba(0,0,0,0.5)] md:w-80"
            />
          </div>
        </div>

      </section>

      <section aria-label="Server stats" className="border-b-4 border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-pixel text-sm text-primary md:text-base">{s.value}</p>
              <p className="mt-2 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section aria-label="Discord" className="py-12">
          <div className="pixel-border flex flex-col items-center gap-6 bg-discord p-8 text-discord-foreground md:flex-row">
            <MessageSquare className="size-14 shrink-0" />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-pixel text-sm md:text-base">JOIN OUR DISCORD</h2>
              <p className="mt-3 text-lg">
                Giveaways, event pings, support tickets and build showcases.
                {members ? ` ${members}+ members already inside.` : ""}
              </p>
            </div>
            <a
              href={discord}
              target="_blank"
              rel="noreferrer"
              className="pixel-border text-pixel bg-card px-6 py-4 text-[10px] text-accent"
            >
              JOIN NOW
            </a>
          </div>
        </section>

        <section className="pixel-border relative overflow-hidden py-6">
          <img
            src={nightBg}
            alt=""
            aria-hidden
            loading="lazy"
            width={1920}
            height={1080}
            className="absolute inset-0 size-full object-cover opacity-30"
          />
          <div className="relative p-6">
          <PixelHeading>HOW TO JOIN</PixelHeading>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <PixelPanel key={s.n} className="pixel-lift">
                <p className="text-pixel text-sm text-gold">{s.n}</p>
                <h3 className="text-pixel mt-4 text-xs text-foreground">{s.title}</h3>
                <p className="mt-3 text-muted-foreground">{s.body}</p>
              </PixelPanel>
            ))}
          </div>
          </div>
        </section>

        <section className="py-14">
          <PixelHeading>WHY LOGIN SMP</PixelHeading>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <PixelPanel key={f.title} className="pixel-lift flex gap-5">
                <span className="pixel-inset flex size-14 shrink-0 items-center justify-center bg-secondary">
                  <f.icon className="size-7 text-primary" />
                </span>
                <div>
                  <h3 className="text-pixel text-xs text-foreground md:text-sm">{f.title}</h3>
                  <p className="mt-3 text-muted-foreground">{f.body}</p>
                </div>
              </PixelPanel>
            ))}
          </div>
        </section>


        {featured.length > 0 && (
          <section className="py-8">
            <PixelHeading>FROM THE STORE</PixelHeading>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Ranks, keys and coins — delivered in game the moment your payment clears.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {featured.map((p) => (
                <div key={p.id} className="pixel-border pixel-lift flex flex-col bg-card">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-40 w-full border-b-4 border-border object-cover"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-pixel text-xs text-foreground">{p.name}</h3>
                      <p className="text-pixel text-sm text-gold">₹{p.price}</p>
                    </div>
                    {p.description ? (
                      <p className="mt-3 flex-1 text-muted-foreground">{p.description}</p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <Button asChild className="pixel-border text-pixel mt-6 h-12 w-full text-[10px]">
                      <Link to="/store">BUY NOW</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                variant="secondary"
                className="pixel-border text-pixel h-12 text-[10px]"
              >
                <Link to="/store">VIEW ALL PRODUCTS</Link>
              </Button>
            </div>
          </section>
        )}

        <section className="py-8">
          <PixelHeading>WHAT PLAYERS SAY</PixelHeading>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {quotes.map((q) => (
              <PixelPanel key={q.name} className="pixel-lift flex flex-col">
                <p className="text-pixel text-[10px] text-gold">{"★★★★★"}</p>
                <p className="mt-4 flex-1 text-muted-foreground">"{q.body}"</p>
                <p className="text-pixel mt-5 text-[10px] text-accent">{q.name}</p>
              </PixelPanel>
            ))}
          </div>
        </section>

        <section className="pixel-border relative my-12 overflow-hidden bg-card text-center">
          <img
            src={caveBg}
            alt=""
            aria-hidden
            loading="lazy"
            width={1920}
            height={1080}
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="relative p-10">
            <h2 className="text-pixel text-sm text-primary md:text-base">READY TO PLAY?</h2>
            <p className="mt-4 text-foreground">Add the IP and hop in — no whitelist.</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <ServerIp ip={ip} />
              <a
                href={discord}
                target="_blank"
                rel="noreferrer"
                className="pixel-border pixel-lift text-pixel inline-flex h-12 items-center bg-discord px-5 text-[10px] text-discord-foreground"
              >
                JOIN DISCORD
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
