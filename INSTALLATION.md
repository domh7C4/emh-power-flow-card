# Installation – EMH Power Flow Card v1.0.3

## Über Marketplace (Home Assistant 2026.11+)

1. Öffne **Einstellungen → Marketplace → ⋮ → Add from link**.
2. Gib die **öffentliche GitHub-URL** deines Repositories ein.
3. Installiere die Card als Dashboard-Element und lade das Dashboard neu.
4. Füge eine neue Karte mit dem Typ `custom:emh-power-flow-card` hinzu.

Die Card ist zunächst ein **benutzerdefiniertes** Repository, nicht automatisch im allgemeinen Katalog.

## Über HACS

HACS → Benutzerdefinierte Repositories → GitHub-Repository-URL → **Dashboard** → installieren.

## Manuell

- `emh-power-flow-card.js` nach `/config/www/` kopieren.
- Unter **Einstellungen → Dashboards → Ressourcen** als **JavaScript-Modul** eintragen:
  `/local/emh-power-flow-card.js?v=1.0.3`
- Dashboard neu laden. Alle alten EMH Power Flow-Ressourcen entfernen.

## Kontrolle

```javascript
window.EMHPowerFlowVersion // '1.0.2'
customElements.get('emh-power-flow-card') // registrierte Custom-Element-Klasse
```

Bei doppelter Registrierung ausschließlich den aktuellen Ressourcenpfad verwenden. Für Veröffentlichung, Release und Installationsbadge siehe [PUBLISHING.md](PUBLISHING.md).
