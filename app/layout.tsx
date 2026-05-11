import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { navItems, site } from "./data";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://karlson-musik.de"),
  title: {
    default: "Karlson | Liedermacher aus dem Havelland",
    template: "%s | Karlson",
  },
  description:
    "Karlson ist Liedermacher, Singer-Songwriter und Alleinunterhalter aus Ketzin im Havelland. Live-Musik für Feiern, Stadtfeste, Kulturabende und Kinderprogramme.",
  keywords: [
    "Liedermacher Havelland",
    "Alleinunterhalter Brandenburg",
    "Musiker Ketzin",
    "Hochzeitssänger Brandenburg",
    "Kinderlieder Brandenburg",
  ],
  openGraph: {
    title: "Karlson | Liedermacher aus dem Havelland",
    description:
      "Live-Musik aus Ketzin: Liedermacher, Alleinunterhalter und Kinderprogramm für Brandenburg und Berlin.",
    type: "website",
    locale: "de_DE",
    images: [{ url: "/karlson/hero.jpg", width: 1090, height: 1599, alt: site.claim }],
  },
};

function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Karlson Startseite">
        <Image src="/karlson/logo.jpg" alt="" width={42} height={42} />
        <span>
          <strong>{site.name}</strong>
          <small>{site.claim}</small>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Hauptnavigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="header-cta" href="/buchung">
        Auftritt anfragen
      </Link>

      <details className="mobile-menu">
        <summary aria-label="Navigation öffnen">Menü</summary>
        <div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/buchung">Auftritt anfragen</Link>
        </div>
      </details>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Image src="/karlson/logo.jpg" alt="" width={54} height={54} />
        <p>
          {site.name} ist Liedermacher, Singer-Songwriter und Alleinunterhalter
          aus Ketzin im Havelland.
        </p>
      </div>
      <nav aria-label="Fußnavigation">
        <Link href="/programme">Programme</Link>
        <Link href="/repertoire">Repertoire</Link>
        <Link href="/veranstalter">Für Veranstalter</Link>
        <Link href="/buchung">Buchung</Link>
      </nav>
      <nav aria-label="Rechtliches">
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <Link href="/agb">AGB</Link>
      </nav>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
