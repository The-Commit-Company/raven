import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { usePinnedMessages } from '@hooks/usePinnedMessages'
import { useChannelMembers } from '@hooks/useChannelMembers'
import { formatRelativeDate } from '@lib/date'
import { MessageListSkeleton } from '@components/features/dm-channel/DirectMessagePageSkeleton'

const ChannelPins = ({ channelID }: { channelID: string }) => {
    const { pins, isLoading } = usePinnedMessages(channelID)
    const { members } = useChannelMembers(channelID)

    return (
        <ScrollArea className="h-full">
            {isLoading || !pins ? <MessageListSkeleton /> :
                pins.length === 0 ? <div className="text-sm text-ink-gray-4 text-center py-8">No pinned messages in this channel yet.</div> :
                    <div className="px-1 space-y-2">
                        {pins.map((message) => {
                            const member = members.find((m) => m.name === message.owner)
                            return (
                                <div
                                    key={message.name}
                                    className="p-3 border border-outline-gray-2/70 rounded-lg hover:bg-surface-gray-2/50 transition-colors cursor-pointer w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        {member && <>
                                            <UserAvatar
                                                user={member}
                                                size="sm"
                                            />
                                            <div className="font-medium text-sm">{member.full_name}</div>
                                        </>}
                                        <div className="text-xs text-ink-gray-4/80">
                                            {formatRelativeDate(message.creation)}
                                        </div>
                                    </div>
                                    <div className="text-sm truncate">
                                        {message.content}
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
        </ScrollArea>
    )
}

export default ChannelPins