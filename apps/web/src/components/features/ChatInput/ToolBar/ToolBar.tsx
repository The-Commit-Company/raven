/**
 * ToolBar.tsx - Bottom toolbar for editor action buttons
 */

import { cn } from "@lib/utils"

interface ToolBarProps {
    children: React.ReactNode
    className?: string
}

/**
 * Container for toolbar - spans full width with items at ends.
 */
export const ToolBar = ({ children, className }: ToolBarProps) => {
    return (
        <div className={cn(
            "flex items-center justify-between",
            "border-t border-border",
            "bg-muted/30",
            "px-1 py-1",
            className
        )}>
            {children}
        </div>
    )
}

/**
 * Visual separator between button groups.
 */
export const ToolSeparator = () => {
    return <div className="w-px h-3.5 bg-border mx-0.5" />
}

/**
 * Icon size constant for consistent toolbar icons.
 */
export const ICON_SIZE = 14
