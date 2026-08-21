# Deploy-Anleitung Karlson Website

Diese Webseite wird **immer über `git push`** veröffentlicht. Nie per
`wrangler deploy`, nie per Direkt-Upload. Sonst laufen GitHub-Stand und
Live-Stand auseinander, und niemand weiß mehr, was eigentlich online ist.

Live: https://karlson-solo-orchester.de

---

## 1. Workflow für Karlson + Codex (Standardfall)

Die ausführliche, nicht-technische Fassung steht in [KARLSON.md](KARLSON.md).

### Einmalig vorbereiten

1. **Git** und **Node.js 20+**
2. GitHub-Zugriff auf `franklyai-botter/-karlson-website`
3. Repo klonen:
   ```bash
   git clone https://github.com/franklyai-botter/-karlson-website.git karlson-website
   cd karlson-website
   npm install
   ```

### Jede Änderung veröffentlichen

```bash
git pull origin main       # immer zuerst, sonst Konflikte
# ... Änderungen machen, lokal mit "npm run dev" prüfen ...
git add .
git commit -m "kurze beschreibung"
git push origin main
```

Cloudflare baut und veröffentlicht automatisch in ein bis zwei Minuten.

Codex braucht den **Projektordner als Working Directory**, nicht einzelne
Dateien. Nur so kann es echte Dateien ändern und committen.

---

## 2. Cloudflare einrichten (einmalig) — Launch-Ablauf

Reihenfolge ist Absicht: **erst der Worker, dann die Domain.** So läuft die neue
Auslieferung schon nachweisbar, bevor die Domain umgezogen wird. Die Seite ist
zu keinem Zeitpunkt offline, weil Vercel bis zum Schluss weiterläuft.

Stand der Prüfung: 20.08.2026.

### Vorab — Ist-Zustand der Domain (geprüft, nicht vermutet)

`karlson-solo-orchester.de` ist seit 19.08.2026 registriert, Status `active`.
Sie liegt bei **IONOS** (Nameserver `ns1031.ui-dns.com`, `ns1040.ui-dns.biz`,
`ns1090.ui-dns.de`, `ns1106.ui-dns.org`). Bestehende Einträge:

| Typ | Wert |
|---|---|
| A | `217.160.0.176` (IONOS-Parkseite) |
| AAAA | `2001:8d8:100f:f000::200` |
| MX | `mx00.ionos.de` (10), `mx01.ionos.de` (10) |
| TXT | `v=spf1 include:_spf-eu.ionos.com ~all` |
| www | existiert nicht |

**DNSSEC ist nicht aktiv** (kein DS-Record). Die klassische Umzugsfalle entfällt
damit — nur beim Umzug bitte auch nicht einschalten.

> **Die MX- und SPF-Einträge sind der kritische Punkt am Launch-Abend.**
> Auf der Domain liegt ein IONOS-Postfach. Wer die Nameserver auf Cloudflare
> umstellt und MX plus SPF nicht in die Cloudflare-Zone übernimmt, schaltet die
> E-Mail-Adresse ab. Anfragen von Veranstaltern kommen dann nicht mehr an, und
> auf der Webseite fällt das nicht auf.

### Schritt 1 — Worker anlegen und aus dem Repo bauen lassen

Dashboard → **Compute (Workers)** → **Create** → **Import a repository**

