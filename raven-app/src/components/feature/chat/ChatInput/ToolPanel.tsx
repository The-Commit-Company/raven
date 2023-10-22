import { HStack, StackProps, useColorModeValue } from '@chakra-ui/react'

export const ICON_PROPS = {
    size: '20px'
}
export const ToolPanel = (props: StackProps) => {

    const buttonGroupBgColor = useColorModeValue('white', 'gray.900')
    const borderTopColor = useColorModeValue('gray.100', 'gray.700')
    return (
        <HStack
            justify={'space-between'}
            borderTop='1px solid'
            borderTopColor={borderTopColor}
            bgColor={buttonGroupBgColor}
            p='1.5'
            shadow={'md'}
            roundedBottom='md'
            {...props}
        >
        </HStack>
    )
}