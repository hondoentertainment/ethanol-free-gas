export function PremiumBadge({
  isPremium,
  isSponsored,
}: {
  isPremium?: boolean;
  isSponsored?: boolean;
}) {
  if (!isPremium && !isSponsored) return null;

  if (isPremium) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-300/50">
        Featured
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900 ring-1 ring-inset ring-violet-300/50">
      Sponsored
    </span>
  );
}
