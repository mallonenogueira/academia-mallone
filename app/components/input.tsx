import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return (
    <input
      className="px-3 py-1.5 bg-transparent text-black border border-black font-medium rounded-sm shadow-sm transition-all duration-200 hover:opacity-80 active:opacity-60 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 cursor-pointer w-full"
      {...props}
    />
  );
}
