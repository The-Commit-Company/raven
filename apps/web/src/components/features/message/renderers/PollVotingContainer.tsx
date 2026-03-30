import React from "react"
import { cn } from "@lib/utils"

export interface PollVotingContainerProps {
    children: React.ReactNode
    className?: string
}

export const PollVotingContainer: React.FC<PollVotingContainerProps> = ({
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "w-full max-w-md bg-card border border-border rounded-lg p-4 shadow-xs",
                className
            )}
        >
            {children}
        </div>
    )
}

