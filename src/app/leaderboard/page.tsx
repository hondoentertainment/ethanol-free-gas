import { getBadgesForPoints, CONTRIBUTOR_BADGES } from "@/lib/gamification/badges";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getLeaders() {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "demo-1",
        display_name: "HarborPilot",
        contributor_points: 125,
      },
      {
        id: "demo-2",
        display_name: "E0Scout",
        contributor_points: 80,
      },
      {
        id: "demo-3",
        display_name: "MarinaMike",
        contributor_points: 55,
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, contributor_points")
    .gt("contributor_points", 0)
    .order("contributor_points", { ascending: false })
    .limit(50);

  return data ?? [];
}

export default async function LeaderboardPage() {
  const leaders = await getLeaders();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Top contributors</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Community members keeping ethanol-free fuel data accurate across North
        America.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {leaders.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">
            No contributors yet. Add or verify a station to appear here.
          </p>
        ) : (
          <ol className="divide-y divide-zinc-100">
            {leaders.map((leader, index) => {
              const earned = getBadgesForPoints(leader.contributor_points);
              return (
                <li
                  key={leader.id}
                  className="flex items-center gap-4 px-4 py-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">
                      {leader.display_name ?? "Contributor"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {leader.contributor_points} points
                    </p>
                    {earned.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {earned.map((badge) => (
                          <span
                            key={badge.id}
                            className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900"
                            title={badge.description}
                          >
                            {badge.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Achievement badges</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {CONTRIBUTOR_BADGES.map((badge) => (
            <li key={badge.id}>
              <span className="font-medium text-zinc-800">{badge.name}</span> —{" "}
              {badge.minPoints}+ points · {badge.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
