export default function EmergencyInfoWidget({ href = "/dashboard/emergency-info" }) {
  return (
    <div className="emergency-info-widget">
      <a className="emergency-menu-trigger" href={href} aria-label="Afficher les informations d'urgence">
        <span aria-hidden="true">...</span>
      </a>
    </div>
  );
}
