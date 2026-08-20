// Strukturierte Daten (JSON-LD, schema.org).
//
// Warum: Suchmaschinen und KI-Assistenten lesen daraus Fakten sicher aus,
// statt sie aus dem Fliesstext zu raten. Fuer Karlson zaehlt vor allem das
// Event-Markup: Google kann Auftrittstermine als Rich Result mit Datum und
// Ort direkt im Suchergebnis anzeigen.
//
// Alle Werte kommen aus app/data.ts. Nichts hier doppelt pflegen — wer einen
// Termin ergaenzt, aktualisiert damit automatisch auch die Auszeichnung.
import {
  faqs,
  programs,
  repertoireGroups,
  site,
  siteUrl,
  socialLinks,
  upcomingEvents2026,
} from "./data";

const ARTIST_ID = `${siteUrl}/#karlson`;

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // "<" maskieren: verhindert, dass ein Zeichen im Inhalt das
      // script-Element vorzeitig beendet.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Karlson selbst und die Website. Gehoert ins Layout, gilt fuer jede Seite. */
export function ArtistJsonLd() {
  const artist = {
    "@type": "MusicGroup",
    "@id": ARTIST_ID,
    name: site.name,
    legalName: site.legalName,
    description: `${site.name} ist Liedermacher, Singer-Songwriter und One-Man-Band aus ${site.address.city}. Live-Musik für Stadt- und Dorffeste, Firmenfeiern, Empfänge, Hochzeiten, Kulturabende und Kinderprogramme.`,
    url: siteUrl,
    image: `${siteUrl}/karlson/hero.jpg`,
    logo: `${siteUrl}/karlson/logo.png`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.zip,
      addressLocality: site.address.city,
      addressCountry: "DE",
    },
    areaServed: ["Havelland", "Brandenburg", "Berlin"],
    genre: repertoireGroups,
    sameAs: socialLinks.map((link) => link.href),
    makesOffer: programs.map((program) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: program.title,
        description: program.text,
      },
    })),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: `${site.name} — ${site.claim}`,
    inLanguage: "de-DE",
    publisher: { "@id": ARTIST_ID },
  };

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [artist, website] }} />;
}

/**
 * Auftrittstermine.
 *
 * Bewusst nur **oeffentliche** Termine: private Feiern sollen gerade nicht
 * auffindbar sein, und ein Event, zu dem niemand kommen kann, gehoert nicht
 * in die Suche. Termine ohne Ortsangabe bleiben ebenfalls draussen — Google
 * verlangt fuer Event-Auszeichnungen einen Ort, und einen zu erfinden waere
 * falsch.
 */
export function EventsJsonLd() {
  const events = upcomingEvents2026
    .filter((event) => event.type === "public" && event.location !== "")
    .map((event) => ({
      "@type": "Event",
      name: `${event.title}, ${event.location} — ${site.name} live`,
      startDate: event.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description: `Live-Musik mit ${site.name}, ${site.claim}, bei ${event.title} in ${event.location}.`,
      image: `${siteUrl}/karlson/hero.jpg`,
      url: `${siteUrl}/termine/`,
      location: {
        "@type": "Place",
        name: event.location,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.location,
          addressRegion: "Brandenburg",
          addressCountry: "DE",
        },
      },
      performer: { "@id": ARTIST_ID },
    }));

  if (events.length === 0) {
    return null;
  }

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": events }} />;
}

/**
 * Haeufige Fragen von der Startseite.
 *
 * Google zeigt FAQ-Rich-Results seit 2023 nur noch fuer wenige Seitenarten an,
 * die Auszeichnung ist hier also kein Ranking-Trick. Sie bleibt trotzdem
 * sinnvoll: KI-Assistenten ziehen daraus belastbare Antworten auf Fragen wie
 * "Wo tritt Karlson auf" oder "Gibt es ein Kinderprogramm".
 */
export function FaqJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
