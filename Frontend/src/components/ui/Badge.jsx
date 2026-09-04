/**
 * Badge - For status, type, or category tags
 * Variants: primary, secondary, success, warning, danger, outline
 */

const variants = {
  primary: "bg-[#5472FC]/10 text-[#2551D9] border-[#5472FC]/30",
  secondary: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  outline: "bg-transparent border-gray-300 text-gray-700",
};

const sizes = {
  sm: "px-2.5 py-1 text-xs font-semibold",
  md: "px-3 py-1.5 text-sm font-semibold",
  lg: "px-4 py-2 text-base font-semibold",
};

export const Badge = ({
  children,
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses = `inline-flex items-center justify-center rounded-full border font-sans transition-colors`;
  const variantClasses = variants[variant] || variants.secondary;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <span
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
