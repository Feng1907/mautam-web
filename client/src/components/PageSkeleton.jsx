// Skeleton dùng làm Suspense fallback (route transition) và loading state trang
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800 ${className}`} />
);

// Skeleton cho trang có card grid (Gallery, ClassList...)
export const CardGridSkeleton = ({ count = 8, ratio = '4/3' }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Shimmer key={i} style={{ aspectRatio: ratio }} />
    ))}
  </div>
);

// Skeleton cho trang có table/list (điểm, chuyên cần...)
export const TableSkeleton = ({ rows = 6 }) => (
  <div className="space-y-2">
    <Shimmer className="h-10 w-full rounded-lg mb-3" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center gap-4 h-12 bg-gray-50 dark:bg-slate-800 rounded-lg px-4">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12" />
      </div>
    ))}
  </div>
);

// Skeleton cho dashboard dạng card sections (ParentDashboard...)
export const DashboardSkeleton = () => (
  <div className="page-container max-w-6xl py-8 space-y-6">
    {/* Header */}
    <div className="animate-pulse space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64" />
    </div>
    {/* 3-column card grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700" />
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-4/5" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-3/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton tổng quát dùng làm Suspense fallback (route lazy load)
const PageSkeleton = () => (
  <div className="page-container py-8 space-y-5 max-w-4xl">
    <div className="animate-pulse space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20" />
      <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-56" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800 h-32" />
      ))}
    </div>
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse h-4 bg-gray-100 dark:bg-slate-800 rounded" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  </div>
);

export default PageSkeleton;
