import Script from "next/script";
import { saveContactAction, saveIdentityAction } from "@/app/actions";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";
import { defaultSosMessage, splitValues } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

const nationalities = ["Tunisie", "Algérie", "Maroc", "France", "Italie", "Allemagne", "Espagne", "États-Unis", "Canada", "Albanie", "Autre"];
const bloodTypes = ["Inconnu", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const coverage = ["CNAM", "CNSS", "Privée", "Aucune"];
const tunisianPhonePattern = "^\\+216\\s?[0-9]{2}\\s?[0-9]{3}\\s?[0-9]{3}$";
const tunisianPhoneTitle = "Format attendu : +216 23 444 194";

function SetupTop({ title = "Profil de santé" }) {
  return <div className="topbar"><button className="icon-button" type="button">←</button><strong className="top-title">{title}</strong><button className="icon-button">⌘</button></div>;
}

function SetupScripts({ id, code }) {
  return <><Script src="/js/main.js" strategy="afterInteractive" /><Script id={`${id}-script`} strategy="afterInteractive">{code}</Script></>;
}

export default async function SetupPage({ searchParams }) {
  const userId = await requirePatient();
  const bundle = await getPatientBundle(userId);
  const params = await searchParams;
  const step = Number(params?.step || 1);
  const { profile, contact, history, lifestyle, emergencyContacts } = bundle;
  const paddedContacts = [...emergencyContacts];
  while (paddedContacts.length < 3) paddedContacts.push({});

  if (step === 2) {
    return (
      <main className="app-shell">
        <SetupTop />
        <section className="content">
          <h1 className="title-lg">Coordonnées et<br />démographie</h1>
          <p className="subtitle">Aidez-nous à compléter votre dossier avec vos informations professionnelles et résidentielles.</p>
          {params?.error && <p className="notice">{params.error}</p>}
          <form id="civil2" action={saveContactAction} className="form-stack">
            <div className="section-label">■ Emploi et famille</div>
            <div className="field"><label>Profession</label><input name="occupation" defaultValue={contact.occupation || ""} placeholder="ex. ingénieur logiciel" required /></div>
            <div className="field"><label>Nombre d'enfants</label><input type="number" name="numChildren" min="0" defaultValue={contact.num_children || 0} required /></div>
            <div className="field"><label>Couverture sociale</label><select name="socialSecurityType" defaultValue={contact.social_security_type || "CNAM"}>{coverage.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
            <div className="section-label">☎ Communication</div>
            <div className="field"><label>Numéro de téléphone</label><input type="tel" name="phoneNumber" inputMode="tel" autoComplete="tel" defaultValue={contact.phone_number || ""} placeholder="+216 23 444 194" pattern={tunisianPhonePattern} title={tunisianPhoneTitle} required /></div>
            <div className="section-label">⚠ Contacts d'urgence</div>
            <div className="field"><label>Message SOS personnalisé</label><textarea name="sosMessage" defaultValue={profile.sos_message || defaultSosMessage()} placeholder="SOS : j'ai besoin d'une aide immédiate. Veuillez venir à ma position." /></div>
            <div className="emergency-contact-grid">{paddedContacts.slice(0, 3).map((item, index) => <div className="emergency-contact-form white-card" key={item.id || index}><div className="emergency-contact-title"><strong>Contact {index + 1}</strong>{index === 0 && <span className="soft-pill">Principal</span>}</div><div className="field"><label>Nom complet</label><input name="emergencyName" defaultValue={item.full_name || ""} placeholder="ex. Jean Lefebvre" /></div><div className="field"><label>Lien avec le patient</label><input name="emergencyRelationship" defaultValue={item.relationship || ""} placeholder="ex. Fils, conjointe, voisin" /></div><div className="field"><label>Numéro de téléphone</label><input type="tel" name="emergencyPhone" inputMode="tel" autoComplete="tel" defaultValue={item.phone_number || ""} placeholder="+216 23 444 194" pattern={tunisianPhonePattern} title={tunisianPhoneTitle} /></div><div className="field"><label>Lieu de résidence</label><input name="emergencyResidence" defaultValue={item.residence || ""} placeholder="ex. Tunis, La Marsa" /></div></div>)}</div>
            <div className="section-label">⌖ Résidence principale</div>
            <div className="field"><label>Région</label><input name="region" defaultValue={contact.region || ""} placeholder="Grand Tunis" required /></div>
            <div className="field"><label>Code postal</label><input name="postalCode" defaultValue={contact.postal_code || ""} placeholder="1000" required /></div>
            <div className="field"><label>Adresse</label><textarea name="address" defaultValue={contact.address || ""} placeholder="Rue, numéro du bâtiment, appartement..." required /></div>
            <div className="notice">Vos informations professionnelles et de contact facilitent la coordination d'urgence et le traitement des assurances.</div>
          </form>
        </section>
        <div className="bottom-actions"><Link className="save-btn" href="/dashboard">▣<span>ANNULER</span></Link><button className="primary-btn" form="civil2">TERMINER →</button></div>
      </main>
    );
  }

  if (step === 3) {
    const selected = history.chronic_conditions || "";
    const options = ["Hypertension artérielle", "Hypercholestérolémie", "Maladie cardiaque", "AVC", "Troubles thyroïdiens", "Asthme", "BPCO", "Apnée du sommeil", "RGO", "Maladie de Crohn", "SII", "Épilepsie/Convulsions", "Migraines", "Sclérose en plaques", "Anxiété", "Dépression", "TSPT"];
    return (
      <main className="app-shell">
        <SetupTop />
        <section className="content">
          <h1 className="title-lg">Antécédents médicaux</h1><p className="subtitle">Sélectionnez les pathologies chroniques diagnostiquées.</p>
          <form id="medical" className="form-stack">
            <input type="hidden" name="surgicalProcedures" defaultValue={history.surgical_procedures || ""} />
            <input type="hidden" name="obGynHistory" defaultValue={history.ob_gyn_history || ""} />
            <div className="section-label">♥ Cardiovasculaire</div><div className="choice-list">{options.slice(0, 4).map((item) => <label className="choice" key={item}>{item}<input type="checkbox" value={item} name="condition" defaultChecked={selected.includes(item)} /></label>)}</div>
            <div className="section-label">● Métabolique</div><div className="choice-list"><label className="choice">Diabète <input id="diabetesToggle" type="checkbox" defaultChecked={selected.includes("Diabète")} /></label><div id="diabetesTypePanel" className="detail-panel"><span className="detail-title">Type de diabète</span><div className="chip-row"><label className="chip"><input type="radio" value="Diabète type 1" name="diabetesType" defaultChecked={selected.includes("type 1")} /><span>Type 1</span></label><label className="chip"><input type="radio" value="Diabète type 2" name="diabetesType" defaultChecked={!selected.includes("type 1") && !selected.includes("gestationnel")} /><span>Type 2</span></label><label className="chip"><input type="radio" value="Diabète gestationnel" name="diabetesType" defaultChecked={selected.includes("gestationnel")} /><span>Gestationnel</span></label></div></div><label className="choice">Troubles thyroïdiens <input type="checkbox" value="Troubles thyroïdiens" name="condition" defaultChecked={selected.includes("Troubles thyroïdiens")} /></label></div>
            <div className="section-label">☁ Respiratoire</div><div className="chip-row">{options.slice(5, 8).map((item) => <label className="chip" key={item}><input type="checkbox" value={item} name="condition" defaultChecked={selected.includes(item)} /><span>{item}</span></label>)}</div>
            <div className="section-label">◆ Digestif</div><div className="choice-list">{options.slice(8, 11).map((item) => <label className="choice" key={item}>{item}<input type="checkbox" value={item} name="condition" defaultChecked={selected.includes(item)} /></label>)}</div>
            <div className="section-label">◉ Neurologique</div><div className="choice-list">{options.slice(11, 14).map((item) => <label className="choice" key={item}>{item}<input type="checkbox" value={item} name="condition" defaultChecked={selected.includes(item)} /></label>)}</div>
            <div className="blue-panel"><div className="section-label" style={{ color: "white", marginTop: 0 }}>Santé mentale</div><div className="chip-row">{options.slice(14).map((item) => <label className="chip" key={item}><input type="checkbox" value={item} name="condition" defaultChecked={selected.includes(item)} /><span>{item}</span></label>)}</div></div>
            <input type="hidden" name="chronicConditions" id="chronicConditions" />
          </form>
        </section>
        <div className="bottom-actions"><button className="save-btn" data-draft="medical">▣<span>ENREGISTRER</span></button><button className="primary-btn" form="medical">CONTINUER →</button></div>
        <SetupScripts id="medical" code={`medical.addEventListener('submit', e => { e.preventDefault(); const conditions = collectCheckedValues('input[name=condition]'); if (diabetesToggle.checked) { const selectedType = document.querySelector('input[name=diabetesType]:checked'); conditions.push(selectedType ? selectedType.value : 'Diabète type 2'); } chronicConditions.value = conditions.join(', '); postForm('/profile/medical-history', new FormData(medical), '/profile/setup?step=4'); });`} />
      </main>
    );
  }

  if (step === 4) {
    const selected = history.surgical_procedures || "";
    const groups = [["▣ Général", ["Appendicectomie", "Cholécystectomie", "Réparation de hernie"]], ["▤ Orthopédique", ["Prothèse du genou", "Prothèse de hanche", "Arthrodèse vertébrale"]], ["♥ Cardiaque", ["Pontage cardiaque", "Pose de stent", "Pacemaker"]], ["☊ ORL", ["Amygdalectomie", "Adénoïdectomie"]], ["••• Autre", ["Chirurgie de la cataracte", "Césarienne"]]];
    return <main className="app-shell"><SetupTop /><section className="content"><h1 className="title-lg">Antécédents chirurgicaux</h1><p className="subtitle">Avez-vous subi l'une des interventions suivantes ?</p><form id="surgery" className="form-stack"><input type="hidden" name="chronicConditions" defaultValue={history.chronic_conditions || ""} /><input type="hidden" name="obGynHistory" defaultValue={history.ob_gyn_history || ""} /><input type="hidden" name="surgicalProcedures" id="surgicalProcedures" />{groups.map(([label, values]) => <div key={label}><div className="section-label">{label}</div><div className="choice-list">{values.map((item) => <label className="choice" key={item}>{item}<input name="proc" value={item} type="checkbox" defaultChecked={selected.includes(item)} /></label>)}</div></div>)}<div className="field"><label>Procédures ou notes supplémentaires</label><textarea id="surgicalNotes" defaultValue={selected} placeholder="Ajoutez les interventions non listées ci-dessus..." /></div></form></section><div className="bottom-actions"><button className="save-btn" data-draft="surgery">▣<span>ENREGISTRER</span></button><button className="primary-btn" form="surgery">CONTINUER →</button></div><SetupScripts id="surgery" code={`surgery.addEventListener('submit', e => { e.preventDefault(); const checked = collectCheckedValues('input[name=proc]'); const notes = surgicalNotes.value.trim(); const merged = notes ? [notes] : []; checked.forEach(item => { if (!merged.some(existing => existing.toLowerCase().includes(item.toLowerCase()))) merged.push(item); }); surgicalProcedures.value = merged.join(', '); postForm('/profile/medical-history', new FormData(surgery), '/profile/setup?step=5'); });`} /></main>;
  }

  if (step === 5) {
    return <main className="app-shell"><SetupTop /><section className="content"><h1 className="title-lg">Antécédents gynéco-obstétriques</h1><p className="subtitle">Pour les patientes, ajoutez les détails de grossesse, d'accouchement, de complications et de pathologies.</p><form id="obgyn" className="form-stack"><input type="hidden" name="chronicConditions" defaultValue={history.chronic_conditions || ""} /><input type="hidden" name="surgicalProcedures" defaultValue={history.surgical_procedures || ""} /><div className="field"><label>Grossesses</label><input type="number" min="0" name="pregnancies" defaultValue="0" /></div><div className="field"><label>Accouchements</label><input type="number" min="0" name="accouchements" defaultValue="0" /></div><div className="section-label">Complications</div><div className="chip-row"><label className="chip"><input type="checkbox" name="ob" value="Prééclampsie" /><span>Prééclampsie</span></label><label className="chip"><input type="checkbox" name="ob" value="Diabète gestationnel" /><span>Diabète gestationnel</span></label></div><div className="section-label">Pathologies</div><div className="chip-row"><label className="chip"><input type="checkbox" name="ob" value="Endométriose" /><span>Endométriose</span></label><label className="chip"><input type="checkbox" name="ob" value="SOPK" /><span>SOPK</span></label></div><div className="field"><label>Notes gynéco-obstétriques existantes</label><textarea id="obGynNotes" defaultValue={history.ob_gyn_history || ""} placeholder="Grossesses, accouchements, complications, SOPK..." /></div><input type="hidden" name="obGynHistory" id="obGynHistory" /></form></section><div className="bottom-actions"><button className="save-btn" data-draft="obgyn">▣<span>ENREGISTRER</span></button><button className="primary-btn" form="obgyn">CONTINUER →</button></div><SetupScripts id="obgyn" code={`obgyn.addEventListener('submit', e => { e.preventDefault(); const selected = collectChecked('input[name=ob]'); const enteredCounts = obgyn.pregnancies.value !== '0' || obgyn.accouchements.value !== '0'; const notes = obGynNotes.value.trim(); const generated = enteredCounts || selected ? 'Grossesses: ' + obgyn.pregnancies.value + ', Accouchements: ' + obgyn.accouchements.value + (selected ? ', ' + selected : '') : ''; obGynHistory.value = [notes, generated].filter(Boolean).join(' | '); postForm('/profile/medical-history', new FormData(obgyn), '/profile/setup?step=6'); });`} /></main>;
  }

  if (step === 6) {
    const drugItems = splitValues(lifestyle.drug_allergies);
    const otherItems = splitValues(lifestyle.other_allergies);
    const renderRows = (items, placeholder) => (items.length ? items : [""]).map((item, index) => <div className="allergy-row" key={index}><input className="allergy-input" type="text" defaultValue={item} placeholder={placeholder} /><button type="button" className="icon-button small danger" data-remove-allergy aria-label="Supprimer l'allergie">-</button></div>);
    return <main className="app-shell"><SetupTop /><section className="content"><h1 className="title-lg">Allergies et<br />mode de vie</h1><p className="subtitle">Complétez votre profil avec les allergies et les risques liés au mode de vie.</p><form id="life" className="form-stack"><div className="field dynamic-fieldset" data-allergy-group data-list="drugAllergyList" data-hidden="drugAllergies"><label>Allergies médicamenteuses</label><div id="drugAllergyList" className="dynamic-list" data-placeholder="Pénicilline, sulfamides, ibuprofène">{renderRows(drugItems, "Pénicilline, sulfamides, ibuprofène")}</div><button type="button" className="add-row-btn" data-add-allergy data-target="drugAllergyList" data-placeholder="Pénicilline, sulfamides, ibuprofène"><span>+</span> Ajouter une autre allergie médicamenteuse</button><input type="hidden" name="drugAllergies" id="drugAllergies" /></div><div className="field dynamic-fieldset" data-allergy-group data-list="otherAllergyList" data-hidden="otherAllergies"><label>Autres allergies</label><div id="otherAllergyList" className="dynamic-list" data-placeholder="Latex, iode, produit de contraste">{renderRows(otherItems, "Latex, iode, produit de contraste")}</div><button type="button" className="add-row-btn" data-add-allergy data-target="otherAllergyList" data-placeholder="Latex, iode, produit de contraste"><span>+</span> Ajouter une autre allergie</button><input type="hidden" name="otherAllergies" id="otherAllergies" /></div><div className="field"><label>Tabac</label><select name="smokingStatus" defaultValue={lifestyle.smoking_status || "Jamais fumé"}><option>Jamais fumé</option><option>Ancien fumeur</option><option>Fumeur actuel</option></select></div><div className="field"><label>Alcool</label><select name="alcoholConsumption" defaultValue={lifestyle.alcohol_consumption || "Non buveur"}><option>Non buveur</option><option>Occasionnel/social</option><option>Consommation quotidienne</option></select></div><div className="blue-panel"><h2>Profil prêt</h2><p>Votre espace de santé personnel est maintenant centralisé et lié à votre bracelet.</p></div></form></section><div className="bottom-actions"><button className="save-btn" data-draft="life">▣<span>ENREGISTRER</span></button><button className="primary-btn" form="life">TERMINER →</button></div><SetupScripts id="life" code={`life.addEventListener('submit', e => { e.preventDefault(); syncAllergyFields(life); postForm('/profile/allergies-lifestyle', new FormData(life), '/dashboard'); });`} /></main>;
  }

  return (
    <main className="app-shell">
      <SetupTop />
      <section className="content">
        <h1 className="title-lg">À propos de vous</h1><p className="subtitle">Renseignez vos informations d'identité pour sécuriser votre dossier de santé.</p>
        <form id="civil1" action={saveIdentityAction} className="form-stack">
          <div className="field"><label>Nom</label><input name="surname" defaultValue={profile.surname || ""} placeholder="ex. Ben Ali" required /></div>
          <div className="field"><label>Prénom</label><input name="firstName" defaultValue={profile.first_name || ""} placeholder="ex. Amel" required /></div>
          <div className="field"><label>Sexe</label><div className="segmented"><label><input type="radio" name="gender" value="MALE" defaultChecked={profile.gender !== "FEMALE"} required /><span>Homme</span></label><label><input type="radio" name="gender" value="FEMALE" defaultChecked={profile.gender === "FEMALE"} /><span>Femme</span></label></div></div>
          <div className="field"><label>Date de naissance</label><input type="date" name="dateOfBirth" defaultValue={profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : ""} required /></div>
          <div className="field"><label>Groupe sanguin</label><select name="bloodType" defaultValue={profile.blood_type || "Inconnu"} required>{bloodTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className="field"><label>Situation familiale</label><select name="maritalStatus" defaultValue={profile.marital_status || "SINGLE"} required><option value="SINGLE">Célibataire</option><option value="MARRIED">Marié(e)</option><option value="DIVORCED">Divorcé(e)</option><option value="WIDOWED">Veuf/Veuve</option></select></div>
          <div className="field"><label>Nationalité</label><select name="nationality" defaultValue={profile.nationality || ""} required><option value="">Choisir une nationalité</option>{nationalities.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className="blue-panel" style={{ background: "linear-gradient(135deg,#dfe5ff,#cbd6ff)", color: "#273050" }}><h3>Confidentialité d'abord</h3><p>Vos données sont chiffrées avec des protocoles de niveau clinique et ne sont jamais partagées sans consentement.</p></div>
        </form>
      </section>
      <div className="bottom-actions"><Link className="save-btn" href="/dashboard">▣<span>ANNULER</span></Link><button className="primary-btn" form="civil1">TERMINER →</button></div>
    </main>
  );
}
