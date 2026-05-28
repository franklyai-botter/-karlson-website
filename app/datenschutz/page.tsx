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

        <h2>2. Hosting (Vercel)</h2>
        <p>
          Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
          91789, USA gehostet. Beim Aufruf der Website werden technisch
          notwendige Daten verarbeitet (insbesondere IP-Adresse, Datum/Uhrzeit
          der Anfrage, aufgerufene Seite, Browsertyp, Referrer), damit die
          Seite sicher und stabil ausgeliefert werden kann. Rechtsgrundlage ist
          Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
          funktions­fähigen Website).
        </p>
        <p>
          Vercel kann Daten in Drittländer (insbesondere USA) übertragen. Vercel
          beruft sich hierfür auf das EU-US Data Privacy Framework sowie auf
          Standard­vertrags­klauseln. Weitere Informationen:{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            vercel.com/legal/privacy-policy
          </a>
          .
        </p>

        <h2>3. Kontaktaufnahme</h2>
        <p>
          Es gibt auf dieser Website kein Kontaktformular. Wenn Besucherinnen
          oder Besucher per E-Mail oder Telefon Kontakt aufnehmen, werden die
          dabei übermittelten Angaben ausschließlich zur Bearbeitung der
          Anfrage und für mögliche Anschlussfragen verwendet. Rechtsgrundlage
          ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen bzw.
          Vertrags­abwicklung) bzw. Art. 6 Abs. 1 lit. f DSGVO (effiziente
          Bearbeitung).
        </p>
        <p>
          Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr
          erforderlich sind, soweit keine gesetzlichen Aufbewahrungs­pflichten
          entgegenstehen.
        </p>

        <h2>4. Cookies und TDDDG</h2>
        <p>
          Beim Erstaufruf dieser Website werden keine nicht notwendigen
          Cookies, keine Tracking-Pixel und keine externen Medien gesetzt.
          Verlinkungen zu YouTube und Facebook sind als reine Textlinks
          umgesetzt; Inhalte dieser Plattformen werden erst nach einem Klick
          und einem Wechsel auf die Plattform geladen.
        </p>

        <h2>5. Webanalyse</h2>
        <p>
          Es wird derzeit keine Webanalyse eingesetzt. Sollte sich daran etwas
          ändern, wird diese Datenschutz­erklärung angepasst und – wo
          erforderlich – eine Einwilligung eingeholt.
        </p>

        <h2>6. Eingebettete Inhalte und externe Links</h2>
        <p>
          Verlinkungen auf YouTube (Google Ireland Limited / Google LLC) und
          Facebook (Meta Platforms Ireland Ltd.) sind Textlinks. Inhalte dieser
          Anbieter werden erst geladen, wenn der Link ausdrücklich angeklickt
          wird. Eine Datenübertragung an diese Anbieter findet folglich erst
          dann statt.
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
