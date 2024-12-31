import { Flex } from '@radix-ui/themes'
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex'

export const ICON_PROPS = {
    size: '18'
}

export const DEFAULT_BUTTON_STYLE = 'bg-transparent dark:text-gray-11 sm:dark:text-gray-10 text-gray-11 hover:bg-accent-a3 hover:text-accent-a11 dark:hover:text-accent-a11'
export const ToolPanel = (props: FlexProps) => {

    return (
        <Flex
            justify='between'
            align='center'
            className='border-t border-t-slate-5 bg-slate-2 rounded-b-radius4 overflow-hidden'
            p='1'
            {...props}
        >
        </Flex>
    )
}