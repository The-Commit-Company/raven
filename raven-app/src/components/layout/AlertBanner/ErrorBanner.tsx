import { FrappeError } from 'frappe-react-sdk'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertBanner } from './AlertBanner'
import { AlertProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import React from 'react'

interface ErrorBannerProps extends AlertProps {
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

    // TODO: Sometimes, error message has links which route to the ERPNext interface. We need to parse the link to route to the correct page in our interface
    // Links are of format <a href="{host_name}/app/{doctype}/{name}">LEAD-00001</a>

    return (
        <AnimatePresence>
            {error && <motion.div key='error' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertBanner status={messages[0].indicator === 'yellow' ? 'warning' : "error"} heading={overrideHeading ?? parseHeading(messages[0])} {...props}>
                    {messages.map((m, i) => <Text key={i} fontSize="small">{m.message}</Text>)}
                </AlertBanner>
            </motion.div>}
        </AnimatePresence>

    )
}