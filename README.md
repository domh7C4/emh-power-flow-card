# EMH Power Flow Card

[![Version](https://img.shields.io/badge/Version-1.0.1-00b7c8)](./CHANGELOG.md)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Home Assistant](https://img.shields.io/badge/Home_Assistant-Lovelace-41BDF5?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![Sponsor via PayPal](https://img.shields.io/badge/PayPal-Projekt%20unterst%C3%BCtzen-00457C?logo=paypal&logoColor=white)](https://www.paypal.me/domh7C4)

**Visualisierung des Energieflusses in Home Assistant – für Photovoltaik, Stromnetz, Batteriespeicher, Haus und bis zu sechs individuelle Verbraucher.**

Die EMH Power Flow Card ist eine eigenständige Lovelace-Custom-Card. Sie stellt die aktuellen Leistungsflüsse übersichtlich dar, berechnet den Hausverbrauch aus Messwerten und zeigt die geschätzte Herkunft des verbrauchten Stroms. Die Karte besitzt einen grafischen Home-Assistant-Konfigurationseditor und ist für Desktop und Mobilgeräte ausgelegt.

## Vorschau der echten Card (Demo mit simulierten Sensorwerten)

Die folgenden Bilder wurden **direkt aus dem originalen JavaScript der EMH Power Flow Card** im Browser aufgenommen. Es sind keine KI-Grafiken und keine Screenshots privater Home-Assistant-Daten. Die Sensoren und Messwerte werden ausschließlich für diese Demo simuliert.

### Desktop – sechs Individual-Kacheln

![Echte EMH Power Flow Card im Browser, Desktop mit Individual 1 bis 6](assets/real-desktop.png)

### Mobil – sechs Individual-Kacheln

![Echte EMH Power Flow Card im Browser, Mobil mit Individual 1 bis 6](assets/real-mobile.png)

<details>
<summary>Mobil – drei Individual-Kacheln und automatische Anordnung</summary>

![EMH Card mobil mit drei Individual-Kacheln in unterer Rasterreihe](assets/real-mobile-3.png)

</details>

<details>
<summary>Nur PV konfiguriert – Netz- und Batteriezweig automatisch ausgeblendet</summary>

![EMH Card mit PV und Haus, ohne Netz und Batterie](assets/real-only-pv.png)

</details>

**Fiktive Demowerte:** PV 3.200 W, Netzbezug 350 W, Batterieentladung 850 W, SOC 76 % und Hausverbrauch 4.400 W. Die Hausbilanz stimmt dabei mit den Eingangswerten überein.

| Kachel | Fiktive Leistung | Fiktive Zusatzanzeige |
|---|---:|---|
| Individual 1 | 742 W | Waschgang · 38 °C |
| Individual 2 | 1,58 kW | Lädt · 76 % |
| Individual 3 | 215 W | Heizung · Aktiv |
| Individual 4 | 96 W | Warmwasser · 45 °C |
| Individual 5 | 328 W | Wärmepumpe |
| Individual 6 | 240 W | Server · Online |

**[Interaktive Offline-Demo](demo.html):** `demo.html` gemeinsam mit `emh-power-flow-card.js` herunterladen bzw. aus dem Repository-ZIP entpacken und im Browser öffnen. Du kannst zwischen sechs, drei oder vier Individual-Kacheln, einzelnen Energiequellen und einer komplett leeren Konfiguration umschalten. Es ist kein Home-Assistant-Zugang erforderlich.

## Funktionen im Überblick

- **Vier Haupt-Kacheln:** PV oben, Netz links, Batteriespeicher rechts, Haus in der Mitte. Runde Kacheln mit konfigurierbaren Außenringen und Statuszeilen. Nicht konfigurierte Energiezweige werden automatisch ausgeblendet; ein manueller Schalter „Knoten deaktivieren“ ist nicht notwendig.
- **Hausverbrauch:** Automatische Berechnung aus PV-Erzeugung, Netzbezug, Einspeisung, Batterieentladung und Batterieladung; einzelne Individual-Verbraucher können optional abgezogen werden.
- **Energieherkunft:** Dreifarbiger Hausring für PV (Gelb), Netz (Blau) und Batterie (Grün); prozentuale Aufteilung zusätzlich in der optionalen Fußzeile.
- **Netzlastwarnung:** Der Netzring wechselt ab einer konfigurierbaren Lastschwelle auf eine frei einstellbare Warnfarbe.
- **Batterieanzeige:** Ladezustand (SOC) neben dem Batteriesymbol, dynamische Symbolfüllung, optional SOC-abhängige Symbol-/Textfarbe. Die äußere Ringfarbe bleibt separat einstellbar.
- **Auslastungsringe:** Ringwert und Höchstwert wahlweise fest oder über Entitäten, Auswahl zwischen Leistungs- und SOC-Ring für den Speicher sowie einstellbare Ringbreite.
- **Animierter Energiefluss:** Lichtpunkte, Kometen, Impulse oder fließende Striche; Richtungsanzeige für Netz und Batterie. Geschwindigkeit unabhängig von der aktuellen Leistung.
- **Bis zu sechs Individual-Kacheln:** Drei pro Reihe; mobil erscheinen 1–3 Kacheln in der unteren Rasterzeile, ab 4 Kacheln in zwei Zeilen; je Kachel Haupt-Entität, Bezeichnung, Symbol, Zusatzzeile, Einheit, Schwellwerte, Aktiv-Hervorhebung, Multiplikator, Erzeuger-Modus und Navigation.
- **Status und Informationen:** LIVE-/Teilstatus und Hilfe-Button rechts oben. Unter der Grafik optionale Fußzeile mit Energieanteilen und dem fossilen Stromanteil.
- **Grafischer Konfigurationseditor:** Entitätsauswahl, Auswahlfelder, native Farbwähler mit HEX-Eingabe und erweiterbare Bereiche für alle wesentlichen Optionen.
- **Darstellung:** Automatische, helle oder dunkle Farbgebung; transparenter Kartenhintergrund; platzsparende Mobilansicht mit 30 px zusätzlichem oberen Abstand für die Energieflussgrafik; Animation mit optionalem Energiesparmodus.
- **Navigation:** Lovelace-Pfade, Hash-Links (z. B. Popups) und externe HTTP(S)-Adressen.

**Wichtig:** Die Card visualisiert und berechnet Leistungen. Sie steuert keine Wechselrichter oder Wallboxen und begrenzt keine Netzleistung. Die angezeigten Energieherkunftsanteile sind ohne separate Herkunftssensoren eine Näherung.

## Voraussetzungen

- Home Assistant mit Lovelace-Dashboard und den gewünschten Sensor-Entitäten.
- Für den grafischen Editor: Dashboard im UI-Bearbeitungsmodus.
- Optional: HACS bzw. Home Assistant Marketplace für Installation und Updates.
- Popups über Hash-Links erfordern eine passende Popup-Lösung im Dashboard; die Card selbst stellt nur die Navigation bereit.

Es ist keine eigene Home-Assistant-Integration und kein separates Backend erforderlich.

## Installation

### Home Assistant Marketplace (ab Home Assistant 2026.11)

[![Open Marketplace custom repositories on My Home Assistant](https://my.home-assistant.io/badges/marketplace_repositories.svg)](https://my.home-assistant.io/redirect/marketplace_repositories)

Diese Card muss zunächst als **benutzerdefiniertes Repository** hinzugefügt werden. Sie ist dadurch **nicht automatisch im offiziellen Marketplace-Katalog gelistet**.

1. Home Assistant öffnen und zu **Einstellungen → Marketplace → ⋮ → Add from link** wechseln.
2. Die URL des **öffentlichen** GitHub-Repositories `https://github.com/DEIN-GITHUB-NAME/emh-power-flow-card` eingeben (durch deine tatsächliche URL ersetzen).
3. Das Repository installieren, Dashboard neu laden und die Card über den Editor hinzufügen.

> Einen direkten Repository-Installationsbutton wie bei gelisteten Projekten kannst du ebenfalls einbinden. Er benötigt deinen tatsächlichen GitHub-Benutzernamen. Die fertige Vorlage dafür steht in [PUBLISHING.md](PUBLISHING.md).

### HACS (ältere Home-Assistant-Versionen)

HACS → **Benutzerdefinierte Repositories** → öffentliche GitHub-URL eingeben → Kategorie **Dashboard** → installieren. Die Ressource wird üblicherweise über `/hacsfiles/emh-power-flow-card/emh-power-flow-card.js` eingebunden.

### Manuelle Installation

1. `emh-power-flow-card.js` in das Home-Assistant-Verzeichnis `/config/www/` kopieren.
2. Unter **Einstellungen → Dashboards → Ressourcen** diese **JavaScript-Modul**-Ressource anlegen:

   ```text
   /local/emh-power-flow-card.js?v=1.0.1
   ```

3. Das Dashboard vollständig neu laden; bei Problemen mit der Companion-App den Frontend-Cache leeren.

**Wichtig:** Nur **einen** Ressourcen-Eintrag für die Card aktivieren. Alte manuelle Einträge entfernen, wenn die Installation über HACS/Marketplace erfolgt.

### Card verwenden

```yaml
type: custom:emh-power-flow-card
```

Die gewünschten Sensoren und Optionen können anschließend im **grafischen Konfigurationseditor** eingestellt werden. Die Card enthält keine eigenen Messsensoren und benötigt für Live-Werte die Zuordnung deiner Home-Assistant-Entitäten. Die im Abschnitt „Vorschau“ gezeigten Werte stammen ausschließlich aus der Offline-Demo.

## Grundkonfiguration ohne Entitäten

Du kannst die Card zunächst **ohne eingetragene Entitäten** zum Dashboard hinzufügen und anschließend alle Sensoren im grafischen Editor auswählen. Ohne echte Sensorzuordnung zeigt die Card **keine fiktiven Live-Werte**: Die Bilder in der Vorschau wurden direkt aus der Card mit fiktiven Sensorzuständen aufgenommen.

```yaml
type: custom:emh-power-flow-card
theme: auto
min_flow_w: 0
appearance:
  transparent_background: true
  ring_width_percent: 50
nodes:
  grid:
    ring_max: 5000
    alert_threshold_w: 5000
    alert_from_percent: 90
    alert_color: "#f04b54"
  battery:
    ring_source: soc
    use_soc_colors: true
animation:
  style: dots
  speed: 1
  glow: 65
  max_drops: 3
  mobile_power_save: true
  mobile_fps: 25
  mobile_max_particles: 2
display:
  footer: true
  energy_split: true
  fossil: true
  live: true
  info_button: true
```

Die Haupt-Kacheln **PV, NETZ, BATTERIE und HOME** erscheinen automatisch, sobald passende Entitäten ausgewählt sind. Wenn ein Zweig keinerlei zugehörige Entität hat, werden Kachel, Verbindung und Animation ausgeblendet. Der HOME-Knoten erscheint, sobald mindestens eine Quelle oder ein direkter Haussensor konfiguriert ist. Für die Individual-Kacheln erfolgt die Zuordnung jeweils über **Haupt-Entität**. Alle nicht angegebenen Konfigurationsfelder verwenden die Standardwerte der Card.

## Entitäten und Leistungsquellen

In der Einstellungsgruppe **Haupt-Kacheln** werden die Messwerte zugeordnet.

| Feld | Funktion |
|---|---|
| `entities.pv` | Aktuelle PV-Erzeugung |
| `entities.grid_mode` | `separate` für zwei Netz-Entitäten oder `signed` für eine vorzeichenbehaftete Entität |
| `entities.grid_import`, `entities.grid_export` | Netzbezug und Einspeisung, jeweils als positiver Leistungswert |
| `entities.grid_power` | Vorzeichenbehaftete Netzleistung bei `grid_mode: signed` |
| `entities.grid_invert_sign` | Vorzeichen des Netzsensors umkehren |
| `entities.battery_mode` | `separate` oder `signed` für die Batterieleistung |
| `entities.battery_charge`, `entities.battery_discharge` | Positive Lade- bzw. Entladeleistung |
| `entities.battery_power` | Vorzeichenbehaftete Batterieleistung bei `battery_mode: signed` |
| `entities.battery_invert_sign` | Vorzeichen des Batteriesensors umkehren |
| `entities.battery_soc` | Batterieladezustand in Prozent |
| `entities.fossil` | Optionaler prozentualer Anteil fossiler Stromerzeugung für die optionale Fußzeile |
| `entities.pv_to_home` | Optionaler Direktwert PV → Haus |
| `entities.grid_to_home` | Optionaler Direktwert Netz → Haus |
| `entities.battery_to_home` | Optionaler Direktwert Batterie → Haus |

**Vorzeichenkonvention im `signed`-Modus:** Netz `+` = Bezug / `−` = Einspeisung. Batterie `+` = Entladung / `−` = Ladung. Bei anderen Gerätekonventionen `grid_invert_sign` oder `battery_invert_sign` aktivieren.

### Einheiten der Leistungsentitäten

Leistungen werden intern in **Watt (W)** verarbeitet. Die Card kann `W`, `kW` und `MW` aus dem Attribut `unit_of_measurement` automatisch erkennen. Falls ein Sensor keine oder eine fehlerhafte Einheit liefert, kann sie pro Leistungsquelle über den Suffix `_unit` überschrieben werden:

```yaml
entities:
  pv: sensor.beispiel_pv_kw
  pv_unit: kW
  grid_import: sensor.beispiel_netzbezug
  grid_import_unit: auto
```

Dies gilt auch für `grid_export`, `grid_power`, `battery_charge`, `battery_discharge`, `battery_power`, `pv_to_home`, `grid_to_home` und `battery_to_home`. `auto` ist die Standardwahl. **Einheitenüberschreibung bedeutet Interpretation des Sensorwerts, keine Umrechnung der physischen Messung im Sensor.**

### Hausverbrauch und Herkunftsanteile

Die Grundberechnung lautet:

```text
Hausverbrauch (W) = PV-Erzeugung + Netzbezug + Batterieentladung
                    − Netzeinspeisung − Batterieladung
                    − explizit konfigurierte Individual-Abzüge
```

Negative Ergebnisse werden auf null begrenzt. Ist ein notwendiger Sensorwert nicht verfügbar, wird die Hausbilanz gegebenenfalls als `–` dargestellt. Die **Nulltoleranz betrifft nur die Darstellung**, nicht die zugrunde liegende Berechnung.

Für die farblichen Anteile am Hausring werden PV, Netz und Batterie unter Berücksichtigung von Export und Batterieladung abgeschätzt. Wenn alle drei optionalen Sensoren `pv_to_home`, `grid_to_home` und `battery_to_home` gültige Werte liefern, werden diese für die Herkunftsaufteilung benutzt. Die Anteile werden für die Anzeige auf 100 % normiert. Durch fehlende Strompfadmessungen, zeitliche Messabweichungen und unterschiedliche Aktualisierungsintervalle können die angezeigten Herkunftsanteile von der physikalischen Aufteilung abweichen.

**Achtung bei Individual-Abzügen:** Nur Werte abziehen, die in deiner Gesamtbilanz tatsächlich zusätzlich enthalten sind und getrennt dargestellt werden sollen. Sonst wird Verbrauch doppelt berücksichtigt. Die Card addiert Individual-Verbraucher nicht automatisch zum Hauswert.

## Haupt-Kacheln, Außenringe und Farben

`nodes.pv`, `nodes.grid`, `nodes.battery` und `nodes.home` steuern die vier runden Haupt-Kacheln. Die Bereiche im grafischen Editor heißen **PV**, **NETZ**, **BATTERIE** und **HOME**. Welche Kacheln angezeigt werden, hängt automatisch von den konfigurierten Entitäten ab:

| Option | Beschreibung |
|---|---|
| `name` | Angezeigter Name bzw. zugängliche Bezeichnung |
| `icon` | Symbol, z. B. `mdi:solar-power` oder `mdi:home` |
| `color` | Hauptfarbe im HEX-Format `#RRGGBB`; Auswahl auch per Farbwähler |
| `popup` | Popup-Hash, interner Lovelace-Pfad oder externe URL |
| `zero_tolerance_w` | Werte unter dieser Leistung werden als 0 W angezeigt |

### Leistungsringe für PV, Netz und Batterie

| Option | Beschreibung |
|---|---|
| `ring_entity` | Sensor für die Füllung des Rings |
| `ring_max_mode` | `fixed` (fester Maximalwert) oder `entity` (Maximalwert aus Entität) |
| `ring_max` | Fester Wert für 100 % Füllung |
| `ring_max_entity` | Entität für den 100-%-Referenzwert |
| `ring_unit` | Einheit des festen Ringmaximums: `W`, `kW`, bei passender Messgröße auch `%` |
| `ring_max_entity_unit` | Einheit der Entität für das Ringmaximum |
| `ring_value_unit` | Einheit des Ringwerts, falls Home Assistant keine passende Einheit meldet |

Mit `appearance.ring_width_percent` wird die Ringbreite relativ zum ursprünglichen Standard bestimmt. `50` bedeutet halbe Breite; zulässige Werte werden intern begrenzt.

**Batteriespezifisch:**

- `nodes.battery.ring_source`: `soc` für Ladezustand, `power` für Lade-/Entladeleistung, `custom` für eine eigene Ring-Entität.
- `nodes.battery.icon_style`: `horizontal` für ein liegendes Symbol mit SOC-Füllung oder `classic` für das eingestellte MDI-Symbol.
- `nodes.battery.use_soc_colors`: Färbt optional **nur Symbol und SOC-Prozenttext** nach dem Ladezustand. Die Außenringfarbe bleibt unter `nodes.battery.color` fest konfiguriert.
- `nodes.battery.power_ring_max_mode`: `fixed` oder `entity` bei `ring_source: power`.
- `nodes.battery.power_ring_max`, `power_ring_unit`: Referenzleistung im festen Modus.
- `nodes.battery.power_ring_max_entity`, `power_ring_max_entity_unit`: Referenzleistung aus Entität.

Beim Ladeleistungsring wird die Richtung durch eine invertierte Füllrichtung berücksichtigt. Der Hausring zeigt keine Kapazitätsauslastung, sondern die drei relativen Energiequellen.

### Netzlastwarnung

Unter `nodes.grid` lässt sich ein Warnring konfigurieren:

```yaml
nodes:
  grid:
    alert_entity: sensor.beispiel_netzbezug
    alert_threshold_mode: fixed
    alert_threshold_w: 5000
    alert_threshold_unit: W
    alert_from_percent: 90
    alert_color: "#f04b54"
```

- `alert_entity`: Messwert für die Warnung.
- `alert_threshold_mode`: Fester Grenzwert `fixed` oder dynamische Entität `entity`.
- `alert_threshold_w` / `alert_threshold_unit`: Fester Grenzwert und Einheit.
- `alert_threshold_entity` / `alert_threshold_entity_unit`: Dynamischer Grenzwert und dessen Einheit.
- `alert_from_percent`: Auslösung ab diesem Anteil des Grenzwerts, z. B. 90 %.
- `alert_color`: Frei wählbare Warnringfarbe (Farbwähler + HEX).

Die Warnfarbe dient ausschließlich als Anzeige. Es erfolgt **keine automatische Leistungsbegrenzung**.

### Zusatzzeilen der Haupt-Kacheln

PV, Netz und Batterie besitzen eine zusätzliche Statuszeile. Für `nodes.<kachel>.secondary_mode` stehen zur Verfügung:

- `default`: Standardtext aus der erkannten Situation, z. B. „Erzeugung“, „Einspeisung“, „Lädt“ oder „Entlädt“.
- `text`: Eigener Text in `secondary_text`.
- `state`: Textzustand einer Entität aus `secondary_entity`.
- `entity`: Numerischer Wert einer `secondary_entity`, wahlweise mit `secondary_label` und `secondary_unit`.

Das Haus zeigt standardmäßig „Gesamtverbrauch“ bzw. einen Hinweis auf aktivierte Individual-Abzüge.

## Individual-Kacheln (0 bis 6)

Unterhalb des Energieflusses können bis zu sechs Kacheln dargestellt werden, auf Desktop und Mobil in **drei Spalten pro Reihe**. **Mobil** erscheinen bei **1–3 eingeblendeten Kacheln** die Kacheln in der **unteren Rasterzeile (Plätze 4–6)**; die obere Reihe bleibt bewusst frei. Zusätzlich rückt die **Energieflussgrafik um eine halbe Individual-Kachelhöhe** nach unten, ohne die Position der Individual-Kacheln zu verändern. Ab **4 eingeblendeten Kacheln** werden wie bisher beide Reihen belegt. Ausgeblendete Kacheln (`show: false`) zählen dabei nicht. Auf dem Desktop bleiben alle Kacheln in der normalen Reihenfolge ohne leere erste Reihe. Die Reihenfolge ist im Editor änderbar. Typische Anwendungen: Wohnungszähler, Wallboxen, Heizstäbe, Warmwasser, Wärmepumpe, Server oder weitere Verbraucher.

```yaml
individual:
  - id: individual_1
    name: Individual 1
    icon: mdi:washing-machine
    secondary_mode: text
    secondary_text: Waschgang
    show: true
  - id: individual_2
    name: Individual 2
    icon: mdi:car-electric
    secondary_mode: text
    secondary_text: Lädt
    show: true
  - id: individual_3
    name: Individual 3
    icon: mdi:thermometer
    secondary_mode: text
    secondary_text: Heizung
    show: true
  - id: individual_4
    name: Individual 4
    icon: mdi:snowflake
    secondary_mode: text
    secondary_text: Kühlung
    show: true
  - id: individual_5
    name: Individual 5
    icon: mdi:monitor
    secondary_mode: text
    secondary_text: Standby
    show: true
  - id: individual_6
    name: Individual 6
    icon: mdi:calendar
    secondary_mode: text
    secondary_text: Energie
    show: true
```

**Wichtig:** Dieses Beispiel definiert nur die sechs Kacheln und ihre Beschriftungen. Für Leistungswerte musst du im Editor jeder Kachel eine **Haupt-Entität** zuordnen. Die Werte in den Vorschaubildern sind erfunden und werden vom obigen YAML **nicht simuliert**.

| Option | Funktion |
|---|---|
| `id` | Eindeutige technische ID, für die Navigation und Aktualisierung |
| `name` | Name der Kachel |
| `entity` | Haupt-Entität mit dem Leistungswert |
| `entity_unit` | `auto`, `W`, `kW` oder `MW` für die Haupt-Entität |
| `icon` | MDI-Symbol |
| `popup` | Popup-Hash / Link |
| `secondary_mode` | `text`, `state` oder `entity` |
| `secondary_text` | Fester Zusatztext; auch Rückfalltext bei bestimmten Modi |
| `secondary_entity` | Entität für Zusatzwert oder Zustand |
| `secondary_label` | Beschriftung des Zusatzwerts |
| `secondary_unit` | Optionale Einheit des Zusatzwerts, leer = Sensor-Einheit verwenden |
| `secondary_decimals` | Dezimalstellen eines numerischen Zusatzwerts (0 bis 3) |
| `secondary_show_above_enabled` | Zusatzzeile erst oberhalb des Leistungsschwellwerts anzeigen |
| `secondary_threshold_w` | Leistungsschwelle in Watt; auch Basis für Aktiv-Hervorhebung |
| `highlight_active_enabled` | Leucht-/Schatteneffekt ab der Schwellleistung aktivieren |
| `highlight_active_color` | HEX-Farbe für die Aktiv-Hervorhebung |
| `multiplier` | Multiplikationsfaktor für den Hauptwert, Standard 1 |
| `reverse_flow` | Als Erzeuger kennzeichnen; wird nicht als Individual-Abzug des Hausverbrauchs berücksichtigt (keine eigene Flussleitung) |
| `deduct_from_home` | Individual-Leistung ausdrücklich von der berechneten Hausleistung abziehen |
| `zero_tolerance_w` | Anzeigewerte kleiner als die Toleranz auf 0 W setzen |
| `show` | Kachel ein-/ausblenden |

Für `secondary_mode: state` besitzt die Card eine integrierte Zuordnung häufiger Zustände, z. B. `on` → „Ein“, `off` → „Aus“. Mit `secondary_state_map` kann über YAML eine eigene Zustandszuordnung hinterlegt werden; im grafischen Editor ist dafür kein eigenes Eingabefeld vorhanden.

## Animation und Mobil-Performance

Die Flusswege zwischen PV, Netz, Batterie und Haus werden animiert, wenn Leistung oberhalb des eingestellten Schwellenwerts fließt. Bei Netz und Batterie wird die Richtung anhand der Vorzeichen berücksichtigt.

| Option | Funktion / übliche Werte |
|---|---|
| `animation.style` | `dots` (Lichtpunkte), `comet` (Kometen), `pulse` (Impulse), `dash` (fließende Striche) |
| `animation.speed` | Geschwindigkeit von 0 bis 3; **0 stoppt die Animation**; von der Leistung unabhängig |
| `animation.glow` | Leuchtstärke (0–100) |
| `animation.max_drops` | Maximale Anzahl bewegter Partikel (1–5) |
| `animation.mobile_power_save` | Mobilen Energiesparmodus aktivieren |
| `animation.mobile_fps` | Maximale mobile Bildrate, z. B. 25 FPS |
| `animation.mobile_max_particles` | Maximale Partikelzahl je Leitung auf Mobilgeräten |
| `min_flow_w` | Energieflussanimation erst ab dieser Leistung in Watt |

Der Energiesparmodus begrenzt Mobil-Bildrate und Partikelzahl, reduziert aufwendige Effekte und stoppt die Animation in nicht sichtbaren Ansichten. Die Geschwindigkeit auf einem einzelnen Pfad bleibt unabhängig vom Leistungswert. Bei Problemen mit einer schwachen Companion-App-Konfiguration können etwa `mobile_fps: 20` und `mobile_max_particles: 1` sinnvoll sein.

## Darstellung, Fußzeile und Hilfe

| Option | Beschreibung |
|---|---|
| `theme` | `auto`, `dark`, `light` |
| `appearance.transparent_background` | Halbtransparenter Kartenhintergrund passend zum Home-Assistant-Theme |
| `appearance.ring_width_percent` | Relative Dicke der Außenringe; Standard 50 % |
| `display.footer` | Optionale Fußzeile unter der Energieflussgrafik anzeigen |
| `display.energy_split` | Anteile von PV, Netz und Speicher in der Fußzeile anzeigen |
| `display.live` | LIVE-/Teilweise-Status rechts oben anzeigen |
| `display.fossil` | Fossilen Stromanteil in der Fußzeile anzeigen, sofern ein Sensor vorhanden ist |
| `display.info_button` | Hilfe-Button `?` anzeigen |
| `info.title` | Überschrift des Hilfe-Popups |
| `info.description` | Eigener mehrzeiliger Hilfetext |
| `info.show_default_guide` | Standarderklärung der Symbole, Ringe und Farben ein-/ausblenden |

Die Card besitzt keinen Titelbereich. Der LIVE-/Teilweise-Status und die Hilfe-Schaltfläche stehen rechts oben. Die konfigurierbare Fußzeile befindet sich unterhalb der Grafik und zeigt Energieanteile sowie optional den fossilen Stromanteil.

### Navigation

Für PV/Netz/Batterie/Haus und jede Individual-Kachel kann `popup` gesetzt werden:

- `"#pop-up-pv"` – Hash-Navigation für passende Popup-Karten.
- `"/energy"` – interner Dashboard-/Home-Assistant-Pfad.
- `"https://www.example.com"` – externe Webseite in einem neuen Tab.

Die Karte ersetzt keine Popup-Integration. Hash-Navigation hängt davon ab, wie das Dashboard den Hash interpretiert.

## Technische Hinweise

- Registrierung: `custom:emh-power-flow-card`; grafischer Editor: `emh-power-flow-card-editor`.
- Leistungswerte und Berechnungen: Watt, Anzeige in W bzw. bei größeren Werten in kW.
- Sensorausfälle: fehlende Messwerte werden nicht stillschweigend als echte Nullen behandelt.
- Ursprungsring: Anteile werden normiert und als zusammenhängende SVG-Bögen ausgegeben.
- Außenringe: Einheit, Maximum und Farbgebung für jede Haupt-Kachel separat konfigurierbar.
- Frontend: Die gesamte Card wird über eine einzige JavaScript-Datei ausgeliefert; keine zusätzlichen Laufzeitdateien erforderlich.
- Sämtliche `sensor.beispiel_*`-Namen in den YAML-Ausschnitten sind **Platzhalter**. Sie sind keine realen Home-Assistant-Entitäten und müssen für eine funktionierende Live-Anzeige durch eigene Sensoren ersetzt werden.

## Open Source, Lizenz und Unterstützung

Der Quellcode ist unter der **GNU General Public License, Version 3 (GPL-3.0-only)** veröffentlicht. Die Lizenzbedingungen stehen in [LICENSE](LICENSE). Weitergabe und Änderung sind im Rahmen dieser Lizenz erlaubt; für weitergegebene abgeleitete Werke gelten die GPL-Vorgaben.

## Unterstützung / Sponsor

Wenn dir dieses Projekt hilft, kannst du die Weiterentwicklung freiwillig unterstützen:

[![PayPal](https://img.shields.io/badge/PayPal-Spenden-00457C?logo=paypal&logoColor=white)](https://www.paypal.me/domh7C4)

Die Installationsschritte für dein öffentliches Repository, den direkten Marketplace-Badge und den GitHub-Release-Workflow findest du in [PUBLISHING.md](PUBLISHING.md).

**EMH** · Home Assistant · Photovoltaik · Energiemonitoring
