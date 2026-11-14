# Installation – EMH Power Flow Card 1.0.0

## GitHub-Repository selbst veröffentlichen

1. Auf https://github.com/new ein öffentliches Repository `emh-power-flow-card` erstellen (ohne automatisch generierte README).
2. Dieses ZIP **entpacken** und den Inhalt direkt im Stammverzeichnis auf GitHub hochladen. `hacs.json`, `README.md` und `emh-power-flow-card.js` müssen im Root liegen.
3. Den Ordner `.github/workflows/` einschließlich der Dateien `release.yml` und `validate.yml` mit hochladen. Bei einem Web-Upload kann der versteckte Ordner leicht übersehen werden.
4. Den Branch `main` benutzen. In GitHub unter *Actions* die Syntaxprüfung kontrollieren.
5. Vor einer öffentlichen Open-Source-Freigabe eine Lizenz auswählen und eine `LICENSE`-Datei ergänzen.
6. Auf GitHub einen Tag **`v1.0.0`** setzen. Der Workflow veröffentlicht dann einen Release mit der Ressource `emh-power-flow-card.js`.

## Über Marketplace / HACS installieren

Home Assistant 2026.11+: Einstellungen → Marketplace → **Add from link** → GitHub-Repo-URL → installieren.
Ältere HACS-Version: HACS → ⋮ → **Custom repositories** → URL → Kategorie **Dashboard** → installieren.

Bei der ersten Installation bleibt der Kartentyp **`custom:emh-power-flow-card`**. HACS/Marketplace registriert die JavaScript-Datei bei den unterstützten Dashboardtypen normalerweise automatisch.

## Manuelle Installation

`emh-power-flow-card.js` nach `/config/www/` kopieren, JavaScript-Modul unter Einstellungen → Dashboards → Ressourcen hinzufügen:

`/local/emh-power-flow-card.js?v=1.0.0`

Nicht zusätzlich die gleiche Ressource über HACS/Marketplace laden. Die früheren versionierten Ressourcenpfade der EMH Power Flow Card im Dashboard entfernen, sonst registriert sich die Karte möglicherweise doppelt oder eine ältere Version gewinnt.

## Verifikation

Im Browser `F12` → Konsole: `window.EMHPowerFlowVersion` sollte `"1.0.0"` ergeben. `customElements.get('emh-power-flow-card')` muss die registrierte Klasse zurückgeben.
