import Link from "next/link";
import Image from "next/image";
import { programs } from "../data";

export const metadata = {
  title: "Programme",
  description:
    "Karlsons Programme: Alleinunterhalter als One-Man-Band, Liedermacher-Abend, Kinderlieder-Mitmachprogramm und Duo mit Klavier.",
};

export default function ProgrammePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Programme</span>
          <h1>Vier Programme – ein Musiker, jede Stimmung.</h1>
          <p>
            Vom ruhigen Liedermacher-Abend bis zur langen Feier mit
            mitreißender One-Man-Band: Karlson hat für jeden Anlass das
            passende Format.
          </p>
        </div>
      </section>
      <section className="section grid-2">
        {programs.map((program) => (
          <article className="card" key={program.title}>
            <h2>{program.title}</h2>
            <p>{program.text}</p>
            <p><strong>{program.details}</strong></p>
            <Link className="button" href="/buchung">Dieses Programm anfragen</Link>
          </article>
        ))}
      </section>
      <section className="split-band">
        <div className="section media-band">
          <Image src="/karlson/remise-setup.jpg" alt="Karlsons Technik und Instrumente" width={1600} height={1200} />
          <div>
            <span className="eyebrow">Technik</span>
            <h2>Kompakt, flexibel, bühnentauglich.</h2>
            <p className="muted">
              Karlson bringt Gitarre, Gesang, Mundharmonika, Fußpercussion und
              je nach Ort die passende technische Grundausstattung mit. Der
              Veranstalter stellt einen funktionstüchtigen Stromanschluss
              bereit; bei Open-Air einen ausreichenden Wetterschutz für
              Künstler, Instrumente und Technik.
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="notice card">
          <h2>Preise</h2>
          <p>
            Honorare richten sich nach Programm, Auftrittsdauer, Anfahrt und
            Anlass und werden jeweils individuell vereinbart – am besten
            direkt anfragen.
          </p>
          <div className="actions">
            <Link className="button" href="/buchung">Auftritt anfragen</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
