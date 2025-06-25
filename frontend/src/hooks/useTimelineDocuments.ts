import { useFrappeGetCall } from 'frappe-react-sdk'
import { TimelineItem } from '@/components/feature/chat/ChatInput/TimelineMentionList'

export const useTimelineDocuments = () => {
    const { data, error, isLoading, mutate } = useFrappeGetCall<TimelineItem[]>(
        'raven.api.timeline_api.get_timeline_documents', 
        undefined,
        {
            revalidateOnFocus: false,  
            revalidateOnReconnect: false,
            refreshInterval: 300000, // Refresh every 5 minutes
        }
    )

    // Debug logging
    console.log('useTimelineDocuments - Data:', data)
    console.log('useTimelineDocuments - Error:', error)
    console.log('useTimelineDocuments - Loading:', isLoading)

    return {
        timelineDocuments: data ?? [],
        error,
        isLoading,
        mutate
    }
}