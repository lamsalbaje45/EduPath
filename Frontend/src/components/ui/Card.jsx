/**
 * Card - Container component for content sections
 * Used for displaying grouped information with border and shadow
 */

export const Card = ({
  children,
  className = "",
  onClick,
  hover = false,
  ...props
}) => {
  const baseClasses =
    "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";
  const hoverClasses = hover
    ? "transition-all hover:shadow-md hover:border-[#5472FC]/50 cursor-pointer"
    : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Skeleton - Loading placeholder for content
 */
export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
      {...props}
    />
  );
};

export default Card;
