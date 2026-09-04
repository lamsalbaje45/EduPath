/**
 * Input - Text input component
 * Matches login.jsx inputBase/inputState pattern
 */

const inputBase =
  "w-full px-4 py-3 border rounded-xl text-sm font-sans bg-white/90 dark:bg-slate-900/90 dark:text-white transition-all focus:outline-none focus:ring-0";
const inputFocus =
  "focus:border-[#1F4FD8] focus:shadow-[0_0_0_3px_rgba(31,79,216,0.12)]";
const inputError = "border-red-500 shadow-red-100 dark:shadow-red-900";
const inputDefault = "border-gray-200 dark:border-slate-700";

export const Input = ({
  error,
  label,
  helperText,
  className = "",
  ...props
}) => {
  const inputClasses = `${inputBase} ${error ? inputError : `${inputDefault} ${inputFocus}`} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}
      {helperText && !error && (
        <span className="mt-1 block text-xs text-gray-500">{helperText}</span>
      )}
    </div>
  );
};

export default Input;
