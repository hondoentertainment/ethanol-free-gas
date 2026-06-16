import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = {
  title: "API & Developers",
  description: "License the ethanol-free station database for navigation apps and partners.",
};

const PRICING = [
  {
    name: "Starter",
    volume: "Up to 10,000 requests / month",
    price: "Contact for pricing",
    features: ["Radius search", "Classification filter", "Attribution required"],
  },
  {
    name: "Partner",
    volume: "Up to 250,000 requests / month",
    price: "Contact for pricing",
    features: [
      "Higher rate limits",
      "Premium/sponsored flags",
      "Verification metadata",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    volume: "Unlimited + bulk export",
    price: "Custom",
    features: ["Dedicated key", "SLA", "Custom fields on request"],
  },
] as const;

export default function DevelopersPage() {
  const base = getSiteUrl();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Developer API</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Access verified E0 station data for navigation apps, boating platforms, and fleet tools.
        Dataset includes {">"}17,000 North American listings with community verification status.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700">
        <div>
          <p className="font-semibold text-zinc-900">Endpoint</p>
          <code className="mt-1 block rounded-lg bg-zinc-100 px-3 py-2 text-xs break-all">
            GET {base}/api/v1/stations
          </code>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Authentication</p>
          <p className="mt-1">
            Send your license key in the <code>X-API-Key</code> header.
          </p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Example</p>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs">
{`curl "${base}/api/v1/stations?lat=38.98&lng=-76.49&radius=25" \\
  -H "X-API-Key: YOUR_KEY"`}
          </pre>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Query parameters</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li><code>lat</code>, <code>lng</code> — search center (recommended)</li>
            <li><code>radius</code> — miles (default 25, max 100)</li>
            <li><code>classification</code> — <code>car</code>, <code>boat</code>, or <code>dual</code></li>
            <li><code>state</code>, <code>city</code>, <code>zip</code>, <code>q</code> — text filters</li>
            <li><code>limit</code> — max results (default 100, max 500)</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Response fields</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
            <li><code>id</code>, <code>name</code>, <code>address</code>, <code>city</code>, <code>state</code>, <code>zip</code></li>
            <li><code>lat</code>, <code>lng</code>, <code>classification</code>, <code>fuel_type</code>, <code>ethanol_percent</code></li>
            <li><code>phone</code>, <code>is_premium</code>, <code>is_sponsored</code></li>
            <li><code>verification_label</code> — community freshness indicator</li>
            <li><code>distance_miles</code> — when <code>lat</code>/<code>lng</code> provided</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Rate limits & errors</p>
          <p className="mt-1">
            Invalid or missing keys return <code>401</code>. Usage is logged per key. Contact us
            for higher limits or bulk licensing.
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Licensing tiers</h2>
      <div className="mt-4 space-y-3">
        {PRICING.map((tier) => (
          <div
            key={tier.name}
            className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-semibold text-zinc-900">{tier.name}</p>
              <p className="text-xs text-zinc-500">{tier.volume}</p>
            </div>
            <p className="mt-1 text-zinc-600">{tier.price}</p>
            <ul className="mt-2 list-inside list-disc text-xs text-zinc-600">
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-zinc-600">
        Request an API key via the{" "}
        <Link href="/premium" className="font-medium text-sky-700 hover:text-sky-800">
          premium / partner inquiry form
        </Link>
        , or read the{" "}
        <Link href="/docs/api-partners" className="font-medium text-sky-700 hover:text-sky-800">
          partner documentation
        </Link>
        . Keys are provisioned as <code>API_LICENSE_KEYS</code> on the deployment.
      </p>
    </div>
  );
}
