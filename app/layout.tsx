import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { navItems, site, siteUrl, socialLinks } from "./data";
import { ArtistJsonLd } from "./structured-data";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Relativer Canonical: Next setzt daraus je Route die eigene Adresse.
  // Noetig, weil die Seite zusaetzlich unter der workers.dev-Adresse
  // erreichbar ist — ohne Canonical kann Google zwei Fassungen derselben
  // Seite sehen.
  alternates: { canonical: "./" },
  title: {
    default: "Karlson | Liedermacher aus dem Havelland",
    template: "%s | Karlson",
  },
  description:
    "Karlson ist Liedermacher, Singer-Songwriter und One-Man-Band aus Ketzin im Havelland. Live-Musik für Stadt- und Dorffeste, Firmenfeiern, Empfänge, Hochzeiten, Kulturabende und Kinderprogramme.",
  keywords: [
    "Liedermacher Havelland",
    "Alleinunterhalter Brandenburg",
    "One-Man-Band Ketzin",
    "Musiker Ketzin",
    "Stadtfest Musiker Brandenburg",
    "Firmenfeier Musiker Brandenburg",
    "Kinderlieder Brandenburg",
  ],
  openGraph: {
    title: "Karlson | One-Man-Band aus dem Havelland",
    description:
      "Live-Musik aus Ketzin: Liedermacher, One-Man-Band und Kinderprogramm für Brandenburg und Berlin.",
    type: "website",
    locale: "de_DE",
    images: [{ url: "/karlson/hero.jpg", width: 1090, height: 1599, alt: site.claim }],
  },
};

function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Karlson Startseite">
        <Image src="/karlson/logo.png" alt="" width={42} height={42} />
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

      <div className="header-social" aria-label="Social Media">
        {socialLinks.map((item) => (
          <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
          </a>
        ))}
      </div>

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
          {socialLinks.map((item) => (
            <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
            </a>
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
        <Image src="/karlson/logo.png" alt="" width={54} height={54} />
        <p>
          {site.name} ist Liedermacher, Singer-Songwriter und One-Man-Band
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
      <nav aria-label="Social Media">
        {socialLinks.map((item) => (
          <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label} <span>{item.handle}</span>
          </a>
        ))}
      </nav>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={cormorant.variable}>
      <body>
        <ArtistJsonLd />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
