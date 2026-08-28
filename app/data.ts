// Basis-URL fuer Meta-Tags, Sitemap und Link-Vorschauen.
// Sobald die echte Domain steht: hier eintragen oder als Env-Variable
// NEXT_PUBLIC_SITE_URL im Cloudflare-Projekt setzen.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://karlson-solo-orchester.de";

export const site = {
  name: "Karlson",
  legalName: "Frank Haupt-Tschachtschal",
  claim: "One-Man-Band aus Ketzin im Havelland",
  email: "karlson.11.10@gmail.com",
  phone: "0172 4732644",
  phoneHref: "tel:+491724732644",
  address: {
    street: "Etziner Dorfstraße 28",
    zip: "14669",
    city: "Ketzin/Havel",
    country: "Deutschland",
  },
  taxNumber: "051/228/00794",
  taxStatus: "Kleinunternehmer gemäß § 19 UStG (keine Umsatzsteuer)",
  area: "Havelland, Brandenburg und Berlin",
};

export const socialLinks = [
  {
    label: "YouTube",
    handle: "@karlikarlson1967",
    href: "https://www.youtube.com/@karlikarlson1967",
  },
  {
    label: "Facebook",
    handle: "Karlson Haupt",
    href: "https://www.facebook.com/share/1AgM26JpAY/?mibextid=wwXIfr",
  },
];

export const navItems = [
  { href: "/programme", label: "Programme" },
  { href: "/repertoire", label: "Repertoire" },
  { href: "/ueber-karlson", label: "Über Karlson" },
  { href: "/termine", label: "Termine" },
  { href: "/eindruecke", label: "Eindrücke" },
  { href: "/veranstalter", label: "Für Veranstalter" },
];

export const programs = [
  {
    title: "Alleinunterhalter (One-Man-Band)",
    text: "Gitarre, Mundharmonika, Fußpercussion, Kazoo und Gesang – alles gleichzeitig. Ein Mann, ein Sound wie eine kleine Band.",
    details: "Für Stadt- und Dorffeste, Firmenfeiern, Neujahrsempfänge, Hochzeiten, Gartenpartys und private Feiern.",
  },
  {
    title: "Liedermacher-Abend",
    text: "Eigene Havelland-Lieder, persönliche Geschichten und bekannte Songs in Karlsons eigener Handschrift.",
    details: "Für Kulturabende, Wohnzimmerkonzerte, Vereine und besondere private Anlässe.",
  },
  {
    title: "Kinderlieder-Mitmachprogramm",
    text: "Ein etwa einstündiges Mitmachprogramm mit musiktherapeutischer Erfahrung und viel Nähe zum Publikum.",
    details: "Für Kitas, Schulen, Familienfeste, Kinderfeste und kommunale Veranstaltungen.",
  },
  {
    title: "Duo-Besetzung mit Klavier",
    text: "Auf Wunsch ergänzt Karlson sein Solo-Programm um Klavierbegleitung – mehr Klangfülle für besondere Abende.",
    details: "Für Hochzeiten, Empfänge, Kulturveranstaltungen und stimmungsvolle Privatfeiern.",
  },
];

export const repertoireGroups = [
  "Singer-Songwriter",
  "Deutschpop und Rock",
  "Oldies",
  "Rockklassiker",
  "Schlager",
  "Stimmungsmusik",
  "Volkslieder",
  "Eigene Havelland-Lieder",
];

export const highlightAppearances = [
  {
    title: "Fischerfest Ketzin",
    note: "Traditionsfest im Havelland",
  },
  {
    title: "Brandenburgtag Perleberg",
    note: "Landesweite Bühne für brandenburgische Künstler",
  },
  {
    title: "Grüne Woche Berlin",
    note: "Internationale Messe in Berlin",
  },
];

export const appearancePlaces = [
  "Fischerfest Ketzin",
  "Brandenburgtag Perleberg",
  "Grüne Woche Berlin",
  "Baumblüte Werder",
  // Fortsetzung unten. `weitereAppearancePlaces` filtert die drei Eintraege
  // heraus, die oben schon als Highlight-Karte stehen.
  "BraLa Paaren im Glien",
  "Werder Classics",
  "Ketzür rockt",
  "Brandenburgisches Leistungshüten, Flugplatz Bienenfarm",
  "Adventsmärkte, Hofweihnachten und Pfarrhoffeste",
  "Stadtfeste und Vereinsfeiern",
  "Neujahrsempfänge und Gartenpartys",
  "Kinderfeste",
];

/**
 * Die Auftrittsorte ohne die drei, die als Highlight-Karte hervorgehoben sind.
 *
 * Hintergrund: „Wo Karlson schon gespielt hat" und „Auftrittsorte" waren bis
 * zum 28.08.2026 zwei getrennte Abschnitte auf der Startseite, deren erste drei
 * Eintraege identisch waren. Karin hatte gemeldet, der obere Abschnitt „oeffnet
 * sich nicht" — die drei Karten dort tragen Kartenoptik mit Schatten, hatten
 * aber kein Klickziel (an der Live-Seite nachgemessen: null anklickbare
 * Elemente im Abschnitt). Beide Abschnitte stehen jetzt zusammen, damit die
 * vollstaendige Antwort ohne Klick sichtbar ist.
 */
const highlightTitel = new Set(highlightAppearances.map((h) => h.title));

