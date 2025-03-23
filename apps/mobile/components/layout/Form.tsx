import { Text } from '@components/nativewindui/Text'
import { TextProps } from 'react-native'

type FormLabelProps = TextProps & {
    isRequired?: boolean
    fontSize?: string
    fontWeight?: string
}

export const FormLabel = ({ children, isRequired, ...props }: FormLabelProps) => {
    return (
        <Text className="text-base font-semibold" {...props}>
            {children} {isRequired && <Text className='text-red-600'>*</Text>}
        </Text>
    )
}

export const HelperText = (props: TextProps) => {
    return (
        <Text className="text-xs text-gray-300" {...props} />
    )
}

export const ErrorText = (props: TextProps) => {
    return (
        <Text className="text-xs text-red-700" {...props} />
    )
}