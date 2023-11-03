import { TextProps } from '@radix-ui/themes/dist/cjs/components/text'
import { Box, Text } from '@radix-ui/themes'

type LabelProps = TextProps & {
    isRequired?: boolean
}
export const Label = ({ children, isRequired, ...props }: LabelProps) => {
    return (
        <Box pb='1'>
            {/* @ts-expect-error */}
            <Text as='label' weight='medium' size='2' {...props}>
                {children} {isRequired && <Text as='span' color='red'>*</Text>}
            </Text>
        </Box>

    )
}


export const HelperText = (props: TextProps) => {
    return (
        //@ts-expect-error
        <Text as='span' size='1' color='gray' {...props} />
    )
}

export const ErrorText = (props: TextProps) => {
    return (
        //@ts-expect-error
        <Text as='span' size='1' color='red' {...props} />
    )
}