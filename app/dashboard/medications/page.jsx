import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import EmergencyRail from "@/components/EmergencyRail";
import { addMedicationAction, updateMedicationAction } from "@/app/actions";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";

const frequencyOptions = ["Chaque matin", "Chaque midi", "Chaque soir", "Au coucher", "Matin et soir", "1 fois par jour", "2 fois par jour", "3 fois par jour", "Toutes les 6 heures", "Toutes les 8 heures", "Toutes les 12 heures", "Chaque semaine", "Selon besoin"];

export default async function MedicationsPage() {
  const userId = await requirePatient();
  const { medications } = await getPatientBundle(userId);

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
                <form className="dashboard-card dashboard-edit-card" key={medication.id} action={updateMedicationAction}>
                  <input type="hidden" name="medicationId" value={medication.id} />
                  <div className="dashboard-record-head">
                    <div className="dashboard-date-badge">{medication.start_date ? new Date(medication.start_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) : "--/--"}</div>
                    <div>
                      <h3>{medication.name}</h3>
                      <p>{medication.dosage || ""} - {medication.frequency || ""}</p>
                    </div>
                  </div>
                  <div className="dashboard-edit-fields">
                    <div className="field"><label>Nom</label><input name="name" defaultValue={medication.name} required /></div>
                    <div className="field"><label>Dosage</label><input name="dosage" defaultValue={medication.dosage || ""} required /></div>
                    <div className="field"><label>Fréquence</label><select name="frequency" defaultValue={medication.frequency || ""} required>{frequencyOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                    <div className="field"><label>Début</label><input type="date" name="startDate" defaultValue={medication.start_date ? String(medication.start_date).slice(0, 10) : ""} required /></div>
                    <div className="field"><label>Fin</label><input type="date" name="endDate" defaultValue={medication.end_date ? String(medication.end_date).slice(0, 10) : ""} /></div>
                  </div>
                  <button className="dashboard-outline-btn">Mettre à jour</button>
                </form>
              ))}
            </div>
          </section>
        </section>
      </main>
      <BottomNav active="medications" />
    </>
  );
}
