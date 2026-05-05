import BottomNav from "@/components/BottomNav";
import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import EmergencyRail from "@/components/EmergencyRail";
import { addAppointmentAction } from "@/app/actions";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

export default async function AppointmentsPage() {
  const userId = await requirePatient();
  const { appointments } = await getPatientBundle(userId);

  return (
    <>
      <EmergencyRail />
      <main className="app-shell dashboard-shell">
        <div className="topbar dashboard-topbar">
          <strong className="brand brand-with-video"><img className="brand-logo-img" src="/images/oldercare-logo-transparent.gif" alt="OlderCare" /></strong>
          <div className="bracelet-status-pill"><span /> Bracelet connecté</div>
          <div className="top-actions">
            <Link className="profile-pill-link" href="/dashboard">Accueil</Link>
            <Link className="tiny dashboard-logout" href="/auth/logout">Déconnexion</Link>
            <EmergencyInfoWidget href="/dashboard/emergency-info" />
          </div>
        </div>

        <section className="content dashboard-content dashboard-subpage">
          <header className="dashboard-page-hero">
            <div>
              <div className="step-text">Espace de santé personnel</div>
              <h1>Mes rendez-vous</h1>
              <p>Consultez et ajoutez les visites liées à votre dossier.</p>
            </div>
            <Link className="dashboard-sos-orb small" href="/dashboard/sos" aria-label="Ouvrir le SOS d'urgence">
              <img className="sos-button-img" src="/images/sos-glossy-button.png" alt="" aria-hidden="true" />
            </Link>
          </header>

          <section className="dashboard-section">
            <div className="dashboard-section-head"><h2>Nouveau rendez-vous</h2></div>
            <form action={addAppointmentAction} className="dashboard-card dashboard-form-card">
              <div className="field"><label>Médecin / service</label><input name="doctorName" placeholder="Dr Martin" required /></div>
              <div className="field"><label>Spécialité</label><input name="specialty" placeholder="Cardiologie" required /></div>
              <div className="field"><label>Date et heure</label><input type="datetime-local" name="appointmentDate" required /></div>
              <div className="field"><label>Lieu</label><input name="clinicLocation" placeholder="Clinique / hôpital" required /></div>
              <div className="field"><label>Téléphone</label><input name="phoneContact" placeholder="+216 00 000 000" /></div>
              <button className="dashboard-primary-btn">Ajouter le rendez-vous</button>
            </form>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>Agenda médical</h2>
              <span className="dashboard-count-pill">{appointments.length} total</span>
            </div>
            {appointments.length === 0 && <div className="dashboard-empty-card"><strong>Aucun rendez-vous</strong><p>Aucun rendez-vous n'est encore enregistré.</p></div>}
            <div className="dashboard-record-grid">
              {appointments.map((appointment) => (
                <article className="dashboard-card dashboard-appointment-card" key={appointment.id}>
                  <div className="dashboard-date-badge tall">{appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "-- ---"}</div>
                  <div>
                    <h3>{appointment.doctor_name || "Médecin"}</h3>
                    <strong>{appointment.specialty || "Spécialité"}</strong>
                    <p>{appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" }) : "Date à confirmer"}</p>
                    <small>{appointment.clinic_location || "Lieu à confirmer"}</small>
                    {appointment.phone_contact && <a href={`tel:${appointment.phone_contact}`}>{appointment.phone_contact}</a>}
                  </div>
                  <span className="dashboard-status-pill">{appointment.status === "SCHEDULED" ? "Planifié" : (appointment.status || "Planifié")}</span>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <BottomNav active="appointments" />
    </>
  );
}
