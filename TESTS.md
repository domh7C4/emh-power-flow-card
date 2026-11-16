# Tests – EMH Power Flow Card v1.0.2

Verifiziert mit `node --check`, headless Chromium (Playwright) und der realen `emh-power-flow-card.js`:

- Automatische Zweigsichtbarkeit ohne Sensor, PV-only, Netz-only, Batterie-SOC-only, Direkt-Hauswert und vollständige Zuordnung.
- Auch ältere `nodes.*.show:false`-Angaben deaktivieren keine Haupt-Kacheln mehr.
- Grafischer Editor: Bereiche PV / NETZ / BATTERIE / HOME; keine manuellen Show-Schalter.
- Desktop 1160 px und Mobile 390 px mit 3, 4 und 6 Individual-Kacheln.
- Hausbilanz 3200 W PV + 350 W Netz + 850 W Batterieentladung = 4400 W.
- Keine JavaScript-Fehler beim Rendering der Beispiel-Screenshots.
- `demo-standalone.html` enthält das tatsächliche Card-JavaScript und virtuelle Demo-Entitäten für eine Offline-Vorschau.

Nicht getestet: tatsächliches HACS-Installieren im Home Assistant des Anwenders.

## Zusätzliche Tests v1.0.2

- 17 Konfigurationsfälle in Chromium: vollständig leer, Legacy-Knoten-Schalter, PV-only, Netzbezug, vorzeichenbehaftetes Netz, Batterie nur SOC, Batterieentladung, Batterie-Ring, Batterie-Ringmaximum, Batterie-Leistungsmaximum, Batterie-Zusatzwert, PV-Zusatzwert, Netz-Warnung, Haus-only, vollständige Energiebilanz, ungültige ID, rein dekorative Werte.
- Nur aktive Knoten besitzen SVG-Kreise, Ringe und Verbindungswege.
- `nodes.pv.show`, `nodes.grid.show`, `nodes.battery.show`, `nodes.home.show` existieren nicht als Editor-Felder.
- Ohne sichtbaren Haupt-Energiefluss bleibt bei 1–3 Individual-Kacheln keine unbenutzte mobile obere Rasterzeile reserviert.
- `node --check` und `customElements.get` geprüft.
