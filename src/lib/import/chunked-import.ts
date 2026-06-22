import { createServiceClient } from "@/lib/supabase/admin";
import {
  mapPureGasRow,
  type PureGasImportRow,
} from "@/lib/import/pure-gas-mapper";
import type { StationClassification, StationHours } from "@/lib/types/station";

const GRAPHQL_URL = "https://www.pure-gas.org/graphql";
const BATCH_SIZE = 200;
const SOURCE = "pure-gas.org";

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

type ExistingRow = {
  id: string;
  external_id: string;
  classification: StationClassification;
  hours: StationHours | null;
  submitted_by: string | null;
};

async function loadExistingByExternalId(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  externalIds: string[]
) {
  if (externalIds.length === 0) {
    return new Map<string, ExistingRow & { hasVerifications: boolean }>();
  }

  const { data: existing } = await supabase
    .from("stations")
    .select("id, external_id, classification, hours, submitted_by")
    .eq("source", SOURCE)
    .in("external_id", externalIds);

  if (!existing?.length) {
    return new Map<string, ExistingRow & { hasVerifications: boolean }>();
  }

  const stationIds = existing.map((row) => row.id);
  const { data: verifications } = await supabase
    .from("verifications")
    .select("station_id")
    .in("station_id", stationIds);

  const verifiedIds = new Set(
    (verifications ?? []).map((verification) => verification.station_id)
  );

  return new Map(
    existing.map((row) => [
      row.external_id,
      {
        ...row,
        hasVerifications: verifiedIds.has(row.id),
      },
    ])
  );
}

function mergeImportRow(
  incoming: PureGasImportRow,
  existing?: ExistingRow & { hasVerifications: boolean }
): PureGasImportRow | null {
  if (!existing) return incoming;
  if (existing.submitted_by) return null;

  const merged: PureGasImportRow = { ...incoming };

  if (existing.hasVerifications) {
    merged.classification = existing.classification;
  }
  if (existing.hours != null) {
    merged.hours = existing.hours;
  }

  return merged;
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
  let preserved = 0;

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
        .map((raw: Record<string, unknown>) => mapPureGasRow(raw))
        .filter(Boolean) as PureGasImportRow[];

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const slice = rows.slice(i, i + BATCH_SIZE);
        const existingById = await loadExistingByExternalId(
          supabase,
          slice.map((row) => row.external_id)
        );

        const batch = slice
          .map((row) => {
            const existing = existingById.get(row.external_id);
            if (!existing) return row;

            const merged = mergeImportRow(row, existing);
            if (!merged) return null;

            if (
              existing.hasVerifications &&
              merged.classification !== row.classification
            ) {
              preserved++;
            }
            if (existing.hours != null) preserved++;

            return merged;
          })
          .filter(Boolean) as PureGasImportRow[];

        if (batch.length === 0) continue;

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

    return { upserted, preserved, states_processed: processed };
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
