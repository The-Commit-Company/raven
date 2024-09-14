import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { BiDotsHorizontal } from "react-icons/bi"
import clsx from "clsx"
import { Link } from "react-router-dom"
import { LuChevronRight } from "react-icons/lu"
import { Tooltip } from "@radix-ui/themes"
import { toast } from "sonner"

const Breadcrumb = React.forwardRef<
    HTMLElement,
    React.ComponentPropsWithoutRef<"nav"> & {
        separator?: React.ReactNode
    }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
    HTMLOListElement,
    React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={clsx(
            "flex flex-wrap items-center gap-1 break-words text-sm text-gray-11 sm:gap-1 list-none",
            className
        )}
        {...props}
    />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        className={clsx("inline-flex items-center gap-1.5", className)}
        {...props}
    />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentPropsWithoutRef<"a"> & {
        asChild?: boolean
        href: string
    }
>(({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : Link

    return (
        <Comp
            ref={ref}
            to={props.href}
            className={clsx("text-gray-11 transition-colors hover:text-gray-12", className)}
            {...props}
        />
    )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
    HTMLSpanElement,
    React.ComponentPropsWithoutRef<"span"> & {
        copyToClipboard?: boolean,
        value?: React.ReactNode
    }
>(({ className, copyToClipboard, value, ...props }, ref) => {

    const onCopy = () => {
        if (copyToClipboard && value) {
            navigator.clipboard.writeText(value.toString())
                .then(() => toast.success("Copied to clipboard", {
                    duration: 800
                }))
        }
    }

    if (copyToClipboard && value) {
        return <Tooltip content={"Click to copy"}>
            <span
                ref={ref}
                role={copyToClipboard ? "button" : "link"}
                aria-disabled="true"
                aria-current="page"
                onClick={onCopy}
                className={clsx("font-normal text-gray-12 cursor-pointer", className)}
                {...props}
            />
        </Tooltip>
    }

    return (
        <span
            ref={ref}
            role={"link"}
            aria-disabled="true"
            aria-current="page"
            className={clsx("font-normal text-gray-12", className)}
            {...props}
        />
    )
})

BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
    children,
    className,
    ...props
}: React.ComponentProps<"li">) => (
    <li
        role="presentation"
        aria-hidden="true"
        className={clsx("flex items-center", className)}
        {...props}
    >
        {children ?? <LuChevronRight size='14' />}
    </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
    className,
    ...props
}: React.ComponentProps<"span">) => (
    <span
        role="presentation"
        aria-hidden="true"
        className={clsx("flex h-9 w-9 items-center justify-center", className)}
        {...props}
    >
        <BiDotsHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
    </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
}
