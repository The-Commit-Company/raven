import { Flex } from '@radix-ui/themes'
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex'

export const ICON_PROPS = {
    size: '18px'
}

export const DEFAULT_BUTTON_STYLE = 'bg-transparent text-[var(--gray-11)] hover:bg-[var(--accent-a3)] hover:text-[var(--accent-a11)]'
export const ToolPanel = (props: FlexProps) => {

    return (
        <Flex
            justify='between'
            align='center'
            className='border-t border-t-[var(--slate-5)] bg-[var(--slate-2)] shadow-md rounded-b-md'
            p='1'
            {...props}
        >
        </Flex>
    )
}