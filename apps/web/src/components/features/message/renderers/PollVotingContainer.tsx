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
                "w-full max-w-md sm:max-w-lg my-0.5 bg-surface-elevation-3 border border-outline-gray-2 rounded-md p-4 flex flex-col gap-3",
                className
            )}
        >
            {children}
        </div>
    )
}