- Git repository: `franklyai-botter/-karlson-website`
- Git branch: `main`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy` (ist der Standardwert, so lassen)

**Es gibt bei Workers kein Feld „Build output directory".** Das ist der
Unterschied zu Cloudflare Pages: was ausgeliefert wird, steht in `wrangler.jsonc`
(`assets.directory: "./out"`, `not_found_handling: "404-page"`). Wer hier ein
Ausgabeverzeichnis sucht, sucht vergeblich.

Der `npx wrangler deploy` im Deploy command ist **kein** CLI-Direkt-Deploy und
kein Widerspruch zur Regel oben: der Befehl läuft in Cloudflares Build-Umgebung,
ausgelöst durch den Push. Von einem lokalen Rechner wird nie deployt.

Node-Version: `.nvmrc` im Repo setzt 24, passend zur lokal getesteten
Umgebung. Ohne die Datei nimmt Cloudflare seinen eigenen Standard, der sich
irgendwann ändert und dann den Build brechen kann.

### Schritt 2 — Umgebungsvariable (nur wenn die Domain wechselt)

**Beim Launch nicht nötig.** `app/data.ts` hat die echte Domain als
Rückfallwert, der Build schreibt also von allein die richtigen Adressen in
Sitemap, `robots.txt` und Link-Vorschauen.

Wenn die Domain doch einmal wechselt: `NEXT_PUBLIC_SITE_URL` gehört unter
Settings → **Build** → *Build variables and secrets*, **nicht** unter
„Variables and Secrets" oben. Zwei Gründe:

- Ein Worker, der nur statische Assets ausliefert, nimmt gar keine
  Laufzeit-Variablen an — das Dashboard sagt dort ausdrücklich *„Variables
  cannot be added to a Worker that only has static assets."*
- `NEXT_PUBLIC_*` wird von Next.js beim **Build** ins HTML gebacken. Zur
  Laufzeit wäre sie ohnehin wirkungslos.

Nach dem Setzen einen neuen Build auslösen, sonst steckt der alte Wert im HTML.

### Schritt 3 — Auf der Cloudflare-Testadresse prüfen

Der Worker ist sofort unter `<name>.<subdomain>.workers.dev` erreichbar. Diese
Adresse prüfen, **bevor** die Domain angefasst wird:

- Startseite lädt, Bilder sind da
- `/termine/`, `/buchung/`, `/impressum/` antworten mit 200
- `/robots.txt` und `/sitemap.xml` sind erreichbar
- ein erfundener Pfad wie `/gibtsnicht/` antwortet mit **404**, nicht mit der Startseite

Erst wenn das steht, weiter.

### Schritt 4 — Domain als Site in Cloudflare aufnehmen

Eine Custom Domain für einen Worker verlangt eine **aktive Cloudflare-Zone**.
Die Domain muss also erst in Cloudflare als Site liegen:

Dashboard → **Add a domain** → `karlson-solo-orchester.de` → Free-Plan genügt.

Cloudflare scannt die bestehende Zone und übernimmt gefundene Einträge. **Danach
gegen die Tabelle oben abgleichen**, insbesondere die zwei MX-Einträge und den
SPF-TXT. Was fehlt, hier nachtragen — jetzt, nicht später. Solange die
Nameserver noch bei IONOS stehen, ist das ein Trockenlauf ohne Wirkung nach
außen.

Den A- und AAAA-Eintrag auf die IONOS-Parkseite braucht es nicht mehr; den legt
Schritt 6 als Worker-Route neu an.

### Schritt 5 — Nameserver bei IONOS umstellen

Cloudflare nennt zwei Nameserver. Diese im IONOS-Kundenkonto unter der Domain
eintragen und die vier `ui-dns`-Einträge ersetzen.

- **Auto-Renew bei IONOS aktiv lassen.** Eine abgelaufene Domain ist schlimmer
  als eine langsame.
- Übernahme dauert in der Regel Minuten bis wenige Stunden. Cloudflare meldet
  die Zone dann als `Active`.
- **DNSSEC nicht einschalten**, solange der Umzug nicht durch ist.

### Schritt 6 — Custom Domain auf den Worker legen

Worker → **Settings** → **Domains & Routes** → **Add** → **Custom Domain**

- `karlson-solo-orchester.de` hinzufügen

Cloudflare legt den DNS-Eintrag selbst an und stellt das Zertifikat selbst aus.
Voraussetzung: auf dem Hostnamen darf kein CNAME liegen — deshalb Schritt 4
vorher aufräumen.

`www` gehört ebenfalls erledigt, sonst landet jeder, der es eintippt, im Nichts.
Ein 301 statt einer zweiten Custom Domain, weil Sitemap und Canonical-Tags auf
die Adresse ohne `www` zeigen. Zwei Handgriffe, beide in der Domain-Ansicht:

1. **DNS → Add record**: Typ `AAAA`, Name `www`, Inhalt `100::`, **Proxied**.
   Der Eintrag macht `www` überhaupt erst existent — ohne ihn kommt die Anfrage
   nie bei Cloudflare an und keine Regel greift. `100::` ist eine Adresse, die
   ins Nichts zeigt; erreicht wird sie nie, weil der Proxy vorher abfängt.
2. **Rules → Overview → Vorlage „Redirect from WWW to root"** → *Create from
   template*. Die Vorlage ist fertig (`https://www.*` → `https://${1}`,
   Status 301). Nur **Preserve query string** anhaken, dann Deploy.

Cloudflare warnt beim Deploy womöglich, `www` sei nicht proxied. Wenn Schritt 1
gerade gemacht wurde, ist das nur die nachhinkende Dashboard-Prüfung —
„Ignore and deploy rule anyway" ist dann richtig. **Nicht** „Create a new
proxied DNS record" wählen, das legt einen zweiten Eintrag für denselben Namen
an. Gegenprüfen von außen:
`Resolve-DnsName www.<domain> -Server <cloudflare-ns>` muss Cloudflare-Adressen
liefern, nicht `100::`.

