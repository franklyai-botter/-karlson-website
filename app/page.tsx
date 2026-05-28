import Link from "next/link";
import Image from "next/image";
import {
  appearancePlaces,
  faqs,
  highlightAppearances,
  programs,
  repertoireGroups,
  site,
  socialLinks,
  upcomingEvents2026,
} from "./data";
import { galleryImages } from "./gallery";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Image
          className="hero-background"
          src="/karlson/remise-setup.jpg"
          alt="Remise mit Bühne und Karlsons Auftrittssetup"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-main-image" aria-hidden="true">
          <Image src="/karlson/hero.jpg" alt="" fill priority sizes="(max-width: 960px) 72vw, 34vw" />
        </div>
        <div className="hero-content">
          <Image
            className="hero-logo"
            src="/karlson/logo.jpg"
            alt="Karlson Logo"
            width={128}
            height={128}
            priority
          />
          <span className="eyebrow">Live-Musik aus Ketzin · Brandenburg · Berlin</span>
          <h1>Karlson – One-Man-Band aus dem Havelland.</h1>
          <p className="lead">
            Gitarre, Mundharmonika, Fußpercussion und Gesang – alles
            gleichzeitig. Ein Musiker, der klingt wie eine kleine Band: für
            Stadt- und Dorffeste, Firmenfeiern, Empfänge, Hochzeiten,
            Kulturabende und Kinderprogramme.
          </p>
          <div className="social-links hero-social" aria-label="Karlson online">
            {socialLinks.map((item) => (
              <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                <strong>{item.label}</strong>
                <span>{item.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="stats">
          <div className="stat"><strong>4</strong><span>Programme für jeden Anlass</span></div>
          <div className="stat"><strong>320</strong><span>Titel im Repertoire</span></div>
          <div className="stat"><strong>flexibel</strong><span>Auftrittsdauer je nach Wunsch</span></div>
          <div className="stat"><strong>10 km</strong><span>um Ketzin ohne Aufschlag</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Programme</span>
            <h2>Ein Musiker, viele Anlässe.</h2>
          </div>
          <p>
            Karlson spielt nicht nach Schema F. Das Programm passt sich
            Publikum, Ort und Anlass an: nahbar, direkt und live.
          </p>
        </div>
        <div className="grid-2">
          {programs.map((program) => (
            <article className="card" key={program.title}>
              <h3>{program.title}</h3>
              <p>{program.text}</p>
              <p><strong>{program.details}</strong></p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Bekannte Bühnen</span>
            <h2>Wo Karlson schon gespielt hat.</h2>
          </div>
          <p>
            Drei Auftritte stehen exemplarisch für die Bandbreite – vom
            Traditionsfest im Havelland bis zur internationalen Messe in Berlin.
          </p>
        </div>
        <div className="grid-3">
          {highlightAppearances.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section home-events">
        <div className="section-head">
          <div>
            <span className="eyebrow">Kommende Termine 2026</span>
            <h2>Die nächsten Auftritte auf einen Blick.</h2>
          </div>
          <p>
            Vergangene Termine sind ausgeblendet. Die vollständige Übersicht
            zeigt öffentliche Auftritte und bereits belegte private Veranstaltungen.
          </p>
        </div>
        <div className="event-preview">
          {upcomingEvents2026.slice(0, 6).map((event) => (
            <Link className="event-preview-item" href="/termine" key={event.date}>
              <time dateTime={event.date}>{event.displayDate}</time>
              <span>{event.title}{event.location ? " in " + event.location : ""}</span>
            </Link>
          ))}
        </div>
        <Link className="text-link" href="/termine">Alle Termine ansehen</Link>
      </section>

      <section className="split-band">
        <div className="section media-band">
          <div>
            <span className="eyebrow">Repertoire</span>
            <h2>Von Havelland-Liedern bis Rockklassiker.</h2>
            <p className="muted">
              Rund 30 eigene Lieder über Orte, Menschen und Momente aus der
              Region treffen auf bekannte Titel aus Pop, Rock, Schlager,
              Volkslied und Oldies. Insgesamt vier bis sechs Stunden Live-Musik
              ohne Wiederholung.
            </p>
            <div className="tag-list">
              {repertoireGroups.map((group) => <span key={group}>{group}</span>)}
            </div>
          </div>
          <Image src="/karlson/remise-setup.jpg" alt="Karlsons Auftrittssetup mit Gitarre und Technik" width={1600} height={1200} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Auftrittsorte</span>
            <h2>Bekannt auf Festen und Bühnen der Region.</h2>
          </div>
          <p>
            Eine Auswahl aus dem Havelland, Brandenburg und Berlin – für
            Gemeinden, Vereine, Veranstalter und private Buchungen.
          </p>
        </div>
        <ul className="place-list">
          {appearancePlaces.map((place) => <li key={place}>{place}</li>)}
        </ul>
      </section>

      <section className="split-band">
        <div className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Eindrücke</span>
              <h2>Handgemacht statt glattgebügelt.</h2>
            </div>
            <p>
              Die Website wird über echte Bilder getragen: Karlson, Gitarre,
              Havelland, Bühne und Live-Atmosphäre.
            </p>
          </div>
          <div className="gallery-grid">
            {galleryImages.slice(0, 12).map((image) => (
              <Image src={image.src} alt={image.alt} width={900} height={1125} key={image.src} />
            ))}
          </div>
        </div>
      </section>

      <section className="section faq">
        <div className="section-head">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Schnelle Antworten für Buchende.</h2>
          </div>
          <p>
            Diese Fragen helfen Besuchern und Suchmaschinen, Karlson klar
            einzuordnen.
          </p>
        </div>
        {faqs.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="section">
        <div className="notice card">
          <span className="eyebrow">{site.area}</span>
          <h2>Ein Auftritt soll passen, nicht nur stattfinden.</h2>
          <p>
            Anfragen kommen am liebsten direkt per Telefon oder E-Mail – so
            kann Karlson gleich konkret antworten.
          </p>
          <div className="actions">
            <a className="button" href={site.phoneHref}>{site.phone}</a>
            <a className="button secondary" href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div className="actions">
            <Link className="button secondary" href="/buchung">Mehr zur Buchung</Link>
            <Link className="button secondary" href="/veranstalter">Infos für Veranstalter</Link>
          </div>
          <div className="social-links">
            {socialLinks.map((item) => (
              <a className={`social-button social-${item.label.toLowerCase()}`} key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                <strong>{item.label}</strong>
                <span>{item.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
