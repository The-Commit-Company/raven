import { View, Text } from 'react-native';

interface BaseProps {
    heading?: string
}

type ErrorBannerProps =
    | (BaseProps & { message: string; error?: never })
    | (BaseProps & { error: Error; message?: never })

const ErrorBanner = ({ heading, message, error }: ErrorBannerProps) => {
    return (
        <View className="container">
            <View className="border-l-[6px] border-error-border bg-error-background flex w-full rounded-lg px-6 py-3 md:p-9">
                <View className="w-full">
                    {(heading || error) && (heading ?
                        <Text className="mb-3 text-lg font-semibold text-error-heading">
                            {heading}
                        </Text> :
                        <Text className="mb-3 text-lg font-semibold text-error-heading">
                            {error?.name}
                        </Text>
                    )}
                    {(message || error) && (message ?
                        <Text className="text-error mb-2">
                            {message}
                        </Text> :
                        <Text className="text-error mb-2">
                            {error?.message}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    )
}

export default ErrorBanner
