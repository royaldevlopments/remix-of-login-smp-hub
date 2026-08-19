import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/logo.png.asset.json";
import { settingsQuery, SERVER_IP_FALLBACK } from "@/lib/site-data";
import { ServerIp } from "./server-ip";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const ip = settings?.["server_ip"] || SERVER_IP_FALLBACK;
  const discord = settings?.["discord_invite"] || "#";

  return (
    <footer className="mt-20 border-t-4 border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="VAYU MC logo" className="size-16" />
            <span className="text-pixel text-sm text-primary">VAYU MC</span>
          </div>
          <p className="mt-4 max-w-sm text-muted-foreground">
            A survival multiplayer world built for long-term bases, fair play and a
            community that actually sticks around.
          </p>
          <div className="mt-5">
            <p className="text-pixel mb-2 text-[10px] text-muted-foreground">SERVER IP</p>
            <ServerIp ip={ip} />
          </div>
        </div>

        <div>
          <h3 className="text-pixel mb-4 text-xs text-accent">PAGES</h3>
          <ul className="space-y-2">
            <li><Link to="/store" className="hover:text-primary">Store</Link></li>
            <li><Link to="/team" className="hover:text-primary">Team</Link></li>
            <li><Link to="/rules" className="hover:text-primary">Rules</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-pixel mb-4 text-xs text-accent">COMMUNITY</h3>
          <ul className="space-y-2">
            <li>
              <a href={discord} target="_blank" rel="noreferrer" className="hover:text-primary">
                Discord
              </a>
            </li>
            <li><Link to="/login" className="hover:text-primary">Player login</Link></li>
            <li><Link to="/account" className="hover:text-primary">My orders</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t-4 border-border py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VAYU MC · {ip} · Not affiliated with Mojang or Microsoft.
      </div>
    </footer>
  );
}
