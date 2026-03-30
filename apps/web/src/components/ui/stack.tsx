import * as React from "react"
import { cn } from "@lib/utils"

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    gap?: "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16" | "20" | "24"
    align?: "start" | "center" | "end" | "stretch"
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
}

const gapClasses = {
    "1": "gap-1",
    "2": "gap-2",
    "3": "gap-3",
    "4": "gap-4",
    "5": "gap-5",
    "6": "gap-6",
    "8": "gap-8",
    "10": "gap-10",
    "12": "gap-12",
    "16": "gap-16",
    "20": "gap-20",
    "24": "gap-24",
}

const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
}

const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
}

export const HStack = React.forwardRef<HTMLDivElement, StackProps>(
    ({ className, gap = "2", align, justify, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-row",
                    gapClasses[gap],
                    align && alignClasses[align],
                    justify && justifyClasses[justify],
                    className,
                )}
                {...props}
            />
        )
    },
)
HStack.displayName = "HStack"

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
    ({ className, gap = "2", align, justify, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col",
                    gapClasses[gap],
                    align && alignClasses[align],
                    justify && justifyClasses[justify],
                    className,
                )}
                {...props}
            />
        )
    },
)
Stack.displayName = "Stack"