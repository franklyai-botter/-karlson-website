import Link from "next/link";
import Image from "next/image";
import { programs } from "../data";

export const metadata = {
  title: "Programme",
  description: "Karlsons Programme: Liedermacher-Abend, Alleinunterhalter und Kinderlieder-Mitmachprogramm.",
};

export default function ProgrammePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Programme</span>
          <h1>Live-Musik für Feiern, Feste und Familien.</h1>
          <p>
            Karlson spielt flexibel: vom ruhigen Liedermacher-Abend bis zur langen
            Feier mit bekannten Songs und spontaner Publikumsnähe.
          </p>
        </div>
      </section>
      <section className="section grid-3">
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
              Karlson bringt Gitarre, Gesang, Mundharmonika, Fußpercussion, Kazoo
              und je nach Ort die passende technische Grundausstattung mit.
              Details werden vor jeder Buchung abgestimmt.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
