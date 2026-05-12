export const site = {
  name: "Karlson",
  legalName: "Frank Haupt-Tschachtschal",
  claim: "Liedermacher aus Ketzin im Havelland",
  email: "kontakt@karlson-musik.de",
  phone: "",
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
    title: "Liedermacher-Abend",
    text: "Eigene Havelland-Lieder, persönliche Geschichten und bekannte Songs in Karlsons eigener Handschrift.",
    details: "Für Kulturabende, Wohnzimmerkonzerte, Vereine und besondere private Feiern.",
  },
  {
    title: "Alleinunterhalter",
    text: "Gitarre, Gesang, Mundharmonika, Fußpercussion und Kazoo: ein flexibles Live-Programm für Feste.",
    details: "Für Hochzeiten, Geburtstage, Stadtfeste, Firmenfeiern und Gartenpartys.",
  },
  {
    title: "Kinderlieder-Mitmachprogramm",
    text: "Ein einstündiges Mitmachprogramm mit musiktherapeutischer Erfahrung und viel Nähe zum Publikum.",
    details: "Für Kitas, Schulen, Familienfeste, Kinderfeste und kommunale Veranstaltungen.",
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

export const appearancePlaces = [
  "Fischerfest Ketzin",
  "Grüne Woche Berlin",
  "Brandenburg-Tag",
  "Baumblüte Werder",
  "BraLa Paaren im Glien",
  "Werder Classics",
  "Adventsmärkte",
  "Pfarrhoffeste",
  "Kinderfeste",
];

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

const upcomingEventsCutoff = "2026-05-12";

export const upcomingEvents2026 = events2026.filter((event) => event.date >= upcomingEventsCutoff);

export const faqs = [
  {
    question: "Wo tritt Karlson auf?",
    answer: "Karlson spielt vor allem im Havelland, in Brandenburg und in Berlin. Als Richtwert gilt ein Umkreis von etwa 80 Kilometern um Ketzin.",
  },
  {
    question: "Welche Musikrichtungen spielt Karlson?",
    answer: "Das Repertoire reicht von Singer-Songwriter und Deutschpop über Rockklassiker, Oldies, Schlager und Volkslieder bis zu eigenen Liedern über das Havelland.",
  },
  {
    question: "Wie lange dauert ein Auftritt?",
    answer: "Karlson kann sehr flexibel reagieren. Das Programm reicht von kurzen Auftritten bis zu mehreren Stunden Live-Musik.",
  },
  {
    question: "Gibt es ein Kinderprogramm?",
    answer: "Ja. Karlson bietet ein etwa einstündiges Kinderlieder-Mitmachprogramm an.",
  },
];

export const galleryImages = [
  { src: "/karlson/hero.jpg", alt: "Karlson mit Gitarre vor einer Backsteinwand" },
  { src: "/karlson/gallery/live-01.jpg", alt: "Karlson bei einem Live-Auftritt" },
  { src: "/karlson/gallery/live-02.jpg", alt: "Karlson mit Gitarre und Bühnenaufbau" },
  { src: "/karlson/gallery/live-03.jpg", alt: "Karlson als Alleinunterhalter" },
  { src: "/karlson/gallery/live-04.jpg", alt: "Live-Musik von Karlson" },
  { src: "/karlson/remise-setup.jpg", alt: "Auftrittssetup mit Gitarre, Mikrofon und Technik in einer Remise" },
];
