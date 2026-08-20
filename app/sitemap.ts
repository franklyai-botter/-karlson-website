import type { MetadataRoute } from "next";
import { siteUrl } from "./data";

export const dynamic = "force-static";

// Oeffentliche Routen. /entwurf-2 fehlt hier absichtlich: interne Variante.
const routes = [
  { path: "/", priority: 1 },
  { path: "/programme/", priority: 0.9 },
  { path: "/buchung/", priority: 0.9 },
  { path: "/termine/", priority: 0.8 },
  { path: "/repertoire/", priority: 0.7 },
  { path: "/ueber-karlson/", priority: 0.7 },
  { path: "/eindruecke/", priority: 0.7 },
  { path: "/veranstalter/", priority: 0.7 },
  { path: "/impressum/", priority: 0.3 },
  { path: "/datenschutz/", priority: 0.3 },
  { path: "/agb/", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.path === "/termine/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}
