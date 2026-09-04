/**
 * LoadingSpinner - Loading indicator
 * Variants: spinner (SVG), dots, bar
 */

export const LoadingSpinner = ({
  variant = "spinner",
  size = "md",
  message = "Loading...",
  fullScreen = false,
  className = "",
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white/50 backdrop-blur-sm">
        <div className="text-center">
          {variant === "spinner" && (
            <svg
              className={`mx-auto animate-spin text-[#5472FC] ${sizeClass}`}
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
          )}
          {variant === "dots" && (
            <div className="flex justify-center gap-1">
              <div
                className="h-3 w-3 animate-bounce rounded-full bg-[#5472FC]"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-3 w-3 animate-bounce rounded-full bg-[#5472FC]"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-3 w-3 animate-bounce rounded-full bg-[#5472FC]"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          )}
          {variant === "bar" && (
            <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-1/3 animate-pulse bg-[#5472FC]" />
            </div>
          )}
          {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {variant === "spinner" && (
        <svg
          className={`animate-spin text-[#5472FC] ${sizeClass}`}
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
      )}
      {variant === "dots" && (
        <div className="flex gap-1">
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-[#5472FC]"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-[#5472FC]"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-[#5472FC]"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}
      {variant === "bar" && (
        <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/3 animate-pulse bg-[#5472FC]" />
        </div>
      )}
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
