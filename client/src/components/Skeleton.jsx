// Skeleton screen components — dùng khi loading data
// Mỗi skeleton khớp với layout thực của trang tương ứng

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

const P = 'animate-pulse bg-gray-100 dark:bg-slate-700 rounded';

// ── Trang Tin Tức ─────────────────────────────────────────────────────────────
// Khớp layout: featured card lớn + grid 3 cột bên dưới
export function SkeletonNewsFeed() {
  return (
    <div className="flex flex-col gap-8">
      {/* Featured card */}
      <div className={`rounded-2xl overflow-hidden ${P}`} style={{ height: 260 }} />
      {/* Grid 3 cột */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className={`${P} aspect-video w-full`} />
            <div className="p-4 flex flex-col gap-2.5">
              <div className={`${P} h-3 w-1/3`} />
              <div className={`${P} h-4 w-full`} />
              <div className={`${P} h-4 w-5/6`} />
              <div className={`${P} h-3 w-2/3 mt-1`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trang Lớp Học ─────────────────────────────────────────────────────────────
// Khớp layout: nhóm theo nhánh, mỗi nhóm có header + grid card lớp
export function SkeletonClassGrid() {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="flex flex-col gap-4">
          {/* Tên nhánh */}
          <div className={`${P} h-5 w-32`} />
          {/* Grid lớp */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
                {/* Dải màu trên */}
                <div className={`${P} h-1.5 w-full`} />
                <div className="p-5 flex flex-col gap-3">
                  <div className={`${P} h-5 w-2/3`} />
                  <div className={`${P} h-3 w-1/2`} />
                  <div className="flex gap-2 mt-1">
                    <div className={`${P} h-6 w-16 rounded-full`} />
                    <div className={`${P} h-6 w-16 rounded-full`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Trang Giờ Lễ ─────────────────────────────────────────────────────────────
// Khớp layout: header + 2 cột (sidebar lịch + main card giờ lễ)
export function SkeletonGioLe() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header ngày */}
      <div className="flex items-center gap-4">
        <div className={`${P} h-10 w-10 rounded-xl`} />
        <div className="flex flex-col gap-2">
          <div className={`${P} h-5 w-48`} />
          <div className={`${P} h-3 w-32`} />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${P} h-12 rounded-xl`} />
          ))}
        </div>
        {/* Main — card giờ lễ */}
        <div className="flex flex-col gap-4">
          <div className={`${P} h-8 w-2/3 rounded-xl`} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
              <div className={`${P} h-10 w-10 rounded-lg shrink-0`} />
              <div className="flex flex-col gap-2 flex-1">
                <div className={`${P} h-4 w-24`} />
                <div className={`${P} h-3 w-40`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
