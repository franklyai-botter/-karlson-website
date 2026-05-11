import { programs, site } from "../data";

export const metadata = {
  title: "Buchung",
  description: "Karlson für Hochzeit, Stadtfest, Geburtstag, Firmenfeier, Kinderfest oder Kulturabend anfragen.",
};

export default function BuchungPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Buchung</span>
          <h1>Auftritt anfragen.</h1>
          <p>
            Das Formular ist als Frontend vorbereitet. Der echte Mailversand wird
            nach Entscheidung über Vercel Function, Resend oder eine EU-Alternative
            angeschlossen.
          </p>
        </div>
      </section>
      <section className="section grid-2">
        <form className="form-panel" action={`mailto:${site.email}`} method="post" encType="text/plain">
          <div className="form-grid">
            <label>
              Name *
              <input name="Name" required autoComplete="name" />
            </label>
            <label>
              E-Mail *
              <input name="E-Mail" required type="email" autoComplete="email" />
            </label>
            <label>
              Telefon
              <input name="Telefon" autoComplete="tel" />
            </label>
            <label>
              Datum der Veranstaltung *
              <input name="Datum" required type="date" />
            </label>
            <label>
              Veranstaltungsort *
              <input name="Ort" required />
            </label>
            <label>
              Veranstaltungsart *
              <select name="Veranstaltungsart" required>
                <option value="">Bitte wählen</option>
                <option>Hochzeit</option>
                <option>Stadtfest</option>
                <option>Geburtstag</option>
                <option>Firmenfeier</option>
                <option>Kinderfest</option>
                <option>Sonstiges</option>
              </select>
            </label>
            <label>
              Programmwunsch
              <select name="Programmwunsch">
                <option value="">Noch offen</option>
                {programs.map((program) => <option key={program.title}>{program.title}</option>)}
              </select>
            </label>
            <label>
              Erwartete Gästezahl
              <input name="Gaestezahl" inputMode="numeric" />
            </label>
            <label>
              Gewünschte Auftrittsdauer
              <input name="Dauer" placeholder="z. B. 2 Stunden" />
            </label>
            <label>
              Nachricht *
              <textarea name="Nachricht" required />
            </label>
            <label className="muted">
              <input name="Datenschutzhinweis" type="checkbox" required />
              Ich habe die Datenschutzhinweise gelesen.
            </label>
            <button className="button" type="submit">Anfrage vorbereiten</button>
          </div>
        </form>
        <aside className="card">
          <h2>Direktkontakt</h2>
          <p>
            E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p className="muted">
            Telefonnummer, finale E-Mail-Adresse und Impressumsdaten werden aus dem
            ausgefüllten Fragebogen übernommen.
          </p>
          <h3>Für gute Angebote wichtig</h3>
          <ul>
            <li>Datum und Uhrzeit</li>
            <li>Ort und Anlass</li>
            <li>Drinnen oder Open-Air</li>
            <li>Gewünschte Dauer</li>
            <li>Programmwunsch</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
