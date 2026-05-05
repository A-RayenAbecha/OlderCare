import SosCountdown from "@/components/SosCountdown";
import { requireReadOnly } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReadOnlySosPage() {
  await requireReadOnly();
  return <div className="sos-body"><SosCountdown cancelUrl="/readonly/profile" /></div>;
}
