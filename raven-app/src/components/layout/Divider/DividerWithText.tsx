import { Box, Divider, Flex, FlexProps, Text, useColorModeValue } from '@chakra-ui/react'

export const DividerWithText = (props: FlexProps) => {

    const { children, ...flexProps } = props
    const BORDERCOLOR = useColorModeValue('gray.300', 'gray.600')

    return (
        <Flex align="center" color="gray.300" {...flexProps}>
            <Box flex="1">
                <Divider borderColor={BORDERCOLOR} />
            </Box>
            <Text as="span" px="2" fontSize={'xs'} border={'1px'} borderColor={BORDERCOLOR} boxShadow={'sm'} rounded='md' color={'gray.500'} fontWeight="medium">
                {children}
            </Text>
            <Box flex="1">
                <Divider borderColor={BORDERCOLOR} />
            </Box>
        </Flex>
    )
}