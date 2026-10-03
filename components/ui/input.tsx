import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#DCE6E1] bg-white px-3 py-2 text-sm text-[#13251E] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#93A29B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15C77A]/35 disabled:cursor-not-allowed disabled:bg-[#F4F7F5] disabled:opacity-60",
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