### Schritt 6b — HTTPS erzwingen

**SSL/TLS → Edge Certificates → „Always Use HTTPS"** einschalten. Ohne den
Schalter antwortet `http://` mit 200 statt umzuleiten, und Besucher bleiben
unverschlüsselt.

Gleich darunter **Minimum TLS Version von 1.0 auf 1.2** stellen. TLS 1.0/1.1
gelten seit Jahren als überholt, und kein Browser der letzten zehn Jahre
verliert dadurch Zugang.

**HSTS erst später.** Browser merken sich die Regel monatelang; wenn dabei
etwas schiefgeht, kommt man nicht schnell zurück. Erst ein paar Tage stabil
laufen lassen.

### Schritt 7 — Abnahme unter der echten Domain

- `https://karlson-solo-orchester.de` lädt, Zertifikat gültig
- `http://` leitet auf `https://` um
- `www.` leitet mit 301 auf die Adresse ohne `www`
- **E-Mail-Test: eine Mail an die Adresse auf der Domain schicken und dass sie
  ankommt.** Der Test, den man am Launch-Abend vergisst und drei Tage später
  bereut.
- `/sitemap.xml` nennt die echte Domain, nicht mehr den Vercel-Alias
- Eine Teständerung pushen und nachsehen, ob der Build automatisch anläuft

### Launch-Protokoll 20.08.2026

Durchgeführt und von außen nachgemessen, nicht nur im Dashboard abgelesen:

- Nameserver-Wechsel bei IONOS um **20:38**, bei DENIC nach **90 Sekunden**
  sichtbar. Die von IONOS genannten „bis zu 48 Stunden" sind Sicherheitspuffer.
- Zone-Aktivierung in Cloudflare hinkt der Technik nach: die Cloudflare-
  Nameserver lieferten MX, SPF und SOA schon korrekt, während das Dashboard
  noch „Waiting for your registrar" zeigte.
- Alle Routen unter der echten Domain 200, unbekannte Pfade 404,
  `http://` → 301 → `https://`, `www` → 301 → apex mit erhaltenem Pfad.

### Stolpersteine, die Zeit gekostet haben

**IONOS meldet nach dem Wechsel „Ihre Domain verfügt noch nicht über SSL".**
Fehlalarm. Das Zertifikat kommt von Cloudflare. IONOS sieht nur, dass die
Domain nicht mehr auf ihren Webspace zeigt. Dort SSL zu aktivieren bestellt ein
Zertifikat für einen ungenutzten Webspace. Ebenso unnötig: „Domain Guard".

**`ERR_SSL_PROTOCOL_ERROR` im eigenen Browser, während die Seite längst läuft.**
Ursache ist der Resolver-Cache: er liefert noch die alte Registrar-IP, und dort
liegt kein Zertifikat für die Domain. Erkennbar daran, dass verschiedene
Resolver Verschiedenes sagen — `Resolve-DnsName <domain> -Server 1.1.1.1` gegen
`-Server 8.8.8.8` gegenprüfen. Kein Grund, an der Konfiguration zu drehen. Wer
sofort Gewissheit will, testet an Cloudflare vorbei am Cache:
`curl --resolve <domain>:443:<cloudflare-ip> https://<domain>/`.

