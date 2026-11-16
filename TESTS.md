# Tests – EMH Power Flow Card v1.0.3

Verifiziert mit `node --check`, headless Chromium (Playwright) und der realen `emh-power-flow-card.js`:

- Automatische Zweigsichtbarkeit ohne Sensor, PV-only, Netz-only, Batterie-SOC-only, Direkt-Hauswert und vollständige Zuordnung.
- Auch ältere `nodes.*.show:false`-Angaben deaktivieren keine Haupt-Kacheln mehr.
- Grafischer Editor: Bereiche PV / NETZ / BATTERIE / HOME; keine manuellen Show-Schalter.
- Desktop 1160 px und Mobile 390 px mit 3, 4 und 6 Individual-Kacheln.
- Hausbilanz 3200 W PV + 350 W Netz + 850 W Batterieentladung = 4400 W.
- Keine JavaScript-Fehler beim Rendering der Beispiel-Screenshots.
- `demo-standalone.html` enthält das tatsächliche Card-JavaScript und virtuelle Demo-Entitäten für eine Offline-Vorschau.

Nicht getestet: tatsächliches HACS-Installieren im Home Assistant des Anwenders.

## Zusätzliche Tests v1.0.3

- 17 Konfigurationsfälle in Chromium: vollständig leer, Legacy-Knoten-Schalter, PV-only, Netzbezug, vorzeichenbehaftetes Netz, Batterie nur SOC, Batterieentladung, Batterie-Ring, Batterie-Ringmaximum, Batterie-Leistungsmaximum, Batterie-Zusatzwert, PV-Zusatzwert, Netz-Warnung, Haus-only, vollständige Energiebilanz, ungültige ID, rein dekorative Werte.
- Nur aktive Knoten besitzen SVG-Kreise, Ringe und Verbindungswege.
- `nodes.pv.show`, `nodes.grid.show`, `nodes.battery.show`, `nodes.home.show` existieren nicht als Editor-Felder.
- Ohne sichtbaren Haupt-Energiefluss bleibt bei 1–3 Individual-Kacheln keine unbenutzte mobile obere Rasterzeile reserviert.
- `node --check` und `customElements.get` geprüft.

## Neue Tests v1.0.3

- Syntaxprüfung von `emh-power-flow-card.js` mit Node.js.
- Tatsächliche Browserregistrierung `custom:emh-power-flow-card` und des Editors mit Chromium.
- Erstes kohärentes Haupt-Snapshot korrekt: 3.500 W PV + 200 W Netz + 800 W Batterie = 4.500 W Haus.
- Ein neuer Sensorwert allein führt zunächst zum Status `WARTET`, die Hausbilanz bleibt unverändert.
- Nach 5 Sekunden Abgleich erfolgt die Übernahme mit 2-Sekunden-Glättung (`1.000 → 2.000 W` führt zu einer geglätteten Anzeige).
- Veraltete Werte werden nach Timeout mit `–` dargestellt und mit `VERALTET` gekennzeichnet.
- Unabhängiger Hauswert +70 W über berechneter Bilanz führt bei 30-W-Toleranz zu `ABWEICHUNG`.
- Veralteter Individual-Sensor zeigt `–`, während die Hauptbilanz `SYNC` bleibt.
- `sync.mode: sync` übernimmt die Messwerte ohne Glättung; ohne Sync bleibt der bisherige Live-Modus aktiv.
- Individual-Icons: Desktop 22 px, Mobil 19,8 px (+10 % gegenüber 20/18 px).
- Keinerlei JavaScript-Fehler in den Testfällen.

Diese Tests sind Browser-Simulationen, keine Messung der Sensor-Latenz in einem laufenden Home-Assistant-System.
