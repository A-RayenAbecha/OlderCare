import SosCountdown from "@/components/SosCountdown";
import { requirePatient } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardSosPage() {
  await requirePatient();
  return <div className="sos-body"><SosCountdown cancelUrl="/dashboard" /></div>;
}
