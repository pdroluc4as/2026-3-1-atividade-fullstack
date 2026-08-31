import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-400"
      : "bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-500";

  return (
    <button
      type={type}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
