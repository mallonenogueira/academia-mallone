import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function ButtonPrimary(props: ButtonProps) {
  const className = props.className ?? "";
  return (
    <button
      {...props}
      className={`px-4 py-1.5 bg-black text-white font-medium rounded-sm shadow-sm transition-all duration-200 hover:bg-black hover:text-white hover:opacity-80 active:opacity-60 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 cursor-pointer ${className}`}
    />
  );
}

export function ButtonSecondary(props: ButtonProps) {
  const className = props.className ?? "";
  return (
    <button
      {...props}
      className={`px-4 py-1.5 bg-transparent text-black border border-black font-medium rounded-sm shadow-sm transition-all duration-200 hover:opacity-80 active:opacity-60 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 cursor-pointer ${className}`}
    />
  );
}
