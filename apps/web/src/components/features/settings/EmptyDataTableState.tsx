import { Button } from "@components/ui/button";
import clsx from "clsx";
import { PropsWithChildren } from "react";
import { ButtonProps } from "react-day-picker";
import { Link, LinkProps } from "react-router-dom";


export const EmptyState = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
    return (
        <div className="fixed top-[calc(50%)] sm:left-[calc(50%+128px)] left-[calc(50%)] translate-x-[calc(-50%)] translate-y-[-50%]">
            <div className={clsx('flex flex-col items-center justify-center w-full h-[600px] animate-fadein', className)}>
                {children}
            </div>
        </div>
    )
}

export const EmptyStateIcon = ({ children }: PropsWithChildren) => {

    return <div className="text-5xl text-gray-10">
        {children}
    </div>
}

export const EmptyStateTitle = ({ children }: PropsWithChildren) => {
    return <span className="text-2xl mt-4 text-center text-gray-12 font-semibold">{children}</span>
}

export const EmptyStateDescription = ({ children }: PropsWithChildren) => {
    return <span className="text-sm mt-3 mb-4 max-w-lg text-center text-gray-11">{children}</span>
}

export const EmptyStateLinkAction = ({ children, buttonProps, ...props }: LinkProps & PropsWithChildren<{ buttonProps?: ButtonProps }>) => {
    return <Button asChild className='not-cal' {...buttonProps}>
        <Link {...props}>{children}</Link>
    </Button>
}
