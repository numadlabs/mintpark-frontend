import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white8 bg-background px-3 py-2 text-lg",
          "[appearance:textfield]",
          "[&::-webkit-outer-spin-button]:m-0",
          "[&::-webkit-outer-spin-button]:appearance-none",
          "[&::-webkit-inner-spin-button]:m-0",
          "[&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
