import { Loader } from '@/components/common/Loader'
import { Flex, FlexProps, Text } from '@radix-ui/themes'
import { clsx } from 'clsx'

type Props = FlexProps & {
    text?: string
}

export const FullPageLoader = ({ text = "Ravens are finding their way to you...", ...props }: Props) => {
    return (
        <Flex align='center' width='100%' justify='center' {...props} className={clsx('h-screen', props.className)}>
            <Flex justify='center' align='center' direction='row' gap='4'>
                <Loader />
                <Text as='span' color='gray'>{text}</Text>
            </Flex>
        </Flex>
    )
}