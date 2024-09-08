import { Separator, Flex, Text } from '@radix-ui/themes'
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex'

export const DateSeparator = (props: FlexProps) => {

    const { children, ...flexProps } = props

    return (
        <Flex align="center" {...flexProps}>
            <Flex flexGrow='1' >
                <Separator size='4' className={`bg-gray-5 dark:bg-gray-7`} />
            </Flex>
            <Flex px='4'>
                <Text
                    as="span"
                    size='1'
                    className='text-center'
                    color='gray'>
                    {children}
                </Text>
            </Flex>
            <Flex flexGrow='1'>
                <Separator size='4' className={`bg-gray-5 dark:bg-gray-7`} />
            </Flex>
        </Flex>
    )
}