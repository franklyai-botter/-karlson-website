import { site } from "../data";

export const metadata = {
  title: "Datenschutz",
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Rechtliches</span>
          <h1>Datenschutzerklärung</h1>
          <p>
            Arbeitsfassung für die Website. Die finale Version muss nach Tool-,
            Hosting- und Formularentscheidung geprüft werden.
          </p>
        </div>
      </section>
      <section className="section legal">
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich ist {site.legalName}, Anschrift und Kontaktdaten werden
          vor Veröffentlichung ergänzt.
        </p>
        <h2>2. Hosting</h2>
        <p>
          Die Website ist für ein Deployment über Vercel vorgesehen. Beim Aufruf
          der Website können technisch notwendige Zugriffsdaten verarbeitet werden,
          damit die Seite sicher und stabil ausgeliefert werden kann.
        </p>
        <h2>3. Kontaktaufnahme und Buchungsanfragen</h2>
        <p>
          Wenn Besucher per E-Mail oder Formular Kontakt aufnehmen, werden die
          übermittelten Angaben zur Bearbeitung der Anfrage verarbeitet. Die
          Rechtsgrundlage ist regelmäßig Art. 6 Abs. 1 lit. b DSGVO, soweit es um
          vorvertragliche Maßnahmen oder eine Buchung geht.
        </p>
        <h2>4. Cookies und TDDDG</h2>
        <p>
          Die Seite ist so geplant, dass beim Erstladen keine nicht notwendigen
          Cookies, Tracking-Pixel oder externen Medien gesetzt werden. Externe
          Videos werden nur verlinkt oder per 2-Klick-Lösung geladen.
        </p>
        <h2>5. Webanalyse</h2>
        <p>
          Aktuell ist keine Webanalyse vorgesehen. Falls später Analytics genutzt
          wird, wird die Datenschutzerklärung angepasst und, falls erforderlich,
          eine Einwilligung eingeholt.
        </p>
        <h2>6. Betroffenenrechte</h2>
        <p>
          Betroffene Personen haben nach Maßgabe der DSGVO Rechte auf Auskunft,
          Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch
          und Beschwerde bei einer Datenschutzaufsichtsbehörde.
        </p>
      </section>
    </main>
  );
}
