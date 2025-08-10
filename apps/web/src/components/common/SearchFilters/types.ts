export interface SearchFilters {
    searchQuery: string,
    selectedChannel: string,
    selectedUser: string,
    channelType: '' | 'Public' | 'Private' | 'Open',
    messageType: '' | 'Text' | 'Image' | 'File' | 'Poll',
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