import { useMemo } from 'react'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import _ from '@lib/translate'

export const useChannelTypeInfo = (channelType: RavenChannel['type']) => {
    return useMemo(() => {
        switch (channelType) {
            case 'Private':
                return {
                    header: _('Create a private channel'),
                    helperText:
                        _('When a channel is set to private, it can only be viewed or joined by invitation.'),
                }
            case 'Open':
                return {
                    header: _('Create an open channel'),
                    helperText: _('When a channel is set to open, everyone is a member.'),
                }
            default:
                return {
                    header: _('Create a public channel'),
                    helperText: _('When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.'),
                }
        }
    }, [channelType])
}

