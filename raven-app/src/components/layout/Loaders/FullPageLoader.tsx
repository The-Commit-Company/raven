import { Flex, Text } from '@radix-ui/themes'
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex'

interface Props extends FlexProps {
    text?: string
}

export const FullPageLoader = ({ text = "Ravens are finding their way to you...", ...props }: Props) => {
    return (
        <Flex width='100%' height='100%' align='center' justify='center' {...props}>
            <Flex justify='center' align='center' direction='column'>
                <Text as='span' color='gray'><i>{text}</i></Text>
            </Flex>
        </Flex>
    )
}