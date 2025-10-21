import { useMemo } from 'react'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'

export const useChannelTypeInfo = (channelType: RavenChannel['type']) => {
    return useMemo(() => {
        switch (channelType) {
            case 'Private':
                return {
                    header: 'Create a private channel',
                    helperText:
                        'When a channel is set to private, it can only be viewed or joined by invitation.',
                }
            case 'Open':
                return {
                    header: 'Create an open channel',
                    helperText: 'When a channel is set to open, everyone is a member.',
                }
            default:
                return {
                    header: 'Create a public channel',
                    helperText:
                        'When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.',
                }
        }
    }, [channelType])
}

