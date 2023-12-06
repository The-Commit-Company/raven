import { Flex } from '@radix-ui/themes'
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex'

export const ICON_PROPS = {
    size: '18'
}

export const DEFAULT_BUTTON_STYLE = 'bg-transparent dark:text-[var(--gray-10)] text-[var(--gray-11)] hover:bg-[var(--accent-a3)] hover:text-[var(--accent-a11)]'
export const ToolPanel = (props: FlexProps) => {

    return (
        <Flex
            justify='between'
            align='center'
            className='border-t border-t-[var(--slate-5)] bg-[var(--slate-2)] rounded-b-[var(--radius-4)]'
            p='1'
            {...props}
        >
        </Flex>
    )
}