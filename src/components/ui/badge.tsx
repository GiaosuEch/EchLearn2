import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
        secondary:
          "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
        destructive:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        outline:
          "text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700",
        amber:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        purple:
          "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
