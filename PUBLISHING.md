# Veröffentlichung über GitHub und HACS

## 1. Repository erstellen

1. Auf https://github.com/new ein Repository `emh-power-flow-card` erstellen und **Public** auswählen.
2. Den Inhalt dieses ZIP-Pakets **entpackt direkt in das Root-Verzeichnis** hochladen, einschließlich versteckter Dateien: `.github/FUNDING.yml`, `.github/workflows/release.yml`, `.github/workflows/validate.yml`.
3. Darauf achten, dass `README.md`, `LICENSE`, `hacs.json` und `emh-power-flow-card.js` im Root stehen und **nicht** in einem zusätzlichen Unterordner.
4. Branch `main` verwenden. Die JavaScript-Prüfung erfolgt über GitHub Actions.

## 2. PayPal.Me als freiwillige Unterstützung verlinken

- Einen aktiven PayPal.Me-Link unter `https://paypal.me/domh7C4` prüfen.
- Die Datei `.github/FUNDING.yml` enthält diesen Link unter `custom:`. Dadurch kann GitHub den **Sponsor**-Button anzeigen.
- Die README verwendet denselben PayPal.Me-Link als Badge.
- Die Unterstützung ist freiwillig; für die Nutzung der Card ist keine Zahlung erforderlich.

## 3. Marketplace-Badge für genau dein Repository

Die README enthält zunächst einen funktionierenden Badge zu **Marketplace → benutzerdefinierte Repositories**. Für einen direkten **Open Marketplace Repository on My Home Assistant**-Button ersetze den allgemeinen Badge durch diesen Markdown-Block und trage **deinen echten GitHub-Accountnamen** ein:

```markdown
[![Open Marketplace Repository on My Home Assistant](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=DEIN_GITHUB_NAME&repository=emh-power-flow-card&category=plugin)
```

Für ältere HACS-Versionen kann auch die ältere Weiterleitung `hacs_repository` genutzt werden. Die Kategorie für Custom Dashboard-Cards lautet `plugin` (HACS-Oberfläche: Dashboard).

## 4. Version 1.0.1 veröffentlichen

1. Git-Tag `v1.0.1` auf dem aktuellen `main`-Stand erstellen und pushen. Im GitHub-Webinterface unter **Releases → Draft a new release → Choose a tag → Create new tag** möglich.
2. Der Workflow `.github/workflows/release.yml` erstellt einen GitHub Release und hängt `emh-power-flow-card.js` als Download an.
3. Im Reiter **Actions** kontrollieren, ob `Validate` und `Release` erfolgreich sind.
4. Danach die Repository-URL in Marketplace **Add from link** bzw. HACS **Custom repositories** installieren.

**Hinweis:** Ein öffentliches Repository ist für normale Installationen über HACS/Marketplace notwendig. Die Aufnahme in den offiziellen Standardkatalog erfordert zusätzliche Freigabe/Einreichung. Das `v1.0.1`-Tag **nicht** auf ältere JS-Fassungen setzen.

## 5. Lizenz

Die Datei `LICENSE` enthält den offiziellen GPL-3.0-Text. Die Card trägt einen SPDX-Hinweis `GPL-3.0-only` und Copyright `2026 EMH – Effiziente Energielösungen`. GitHub sollte im Seitenbereich die GPL-3.0-Lizenz erkennen.
