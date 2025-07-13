import { UserFields } from '@raven/types/common/UserFields'
import { Channel, DMUser, SearchFilters } from './types'

export const updateFilter = (filters: SearchFilters, key: keyof SearchFilters, value: unknown, onFiltersChange: (filters: SearchFilters) => void) => onFiltersChange({ ...filters, [key]: value })

export const clearFilter = (filters: SearchFilters, key: keyof SearchFilters, onFiltersChange: (filters: SearchFilters) => void) => {
    const newFilters = { ...filters }
    if (key === 'dateRange') {
        newFilters.dateRange = { from: undefined, to: undefined }
    } else if (key === 'selectedChannel' || key === 'selectedUser') {
        newFilters[key] = 'all'
    } else if (key === 'channelType' || key === 'messageType') {
        newFilters[key] = 'all'
    } else if (key === 'fileType') {
        newFilters[key] = []
    } else {
        (newFilters as unknown as Record<string, boolean | null>)[key] = null
    }
    onFiltersChange(newFilters)
}

export const clearAllFilters = (onFiltersChange: (filters: SearchFilters) => void) => {
    onFiltersChange({
        searchQuery: '',
        selectedChannel: 'all',
        selectedUser: 'all',
        channelType: 'all',
        messageType: 'all',
        fileType: [],
        dateRange: { from: undefined, to: undefined },
        isPinned: null,
        isSaved: null,
        hasReactions: null,
        hasLink: null,
        inThread: null,
        isDirectMessage: null,
    })
}

export const hasActiveFilters = (filters: SearchFilters): boolean => {
    return !!(
        filters.searchQuery ||
        filters.selectedChannel !== 'all' ||
        filters.selectedUser !== 'all' ||
        filters.channelType !== 'all' ||
        filters.messageType !== 'all' ||
        filters.fileType.length > 0 ||
        filters.dateRange.from ||
        filters.dateRange.to ||
        filters.isPinned !== null ||
        filters.isSaved !== null ||
        filters.hasReactions !== null ||
        filters.hasLink !== null ||
        filters.inThread !== null ||
        filters.isDirectMessage !== null
    )
}

export const separateChannelsAndDMs = (availableChannels: Channel[]) => {
    const channels = availableChannels.filter(channel => channel.is_direct_message !== 1)
    const dms = availableChannels.filter(channel => channel.is_direct_message === 1)
    return { channels, dms }
}

export const getDMUsers = (dms: Channel[], availableUsers: UserFields[]): DMUser[] => {
    return dms.map(dm => {
        const user: UserFields | undefined = availableUsers.find(u => u.name === dm.peer_user_id);
        return {
            id: dm.id,
            name: dm.name,
            user: user || {
                name: dm.peer_user_id || dm.id,
                full_name: dm.name,
                type: 'User', // fallback to 'User' if not found
                enabled: 1,
                user_image: '',
                first_name: '',
                availability_status: '',
                custom_status: ''
            } as UserFields
        }
    })
}

export const getPeerUserForDM = (channel: Channel, availableUsers: UserFields[]): UserFields | null => {
    const userId = channel.peer_user_id
    return availableUsers.find(u => u.name === userId) || null
}

export const getChannelIconType = (type: string): 'Private' | 'Public' | 'Open' => {
    switch (type) {
        case 'private': return 'Private'
        case 'public': return 'Public'
        case 'open': return 'Open'
        default: return 'Public'
    }
} 