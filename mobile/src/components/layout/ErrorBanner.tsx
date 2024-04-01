import { FrappeError } from 'frappe-react-sdk'
import { useMemo } from 'react'
import { MarkdownRenderer } from '../common/MarkdownRenderer'
import { ErrorCallout } from '../common/Callouts'
import { Callout, Text } from '@radix-ui/themes'
import { FiAlertCircle } from 'react-icons/fi'

interface ErrorBannerProps {
    error?: FrappeError | null,
    overrideHeading?: string,
}

interface ParsedErrorMessage {
    message: string,
    title?: string,
    indicator?: string,
}
export const ErrorBanner = ({ error, overrideHeading, ...props }: ErrorBannerProps) => {


    //exc_type: "ValidationError" or "PermissionError" etc
    // exc: With entire traceback - useful for reporting maybe
    // httpStatus and httpStatusText - not needed
    // _server_messages: Array of messages - useful for showing to user
    // console.log(JSON.parse(error?._server_messages!))

    const messages = useMemo(() => {
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
    }, [error])

    const parseHeading = (message?: ParsedErrorMessage) => {
        if (message?.title === 'Message' || message?.title === 'Error') return undefined
        return message?.title
    }

    if (messages.length === 0) return null
    return (
        <Callout.Root color='red' variant='soft'>
            <Callout.Icon>
                <FiAlertCircle size="18" />
            </Callout.Icon>
            <Callout.Text>
                <Text weight='bold'>{overrideHeading ?? parseHeading(messages[0])}</Text>
                {messages.map((m, i) => <MarkdownRenderer key={i} content={m.message} />)}
            </Callout.Text>
        </Callout.Root>
    )
}