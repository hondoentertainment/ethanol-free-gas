import { createServiceClient } from "@/lib/supabase/admin";

const GRAPHQL_URL = "https://www.pure-gas.org/graphql";
const BATCH_SIZE = 200;

const STATIONS_QUERY = `
  query StationsByState($code: ID!) {
    stationsByState(code: $code) {
      id name streetaddress city
      state { code }
      phone brand { name }
      location { latitude longitude comment }
      octanes comment removed
    }
  }
`;

const STATES_QUERY = `query { states { code } }`;

function mapRow(raw: Record<string, unknown>) {
  if (raw.removed) return null;
  const loc = raw.location as { latitude?: number; longitude?: number } | undefined;
  if (loc?.latitude == null || loc?.longitude == null) return null;
  const state = (raw.state as { code?: string })?.code ?? "";
  const brand = (raw.brand as { name?: string })?.name;
  const name = raw.name as string;
  const display =
    brand && !name?.includes(brand) ? `${brand} — ${name}` : name;

  return {
    name: display?.trim() || "E0 Station",
    address: ((raw.streetaddress as string) ?? "").trim() || "Unknown",
    city: ((raw.city as string) ?? "").trim() || "Unknown",
    state,
    zip: null,
    country: ["AB","BC","MB","NB","NF","NS","NT","ON","PE","QC","SK","YT"].includes(state)
      ? "CA"
      : "US",
    lat: loc.latitude,
    lng: loc.longitude,
    classification: "car" as const,
    fuel_type: "E0 Gasoline",
    ethanol_percent: 0,
    phone: (raw.phone as string)?.trim() || null,
    hours: null,
    is_premium: false,
    is_sponsored: false,
    external_id: String(raw.id),
    source: "pure-gas.org",
    source_url: "https://www.pure-gas.org/",
    notes: (raw.comment as string)?.trim() || null,
  };
}

export async function runChunkedPureGasImport(stateCodes?: string[]) {
  const supabase = createServiceClient();
  if (!supabase) throw new Error("Supabase service client unavailable");

  const statesRes = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: STATES_QUERY }),
  });
  const statesJson = await statesRes.json();
  const allCodes = (statesJson.data?.states ?? []).map(
    (s: { code: string }) => s.code
  );
  const codes = stateCodes ?? allCodes;

  const { data: run } = await supabase
    .from("import_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  let upserted = 0;
  let processed = 0;

  try {
    for (const code of codes) {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: STATIONS_QUERY,
          variables: { code },
        }),
      });
      const json = await res.json();
      const rows = (json.data?.stationsByState ?? [])
        .map((r: Record<string, unknown>) => mapRow(r))
        .filter(Boolean);

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from("stations")
          .upsert(batch, { onConflict: "source,external_id" });
        if (!error) upserted += batch.length;
      }
      processed++;
    }

    await supabase
      .from("import_runs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        stations_upserted: upserted,
        states_processed: processed,
      })
      .eq("id", run!.id);

    return { upserted, states_processed: processed };
  } catch (error) {
    await supabase
      .from("import_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Import failed",
        stations_upserted: upserted,
        states_processed: processed,
      })
      .eq("id", run!.id);
    throw error;
  }
}
