import { IconButton, Tooltip } from '@radix-ui/themes'
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'
import { clsx } from 'clsx'
import { forwardRef } from 'react'

interface QuickActionButtonProps extends IconButtonProps {
    tooltip: string
}

export const QUICK_ACTION_BUTTON_CLASS = 'bg-gray-2 dark:bg-gray-2 hover:bg-gray-4 dark:hover:bg-gray-5 text-gray-12 hover:text-gray-12'
export const QuickActionButton = forwardRef(({ className, tooltip, ...props }: QuickActionButtonProps, ref) => {
    return (
        <Tooltip content={tooltip}>
            <IconButton
                size='2'
                className={clsx(QUICK_ACTION_BUTTON_CLASS, className)}
                ref={ref}
                {...props}
            />
        </Tooltip>
    )
})