import SosCountdown from "@/components/SosCountdown";
import { requirePatient } from "@/lib/auth";

export default async function DashboardSosPage() {
  await requirePatient();
  return <div className="sos-body"><SosCountdown cancelUrl="/dashboard" /></div>;
}