**Der Import-Flow kann an einer alten GitHub-App-Installation scheitern**
(„Error connecting to git account"). Dann die GitHub-App unter
Settings → Applications deinstallieren und den Weg **von Cloudflare aus** neu
starten — nur so entsteht die Verknüpfung zum Cloudflare-Konto. Vorher prüfen,
dass keine anderen Cloudflare-Projekte an der Installation hängen.

### Schritt 8 — Erst danach Vercel abschalten

- Vercel-Projekt **deaktivieren, nicht löschen.** Es bleibt Rückfallebene, bis
  die neue Auslieferung ein paar Tage stabil war.
- Dann prüfen, dass keine Doku und kein Link mehr auf
  `karlson-website.vercel.app` zeigt.

---

## 2b. Anfrageformular scharfstellen (einmalig)

Das Formular auf `/buchung/` ist **gebaut und getestet, aber noch nicht
eingeschaltet**. Solange die Variable aus Schritt 5 unten fehlt, zeigt die
Seite nur Telefon und E-Mail — genau wie vorher. Das ist Absicht: ein
Formular, das beim Absenden scheitert, kostet mehr Anfragen als keins.

Wie es technisch läuft: `worker/index.js` liegt neben den statischen Dateien
und wird laut `wrangler.jsonc` **nur für `/api/*`** aufgerufen
(`run_worker_first`). Jede andere Adresse wird weiter direkt als Asset
ausgeliefert — kostenlos und unbegrenzt wie bisher. Nur die Formularabsendung
zählt auf das Kontingent von 100.000 Worker-Requests pro Tag; bei realistischem
Anfrageaufkommen sind das ein paar Requests am Tag.

Der Worker **speichert nichts**. Er nimmt die Anfrage an, prüft sie und gibt
sie als E-Mail an Mailjet weiter. Danach ist sie aus dem Speicher weg.

### Schritt 1 — Mailjet-Konto und Absenderdomain

1. Konto bei Mailjet anlegen. **Prüfen, dass das Konto auf die EU-Region
   läuft.** Mailjet verarbeitet standardmäßig in Frankfurt und Saint-Ghislain,
   der Sinch-Konzern betreibt aber auch US-Standorte — die Datenschutzerklärung
   behauptet EU, also muss das stimmen.
2. **AVV (Data Processing Agreement) abschließen** und die PDF zu Karlsons
   Unterlagen legen. Ohne AVV ist der Einsatz nicht sauber.
3. Unter *Account → API Key Management* **API Key und Secret Key** erzeugen.
4. **Absenderdomain verifizieren.** Mailjet verlangt dafür DKIM- und
   SPF-Einträge. Die DNS-Zone liegt bei **Cloudflare**, nicht bei IONOS — dort
   eintragen.

   ⚠️ **SPF: es darf nur einen SPF-TXT-Record geben.** In der Zone steht schon
   `v=spf1 include:_spf-eu.ionos.com ~all`. Mailjets `include` muss in **diesen
   Record hinein**, kein zweiter TXT-Record daneben — sonst ist SPF für beide
   Absender kaputt und die Mails landen im Spam.

5. Absenderadresse auf der eigenen Domain wählen, z. B.
   `formular@karlson-solo-orchester.de`. **Kein Freemail-Absender und nicht der
   Testabsender des Anbieters** — beides landet im Spam.

### Schritt 2 — Turnstile (Spam-Schutz)

Cloudflare-Dashboard → *Turnstile* → *Add Site* für
`karlson-solo-orchester.de`. Liefert ein Paar: **Sitekey** (öffentlich) und
**Secret Key**.

Ohne Turnstile funktioniert das Formular, hat dann aber nur den Honeypot als
Schutz. Für eine öffentlich verlinkte Musikerseite ist das zu wenig — Bot-Müll
im Postfach ist die Folge. Also einrichten.

### Schritt 3 — Secrets im Worker hinterlegen

Cloudflare-Dashboard → Worker `karlson-website` → *Settings → Variables and
Secrets*. Diese vier als **Secret** (nicht als Variable), damit sie nicht
lesbar sind:

| Name | Wert |
|---|---|
| `MAILJET_API_KEY` | API Key aus Schritt 1 |
| `MAILJET_SECRET_KEY` | Secret Key aus Schritt 1 |
| `TURNSTILE_SECRET_KEY` | Secret Key aus Schritt 2 |
| `MAIL_FROM` | verifizierte Absenderadresse, z. B. `formular@karlson-solo-orchester.de` |
| `MAIL_TO` | Karlsons Postfach (wohin die Anfragen gehen) |

**Nie ins Repo.** `.env.example` dokumentiert nur die Namen, keine Werte.

### Schritt 4 — Zustellungstest, bevor eingeschaltet wird

Lokal, ohne echten Versand:

```bash
# .dev.vars anlegen (steht in .gitignore, kommt nie ins Repo):
#   MAIL_DRY_RUN=1
#   MAIL_FROM=formular@karlson-solo-orchester.de
#   MAIL_TO=<eigene Adresse>
npm run vorschau      # = next build && wrangler dev
```

Dann `/buchung/` aufrufen und absenden. Mit `MAIL_DRY_RUN=1` wird die Mail
gebaut und ins Log geschrieben, aber nicht gesendet — so lässt sich die ganze
Kette prüfen, ohne Schlüssel zu brauchen.

Für den echten Test `MAIL_DRY_RUN` weglassen und die Mailjet-Schlüssel in
`.dev.vars` eintragen. **In den Spam-Ordner schauen** und prüfen, dass
*Antworten* an den Absender der Anfrage geht (`ReplyTo`) und nicht an Karlson
selbst.

### Schritt 5 — Einschalten

⚠️ **Vorher diese drei Punkte wirklich abhaken.** Mit dem Einschalten geht
gleichzeitig der Datenschutzabschnitt live, und der behauptet sie als
Tatsache. Wer die Variable setzt, ohne dass sie stimmen, veröffentlicht eine
falsche Angabe in einem Rechtstext:

- [ ] **AVV mit Mailjet ist abgeschlossen** (nicht nur „verfügbar"). Der Text
      sagt „Grundlage ist ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO".
- [ ] **Das Mailjet-Konto verarbeitet in der EU** und das ist im Konto
      nachgesehen, nicht angenommen. Der Text sagt „auf die Verarbeitung in
      Rechenzentren innerhalb der Europäischen Union eingestellt".
- [ ] **Zustellungstest aus Schritt 4 ist geglückt**, inklusive Blick in den
      Spam-Ordner und Prüfung, dass „Antworten" beim Anfragenden landet.

Dann im Cloudflare-Projekt als **Variable** (nicht Secret, der Build braucht
sie):

| Name | Wert |
|---|---|
| `NEXT_PUBLIC_FORMULAR_AKTIV` | `1` |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | Sitekey aus Schritt 2 |

Danach einen Deploy auslösen (Push oder *Retry deployment* im Dashboard).
`NEXT_PUBLIC_*`-Werte werden beim Build ins HTML eingebacken — eine Änderung
wirkt erst nach dem nächsten Build, nicht sofort.

Mit `NEXT_PUBLIC_FORMULAR_AKTIV=1` schaltet sich auch der passende Abschnitt
der **Datenschutzerklärung** mit ein (Mailjet, Turnstile, welche Felder,
keine Speicherung). Beide hängen bewusst an derselben Variable, damit der
Rechtstext nie etwas anderes behauptet als die Seite tut.

### Danach noch offen

- **Rate-Limit** über eine WAF-Regel im Dashboard (*Security → WAF → Rate
  limiting rules*) auf `/api/contact`, z. B. 5 Anfragen pro Minute je IP.
  Turnstile fängt das Meiste, aber ein Deckel kostet nichts.
- Anbieteranschrift von Mailjet aus dem abgeschlossenen AVV in die
  Datenschutzerklärung übernehmen — dort steht bewusst noch keine Hausadresse,
  weil sie aus zweiter Hand nicht belegt war.

---

## 3. Auslieferung lokal prüfen

Der Build schreibt nach `./out`. So testet man genau das, was Cloudflare
ausliefert, ohne Anmeldung und ohne Deployment:

```bash
npm run build
npx wrangler dev
```

Dann `http://localhost:8787` aufrufen. Auch die 404-Behandlung lässt sich so
prüfen: ein Aufruf wie `/gibtsnicht/` muss mit Status 404 antworten.

---

## 4. Wichtige Regeln

- **Nie `wrangler deploy`, nie `vercel --prod`.** Immer über `git push`.
- **Vor jeder Session `git pull`.** Lokal muss gleich GitHub sein.
- **Nach UI-Änderungen einmal lokal durchklicken**, bevor gepusht wird.
- **Bilder klein halten.** Der statische Export hat keinen Image-Optimizer,
  jede Datei geht in Originalgröße an den Besucher. Richtwert: 400 px
  Kantenlänge, unter 200 KB.
- **Termine aktualisieren sich nur beim Build.** Der Stichtag ist das
  Build-Datum. Wer vergangene Termine verschwinden lassen will, muss einen
  Deploy auslösen, ein Aufruf im Browser genügt nicht.
- **Geheime Werte niemals committen.** Immer als Variable im
  Cloudflare-Projekt setzen und in `.env.example` ohne Wert dokumentieren.

---

## 5. Nicht mehr verfolgt: Coolify auf Hetzner

Bis Juni 2026 war ein Umzug auf einen eigenen Hetzner-Server mit Coolify
vorbereitet (`output: "standalone"` plus `Dockerfile`). Das ist mit dem
Wechsel auf den statischen Export hinfällig, `Dockerfile` und `.dockerignore`
sind entfernt.

Der Grund für die Entscheidung: die Seite hat keine API-Route, keine
Middleware und keine Datenbank. Ein Server, der laufen und gepatcht werden
muss, wäre für eine statische Seite Aufwand ohne Gegenwert. Sollte später
doch serverseitige Logik dazukommen, ist die Historie der richtige Ort, um den
alten Docker-Aufbau nachzulesen.
