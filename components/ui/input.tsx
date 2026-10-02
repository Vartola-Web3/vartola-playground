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
          "flex h-10 w-full rounded-xl border border-[rgba(112,255,184,0.2)] bg-[#091713] px-3 py-2 text-sm text-[#F6FFF9] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#9FB8AD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35F49A] disabled:cursor-not-allowed disabled:opacity-50",
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
