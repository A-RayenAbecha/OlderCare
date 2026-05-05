import Link from "next/link";
import Script from "next/script";
import { fullName, sosMessage } from "@/lib/format";

export default function EmergencyInfo({ bundle, cancelUrl = "/dashboard", sosUrl = "/dashboard/sos" }) {
  const profile = bundle.profile || {};
  const contacts = bundle.emergencyContacts || [];

  return (
    <main className="emergency-info-page-shell" data-emergency-page>
      <div className="topbar dashboard-topbar emergency-info-topbar">
        <strong className="brand brand-with-video"><video className="brand-video" src="/videos/oldercare-logo.mp4" autoPlay muted loop playsInline aria-label="OlderCare" /></strong>
        <div className="top-actions">
          <Link className="profile-pill-link" href={cancelUrl}>Retour</Link>
          <Link className="emergency-menu-trigger emergency-page-menu" href={sosUrl} aria-label="SOS"><span>*</span></Link>
        </div>
      </div>
      <header className="emergency-info-head emergency-page-head">
        <div>
          <span className="emergency-info-pill" data-location-status>LOCALISATION GPS EN ATTENTE</span>
          <h1>Informations d'urgence</h1>
          <p>Consultez rapidement la localisation, les contacts et les urgences les plus proches.</p>
        </div>
        <Link className="emergency-page-sos" href={sosUrl}><span>*</span><strong>SOS</strong></Link>
      </header>
      <div className="emergency-info-grid">
        <article className="emergency-info-card emergency-location-card">
          <div className="sos-map-grid"></div>
          <div className="emergency-location-content">
            <strong data-location-title>Recherche de votre position</strong>
            <span data-location-coords>Autorisez la localisation dans le navigateur.</span>
            <a data-maps-link href="#" target="_blank" rel="noreferrer">Ouvrir dans Maps</a>
          </div>
        </article>
        <article className="emergency-info-card emergency-identity-card">
          <div><span>Identité patient</span><strong>{fullName(profile)}</strong></div>
          <div className="emergency-blood-card"><span>Groupe sanguin</span><strong>{profile.blood_type || "Inconnu"}</strong></div>
        </article>
        <section className="emergency-info-card emergency-message-card">
          <span>Message SOS</span>
          <p data-sos-message data-base-message={sosMessage(profile)}>{sosMessage(profile)}</p>
        </section>
        <section className="emergency-info-card emergency-nearby-card">
          <div className="emergency-nearby-head"><div><span>Urgences proches</span><strong>5 plus proches de vous</strong></div><b data-nearby-status>En attente GPS</b></div>
          <div className="emergency-nearby-table-wrap">
            <table className="emergency-nearby-table"><thead><tr><th>Lieu</th><th>Distance</th><th>Maps</th></tr></thead><tbody data-nearby-rows><tr><td colSpan="3">Autorisez la localisation pour afficher les urgences proches.</td></tr></tbody></table>
          </div>
        </section>
        <section className="emergency-info-card emergency-contacts-card">
          <span>Contacts d'urgence</span>
          {contacts.length === 0 && <div className="emergency-contact-row"><div><strong>Service d'urgence</strong><small>Aucun contact personnel enregistré</small></div><a href="tel:112">112</a></div>}
          {contacts.map((contact) => <div className="emergency-contact-row" key={contact.id}><div><strong>{contact.full_name || "Contact urgence"}</strong><small>{contact.relationship || "Contact de confiance"}</small>{contact.residence && <small>{contact.residence}</small>}</div><a href={`tel:${contact.phone_number || 112}`}>{contact.phone_number || "112"}</a></div>)}
        </section>
      </div>
      <Script src="/js/emergency-panel.js?v=2" strategy="afterInteractive" />
    </main>
  );
}
