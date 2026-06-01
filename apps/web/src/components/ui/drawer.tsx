import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@lib/utils"

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
    return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
    return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
    return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            data-slot="drawer-overlay"
            className={cn("fixed inset-0 z-50 bg-black/40", className)}
            {...props}
        />
    )
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
    return (
        <DrawerPortal>
            <DrawerOverlay />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl border-t border-outline-gray-2 bg-surface-white outline-none",
                    className
                )}
                {...props}
            >
                <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-surface-gray-4 shrink-0" />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    )
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="drawer-header"
            className={cn("flex flex-col gap-1.5 px-6 pt-4 pb-4", className)}
            {...props}
        />
    )
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="drawer-footer"
            className={cn("flex items-center justify-end gap-3 border-t px-4 py-4 shrink-0", className)}
            {...props}
        />
    )
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            data-slot="drawer-title"
            className={cn("text-xl font-semibold text-ink-gray-8", className)}
            {...props}
        />
    )
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            data-slot="drawer-description"
            className={cn("text-sm text-ink-gray-5", className)}
            {...props}
        />
    )
}

export {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerPortal,
    DrawerTitle,
    DrawerTrigger,
}
