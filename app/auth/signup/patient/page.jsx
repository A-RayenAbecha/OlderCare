import Link from "next/link";
import Script from "next/script";
import { redirectIfLoggedIn } from "@/lib/auth";

const countryCodes = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"
];
const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });
const nationalities = countryCodes
  .map((countryCode) => regionNames.of(countryCode))
  .filter(Boolean)
  .filter((country, index, list) => list.indexOf(country) === index)
  .sort((a, b) => a.localeCompare(b, "fr"));
const bloodTypes = ["Inconnu", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const coverage = ["CNAM", "CNSS", "Privé", "Aucune"];
const tunisianPhonePattern = "^\\+216\\s?[0-9]{2}\\s?[0-9]{3}\\s?[0-9]{3}$";
const tunisianPhoneTitle = "Format attendu : +216 23 444 194";

export default async function PatientSignupPage({ searchParams }) {
  await redirectIfLoggedIn();
  const params = await searchParams;

  return (
    <main className="app-shell auth-shell signup-shell">
      <div className="topbar">
        <Link className="icon-button" href="/auth/welcome">←</Link>
        <strong>Inscription patient</strong>
        <span />
      </div>
      <section className="content">
        <h1 className="title-lg">Créer le profil<br />patient</h1>
        <p className="subtitle">Complétez votre profil de santé et connectez le code inscrit sur votre bracelet. La valeur QR est stockée de manière privée et n'est jamais affichée.</p>
        {params?.error && <p className="notice">{params.error}</p>}
        <form id="patientSignup" method="post" action="/register" className="form-stack">
          <div className="section-label">Données civiles</div>
          <div className="field"><label>Nom</label><input name="surname" required /></div>
          <div className="field"><label>Prénom</label><input name="firstName" required /></div>
          <div className="field"><label>E-mail</label><input type="email" name="email" placeholder="patient@example.com" required /></div>
          <div className="field"><label>Sexe</label><select name="gender"><option value="MALE">Homme</option><option value="FEMALE">Femme</option></select></div>
          <div className="field"><label>Date de naissance</label><input type="date" name="dateOfBirth" required /></div>
          <div className="field"><label>Groupe sanguin</label><select name="bloodType" required>{bloodTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className="field"><label>Situation familiale</label><select name="maritalStatus"><option value="SINGLE">Célibataire</option><option value="MARRIED">Marié(e)</option><option value="DIVORCED">Divorcé(e)</option><option value="WIDOWED">Veuf/Veuve</option></select></div>
          <div className="field"><label>Nationalité</label><select name="nationality" required><option value="">Choisir une nationalité</option>{nationalities.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>

          <div className="section-label">Coordonnées et données démographiques</div>
          <div className="field"><label>Profession</label><input name="occupation" required /></div>
          <div className="field"><label>Nombre d'enfants</label><input type="number" name="numChildren" min="0" defaultValue="0" required /></div>
          <div className="field"><label>Couverture sociale</label><select name="socialSecurityType" required>{coverage.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className="field"><label>Numéro de téléphone</label><input type="tel" name="phoneNumber" inputMode="tel" autoComplete="tel" placeholder="+216 23 444 194" pattern={tunisianPhonePattern} title={tunisianPhoneTitle} required /></div>
          <div className="field"><label>Région</label><input name="region" required /></div>
          <div className="field"><label>Adresse</label><textarea name="address" required /></div>
          <div className="field"><label>Code postal</label><input name="postalCode" required /></div>

          <div className="section-label">⚠ Contacts d'urgence</div>
          <div className="emergency-contact-grid">
            {[1, 2, 3].map((slot) => (
              <div className="emergency-contact-form white-card" key={slot}>
                <div className="emergency-contact-title"><strong>Contact {slot}</strong>{slot === 1 && <span className="soft-pill">Principal</span>}</div>
                <div className="field"><label>Nom complet</label><input name="emergencyName" placeholder="ex. Jean Lefebvre" /></div>
                <div className="field"><label>Lien avec le patient</label><input name="emergencyRelationship" placeholder="ex. Fils, conjointe, voisin" /></div>
                <div className="field"><label>Numéro de téléphone</label><input type="tel" name="emergencyPhone" inputMode="tel" autoComplete="tel" placeholder="+216 23 444 194" pattern={tunisianPhonePattern} title={tunisianPhoneTitle} /></div>
                <div className="field"><label>Lieu de résidence</label><input name="emergencyResidence" placeholder="ex. Tunis, La Marsa" /></div>
              </div>
            ))}
          </div>

          <div className="section-label">♥ Antécédents médicaux</div>
          <div className="choice-list">
            {["Hypertension artérielle", "Hypercholestérolémie", "Maladie cardiaque", "AVC"].map((item) => (
              <label className="choice" key={item}>{item}<input type="checkbox" value={item} name="condition" /></label>
            ))}
          </div>
          <div className="choice-list">
            <label className="choice">Diabète <input id="diabetesToggle" type="checkbox" /></label>
            <div id="diabetesTypePanel" className="detail-panel">
              <span className="detail-title">Type de diabète</span>
              <div className="chip-row">
                <label className="chip"><input type="radio" value="Diabète type 1" name="diabetesType" /><span>Type 1</span></label>
                <label className="chip"><input type="radio" value="Diabète type 2" name="diabetesType" defaultChecked /><span>Type 2</span></label>
                <label className="chip"><input type="radio" value="Diabète gestationnel" name="diabetesType" /><span>Gestationnel</span></label>
              </div>
            </div>
            <label className="choice">Troubles thyroïdiens <input type="checkbox" value="Troubles thyroïdiens" name="condition" /></label>
          </div>
          <div className="chip-row">
            {["Asthme", "BPCO", "Apnée du sommeil", "RGO", "Maladie de Crohn", "SII", "Épilepsie/Convulsions", "Migraines", "Sclérose en plaques", "Anxiété", "Dépression", "TSPT"].map((item) => (
              <label className="chip" key={item}><input type="checkbox" value={item} name="condition" /><span>{item}</span></label>
            ))}
          </div>
          <input type="hidden" name="chronicConditions" id="chronicConditions" />
          <div className="field"><label>Antécédents chirurgicaux</label><textarea name="surgicalProcedures" placeholder="Appendicectomie, Césarienne, prothèse du genou..." /></div>
          <div className="field"><label>Antécédents gynéco-obstétriques</label><textarea name="obGynHistory" placeholder="Grossesses, accouchements, complications, SOPK..." /></div>

          <div className="section-label">⚠ Allergies et mode de vie</div>
          <div className="field dynamic-fieldset" data-allergy-group data-list="signupDrugAllergyList" data-hidden="drugAllergies">
            <label>Allergies médicamenteuses</label>
            <div id="signupDrugAllergyList" className="dynamic-list" data-placeholder="Pénicilline, ibuprofène...">
              <div className="allergy-row"><input className="allergy-input" type="text" placeholder="Pénicilline, ibuprofène..." /><button type="button" className="icon-button small danger" data-remove-allergy aria-label="Supprimer l'allergie">-</button></div>
            </div>
            <button type="button" className="add-row-btn" data-add-allergy data-target="signupDrugAllergyList" data-placeholder="Pénicilline, ibuprofène..."><span>+</span> Ajouter une autre allergie médicamenteuse</button>
            <input type="hidden" name="drugAllergies" id="drugAllergies" />
          </div>
          <div className="field dynamic-fieldset" data-allergy-group data-list="signupOtherAllergyList" data-hidden="otherAllergies">
            <label>Autres allergies</label>
            <div id="signupOtherAllergyList" className="dynamic-list" data-placeholder="Latex, iode, produit de contraste...">
              <div className="allergy-row"><input className="allergy-input" type="text" placeholder="Latex, iode, produit de contraste..." /><button type="button" className="icon-button small danger" data-remove-allergy aria-label="Supprimer l'allergie">-</button></div>
            </div>
            <button type="button" className="add-row-btn" data-add-allergy data-target="signupOtherAllergyList" data-placeholder="Latex, iode, produit de contraste..."><span>+</span> Ajouter une autre allergie</button>
            <input type="hidden" name="otherAllergies" id="otherAllergies" />
          </div>
          <div className="field"><label>Tabac</label><select name="smokingStatus"><option>Jamais fumé</option><option>Ancien fumeur</option><option>Fumeur actuel</option></select></div>
          <div className="field"><label>Alcool</label><select name="alcoholConsumption"><option>Non buveur</option><option>Occasionnel/social</option><option>Consommation quotidienne</option></select></div>
          <div className="section-label">Connexion du bracelet</div>
          <div className="field"><label>Code bracelet</label><input type="password" name="braceletCode" placeholder="Code inscrit sur le bracelet" autoComplete="off" required /></div>
          <button className="primary-btn">CONNECTER LE BRACELET</button>
        </form>
      </section>
      <Script src="/js/main.js" strategy="afterInteractive" />
      <Script id="signup-form-script" strategy="afterInteractive">{`
        const patientSignupForm = document.getElementById('patientSignup');
        if (patientSignupForm) {
          patientSignupForm.addEventListener('submit', () => {
            const conditions = collectCheckedValues('input[name=condition]');
            const diabetesToggle = document.getElementById('diabetesToggle');
            const chronicConditions = document.getElementById('chronicConditions');
            if (diabetesToggle && diabetesToggle.checked) {
              const selectedType = document.querySelector('input[name=diabetesType]:checked');
              conditions.push(selectedType ? selectedType.value : 'Diabète type 2');
            }
            chronicConditions.value = conditions.join(', ');
            syncAllergyFields(patientSignupForm);
          });
        }
      `}</Script>
    </main>
  );
}
