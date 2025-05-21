import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox(props: CheckboxProps) {
  return (
    <label className="inline-flex items-center text-black font-medium mb-1">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-black border border-black rounded-sm transition-all duration-200 hover:opacity-80 active:opacity-60 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 focus:ring-opacity-50 cursor-pointer"
        {...props}
      />

      {props.label && <span className="ml-2">{props.label}</span>}
    </label>
  );
}
