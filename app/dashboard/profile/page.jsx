import BottomNav from "@/components/BottomNav";
import EmergencyInfoWidget from "@/components/EmergencyInfoWidget";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";
import { calculateAge, fullName, genderLabel, recordNumber, splitMedicalValues, splitValues } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

export default async function MedicalProfilePage() {
  const userId = await requirePatient();
  const bundle = await getPatientBundle(userId);
  const { profile, history, lifestyle, emergencyContacts, medications } = bundle;
  const age = calculateAge(profile.date_of_birth);
  const allergyItems = [...splitValues(lifestyle.drug_allergies), ...splitValues(lifestyle.other_allergies)];
  const chronicConditionItems = splitMedicalValues(history.chronic_conditions);
  const surgicalProcedureItems = splitMedicalValues(history.surgical_procedures);
  const obGynItems = splitMedicalValues(history.ob_gyn_history);

  return (
    <main className="medical-fiche-shell">
      <header className="medical-mobile-head">
        <Link className="medical-menu-button" href="/dashboard" aria-label="Retour accueil">☰</Link>
        <div>
          <div className="medical-eyebrow">Dossier médical</div>
          <h1>Fiche médicale</h1>
          <p>{fullName(profile)}</p>
        </div>
        <div className="medical-mobile-actions">
          <Link className="medical-sos-square" href="/dashboard/sos" aria-label="SOS"><span>*</span><strong>SOS</strong></Link>
          <EmergencyInfoWidget href="/dashboard/emergency-info" />
        </div>
      </header>

      <header className="medical-fiche-header">
        <div>
          <div className="medical-eyebrow">Dossier médical</div>
          <h1>Fiche médicale</h1>
        </div>
        <div className="medical-header-actions">
          <Link className="medical-outline-action" href="/dashboard">⌂ Tableau de bord</Link>
          <Link className="medical-outline-action" href="/dashboard/profile">↻ Actualiser</Link>
          <Link className="medical-outline-action" href="/auth/logout">Déconnexion</Link>
          <EmergencyInfoWidget href="/dashboard/emergency-info" />
        </div>
      </header>

      <section className="medical-fiche-grid">
        <article className="medical-card medical-identity-card">
          <div className="medical-identity-main">
            <div className="medical-avatar">👤</div>
            <div>
              <div className="medical-card-label">Identité du patient</div>
              <h2>{fullName(profile)}</h2>
              <div className="medical-pill-row">
                {age && <span className="medical-pill">{age} ans</span>}
                <span className="medical-pill">{genderLabel(profile.gender)}</span>
                {profile.nationality && <span className="medical-pill">{profile.nationality}</span>}
              </div>
            </div>
          </div>
          <dl className="medical-info-grid">
            <div><dt>📅 Date de naissance</dt><dd>{profile.date_of_birth ? `${new Date(profile.date_of_birth).toLocaleDateString("fr-FR")}${age ? ` (${age} ans)` : ""}` : "--"}</dd></div>
            <div><dt>◉ Groupe sanguin</dt><dd>{profile.blood_type || "--"}</dd></div>
            <div><dt>📋 N° de dossier</dt><dd>{recordNumber(userId)}</dd></div>
            <div><dt>⚠ Allergies connues</dt><dd>{allergyItems.length ? `Oui (${allergyItems[0]})` : "Non"}</dd></div>
          </dl>
          <div className="medical-file-actions">
            <Link className="medical-outline-action" href="/dashboard/profile/pdf">📄 Télécharger PDF</Link>
          </div>
        </article>

        <article className="medical-card medical-alert-card">
          <div className="medical-card-label danger">Priorité 1 : vital</div>
          <div className="medical-alert-inner">
            <span className="medical-alert-icon">⚠</span>
            <div>
              <h3>Allergies majeures</h3>
              {allergyItems.length === 0 ? <p>Aucune allergie majeure enregistrée</p> : <ul>{allergyItems.map((item) => <li key={item}>{item}</li>)}</ul>}
            </div>
          </div>
        </article>

        <article className="medical-card medical-chronic-card">
          <div className="medical-card-title"><span>〰</span><h3>Pathologies chroniques</h3></div>
          {chronicConditionItems.length === 0 ? <p className="medical-muted">Aucune pathologie chronique enregistrée.</p> : <ul className="medical-condition-list">{chronicConditionItems.map((item, index) => <li key={item} className={index > 5 ? "medical-extra-condition" : ""}>{item}</li>)}</ul>}
          {chronicConditionItems.length > 6 && <button className="medical-more-button" type="button">Voir plus ⌄</button>}
        </article>

        <section className="medical-secondary-grid">
          <article className="medical-card medical-summary-card">
            <span className="medical-summary-icon medicine">💊</span>
            <div>
              <h3>Traitement actuel</h3>
              <strong>{medications.length ? `${medications[0].name}${medications[0].dosage ? ` - ${medications[0].dosage}` : ""}` : "Aucun traitement en cours"}</strong>
              <p>{medications.length ? (medications[0].frequency || "Fréquence non renseignée") : "Aucun médicament ou traitement actif enregistré."}</p>
            </div>
            <Link className="medical-row-arrow" href="/dashboard/medications">›</Link>
          </article>
          <article className="medical-card medical-summary-card">
            <span className="medical-summary-icon surgery">⚒</span>
            <div><h3>Antécédents chirurgicaux</h3><strong>{surgicalProcedureItems.length ? surgicalProcedureItems.join(", ") : "Aucune chirurgie enregistrée"}</strong></div>
            <Link className="medical-row-arrow" href="/profile/setup?step=4&returnTo=/dashboard/profile">›</Link>
          </article>
          <article className="medical-card medical-summary-card">
            <span className="medical-summary-icon obgyn">♀</span>
            <div><h3>Antécédents gynéco-obstétriques</h3><strong>{obGynItems.length ? obGynItems.join("  -  ") : "Aucune donnée enregistrée"}</strong></div>
            <Link className="medical-row-arrow" href="/profile/setup?step=5&returnTo=/dashboard/profile">›</Link>
          </article>
        </section>

        <section className="medical-card medical-contacts-card">
          <div className="medical-contact-head"><h2>Contacts d'urgence</h2><Link href="/profile/setup?step=2&returnTo=/dashboard/profile">Modifier</Link></div>
          <div className="medical-contact-list">
            {emergencyContacts.length === 0 && <div className="medical-contact-row"><div className="medical-contact-avatar">112</div><div><strong>Aucun contact enregistré</strong><span>Service d'urgence par défaut</span></div><a className="medical-contact-phone" href="tel:112">112</a><span className="medical-mail-dash">--</span><a className="medical-call-button" href="tel:112">☎</a></div>}
            {emergencyContacts.map((contact) => (
              <div className="medical-contact-row" key={contact.id}>
                <div className="medical-contact-avatar">{contact.full_name?.[0] || "SOS"}</div>
                <div><strong>{contact.full_name || "Contact urgence"}</strong><span>{contact.relationship || "Contact de confiance"}</span>{contact.residence && <small>{contact.residence}</small>}</div>
                <a className="medical-contact-phone" href={`tel:${contact.phone_number || 112}`}>{contact.phone_number || "112"}</a>
                <span className="medical-mail-dash">✉ --</span>
                <a className="medical-call-button" href={`tel:${contact.phone_number || 112}`}>☎</a>
              </div>
            ))}
          </div>
        </section>
      </section>
      <footer className="medical-confidential">🔒 Données médicales confidentielles et protégées</footer>
      <Link className="medical-floating-edit" href="/profile/setup?step=3&returnTo=/dashboard/profile">✎ Modifier le dossier médical</Link>
      <BottomNav active="home" shared={false} />
    </main>
  );
}
