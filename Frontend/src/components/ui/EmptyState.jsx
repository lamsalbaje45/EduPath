/**
 * EmptyState - Icon + message + optional CTA
 * Used when no data is available
 */

export const EmptyState = ({
  icon: Icon = null,
  title = "No results found",
  message = "Try adjusting your filters or search terms",
  action = null,
  actionLabel = "Get Started",
  onAction = null,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7EEFF]">
          <Icon className="h-8 w-8 text-[#2551D9]" />
        </div>
      )}

      <h3 className="mb-2 text-lg font-black text-slate-950">{title}</h3>

      <p className="mb-6 max-w-md text-sm text-gray-600">{message}</p>

      {(action || onAction) && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full bg-[#5472FC] px-6 py-2.5 text-sm font-black text-white shadow-sm shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE] hover:shadow-md"
        >
          {action || actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
