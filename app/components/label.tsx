import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label(props: LabelProps) {
  return <label className="block text-black font-medium mb-1" {...props} />;
}
