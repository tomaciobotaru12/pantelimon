import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-sepia-700/30 bg-sepia-50/5 px-3 py-2 text-sm text-sepia-50 placeholder:text-sepia-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sepia-300 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
