import { Separator, Flex, Text } from '@radix-ui/themes'
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex'

export const DividerWithText = (props: FlexProps) => {

    const { children, ...flexProps } = props

    return (
        <Flex align="center" {...flexProps}>
            <Flex grow='1' >
                <Separator size='4' />
            </Flex>
            <Flex
                className='border border-[var(--gray-7)] shadow-sm rounded-md'
                px='2'
            >
                <Text
                    as="span"
                    size='1'
                    color={'gray'}
                    weight="medium"
                >
                    {children}
                </Text>
            </Flex>

            <Flex grow='1'>
                <Separator size='4' />
            </Flex>
        </Flex>
    )
}