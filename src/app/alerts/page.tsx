import Link from "next/link";
import { FuelAlertsPanel } from "@/components/alerts/FuelAlertsPanel";

export default function AlertsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Fuel alerts</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Know when new E0 stations appear or availability changes near your routes
        and marinas.
      </p>
      <div className="mt-6">
        <FuelAlertsPanel />
      </div>
    </div>
  );
}
