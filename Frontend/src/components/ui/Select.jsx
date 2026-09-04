/**
 * Select - Dropdown select component
 * Matches Input.jsx styling
 */

const selectBase =
  "w-full px-4 py-3 border rounded-xl text-sm font-sans bg-white/90 dark:bg-slate-900/90 dark:text-white transition-all focus:outline-none focus:ring-0 appearance-none";
const selectFocus =
  "focus:border-[#1F4FD8] focus:shadow-[0_0_0_3px_rgba(31,79,216,0.12)]";
const selectError = "border-red-500 shadow-red-100 dark:shadow-red-900";
const selectDefault = "border-gray-200 dark:border-slate-700";

export const Select = ({
  error,
  label,
  helperText,
  options = [],
  placeholder = "Select an option...",
  className = "",
  children,
  ...props
}) => {
  const selectClasses = `${selectBase} ${error ? selectError : `${selectDefault} ${selectFocus}`} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <div className="relative">
        <select className={selectClasses} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0 &&
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}
      {helperText && !error && (
        <span className="mt-1 block text-xs text-gray-500">{helperText}</span>
      )}
    </div>
  );
};

export default Select;
