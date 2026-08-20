import Image from "next/image";

export const metadata = {
  title: "Über Karlson",
  description:
    "Karlson, bürgerlich Frank Haupt-Tschachtschal, ist Liedermacher, Singer-Songwriter und One-Man-Band aus Ketzin im Havelland.",
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
            Singer-Songwriter und One-Man-Band aus Ketzin. Seine Musik ist nah
            an der Region, am Publikum und an den Geschichten des Abends.
          </p>
        </div>
      </section>
      <section className="section media-band">
        <Image className="about-portrait" src="/karlson/gallery-full/foto-14.jpg" alt="Karlson mit Gitarre vor einer Backsteinwand" width={900} height={1600} />
        <div>
          <h2>Eine kleine Band in einer Person.</h2>
          <p className="muted">
            Karlson spielt gleichzeitig Gitarre, Mundharmonika, Fußpercussion
            und Kazoo und singt – das klingt wie eine kleine Band, ist aber ein
            Mann auf der Bühne. Mit einem Repertoire von rund 320 Titeln kann er auf
            Stimmung, Publikum und Ort reagieren, ohne den persönlichen
            Charakter zu verlieren.
          </p>
          <p className="muted">
            Zu seinen rund 30 eigenen Liedern gehören Stücke über das Havelland,
            Etzin, Retzow, Tremmen und persönliche Geschichten über Liebe und
            Leben. Auf Wunsch tritt er auch in Duo-Besetzung mit Klavier auf.
          </p>
        </div>
      </section>
    </main>
  );
}
