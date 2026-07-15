import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:brightness-110 active:brightness-95",
  secondary:
    "bg-surface-2 text-foreground hover:bg-surface-2/70 border border-border",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  outline: "bg-transparent border border-border text-foreground hover:bg-surface-2",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full font-medium transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
