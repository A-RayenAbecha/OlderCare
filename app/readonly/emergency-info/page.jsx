import EmergencyInfo from "@/components/EmergencyInfo";
import { requireReadOnly } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReadOnlyEmergencyInfoPage() {
  const session = await requireReadOnly();
  const bundle = await getPatientBundle(session.patientUserId);
  return <div className="emergency-info-page-body"><EmergencyInfo bundle={bundle} cancelUrl="/readonly/profile" sosUrl="/readonly/sos" /></div>;
}
