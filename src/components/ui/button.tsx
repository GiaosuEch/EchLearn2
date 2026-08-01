import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-extrabold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 hover:bg-emerald-400 text-white border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 shadow-md",
        destructive:
          "bg-rose-500 hover:bg-rose-400 text-white border-b-4 border-rose-700 active:translate-y-1 active:border-b-0 shadow-md",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 shadow-xs",
        secondary:
          "bg-slate-100 hover:bg-slate-200 text-slate-800 border-b-4 border-slate-300 active:translate-y-1 active:border-b-0 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
        ghost:
          "hover:bg-slate-100 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
        link:
          "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs rounded-xl",
        lg: "h-13 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
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
