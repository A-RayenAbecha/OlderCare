import EmergencyInfo from "@/components/EmergencyInfo";
import { requirePatient } from "@/lib/auth";
import { getPatientBundle } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardEmergencyInfoPage() {
  const userId = await requirePatient();
  const bundle = await getPatientBundle(userId);
  return <div className="emergency-info-page-body"><EmergencyInfo bundle={bundle} cancelUrl="/dashboard" sosUrl="/dashboard/sos" /></div>;
}
