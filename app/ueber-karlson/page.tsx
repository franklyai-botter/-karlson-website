import Image from "next/image";

export const metadata = {
  title: "Über Karlson",
  description: "Über Karlson, Frank Haupt-Tschachtschal: Liedermacher, Singer-Songwriter und Alleinunterhalter aus Ketzin im Havelland.",
};

export default function UeberKarlsonPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Über Karlson</span>
          <h1>Musik von beiden Seiten der Havel.</h1>
          <p>
            Karlson, bürgerlich Frank Haupt-Tschachtschal, ist Liedermacher,
            Singer-Songwriter und Alleinunterhalter aus Ketzin. Seine Musik ist
            nah an der Region, am Publikum und an den Geschichten des Abends.
          </p>
        </div>
      </section>
      <section className="section media-band">
        <Image src="/karlson/hero.jpg" alt="Karlson mit Gitarre" width={1090} height={1599} />
        <div>
          <h2>Handgemacht, persönlich, spontan.</h2>
          <p className="muted">
            Karlson spielt Gitarre, Mundharmonika, Fußpercussion, Kazoo und singt.
            Mit einem Repertoire von rund 320 Titeln kann er auf Stimmung,
            Publikum und Ort reagieren, ohne den persönlichen Charakter zu verlieren.
          </p>
          <p className="muted">
            Zu seinen eigenen Liedern gehören Stücke über das Havelland, Etzin,
            Retzow, Tremmen und persönliche Geschichten über Liebe und Leben.
          </p>
        </div>
      </section>
    </main>
  );
}
