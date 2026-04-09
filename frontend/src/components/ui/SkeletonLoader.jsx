// Reusable Skeleton components for loading states across the entire app

// Single pulsing block
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// Table row skeleton (for Admin/Seller tables)
export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-5">
        <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Stats card skeleton (Admin overview / Seller dashboard)
export const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
      <div className="w-8 h-3 bg-gray-100 rounded" />
    </div>
    <div className="h-9 bg-gray-200 rounded-xl w-16 mb-2" />
    <div className="h-3 bg-gray-100 rounded-xl w-24" />
  </div>
);

// Product card skeleton (User products page grid)
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="h-52 bg-gray-200 w-full" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded-lg w-20" />
      <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-200 rounded-lg w-16" />
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// Full table skeleton wrapper
export const TableSkeleton = ({ rows = 6, cols = 4 }) => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Empty state component (beautiful message when no data) 
export const EmptyState = ({ icon: Icon, title, message, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-4">
    <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-5 shadow-inner">
      {Icon && <Icon size={36} className="text-gray-300" />}
    </div>
    <h3 className="font-syne font-black text-xl text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs mb-6">{message}</p>
    {action && (
      <button
        onClick={action}
        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
