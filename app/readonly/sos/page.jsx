import SosCountdown from "@/components/SosCountdown";
import { requireReadOnly } from "@/lib/auth";

export default async function ReadOnlySosPage() {
  await requireReadOnly();
  return <div className="sos-body"><SosCountdown cancelUrl="/readonly/profile" /></div>;
}
