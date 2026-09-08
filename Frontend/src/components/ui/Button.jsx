/**
 * Button - Primary, outline, ghost variants
 * Matches design system from navbar.jsx and login.jsx
 */

const variants = {
  primary:
    "bg-[#5472FC] text-white shadow-sm shadow-[#5472FC]/30 hover:-translate-y-0.5 hover:bg-[#435DDE] hover:shadow-md active:bg-[#2551D9]",
  outline:
    "border border-[#5472FC] bg-white text-[#5472FC] hover:-translate-y-0.5 hover:bg-[#5472FC] hover:text-white",
  ghost: "text-[#5472FC] hover:bg-[#5472FC]/10 hover:text-[#2551D9]",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  // Light/soft danger style for inline row actions (e.g. Delete, Reject, Suspend)
  // where a solid red button would be too visually heavy. Defined as its own
  // variant rather than "danger" + an overriding className, because Tailwind's
  // generated stylesheet order -- not JSX class order -- decides which of two
  // conflicting utilities (e.g. text-white vs text-rose-700) wins, which made
  // that combination render invisible white text on a near-white background.
  dangerSoft:
    "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-black",
  md: "px-4 py-2.5 text-sm font-black",
  lg: "px-6 py-3 text-base font-black",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full font-sans transition-all focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0";
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
