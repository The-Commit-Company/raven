import * as React from "react"

import { cn } from "@/lib/utils"
import { RootProps } from "@radix-ui/themes/dist/cjs/components/text-field"
import { TextField } from "@radix-ui/themes"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef((props: RootProps, ref: React.LegacyRef<HTMLInputElement>) => {

  return (
    <TextField.Root
      size='3'
      ref={ref}
      {...props}
    />
  )
})

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  slotStart?: React.ReactNode
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, type, slotStart, ...props }, ref) => {
    return (
      <div className="relative flex items-center px-4 py-1">
        <div className="absolute h-4 w-4 mx-2 pointer-events-none">{slotStart}</div>
        <input
          type={type}
          prefix=""
          className={cn(
            "flex h-10 w-full rounded-md border border-input/20 bg-background pl-8 pr-2 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>

    )
  }
)
Input.displayName = "Input"
SearchInput.displayName = "SearchInput"

export { Input, SearchInput }
