import { View, Text } from 'react-native';
import { FrappeError as Error } from 'frappe-react-sdk'

interface BaseProps {
    heading?: string
}

type ErrorBannerProps =
    | (BaseProps & { message: string; error?: never })
    | (BaseProps & { error: Error; message?: never })

const ErrorBanner = ({ heading, message, error }: ErrorBannerProps) => {
    return (
        <View className="container">
            <View className="border-l-[5px] border-error-border bg-error-background flex w-full rounded-md px-6 py-3 md:p-9">
                <View className="w-full">
                    {(heading || error) && (heading ?
                        <Text className="mb-2 text-base font-semibold text-error-heading">
                            {heading}
                        </Text> :
                        <Text className="mb-2 text-base font-semibold text-error-heading">
                            {error?.message}
                        </Text>
                    )}
                    {(message || error) && (message ?
                        <Text className="text-error mb-2">
                            {message}
                        </Text> :
                        <Text className="text-error mb-2">
                            {error?.exception}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    )
}

export default ErrorBanner
