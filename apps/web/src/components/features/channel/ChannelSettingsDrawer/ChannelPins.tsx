import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { UserFields } from '@raven/types/common/UserFields'

interface Message {
    name: string
    content: string
    owner: UserFields
    creation: string
}

const dummyMessages: Message[] = [
    {
        name: '1',
        content: 'Hey team! 🎉 Don\'t forget about our weekly standup tomorrow at 9 AM.',
        owner: {
            name: 'john.doe',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            first_name: 'John',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '2 hours ago'
    },
    {
        name: '2',
        content: 'Great work everyone! 🚀 The new feature is now live in production.',
        owner: {
            name: 'jane.smith',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            first_name: 'Jane',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '1 day ago'
    },
    {
        name: '3',
        content: 'Thanks for the help! 🙏 The bug fix worked perfectly.',
        owner: {
            name: 'mike.wilson',
            full_name: 'Mike Wilson',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            first_name: 'Mike',
            enabled: 1,
            type: 'User',
            availability_status: 'Away',
            custom_status: undefined
        },
        creation: '2 days ago'
    },
    {
        name: '4',
        content: 'Happy Friday everyone! 🎊 Have a great weekend!',
        owner: {
            name: 'sarah.jones',
            full_name: 'Sarah Jones',
            user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            first_name: 'Sarah',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '3 days ago'
    },
    {
        name: '5',
        content: 'Don\'t forget to update your status before leaving! 📝',
        owner: {
            name: 'john.doe',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            first_name: 'John',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '4 days ago'
    },
    {
        name: '6',
        content: 'The new documentation is ready! 📚 Check it out when you can.',
        owner: {
            name: 'jane.smith',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            first_name: 'Jane',
            enabled: 1,
            type: 'User',
            availability_status: 'Do not disturb',
            custom_status: undefined
        },
        creation: '1 week ago'
    }
]

const ChannelPins = () => {
    return (
        <ScrollArea className="h-full">
            <div className="px-1 space-y-2">
                {dummyMessages.map((message) => (
                    <div
                        key={message.name}
                        className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                            <UserAvatar
                                user={message.owner}
                                size="sm"
                            />
                            <div className="font-medium text-sm">{message.owner.full_name}</div>
                            <div className="text-xs text-muted-foreground/70">
                                {message.creation}
                            </div>
                        </div>
                        <div className="text-[13px]">
                            {message.content}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

export default ChannelPins