import { TextProps } from '@radix-ui/themes/dist/cjs/components/text'
import { Box, Text } from '@radix-ui/themes'

type LabelProps = TextProps & {
    isRequired?: boolean
}
export const Label = ({ children, isRequired, ...props }: LabelProps) => {
    return (
        <Box pb='1'>
            <Text as='label' weight='medium' size='2' {...props}>
                {children} {isRequired && <Text as='span' color='red'>*</Text>}
            </Text>
        </Box>

    )
}


export const HelperText = (props: TextProps) => {
    return (
        <Text as='span' size='2' color='gray' {...props} />
    )
}

export const ErrorText = (props: TextProps) => {
    return (
        <Text as='p' size='2' color='red' {...props} />
    )
}