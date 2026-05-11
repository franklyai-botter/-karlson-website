export const metadata = {
  title: "AGB",
  robots: { index: false, follow: true },
};

export default function AgbPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Rechtliches</span>
          <h1>Auftrittsbedingungen</h1>
          <p>
            Arbeitsfassung. Die finalen Regelungen zu Honorar, Anzahlung,
            Stornierung, Wetter und Technik müssen mit Karlson abgestimmt werden.
          </p>
        </div>
      </section>
      <section className="section legal">
        <h2>1. Anfrage und Buchung</h2>
        <p>
          Eine Anfrage über die Website ist noch keine verbindliche Buchung. Ein
          Vertrag kommt erst durch ausdrückliche Bestätigung zustande.
        </p>
        <h2>2. Honorar und Zahlung</h2>
        <p>
          Honorar, Anzahlung, Fahrtkosten und Zahlungsziel werden je Veranstaltung
          individuell vereinbart.
        </p>
        <h2>3. Stornierung</h2>
        <p>
          Stornofristen und mögliche Ausfallhonorare werden nach Rückmeldung aus
          dem Kundenfragebogen ergänzt.
        </p>
        <h2>4. Open-Air und Wetter</h2>
        <p>
          Bei Veranstaltungen im Freien ist geeigneter Wetterschutz für Künstler,
          Instrumente und Technik erforderlich.
        </p>
        <h2>5. Technik</h2>
        <p>
          Der konkrete Technikbedarf richtet sich nach Ort, Publikum und
          Veranstaltungsgröße und wird vorab abgestimmt.
        </p>
      </section>
    </main>
  );
}
