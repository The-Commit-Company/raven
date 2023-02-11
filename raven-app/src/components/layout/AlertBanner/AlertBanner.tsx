import { Alert, AlertIcon, AlertProps, Box, Text } from '@chakra-ui/react'
import { OPACITY_ON_LOAD } from '../../../utils/layout/animations'

interface Props extends AlertProps {
    heading?: string,
    children?: React.ReactNode
}

export const AlertBanner = ({ variant = "left-accent", heading, children, ...props }: Props) => {

    return (
        <Alert variant={variant} {...props} {...OPACITY_ON_LOAD} exit={{ opacity: 0 }}>
            <AlertIcon />
            <Box>
                {heading && <Text fontSize="sm" fontWeight="medium">{heading}</Text>}
                {children && <Text fontSize="small">{children}</Text>}
            </Box>
        </Alert>
    )
}
