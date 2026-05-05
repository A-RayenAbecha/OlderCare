export function normalizeBraceletCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function fullName(profile) {
  const name = `${profile?.first_name || ""} ${profile?.surname || ""}`.trim();
  return name || "Patient";
}

export function calculateAge(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) age--;
  return age;
}

export function splitValues(value) {
  return String(value || "")
    .split(/\r?\n|,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function translateMedicalValue(value) {
  const normalized = String(value || "").trim();
  const translations = new Map([
    ["High blood pressure", "Hypertension artérielle"],
    ["High cholesterol", "Hypercholestérolémie"],
    ["Heart disease", "Maladie cardiaque"],
    ["Stroke", "AVC"],
    ["Diabetes Type 1", "Diabète type 1"],
    ["Diabete Type 1", "Diabète type 1"],
    ["Diabete type 1", "Diabète type 1"],
    ["Diabetes Type 2", "Diabète type 2"],
    ["Diabete Type 2", "Diabète type 2"],
    ["Diabete type 2", "Diabète type 2"],
    ["Gestational diabetes", "Diabète gestationnel"],
    ["Gestational Diabetes", "Diabète gestationnel"],
    ["Thyroid disorders", "Troubles thyroïdiens"],
    ["Asthma", "Asthme"],
    ["COPD", "BPCO"],
    ["Sleep Apnea", "Apnée du sommeil"],
    ["GERD", "RGO"],
    ["Crohn's disease", "Maladie de Crohn"],
    ["IBS", "SII"],
    ["Epilepsy/Seizures", "Épilepsie/Convulsions"],
    ["Multiple Sclerosis", "Sclérose en plaques"],
    ["Anxiety", "Anxiété"],
    ["Depression", "Dépression"],
    ["PTSD", "TSPT"],
    ["Appendectomy", "Appendicectomie"],
    ["Cholecystectomy", "Cholécystectomie"],
    ["Hernia repair", "Réparation de hernie"],
    ["Knee replacement", "Prothèse du genou"],
    ["Hip replacement", "Prothèse de hanche"],
    ["Spinal fusion", "Arthrodèse vertébrale"],
    ["Heart bypass", "Pontage cardiaque"],
    ["Stent placement", "Pose de stent"],
    ["Pacemaker", "Pacemaker"],
    ["Tonsillectomy", "Amygdalectomie"],
    ["Adenoidectomy", "Adénoïdectomie"],
    ["Cataract surgery", "Chirurgie de la cataracte"],
    ["C-section", "Césarienne"],
    ["Pregnancies: 1", "Grossesses : 1"]
  ]);
  return (translations.get(normalized) || normalized)
    .replaceAll("Pregnancies:", "Grossesses :")
    .replaceAll("Births:", "Accouchements :")
    .replaceAll("Preeclampsia", "Prééclampsie")
    .replaceAll("Endometriosis", "Endométriose")
    .replaceAll("Gestationnel Diabète", "Diabète gestationnel")
    .replaceAll("Diabete", "Diabète")
    .replaceAll("PCOS", "SOPK");
}

export function splitMedicalValues(value) {
  return splitValues(value).map(translateMedicalValue);
}

export function recordNumber(userId) {
  const raw = String(userId || "").replaceAll("-", "").toUpperCase();
  if (raw.length < 8) return "HN-PATIENT";
  return `HN-${raw.slice(0, 2)}-${raw.slice(-6)}`;
}

export function genderLabel(value) {
  if (value === "FEMALE") return "Femme";
  if (value === "MALE") return "Homme";
  return value || "Non renseigné";
}

export function defaultSosMessage() {
  return "SOS : j'ai besoin d'une aide immédiate. Veuillez me contacter ou venir à ma position.";
}

export function sosMessage(profile) {
  return profile?.sos_message?.trim() || defaultSosMessage();
}
