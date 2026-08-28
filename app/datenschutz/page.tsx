import { site } from "../data";

export const metadata = {
  title: "Datenschutz",
  robots: { index: false, follow: true },
};

// Muss an dieselbe Variable haengen wie das Formular auf /buchung/, sonst
// beschreibt die Erklaerung einen anderen Zustand als die Website tatsaechlich
// hat — und zwar in beide Richtungen falsch.
const formularAktiv = process.env.NEXT_PUBLIC_FORMULAR_AKTIV === "1";

export default function DatenschutzPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Rechtliches</span>
          <h1>Datenschutzerklärung</h1>
          <p>
            Diese Website ist bewusst datensparsam aufgebaut. Beim Aufruf werden
            keine Tracking-Cookies, kein Analytics und keine externen Medien
            ungefragt nachgeladen.
          </p>
        </div>
      </section>
      <section className="section legal">
        <h2>1. Verantwortlicher</h2>
        <p>
          {site.legalName} (Künstlername: {site.name})<br />
          {site.address.street}, {site.address.zip} {site.address.city}<br />
          Telefon: <a href={site.phoneHref}>{site.phone}</a><br />
          E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>

        <h2>2. Hosting (Cloudflare)</h2>
        <p>
          Diese Website wird von Cloudflare, Inc., 101 Townsend St., San
          Francisco, CA 94107, USA ausgeliefert. Die Seiten sind statisch
          vorgebaut; es gibt keine Datenbank und keine serverseitige
          Anwendungs­logik. Beim Aufruf werden technisch notwendige Daten
          verarbeitet (insbesondere IP-Adresse, Datum und Uhrzeit der Anfrage,
          angeforderte Datei, Browsertyp und Referrer), damit die Seite
          ausgeliefert und gegen Angriffe geschützt werden kann.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse an einer funktions­fähigen und sicheren Website).
        </p>
        <p>
          Cloudflare betreibt ein weltweites Netz von Rechenzentren und liefert
          Inhalte vom jeweils nächstgelegenen Standort aus. Dabei können Daten
          in Drittländer, insbesondere in die USA, übertragen werden. Cloudflare
          ist nach dem EU-US Data Privacy Framework zertifiziert und stützt
          Übermittlungen zusätzlich auf Standard­vertrags­klauseln. Die
          Verarbeitung erfolgt auf Grundlage eines Auftrags­verarbeitungs­vertrags
          nach Art. 28 DSGVO, den Cloudflare als Bestandteil seiner
          Nutzungs­bedingungen bereitstellt. Weitere Informationen:{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            cloudflare.com/privacypolicy
          </a>
          .
        </p>

        <h2>3. Kontaktaufnahme</h2>
        <p>
          {formularAktiv
            ? "Wenn Besucherinnen oder Besucher per Anfrageformular, E-Mail oder Telefon Kontakt aufnehmen, werden die dabei übermittelten Angaben ausschließlich zur Bearbeitung der Anfrage und für mögliche Anschlussfragen verwendet."
            : "Es gibt auf dieser Website kein Kontaktformular. Wenn Besucherinnen oder Besucher per E-Mail oder Telefon Kontakt aufnehmen, werden die dabei übermittelten Angaben ausschließlich zur Bearbeitung der Anfrage und für mögliche Anschlussfragen verwendet."}{" "}
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
          Maßnahmen bzw. Vertrags­abwicklung) bzw. Art. 6 Abs. 1 lit. f DSGVO
          (effiziente Bearbeitung).
        </p>
        <p>
          Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr
          erforderlich sind, soweit keine gesetzlichen Aufbewahrungs­pflichten
          entgegenstehen.
        </p>

        {formularAktiv ? (
          <>
            <h3>Anfrageformular auf der Seite „Kontakt &amp; Buchung“</h3>
            <p>
              Über das Formular werden Name, E-Mail-Adresse und die Angaben zur
              geplanten Veranstaltung übermittelt – Datum, Ort, Anlass sowie
              optional Telefonnummer, Wunschprogramm, Dauer, Gästezahl, ob
              drinnen oder Open-Air, und eine freie Nachricht. Pflichtangaben
              sind im Formular mit einem Sternchen gekennzeichnet; ohne sie ist
              keine Bearbeitung möglich.
            </p>
            <p>
              Die Angaben werden <strong>nicht auf dieser Website gespeichert</strong> und
              nicht in einer Datenbank abgelegt. Sie werden ausschließlich als
              E-Mail an das Postfach des Verantwortlichen weitergeleitet und
              dort im Rahmen der Anfragebearbeitung aufbewahrt.
            </p>
            {/*
              Anbieterangaben bewusst ohne Hausanschrift: die konkrete
              Vertragspartei und ihre Adresse stehen im DPA und gehoeren von
              dort uebernommen, nicht aus zweiter Hand.

              Stand 21.08.2026, im Konto geprueft: Mailjet bietet KEINE Auswahl
              der Verarbeitungsregion an — weder unter Account Information noch
              in den Account settings gibt es Region, Data residency oder Data
              location. Das Sinch-DPA enthaelt dazu ebenfalls nichts und sagt
              stattdessen: "Sinch may transfer personal data within its company
              group. These transfers are necessary to provide the Services
              globally."

              Deshalb steht hier KEINE Behauptung mehr, das Konto verarbeite in
              der EU. Diverse Vergleichsseiten schreiben das, es sind aber
              Sekundaerquellen. Falls Mailjet/Sinch je eine verbindliche
              schriftliche Auskunft gibt (privacy@mailjet.com, dpo@sinch.com),
              kann der Absatz praeziser werden — vorher nicht.
            */}
            <p>
              Für den Versand dieser E-Mail wird der Dienst{" "}
              <strong>Mailjet</strong> als Auftragsverarbeiter nach Art. 28 DSGVO
              eingesetzt. Mailjet ist ein Dienst der Sinch-Gruppe mit Sitz in
              Paris und erhält die im Formular gemachten Angaben, um sie als
              E-Mail zuzustellen. Grundlage ist ein
              Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.
            </p>
            <p>
              Zur Sinch-Gruppe gehören auch Gesellschaften außerhalb der
              Europäischen Union, unter anderem in den USA. Die Verarbeitung
              kann daher auch außerhalb der Europäischen Union erfolgen. Soweit
              eine Übermittlung in ein Drittland stattfindet, stützt sie sich
              auf die Standardvertragsklauseln der EU-Kommission bzw. eine
              Zertifizierung nach dem EU-US Data Privacy Framework.
            </p>
            <p>
              Die Anfrage wird anschließend im E-Mail-Postfach des
              Verantwortlichen bearbeitet. Solange dafür die im Impressum
              genannte Adresse bei einem Freemail-Anbieter genutzt wird,
              verarbeitet auch dieser Anbieter die Nachricht als Betreiber des
              Postfachs.
            </p>
            <p>
              Zum Schutz vor automatisierten Massenanfragen wird{" "}
              <strong>Cloudflare Turnstile</strong> eingesetzt. Turnstile prüft ohne
              Rätsel und ohne Cookies, ob die Anfrage von einem Menschen stammt;
              dabei werden technische Merkmale des Aufrufs und die IP-Adresse an
              Cloudflare übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
              DSGVO – das berechtigte Interesse, den Posteingang und den Betrieb
              der Website vor Missbrauch zu schützen. Turnstile wird nur auf der
              Seite „Kontakt &amp; Buchung“ geladen, nicht auf den übrigen Seiten.
            </p>
          </>
        ) : null}

        <h2>4. Cookies und TDDDG</h2>
        <p>
          Beim Erstaufruf dieser Website werden keine nicht notwendigen
          Cookies, keine Tracking-Pixel und keine externen Medien geladen. Die
          Videos auf der Seite „Eindrücke“ zeigen zunächst nur ein Vorschaubild,
          das von diesem Server stammt; das Video selbst wird erst nach einem
          ausdrücklichen Klick von YouTube nachgeladen (siehe Abschnitt 6).
          Verlinkungen zu Facebook sind reine Textlinks.
          {formularAktiv
            ? " Auf der Seite „Kontakt & Buchung“ wird zusätzlich Cloudflare Turnstile geladen (siehe Abschnitt 3); Turnstile setzt nach Angaben von Cloudflare keine Cookies zu Werbe- oder Trackingzwecken."
            : ""}
        </p>

        <h2>5. Webanalyse</h2>
        <p>
          Es wird derzeit keine Webanalyse eingesetzt. Sollte sich daran etwas
          ändern, wird diese Datenschutz­erklärung angepasst und – wo
          erforderlich – eine Einwilligung eingeholt.
        </p>

        <h2>6. Videos von YouTube und externe Links</h2>
        <p>
          Auf der Seite „Eindrücke“ sind Videos eingebunden, die bei YouTube
          liegen (Anbieter: Google Ireland Limited, Gordon House, Barrow Street,
          Dublin 4, Irland; Mutterunternehmen Google LLC, USA). Die Einbindung
          erfolgt in zwei Schritten: Zunächst ist nur ein Vorschaubild zu sehen,
          das auf diesem Server gespeichert ist. Solange nicht auf das Video
          geklickt wird, besteht <strong>keine</strong> Verbindung zu Google.
        </p>
        <p>
          Erst mit dem Klick auf das Vorschaubild wird das Video vom Dienst
          <em> youtube-nocookie.com</em> geladen. Dabei erhält Google die
          IP-Adresse, Angaben zum verwendeten Browser und Gerät sowie die
          Information, welche Seite aufgerufen wurde, und kann Cookies oder
          vergleichbare Technologien auf dem Endgerät speichern. Wer währenddessen
          bei YouTube angemeldet ist, ermöglicht Google, die Wiedergabe dem
          eigenen Nutzerkonto zuzuordnen. Auf Umfang und Zweck dieser
          Verarbeitung besteht kein Einfluss.
        </p>
        <p>
          Rechtsgrundlage für das Laden des Videos und für die Speicherung von
          Informationen auf dem Endgerät ist die durch den Klick erteilte
          Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Die
          Einwilligung kann jederzeit für die Zukunft widerrufen werden, indem
          das Video nicht gestartet wird. Eine Übermittlung in die USA ist dabei
          nicht ausgeschlossen; Google LLC ist nach dem EU-US Data Privacy
          Framework zertifiziert. Einzelheiten zur Verarbeitung durch Google:{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            policies.google.com/privacy
          </a>
          .
        </p>
        <p>
          Verlinkungen auf Facebook (Meta Platforms Ireland Ltd.) und auf
          Karlsons YouTube-Kanal sind reine Textlinks. Inhalte dieser Anbieter
          werden erst geladen, wenn der Link ausdrücklich angeklickt wird.
        </p>

        <h2>7. Betroffenenrechte</h2>
        <p>
          Sie haben nach Maßgabe der DSGVO das Recht auf Auskunft (Art. 15),
          Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
          Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch
          (Art. 21). Außerdem besteht das Recht auf Beschwerde bei einer
          Datenschutzaufsichtsbehörde (Art. 77 DSGVO). Zuständig ist
          insbesondere die Landesbeauftragte für den Datenschutz und für das
          Recht auf Akteneinsicht Brandenburg.
        </p>

        <h2>8. Datensicherheit</h2>
        <p>
          Diese Website wird über HTTPS ausgeliefert. Die Übertragung Ihrer
          Daten erfolgt verschlüsselt.
        </p>

        <h2>9. Aktualität</h2>
        <p>
          Diese Datenschutzerklärung wird bei Änderungen der Website oder der
          Rechtslage fortgeschrieben.
        </p>
      </section>
    </main>
  );
}
