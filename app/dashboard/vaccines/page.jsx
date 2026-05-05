import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import EmergencyRail from "@/components/EmergencyRail";
import { addVaccineAction } from "@/app/actions";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";

export default async function VaccinesPage() {
  const userId = await requirePatient();
  const { vaccines } = await getPatientBundle(userId);

  return (
    <>
      <EmergencyRail />
      <main className="app-shell dashboard-shell">
        <div className="topbar dashboard-topbar">
          <strong className="brand brand-with-video"><video className="brand-video" src="/videos/oldercare-logo.mp4" autoPlay muted loop playsInline aria-label="OlderCare" /></strong>
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
              <h1>Mes vaccins</h1>
              <p>Remplissez et consultez l'historique vaccinal du patient.</p>
            </div>
            <Link className="dashboard-sos-orb small" href="/dashboard/sos" aria-label="Ouvrir le SOS d'urgence">
              <span>*</span><strong>SOS</strong>
            </Link>
          </header>

          <section className="dashboard-section">
            <div className="dashboard-section-head"><h2>Ajouter un vaccin</h2></div>
            <form action={addVaccineAction} className="dashboard-card dashboard-form-card">
              <div className="field"><label>Nom du vaccin</label><input name="vaccineName" required /></div>
              <div className="field"><label>Date administrée</label><input type="date" name="dateAdministered" required /></div>
              <div className="field"><label>Lieu</label><input name="location" required /></div>
              <div className="field"><label>Prochain rappel</label><input type="date" name="nextReminderDate" /></div>
              <button className="dashboard-primary-btn">Enregistrer</button>
            </form>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>Historique vaccinal</h2>
              <span className="dashboard-count-pill">{vaccines.length} total</span>
            </div>
            {vaccines.length === 0 && <div className="dashboard-empty-card"><strong>Aucun vaccin</strong><p>Aucun vaccin n'est encore enregistré.</p></div>}
            <div className="dashboard-record-grid">
              {vaccines.map((vaccine) => (
                <article className="dashboard-card dashboard-vaccine-card" key={vaccine.id}>
                  <div className="dashboard-stat-icon vaccine">💉</div>
                  <div>
                    <h3>{vaccine.vaccine_name}</h3>
                    <p>{vaccine.date_administered ? new Date(vaccine.date_administered).toISOString().slice(0, 10) : "Date inconnue"}</p>
                    <small>{vaccine.location || "Lieu non renseigné"}</small>
                  </div>
                  {vaccine.next_reminder_date && <span className="dashboard-status-pill">Rappel {new Date(vaccine.next_reminder_date).toLocaleDateString("fr-FR")}</span>}
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <BottomNav active="vaccines" />
    </>
  );
}
