import { BoxProps, Center, Spinner, SpinnerProps, Stack, Text, TextProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface Props extends BoxProps {
    text?: string
    textProps?: TextProps,
    spinnerProps?: SpinnerProps
}

export const FullPageLoader = ({ text = "Ravens are finding their way to you...", textProps, spinnerProps, ...props }: Props) => {
    return (
        <Center w='100vw' h='100vh' as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} {...props}>
            <Stack justify={'center'} align='center'>
                <Spinner color='gray.500' {...spinnerProps} />
                <Text as='span' color='gray.500' fontStyle={'italic'} {...textProps}>{text}</Text>
            </Stack>
        </Center>
    )
}