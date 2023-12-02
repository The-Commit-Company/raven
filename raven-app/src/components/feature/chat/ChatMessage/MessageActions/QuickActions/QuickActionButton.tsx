import { IconButton, Tooltip } from '@radix-ui/themes'
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'
import { clsx } from 'clsx'

interface QuickActionButtonProps extends IconButtonProps {
    tooltip: string
}

export const QUICK_ACTION_BUTTON_CLASS = 'bg-[var(--gray-4)] dark:bg-[var(--gray-6)] hover:bg-[var(--gray-5)] dark:hover:bg-[var(--gray-8)] text-[var(--gray-12)] hover:text-[var(--gray-12)]'
export const QuickActionButton = ({ className, tooltip, ...props }: QuickActionButtonProps) => {
    return (
        <Tooltip content={tooltip}>
            <IconButton
                size='2'
                className={clsx(QUICK_ACTION_BUTTON_CLASS, className)}
                {...props}
            />
        </Tooltip>
    )
}