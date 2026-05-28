import { site } from "../data";

export const metadata = {
  title: "Impressum",
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Rechtliches</span>
          <h1>Impressum</h1>
          <p>Angaben gemäß § 5 DDG und § 18 Abs. 2 MStV.</p>
        </div>
      </section>
      <section className="section legal">
        <h2>Diensteanbieter</h2>
        <p>
          {site.legalName}<br />
          Künstlername: {site.name}<br />
          {site.address.street}<br />
          {site.address.zip} {site.address.city}<br />
          {site.address.country}
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href={site.phoneHref}>{site.phone}</a><br />
          E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>

        <h2>Steuerliche Angaben</h2>
        <p>
          Steuernummer: {site.taxNumber}<br />
          {site.taxStatus}.
        </p>
        <p>
          Es wird gemäß § 19 UStG keine Umsatzsteuer berechnet und
          ausgewiesen.
        </p>

        <h2>Berufsbezeichnung</h2>
        <p>Freiberuflicher Künstler / Musiker (Deutschland)</p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          {site.legalName}<br />
          {site.address.street}, {site.address.zip} {site.address.city}
        </p>

        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Wir sind nicht bereit oder verpflichtet, an Streit­beilegungs­verfahren
          vor einer Verbraucher­schlichtungsstelle teilzunehmen.
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten
          ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Fotos und Bilder Dritter
          werden mit deren Erlaubnis verwendet.
        </p>
      </section>
    </main>
  );
}
