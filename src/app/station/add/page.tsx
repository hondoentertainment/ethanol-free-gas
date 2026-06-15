import Link from "next/link";
import { AddStationForm } from "@/components/station/AddStationForm";

export default function AddStationPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Add a station</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Help the community by listing an ethanol-free fuel location. You earn 25
        contributor points per submission.
      </p>
      <div className="mt-6">
        <AddStationForm />
      </div>
    </div>
  );
}
