# Changelog

## [1.0.3] – EMH Smart Sync und größere Individual-Symbole

- Optionaler Smart-Sync-Modus: 5 Sekunden zeitliches Synchronisierungsfenster, 2 Sekunden Leistungswertglättung, 30 W Bilanz-Toleranz und 15 Sekunden Sensor-Timeout.
- Alle aktiven Haupt-Leistungsquellen werden aus einem gemeinsamen, zeitlich konsistenten Datensatz angezeigt; kurze asynchrone Updates werden zurückgehalten.
- Bis zu sechs Individual-Leistungen werden unabhängig geglättet; fehlende Individual-Sensoren blockieren die Hauptbilanz nicht.
- Bilanzwarnung bei unabhängig konfiguriertem Hausverbrauchssensor; keine künstliche Bilanzkorrektur.
- Individual-Symbole um 10 % vergrößert auf Desktop und Mobilgeräten.
- Bisheriger Live-Modus unverändert und standardmäßig aktiv, wenn `sync` nicht gesetzt ist.


## [1.0.2] – Vollständige automatische Zweigerkennung

- Alle zu einem Haupt-Knoten gehörenden Entitäten werden für die Sichtbarkeit berücksichtigt, auch Ring-, Warn- und Status-Entitäten.
- Keine manuelle Knoten-deaktivieren-Option; alte `show`-Einträge werden ignoriert.
- Nur bei vollständig leerer Konfiguration eines Energiezweigs verschwinden Kreis, Ring, Verbindung und Animation.
- Editor-Kacheln heißen PV, NETZ, BATTERIE und HOME.
- Funktionalität der bisherigen v1.0.1-Demo und Darstellung beibehalten.


## [1.0.1] – Automatische Sichtbarkeit & reale Browser-Demo

- Haupt-Kacheln im Editor als **PV**, **NETZ**, **BATTERIE**, **HOME** bezeichnet.
- Manuellen Schalter für die Sichtbarkeit dieser vier Haupt-Kacheln entfernt.
- PV-/Netz-/Batteriezweige erscheinen nur bei konfigurierten zugehörigen Entitäten; beim Speicher wird auch die SOC-Entität berücksichtigt.
- HOME nur mit mindestens einer Quelle oder einem direkt konfigurierten Hausverbrauchssensor.
- Verbindungen und Partikel ausgeblendeter Zweige verschwinden mit den Kacheln.
- Neue Karten starten ohne vorausgewählte Entitäten und ohne Individual-Kacheln.
- Interaktive Offline-Demo anhand des unveränderten Karten-Renderings mit fiktiven Zuständen und Original-Screenshots für Desktop und Mobil.

## [1.0.0] – Erste öffentliche Veröffentlichung

- Interaktive Energieflussanzeige mit farbigen Leistungsringen und Hausverbrauchsbilanz.
- Bis zu sechs Individual-Kacheln, Animationen und responsive Darstellung.
- Grafischer Editor, HACS-Unterstützung, GPL-3.0-only und optionale Spendenlinks.
