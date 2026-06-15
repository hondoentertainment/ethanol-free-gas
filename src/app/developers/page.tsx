export const metadata = {
  title: "API & Developers",
  description: "License the ethanol-free station database for navigation apps and partners.",
};

export default function DevelopersPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Developer API</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Access verified E0 station data for navigation apps, boating platforms, and fleet tools.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700">
        <div>
          <p className="font-semibold text-zinc-900">Endpoint</p>
          <code className="mt-1 block rounded-lg bg-zinc-100 px-3 py-2 text-xs">
            GET https://ethanol-free-gas.vercel.app/api/v1/stations
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
{`curl "https://ethanol-free-gas.vercel.app/api/v1/stations?lat=38.98&lng=-76.49&radius=25" \\
  -H "X-API-Key: YOUR_KEY"`}
          </pre>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Query parameters</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li><code>lat</code>, <code>lng</code> — search center</li>
            <li><code>radius</code> — miles (default 25)</li>
            <li><code>classification</code> — car, boat, or dual</li>
          </ul>
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-600">
        API keys are configured via the <code>API_LICENSE_KEYS</code> environment variable on the deployment.
        Contact the site owner for partner access.
      </p>
    </div>
  );
}
