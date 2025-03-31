import { View, Text } from 'react-native';
import { FrappeError } from 'frappe-react-sdk'

interface BaseProps {
    heading?: string
}

interface ParsedErrorMessage {
    message: string,
    title?: string,
    indicator?: string,
}


export const getErrorMessage = (error?: FrappeError | null): string => {
    const messages = getErrorMessages(error)
    return messages.map(m => m.message).join('\n')
}

const getErrorMessages = (error?: FrappeError | null): ParsedErrorMessage[] => {
    if (!error) return []
    let eMessages: ParsedErrorMessage[] = error?._server_messages ? JSON.parse(error?._server_messages) : []
    eMessages = eMessages.map((m: any) => {
        try {
            return JSON.parse(m)
        } catch (e) {
            return m
        }
    })

    if (eMessages.length === 0) {
        // Get the message from the exception by removing the exc_type
        const indexOfFirstColon = error?.exception?.indexOf(':')
        if (indexOfFirstColon) {
            const exception = error?.exception?.slice(indexOfFirstColon + 1)
            if (exception) {
                eMessages = [{
                    message: exception,
                    title: "Error"
                }]
            }
        }

        if (eMessages.length === 0) {
            eMessages = [{
                message: error?.message,
                title: "Error",
                indicator: "red"
            }]
        }
    }
    return eMessages

}

type ErrorBannerProps =
    | (BaseProps & { message: string; error?: never })
    | (BaseProps & { error: FrappeError; message?: never })

const ErrorBanner = ({ heading, message, error }: ErrorBannerProps) => {

    const messages = getErrorMessages(error)
    return (
        <View className="container">
            <View className="border-l-[5px] border-error-border bg-error-background flex w-full rounded-lg rounded-l-none px-6 py-3 md:p-9">
                <View className="w-full">
                    {(heading || error) && (heading ?
                        <Text className="mb-2 text-base font-semibold text-error-heading">
                            {heading}
                        </Text> :
                        <Text className="mb-2 text-base font-semibold text-error-heading">
                            {error?.message}
                        </Text>
                    )}
                    {message ? (
                        <Text className="text-foreground text-base mb-2">
                            {message}
                        </Text>
                    ) : (
                        messages.map((m, i) => <Text key={i} className="text-foreground text-base mb-2">
                            {m.message}
                        </Text>)
                    )}
                </View>
            </View>
        </View>
    )
}

export default ErrorBanner
