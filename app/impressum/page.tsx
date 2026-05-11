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
          <p>Platzhalter bis zur finalen Freigabe der offiziellen Kundendaten.</p>
        </div>
      </section>
      <section className="section legal">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          {site.legalName}<br />
          Künstlername: {site.name}<br />
          Anschrift: wird ergänzt<br />
          Deutschland
        </p>
        <h2>Kontakt</h2>
        <p>
          Telefon: wird ergänzt<br />
          E-Mail: {site.email}
        </p>
        <h2>Steuerliche Angaben</h2>
        <p>
          Steuernummer oder Umsatzsteuer-ID, Kleinunternehmerstatus und weitere
          Pflichtangaben werden nach Rückmeldung aus dem Fragebogen ergänzt.
        </p>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>{site.legalName}, Anschrift wird ergänzt.</p>
      </section>
    </main>
  );
}
