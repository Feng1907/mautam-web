// Skeleton screen components — dùng khi loading data

export function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} rounded-md bg-gray-100 dark:bg-slate-700 animate-pulse`} />;
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 dark:border-slate-700/50">
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 animate-pulse shrink-0" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <div key={i} className="flex-1 h-3.5 rounded bg-gray-100 dark:bg-slate-700 animate-pulse" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex gap-4 px-4 py-3 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 h-3 rounded bg-gray-200 dark:bg-slate-600 animate-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-slate-700 animate-pulse w-1/2" />
          <div className="h-3 rounded bg-gray-100 dark:bg-slate-700 animate-pulse w-1/3" />
        </div>
      </div>
      <div className="h-3 rounded bg-gray-100 dark:bg-slate-700 animate-pulse" />
      <div className="h-3 rounded bg-gray-100 dark:bg-slate-700 animate-pulse w-3/4" />
    </div>
  );
}
