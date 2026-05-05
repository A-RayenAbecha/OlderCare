import BraceletSuccess from "@/components/BraceletSuccess";
import BottomNav from "@/components/BottomNav";
import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import EmergencyRail from "@/components/EmergencyRail";
import VitalsClient from "@/components/VitalsClient";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";
import { calculateAge, fullName, genderLabel, splitMedicalValues, splitValues } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

export default async function DashboardPage({ searchParams }) {
  const userId = await requirePatient();
  const bundle = await getPatientBundle(userId);
  const params = await searchParams;
  const { profile, history, lifestyle, emergencyContacts, medications, appointments, vaccines } = bundle;
  const age = calculateAge(profile.date_of_birth);
  const allergies = [...splitValues(lifestyle.drug_allergies), ...splitValues(lifestyle.other_allergies)];
  const chronic = splitMedicalValues(history.chronic_conditions);

  return (
    <>
      <EmergencyRail />
      <main className="app-shell dashboard-shell">
        <div className="topbar dashboard-topbar">
          <strong className="brand brand-with-video">
            <img className="brand-logo-img" src="/images/oldercare-logo-transparent.gif" alt="OlderCare" />
          </strong>
          <div className="bracelet-status-pill"><span /> Bracelet connecté</div>
          <div className="top-actions">
            <Link className="profile-pill-link active" href="/dashboard">Accueil</Link>
            <Link className="tiny dashboard-logout" href="/auth/logout">Déconnexion</Link>
            <EmergencyInfoWidget href="/dashboard/emergency-info" />
          </div>
        </div>

        <section className="content dashboard-content dashboard-home-content">
          <header className="dashboard-hero">
            <div>
              <div className="step-text">Espace de santé personnel</div>
              <h1>Bonjour, {fullName(profile)} <span className="dashboard-wave">👋</span></h1>
              <p>Votre dossier médical personnel est prêt.</p>
            </div>
            <div className="dashboard-hero-actions">
              <Link className="dashboard-sos-orb" href="/dashboard/sos" aria-label="Ouvrir le SOS d'urgence">
                <span>*</span>
                <strong>SOS</strong>
              </Link>
              <Link className="dashboard-edit-mini-link dashboard-edit-under-sos" href="/profile/setup?step=1">✎ Modifier les données</Link>
            </div>
          </header>

          <div className="dashboard-main-grid">
            <section className="dashboard-card dashboard-patient-card">
              <div className="dashboard-identity">
                <div className="dashboard-patient-icon">👤</div>
                <div>
                  <div className="step-text">Identité du patient</div>
                  <h2>{fullName(profile)}</h2>
                  <div className="chip-row">
                    {age && <span className="info-chip">{age} ans</span>}
                    <span className="info-chip">{genderLabel(profile.gender)}</span>
                    <span className="info-chip">{profile.nationality || "Nationalité"}</span>
                  </div>
                </div>
              </div>
              <div className="dashboard-action-row is-single">
                <Link className="dashboard-primary-btn" href="/dashboard/profile">▣ Ouvrir le dossier médical</Link>
              </div>
            </section>

            <section className="dashboard-card dashboard-vitals-card">
              <div className="live-vitals-head">
                <div className="step-text">Informations vitales</div>
                <span>En direct</span>
              </div>
              <VitalsClient />
              <div className="dashboard-vital-grid">
                <article className="dashboard-vital danger">
                  <span className="dashboard-vital-icon">♥</span>
                  <div>
                    <small>Allergies</small>
                    <strong>{allergies[0] || "Aucune allergie enregistrée"}</strong>
                  </div>
                </article>
                <article className="dashboard-vital blue">
                  <span className="dashboard-vital-icon">〰</span>
                  <div>
                    <small>Pathologies chroniques</small>
                    <strong>{chronic.join(", ") || "Aucune pathologie enregistrée"}</strong>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <section className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>Aujourd'hui</h2>
              <Link href="/dashboard/appointments">Voir tout</Link>
            </div>
            <div className="dashboard-stat-grid">
              <Link className="dashboard-stat-card" href="/dashboard/medications">
                <span className="dashboard-stat-icon medicine">💊</span>
                <div><strong>{medications.length} médicament</strong><small>{medications[0]?.name || "Aucun traitement en cours"}</small></div>
              </Link>
              <Link className="dashboard-stat-card" href="/dashboard/appointments">
                <span className="dashboard-stat-icon appointment">🗓</span>
                <div><strong>{appointments.length} rendez-vous</strong><small>{appointments[0]?.doctor_name || "Aucun rendez-vous à venir"}</small></div>
              </Link>
              <Link className="dashboard-stat-card" href="/dashboard/vaccines">
                <span className="dashboard-stat-icon vaccine">💉</span>
                <div><strong>{vaccines.length} vaccin</strong><small>{vaccines[0]?.vaccine_name || "Aucun vaccin enregistré"}</small></div>
              </Link>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>Contacts d'urgence</h2>
              <Link href="/profile/setup?step=2">Modifier</Link>
            </div>
            <div className="dashboard-contact-card">
              {emergencyContacts.length === 0 && (
                <div className="dashboard-contact-body">
                  <div className="contact-avatar">112</div>
                  <div><strong>Aucun contact enregistré</strong><Link href="/profile/setup?step=2">Ajouter un contact de confiance</Link></div>
                  <a className="call-button" href="tel:112">☎</a>
                </div>
              )}
              {emergencyContacts.length > 0 && (
                <div className="dashboard-contact-list">
                  {emergencyContacts.map((contact) => (
                    <div className="dashboard-contact-body" key={contact.id}>
                      <div className="contact-avatar">{contact.full_name?.[0] || "S"}</div>
                      <div>
                        <strong>{contact.full_name || "Contact d'urgence"}</strong>
                        <span className="trust-badge">{contact.relationship || "Contact de confiance"}</span>
                        {contact.residence && <span className="tiny muted">{contact.residence}</span>}
                        <a href={`tel:${contact.phone_number || 112}`}>{contact.phone_number || "+216 23 444 194"}</a>
                      </div>
                      <a className="call-button" href={`tel:${contact.phone_number || 112}`}>☎</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
      <BraceletSuccess show={params?.bracelet === "connected"} />
      <BottomNav active="home" />
    </>
  );
}
