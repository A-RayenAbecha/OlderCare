import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import EmergencyRail from "@/components/EmergencyRail";
import { unlockStaffAction } from "@/app/actions";
import { requireReadOnly } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";
import { calculateAge, fullName, genderLabel } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

export default async function ReadOnlyProfilePage({ searchParams }) {
  const session = await requireReadOnly();
  const bundle = await getPatientBundle(session.patientUserId);
  const params = await searchParams;
  const { profile, emergencyContacts } = bundle;
  const age = calculateAge(profile.date_of_birth);

  return (
    <>
      <EmergencyRail />
      <main className="app-shell dashboard-shell readonly-dashboard-shell">
        <div className="topbar dashboard-topbar">
          <strong className="brand brand-with-video"><img className="brand-logo-img" src="/images/oldercare-mark.png" alt="OlderCare" /></strong>
          <div className="bracelet-status-pill"><span /> Bracelet connecté</div>
          <div className="top-actions">
            <span className="profile-pill-link active">Urgence</span>
            <Link className="tiny dashboard-logout" href="/auth/logout">Déconnexion</Link>
            <EmergencyInfoWidget href="/readonly/emergency-info" />
          </div>
        </div>

        <section className="content dashboard-content dashboard-subpage readonly-dashboard-content">
          <header className="dashboard-page-hero readonly-hero">
            <div>
              <div className="step-text">Accès urgence en lecture seule</div>
              <h1>Vue d'urgence</h1>
              <p>Données limitées pour identifier le patient et joindre son contact d'urgence.</p>
            </div>
            <Link className="dashboard-sos-orb" href="/readonly/sos" aria-label="Ouvrir le SOS d'urgence"><span>*</span><strong>SOS</strong></Link>
          </header>

          <div className="dashboard-main-grid readonly-main-grid">
            <section className="dashboard-card dashboard-patient-card">
              <div className="dashboard-identity">
                <div className="dashboard-patient-icon">👤</div>
                <div>
                  <div className="step-text">Identité du patient</div>
                  <h2>{fullName(profile)}</h2>
                  <div className="chip-row">
                    {age && <span className="info-chip">{age} ans</span>}
                    <span className="info-chip">{genderLabel(profile.gender)}</span>
                    <span className="info-chip">{profile.blood_type || "Groupe inconnu"}</span>
                  </div>
                </div>
              </div>
              <Link className="dashboard-primary-btn readonly-sos-action" href="/readonly/sos">⚠ Déclencher SOS</Link>
            </section>

            <section className="dashboard-card dashboard-vitals-card readonly-contact-panel">
              <div className="step-text">Contacts d'urgence</div>
              <div className="dashboard-contact-card">
                {emergencyContacts.length === 0 && <div className="dashboard-contact-body"><div className="contact-avatar">112</div><div><strong>Service d'urgence</strong><span className="tiny muted">Aucun contact personnel enregistré</span><a href="tel:112">112</a></div><a className="call-button" href="tel:112">☎</a></div>}
                {emergencyContacts.length > 0 && <div className="dashboard-contact-list">{emergencyContacts.map((contact) => <div className="dashboard-contact-body" key={contact.id}><div className="contact-avatar">{contact.full_name?.[0] || "SOS"}</div><div><strong>{contact.full_name || "Contact d'urgence"}</strong><span className="trust-badge">{contact.relationship || "Contact de confiance"}</span>{contact.residence && <span className="tiny muted">{contact.residence}</span>}<a href={`tel:${contact.phone_number || 112}`}>{contact.phone_number || "Aucun téléphone"}</a></div><a className="call-button" href={`tel:${contact.phone_number || 112}`}>☎</a></div>)}</div>}
              </div>
            </section>
          </div>

          {session.staffMode && <form action={unlockStaffAction} className="dashboard-card dashboard-form-card readonly-unlock-card">
            <div><div className="step-text">Accès personnel médical</div><h2>Déverrouiller le dossier complet</h2><p>Entrez le code médical autorisé pour ouvrir le tableau de bord patient.</p></div>
            {params?.error && <p className="notice">{params.error}</p>}
            <div className="field"><label>Code d'accès</label><input type="password" name="staffAccessCode" placeholder="accesspatient123" autoComplete="off" required /></div>
            <button className="dashboard-primary-btn">Ouvrir la page patient</button>
          </form>}
        </section>
      </main>
    </>
  );
}
