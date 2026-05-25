import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

export function ButtonPrimary({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} border border-transparent bg-gray-900 text-white px-5 py-3 hover:bg-gray-700 focus:ring-gray-900 ${className}`}
    />
  );
}

export function ButtonSecondary({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} border border-gray-300 text-gray-700 px-5 py-3 hover:bg-gray-50 focus:ring-gray-400 ${className}`}
    />
  );
}

export function ButtonDanger({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} border border-transparent bg-red-500 text-white px-5 py-3 hover:bg-red-600 focus:ring-red-500 ${className}`}
    />
  );
}

export function ButtonGhost({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} border border-transparent text-gray-500 px-3 py-2 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400 ${className}`}
    />
  );
}

export function IconButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 ${className}`}
    />
  );
}
