import BottomNav from "@/components/BottomNav";
import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import EmergencyRail from "@/components/EmergencyRail";
import { addMedicationAction } from "@/app/actions";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

const frequencyOptions = ["Chaque matin", "Chaque midi", "Chaque soir", "Au coucher", "Matin et soir", "1 fois par jour", "2 fois par jour", "3 fois par jour", "Toutes les 6 heures", "Toutes les 8 heures", "Toutes les 12 heures", "Chaque semaine", "Selon besoin"];

export default async function MedicationsPage() {
  const userId = await requirePatient();
  const { medications } = await getPatientBundle(userId);

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
              <h1>Mes médicaments</h1>
              <p>Ajoutez et mettez à jour les traitements liés au dossier patient.</p>
            </div>
            <Link className="dashboard-sos-orb small" href="/dashboard/sos" aria-label="Ouvrir le SOS d'urgence">
              <span>*</span><strong>SOS</strong>
            </Link>
          </header>

          <section className="dashboard-section">
            <div className="dashboard-section-head"><h2>Nouveau traitement</h2></div>
            <form action={addMedicationAction} className="dashboard-card dashboard-form-card">
              <div className="field"><label>Nom du médicament</label><input name="name" placeholder="Aspirine" required /></div>
              <div className="field"><label>Dosage</label><input name="dosage" placeholder="1 comprimé" required /></div>
              <div className="field"><label>Fréquence</label><select name="frequency" required><option value="">Choisir une fréquence</option>{frequencyOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="field"><label>Date de début</label><input type="date" name="startDate" required /></div>
              <button className="dashboard-primary-btn">Enregistrer</button>
            </form>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>Traitements enregistrés</h2>
              <span className="dashboard-count-pill">{medications.length} total</span>
            </div>
            {medications.length === 0 && <div className="dashboard-empty-card"><strong>Aucun médicament</strong><p>Aucun traitement n'est encore lié à ce dossier.</p></div>}
            <div className="dashboard-record-grid">
              {medications.map((medication) => (
                <article className="dashboard-card dashboard-appointment-card dashboard-medication-display-card" key={medication.id}>
                  <div className="dashboard-date-badge tall">{medication.start_date ? new Date(medication.start_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "-- ---"}</div>
                  <div>
                    <h3>{medication.name || "Médicament"}</h3>
                    <strong>{medication.dosage || "Dosage non renseigné"}</strong>
                    <p>{medication.frequency || "Fréquence non renseignée"}</p>
                    <small>
                      Début : {medication.start_date ? new Date(medication.start_date).toLocaleDateString("fr-FR") : "non renseigné"}
                      {medication.end_date ? ` - Fin : ${new Date(medication.end_date).toLocaleDateString("fr-FR")}` : ""}
                    </small>
                  </div>
                  <span className="dashboard-status-pill">Traitement</span>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <BottomNav active="medications" />
    </>
  );
}
