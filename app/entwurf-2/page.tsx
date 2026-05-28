import Image from "next/image";
import Link from "next/link";
import { appearancePlaces, programs, repertoireGroups, site, socialLinks, upcomingEvents2026 } from "../data";
import { galleryImages } from "../gallery";

export const metadata = {
  title: "Entwurf 2",
  description: "Referenznaher Entwurf fuer Karlsons Website mit Remise-Hintergrund, Vorstellung, Galerie und Infobereich.",
};

const nav = [
  ["Home", "#home"],
  ["Vorstellung", "#vorstellung"],
  ["Termine", "#termine"],
  ["Galerie", "#galerie"],
  ["Referenzen", "#referenzen"],
  ["Kontakt", "#kontakt"],
  ["Infobereich", "#infobereich"],
];

export default function EntwurfZweiPage() {
  return (
    <main className="v2-page" id="home">
      <Image
        className="v2-background"
        src="/karlson/remise-setup.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <div className="v2-shell">
        <nav className="v2-nav" aria-label="Entwurf 2 Navigation">
          {nav.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>

        <header className="v2-header">
          <Image src="/karlson/logo.jpg" alt="Karlson Logo" width={118} height={118} />
          <div>
            <p className="v2-kicker">One-Man-Band aus dem Havelland</p>
            <h1>Karlson</h1>
            <p>Frank Haupt-Tschachtschal</p>
            <div className="v2-social" aria-label="Karlson online">
              {socialLinks.map((item) => (
                <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}: {item.handle}
                </a>
              ))}
            </div>
          </div>
        </header>

        <section className="v2-hero">
          <Image
            src="/karlson/hero.jpg"
            alt="Karlson mit Gitarre"
            width={1090}
            height={1599}
            priority
          />
        </section>

        <section className="v2-section" id="vorstellung">
          <h2>Vorstellung</h2>
          <p>
            Karlson ist Liedermacher, Singer-Songwriter, Alleinunterhalter und
            auf Wunsch auch ein Ein-Mann-Blasorchester aus Ketzin im Havelland.
            Er spielt dort, wo Menschen gute Live-Musik, ehrliche Unterhaltung und
            einen Abend mit eigener Handschrift suchen.
          </p>
          <p>
            Sein Programm reicht von eigenen Havelland-Liedern bis zu bekannten
            Titeln aus Singer-Songwriter, Deutschpop, Rock, Oldies, Schlager,
            Stimmungsmusik und Volksliedern. Mit rund 320 Titeln kann Karlson
            spontan auf Publikum, Ort und Stimmung reagieren.
          </p>
        </section>

        <section className="v2-section v2-programs">
          <h2>Programme</h2>
          <div className="v2-card-grid">
            {programs.map((program) => (
              <article key={program.title}>
                <h3>{program.title}</h3>
                <p>{program.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="v2-section" id="termine">
          <h2>Kommende Termine 2026</h2>
          <ul className="v2-events">
            {upcomingEvents2026.map((event) => (
              <li key={event.date}>
                <time dateTime={event.date}>{event.displayDate}</time>
                <span>{event.title}{event.location ? " in " + event.location : ""}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="v2-section" id="galerie">
          <h2>Galerie</h2>
          <div className="v2-gallery">
            {galleryImages.map((image, index) => (
              <Image
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={900}
                height={1125}
                loading={index < 8 ? "eager" : "lazy"}
              />
            ))}
          </div>
        </section>

        <section className="v2-section" id="referenzen">
          <h2>Referenzen</h2>
          <ul className="v2-columns">
            {appearancePlaces.map((place) => <li key={place}>{place}</li>)}
          </ul>
        </section>

        <section className="v2-section" id="infobereich">
          <h2>Infobereich</h2>
          <p>
            Hier finden Veranstalter die wichtigsten Informationen fuer ihre
            Planung: Technik, Pressetext, Bilder, Logo und Kontakt. Die Downloads
            werden erst freigegeben, wenn Foto- und Logo-Rechte schriftlich
            geklaert sind.
          </p>
          <div className="v2-info-grid">
            <div><strong>Technik</strong><span>Strom, trockener Platz, Wetterschutz bei Open-Air.</span></div>
            <div><strong>Pressetext</strong><span>Kurzvita und Beschreibung fuer Ankuendigungen.</span></div>
            <div><strong>Pressebilder</strong><span>Alle Bilder nach Rechtepruefung.</span></div>
            <div><strong>Repertoire</strong><span>320 Titel, flexibel nach Anlass und Publikum.</span></div>
          </div>
        </section>

        <section className="v2-section" id="kontakt">
          <h2>Kontakt</h2>
          <p>
            Fuer Buchungen bitte Anlass, Datum, Ort, gewuenschte Dauer und
            Programmwunsch angeben.
          </p>
          <div className="v2-actions">
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={"mailto:" + site.email}>{site.email}</a>
            <Link href="/buchung">Mehr zur Buchung</Link>
          </div>
          <div className="v2-social v2-social-contact" aria-label="Social Media">
            {socialLinks.map((item) => (
              <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}: {item.handle}
              </a>
            ))}
          </div>
        </section>

        <section className="v2-section v2-repertoire">
          <h2>Musikalische Richtung</h2>
          <div>
            {repertoireGroups.map((group) => <span key={group}>{group}</span>)}
          </div>
        </section>
      </div>
    </main>
  );
}