export const weitereAppearancePlaces = appearancePlaces.filter(
  (ort) => !highlightTitel.has(ort),
);

export const events2026 = [
  { date: "2026-01-16", displayDate: "16.1.", title: "Grüne Woche", location: "Berlin", type: "public" },
  { date: "2026-01-24", displayDate: "24.1.", title: "Privatparty", location: "Werder", type: "private" },
  { date: "2026-02-15", displayDate: "15.2.", title: "Privatparty", location: "Blankenfelde", type: "private" },
  { date: "2026-04-04", displayDate: "4.4.", title: "Osterfeuer", location: "Tremmen", type: "public" },
  { date: "2026-04-11", displayDate: "11.4.", title: "Stammtisch", location: "Paretz", type: "public" },
  { date: "2026-04-25", displayDate: "25.4.", title: "Baumblüte", location: "Werder", type: "public" },
  { date: "2026-05-16", displayDate: "16.5.", title: "Privatparty", location: "Werder", type: "private" },
  { date: "2026-06-20", displayDate: "20.6.", title: "Privatparty", location: "Malchow", type: "private" },
  { date: "2026-06-30", displayDate: "30.6.", title: "Sommerempfang Stadt Ketzin", location: "Ketzin", type: "public" },
  { date: "2026-08-01", displayDate: "1.8.", title: "Privatparty", location: "Ketzin", type: "private" },
  { date: "2026-10-02", displayDate: "2.10.", title: "Privatparty", location: "Zachow", type: "private" },
  { date: "2026-11-07", displayDate: "7.11.", title: "Neubürgerempfang", location: "Ketzin", type: "public" },
  { date: "2026-11-11", displayDate: "11.11.", title: "Laternenfest Biene Maja", location: "", type: "public" },
  { date: "2026-11-13", displayDate: "13.11.", title: "Laterne", location: "Tremmen", type: "public" },
  { date: "2026-11-28", displayDate: "28.11.", title: "Privatparty", location: "Ketzin", type: "private" },
  { date: "2026-11-29", displayDate: "29.11.", title: "Adventssingen Kirche Elstal", location: "Elstal", type: "public" },
  { date: "2026-12-05", displayDate: "5.12.", title: "Adventsmarkt", location: "Tremmen", type: "public" },
] as const;

// Stichtag ist der Build-Tag, nicht ein festes Datum: dadurch verschwinden
// vergangene Termine bei jedem Deploy von allein. Wichtig: die Seite ist
// statisch exportiert — die Liste aktualisiert sich erst beim naechsten Build.
const upcomingEventsCutoff = new Date().toISOString().slice(0, 10);

export const upcomingEvents2026 = events2026.filter((event) => event.date >= upcomingEventsCutoff);

export const youtubeLinks = [
  { id: "c-FGXQMpaXw", label: "Karlson live auf YouTube" },
  { id: "MrqLqCjhr_o", label: "Karlson live auf YouTube" },
];

export const faqs = [
  {
    question: "Wo tritt Karlson auf?",
    answer: "Karlson spielt vor allem im Havelland, in ganz Brandenburg und in Berlin. Im Umkreis von 10 km um Ketzin entstehen keine Fahrtkostenaufschläge.",
  },
  {
    question: "Welche Musikrichtungen spielt Karlson?",
    answer: "Das Repertoire reicht von Singer-Songwriter und Deutschpop über Rockklassiker, Oldies, Schlager und Volkslieder bis zu eigenen Liedern über das Havelland.",
  },
  {
    question: "Wie lange dauert ein Auftritt?",
    answer: "Komplett flexibel je nach Wunsch – vom kurzen Empfang bis zur langen Feier mit mehreren Stunden Live-Musik.",
  },
  {
    question: "Gibt es ein Kinderprogramm?",
    answer: "Ja. Karlson bietet ein etwa einstündiges Kinderlieder-Mitmachprogramm an.",
  },
  {
    question: "Was kostet ein Auftritt?",
    answer: "Honorare richten sich nach Programm, Dauer, Anfahrt und Anlass. Für ein konkretes Angebot bitte direkt anfragen.",
  },
];

// Zeigt auf gallery-full/, nicht auf einen eigenen Ordner: der frueher hier
// verwendete Ordner public/karlson/gallery/ enthielt byteidentische Kopien
// (live-01 = foto-06, live-02 = foto-19, live-03 = foto-26, live-04 = foto-43,
// per sha256 geprueft). Die Dateien lagen doppelt im Repo und wurden doppelt
// ausgeliefert; portrait-01.jpg war gar nicht eingebunden.
export const galleryImages = [
  { src: "/karlson/hero.jpg", alt: "Karlson mit Gitarre vor einer Backsteinwand" },
  { src: "/karlson/gallery-full/foto-06.jpg", alt: "Karlson bei einem Live-Auftritt" },
  { src: "/karlson/gallery-full/foto-19.jpg", alt: "Karlson mit Gitarre und Bühnenaufbau" },
  { src: "/karlson/gallery-full/foto-26.jpg", alt: "Karlson als Alleinunterhalter" },
  { src: "/karlson/gallery-full/foto-43.jpg", alt: "Live-Musik von Karlson" },
  { src: "/karlson/remise-setup.jpg", alt: "Auftrittssetup mit Gitarre, Mikrofon und Technik in einer Remise" },
];
