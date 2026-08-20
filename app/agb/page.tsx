import { site } from "../data";

export const metadata = {
  title: "Auftrittsbedingungen",
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
            Diese Bedingungen gelten für Auftritte von {site.name} ({site.legalName}),
            sofern im Einzelfall keine abweichende schriftliche Vereinbarung
            getroffen wird.
          </p>
        </div>
      </section>
      <section className="section legal">
        <h2>1. Anfrage und Vertragsschluss</h2>
        <p>
          Eine Anfrage per E-Mail oder Telefon ist noch keine verbindliche
          Buchung. Ein Vertrag kommt erst mit der schriftlichen oder
          ausdrücklichen Bestätigung des Termins durch Karlson zustande.
        </p>

        <h2>2. Honorar und Zahlung</h2>
        <p>
          Die Höhe des Honorars richtet sich nach Programm, Auftrittsdauer,
          Anfahrt und Anlass und wird je Veranstaltung individuell vereinbart.
          Karlson ist Kleinunternehmer gemäß § 19 UStG; es wird keine
          Umsatzsteuer ausgewiesen.
        </p>
        <p>
          Eine Anzahlung ist grundsätzlich nicht erforderlich. Das Honorar ist
          – sofern nicht anders vereinbart – unmittelbar nach dem Auftritt in
          bar oder innerhalb von 7 Tagen per Überweisung zu zahlen.
        </p>

        <h2>3. Fahrtkosten</h2>
        <p>
          Innerhalb eines Umkreises von 10 km um Ketzin/Havel werden keine
          Fahrtkosten berechnet. Darüber hinausgehende Anfahrten werden
          pauschal in das Angebot aufgenommen.
        </p>

        <h2>4. Stornierung durch den Veranstalter</h2>
        <p>
          Bei Absagen durch den Veranstalter gilt folgende Staffel:
        </p>
        <ul>
          <li>bis 14 Tage vor dem Auftritt: kostenfrei,</li>
          <li>13 bis 8 Tage vor dem Auftritt: 50 % des vereinbarten Honorars,</li>
          <li>ab 7 Tage vor dem Auftritt: 100 % des vereinbarten Honorars.</li>
        </ul>
        <p>
          Bereits angefallene, nachweisbare Auslagen (z. B. bezahlte
          Übernachtung, Sondertechnik) sind zusätzlich zu erstatten.
        </p>

        <h2>5. Open-Air und Wetter</h2>
        <p>
          Bei Veranstaltungen im Freien sorgt der Veranstalter für einen
          ausreichenden, trockenen und sicheren Wetterschutz für Künstler,
          Instrumente und Technik. Wird der Auftritt wegen Wetter abgesagt
          oder ist eine sichere Durchführung nicht möglich, wird ein
          Ausfallhonorar in Höhe von 50 % des vereinbarten Honorars fällig.
        </p>

        <h2>6. Höhere Gewalt und Krankheit</h2>
        <p>
          Kann Karlson aus Gründen, die er nicht zu vertreten hat
          (z. B. Krankheit, höhere Gewalt), nicht auftreten, wird die
          Veranstaltung nach Möglichkeit verlegt. Schadenersatz­ansprüche sind
          in diesen Fällen ausgeschlossen, soweit kein Vorsatz oder grobe
          Fahrlässigkeit vorliegt.
        </p>

        <h2>7. Technik und Bühne</h2>
        <p>
          Karlson bringt eine kompakte Grundausstattung mit (Gitarre, Gesang,
          Mundharmonika, Fußpercussion, Kazoo, kleine PA). Der konkrete Technikbedarf
          – insbesondere Strom, Bühnenfläche und Wetterschutz – wird vor jeder
          Buchung abgestimmt. Der Veranstalter stellt einen funktionstüchtigen
          Stromanschluss bereit.
        </p>

        <h2>8. GEMA und Urheberrechte</h2>
        <p>
          Etwaige GEMA-Gebühren für die Veranstaltung trägt der Veranstalter.
          Die eigenen Lieder Karlsons sind nicht GEMA-pflichtig.
        </p>

        <h2>9. Bild- und Tonaufnahmen</h2>
        <p>
          Aufnahmen von Karlsons Auftritt zu privaten Zwecken sind erlaubt.
          Eine öffentliche Veröffentlichung von Bild- oder Tonaufnahmen
          (z. B. in sozialen Netzwerken) bedarf der vorherigen Abstimmung.
        </p>

        <h2>10. Haftung</h2>
        <p>
          Karlson haftet nur für Schäden, die auf Vorsatz oder grober
          Fahrlässigkeit beruhen. Im Übrigen ist die Haftung – soweit
          gesetzlich zulässig – auf die Höhe des vereinbarten Honorars
          begrenzt.
        </p>

        <h2>11. Schlussbestimmungen</h2>
        <p>
          Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam
          sein, bleibt die Wirksamkeit der übrigen Bedingungen unberührt.
        </p>
      </section>
    </main>
  );
}
