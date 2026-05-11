import Link from "next/link";
import Image from "next/image";
import { appearancePlaces, faqs, programs, repertoireGroups, site } from "./data";
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
          <span className="eyebrow">Live-Musik aus Ketzin</span>
          <h1>Karlson bringt das Havelland auf die Bühne.</h1>
          <p className="lead">
            Liedermacher, Singer-Songwriter und Alleinunterhalter für Stadtfeste,
            Hochzeiten, private Feiern, Kulturabende und Kinderprogramme in
            Brandenburg und Berlin.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/buchung">Auftritt anfragen</Link>
            <Link className="button secondary" href="/programme">Programme ansehen</Link>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="stats">
          <div className="stat"><strong>320</strong><span>Titel im Repertoire</span></div>
          <div className="stat"><strong>6h</strong><span>flexibel spielbar</span></div>
          <div className="stat"><strong>3</strong><span>Programme für Anlässe</span></div>
          <div className="stat"><strong>80 km</strong><span>rund um Ketzin</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Programme</span>
            <h2>Ein Musiker, viele Situationen.</h2>
          </div>
          <p>
            Karlson spielt nicht nach Schema F. Das Programm passt sich Publikum,
            Ort und Anlass an: nahbar, direkt und live.
          </p>
        </div>
        <div className="grid-3">
          {programs.map((program) => (
            <article className="card" key={program.title}>
              <h3>{program.title}</h3>
              <p>{program.text}</p>
              <p><strong>{program.details}</strong></p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-band">
        <div className="section media-band">
          <div>
            <span className="eyebrow">Repertoire</span>
            <h2>Von Havelland-Liedern bis Rockklassiker.</h2>
            <p className="muted">
              Eigene Songs über Orte, Menschen und Momente aus der Region treffen
              auf bekannte Titel aus Pop, Rock, Schlager, Volkslied und Oldies.
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
            <span className="eyebrow">Referenzen</span>
            <h2>Bekannt auf Festen in der Region.</h2>
          </div>
          <p>
            Die Auswahl wird vor Launch noch mit Karlson bestätigt. Sie dient jetzt
            als strukturierter Platz für lokale Suchmaschinen- und Veranstalterrelevanz.
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
            Für Buchungen klären wir Anlass, Ort, gewünschte Stimmung,
            Auftrittsdauer und technische Rahmenbedingungen.
          </p>
          <div className="actions">
            <Link className="button" href="/buchung">Buchung anfragen</Link>
            <Link className="button secondary" href="/veranstalter">Infos für Veranstalter</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
