import { Flex, FlexProps } from '@radix-ui/themes'

export const HStack = (props: FlexProps) => {
    return (
        <Flex direction="row" gap="2" {...props} />
    )
}

export const Stack = (props: FlexProps) => {
    return (
        <Flex direction="column" gap="2" {...props} />
    )
}