import Link from "next/link";
import { events2026 } from "../data";

export const metadata = {
  title: "Termine",
  description: "Aktuelle Termine 2026 und Auftritte von Karlson im Havelland, in Brandenburg und Berlin.",
};

const publicEvents = events2026.filter((event) => event.type === "public");
const privateEvents = events2026.filter((event) => event.type === "private");

function EventCard({ event }: { event: (typeof events2026)[number] }) {
  const locationText = event.location ? " in " + event.location : "";

  return (
    <li className="event-card">
      <time dateTime={event.date}>{event.displayDate}</time>
      <div>
        <h3>{event.title}</h3>
        {event.location ? <p>{event.location}</p> : <p>Ort folgt</p>}
      </div>
      <span>{event.type === "private" ? "Privat" : "Öffentlich"}</span>
      <meta itemProp="name" content={event.title + locationText} />
    </li>
  );
}

export default function TerminePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Termine</span>
          <h1>Aktuelle Termine 2026.</h1>
          <p>
            Die Liste wurde aus Karlsons aktueller Terminübersicht übernommen.
            Private Feiern sind aus Datenschutzgründen bewusst nur knapp mit Ort
            aufgeführt.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Öffentliche Auftritte</span>
            <h2>Karlson live erleben.</h2>
          </div>
          <p>
            Bitte Uhrzeiten, genaue Treffpunkte und mögliche Programmänderungen
            vor dem Besuch noch einmal beim jeweiligen Veranstalter prüfen.
          </p>
        </div>
        <ul className="event-list" aria-label="Öffentliche Termine 2026">
          {publicEvents.map((event) => <EventCard key={event.date} event={event} />)}
        </ul>
      </section>

      <section className="split-band">
        <div className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Geschlossene Veranstaltungen</span>
              <h2>Auch für private Feiern gebucht.</h2>
            </div>
            <p>
              Diese Einträge zeigen belegte Termine, ohne private Details zu
              veröffentlichen.
            </p>
          </div>
          <ul className="event-list event-list-compact" aria-label="Private Termine 2026">
            {privateEvents.map((event) => <EventCard key={event.date} event={event} />)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="notice card">
          <span className="eyebrow">Buchung</span>
          <h2>Wunschtermin anfragen.</h2>
          <p>
            Für private Feiern, Firmenveranstaltungen, Vereinsfeste oder kommunale
            Veranstaltungen kann Karlson direkt angefragt werden.
          </p>
          <Link className="button" href="/buchung">Auftritt anfragen</Link>
        </div>
      </section>
    </main>
  );
}
