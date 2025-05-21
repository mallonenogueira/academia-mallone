import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select(props: SelectProps) {
  return (
    <select
      className="px-3 py-1.5 bg-transparent text-black border border-black font-medium rounded-sm shadow-sm transition-all duration-200 hover:opacity-80 active:opacity-60 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 cursor-pointer w-full"
      {...props}
    />
  );
}
