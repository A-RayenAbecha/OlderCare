export default function EmergencyRail() {
  return (
    <aside className="emergency-rail" aria-label="Numéros d'urgence">
      <div className="emergency-rail-head">
        <span>SOS</span>
        <div>
          <strong>Numéros utiles</strong>
          <small>Urgence rapide</small>
        </div>
      </div>
      <a className="emergency-rail-call is-global" href="tel:112">
        <span className="emergency-rail-icon">☎<small>112</small></span>
        <span><strong>Numéro d'urgence international</strong><small>Partout dans le monde</small></span>
      </a>
      <a className="emergency-rail-call is-medical" href="tel:190">
        <span className="emergency-rail-icon">💼</span>
        <span><strong>190</strong><small>Médecin urgentiste<br />Tunisie</small></span>
      </a>
      <a className="emergency-rail-call is-police" href="tel:197">
        <span className="emergency-rail-icon">👮</span>
        <span><strong>197</strong><small>Police<br />Tunisie</small></span>
      </a>
      <a className="emergency-rail-call is-fire" href="tel:198">
        <span className="emergency-rail-icon">🚒</span>
        <span><strong>198</strong><small>Pompiers<br />Tunisie</small></span>
      </a>
      <div className="emergency-rail-note">
        <span>🛡</span>
        <strong>Votre sécurité, notre priorité</strong>
        <small>Accédez rapidement aux services d'urgence quand vous en avez besoin.</small>
      </div>
    </aside>
  );
}
