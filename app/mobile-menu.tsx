"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Huelle um das <details>-Burgermenue im Header.
 *
 * Warum ueberhaupt Client-JS fuer ein <details>? Weil das Layout bei der
 * Client-Navigation von Next.js gemountet bleibt. Ein einmal geoeffnetes
 * <details> behaelt sein `open` dann ueber den Seitenwechsel hinweg — das
 * Menue bleibt sichtbar und verdeckt die neue Seite. Genau das war am
 * 21.08.2026 auf allen Mobil- und Tabletgroessen reproduzierbar.
 *
 * Bewusst mit <details> statt eigenem State: ohne JavaScript laesst sich das
 * Menue weiter oeffnen und schliessen. Das JS hier ergaenzt nur drei
 * Verhaltensweisen, die Nutzer von einem Menue erwarten und die <details>
 * von sich aus nicht mitbringt.
 */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const pathname = usePathname();

  // 1. Nach jedem Seitenwechsel schliessen.
  useEffect(() => {
    const el = ref.current;
    if (el) el.open = false;
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 2. Klick ausserhalb schliesst. Zusaetzlich schliesst ein Klick auf einen
    //    Link im Menue selbst — sonst bliebe es bei externen Zielen
    //    (target="_blank", also die Social-Links) offen zurueck, weil sich der
    //    Pfad nicht aendert.
    function beiKlick(ereignis: MouseEvent) {
      if (!el || !el.open) return;
      const ziel = ereignis.target as Node | null;
      if (!ziel) return;
      if (!el.contains(ziel)) {
        el.open = false;
        return;
      }
      if (ziel instanceof Element && ziel.closest("a")) {
        el.open = false;
      }
    }

    // 3. Escape schliesst.
    function beiTaste(ereignis: KeyboardEvent) {
      if (ereignis.key === "Escape" && el?.open) {
        el.open = false;
      }
    }

    document.addEventListener("click", beiKlick);
    document.addEventListener("keydown", beiTaste);
    return () => {
      document.removeEventListener("click", beiKlick);
      document.removeEventListener("keydown", beiTaste);
    };
  }, []);

  return (
    <details className="mobile-menu" ref={ref}>
      {children}
    </details>
  );
}
