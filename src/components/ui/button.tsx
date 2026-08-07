import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:-translate-y-px active:translate-y-0",
        destructive:
          "bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:-translate-y-px active:translate-y-0",
        outline:
          "border border-[var(--ech-border)] bg-[var(--ech-surface)] hover:bg-[var(--ech-surface-2)] text-[var(--ech-text)]",
        secondary:
          "bg-[var(--ech-surface-2)] hover:bg-[var(--ech-border)] text-[var(--ech-text)]",
        ghost:
          "hover:bg-[var(--ech-surface-2)] text-[var(--ech-text-muted)] hover:text-[var(--ech-text)]",
        link:
          "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs rounded-lg",
        lg: "h-12 px-7 text-base rounded-xl",
        icon: "h-9 w-9 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
