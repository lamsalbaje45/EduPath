/**
 * ErrorBanner - Error message display
 * Variants: banner (alert style), inline, toast
 * Dismissible with onClose callback
 */

export const ErrorBanner = ({
  message,
  variant = "banner",
  title = "Error",
  onClose = null,
  dismissible = true,
  className = "",
  details = null,
}) => {
  if (!message) return null;

  if (variant === "inline") {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
      >
        {message}
      </div>
    );
  }

  if (variant === "toast") {
    return (
      <div
        className={`fixed bottom-4 right-4 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-4 shadow-lg ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <svg
              className="h-5 w-5 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">{title}</p>
            <p className="mt-1 text-sm text-red-700">{message}</p>
            {details && <p className="mt-2 text-xs text-red-600">{details}</p>}
          </div>
          {dismissible && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-3 shrink-0 text-red-400 hover:text-red-500"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default: banner
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          {title && <p className="font-semibold text-red-800">{title}</p>}
          <p className={`text-sm text-red-700 ${title ? "mt-1" : ""}`}>
            {message}
          </p>
          {details && <p className="mt-2 text-xs text-red-600">{details}</p>}
        </div>
        {dismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-3 shrink-0 text-red-400 hover:text-red-500"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
