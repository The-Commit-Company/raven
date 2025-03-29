import { useLocalSearchParams } from 'expo-router'
import { ForwardMessage } from '@components/features/forward-message/ForwardMessage'
import CommonErrorBoundary from "@components/common/CommonErrorBoundary"

export default function ForwardMessagePage() {
    const message = useLocalSearchParams()
    return <ForwardMessage message={message} />
}

export const ErrorBoundary = CommonErrorBoundary 