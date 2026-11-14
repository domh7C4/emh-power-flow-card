# Technische Prüfung – Public Release v1.0.0

Die Release-Version basiert funktional auf der zuvor getesteten Card und enthält keine Änderungen an der Energiefluss- oder Layoutlogik.

Automatisch geprüft:
- JavaScript-Syntax über `node --check`.
- Registrierung `customElements.get('emh-power-flow-card')`.
- Erhalt des responsive Layouts (Browser-Test mit 1–6 Individual-Kacheln).
- Release-Version `window.EMHPowerFlowVersion === '1.0.0'`.
- HACS-Metadaten (`hacs.json`), Lizenz, Sponsoring-Konfiguration und Release-Dateiname.

Die tatsächliche Installation im Home Assistant Marketplace/HACS ist erst nach dem manuellen GitHub-Upload prüfbar.
