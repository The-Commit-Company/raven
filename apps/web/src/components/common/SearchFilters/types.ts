import { UserFields } from '@raven/types/common/UserFields'

export interface SearchFilters {
    searchQuery: string,
    selectedChannel: string,
    selectedUser: string,
    channelType: 'all' | 'public' | 'private' | 'open' | 'dm',
    messageType: 'all' | 'Text' | 'Image' | 'File' | 'Poll',
    fileType: string[],
    dateRange: {
        from?: Date,
        to?: Date,
        preset?: string,
    },
    isPinned: boolean | null,
    isSaved: boolean | null,
    hasReactions: boolean | null,
    hasLink: boolean | null,
    inThread: boolean | null,
    isDirectMessage: boolean | null,
}

export interface Channel {
    id: string,
    name: string,
    type: 'public' | 'private' | 'open' | 'dm',
    is_direct_message?: 0 | 1,
    peer_user_id?: string,
}

export interface SearchFiltersProps {
    filters: SearchFilters,
    onFiltersChange: (filters: SearchFilters) => void,
    availableChannels: Channel[],
    availableUsers?: UserFields[],
}

export interface FilterComponentProps {
    filters: SearchFilters,
    onFiltersChange: (filters: SearchFilters) => void,
    availableChannels: Channel[],
    availableUsers: UserFields[],
    showLabel?: boolean;
}

export interface DMUser {
    id: string,
    name: string,
    user: UserFields,
} 