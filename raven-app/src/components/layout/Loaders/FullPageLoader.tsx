import { BoxProps, Center, Spinner, SpinnerProps, Stack, Text, TextProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface Props extends BoxProps {
    text?: string
    textProps?: TextProps,
    spinnerProps?: SpinnerProps
}

export const FullPageLoader = ({ text = "Loading...", textProps, spinnerProps, ...props }: Props) => {
    return (
        <Center w='100vw' h='100vh' as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} {...props}>
            <Stack justify={'center'} align='center'>
                <Spinner {...spinnerProps} />
                <Text as='span' style={{ display: 'block ' }} {...textProps}>{text}</Text>
            </Stack>
        </Center>
    )
}