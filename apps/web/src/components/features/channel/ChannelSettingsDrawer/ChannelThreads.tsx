import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { UserFields } from '@raven/types/common/UserFields'
import { Badge } from '@components/ui/badge'
import { Hash, Search } from 'lucide-react'
import { useState } from 'react'

interface Thread {
    name: string
    title: string
    channel_name: string
    message_count: number
    last_message: string
    last_message_owner: UserFields
    last_activity: string
    is_active: boolean
}

const dummyThreads: Thread[] = [
    {
        name: '1',
        title: 'Front-end Development Discussion',
        channel_name: 'front-end',
        message_count: 24,
        last_message: 'The new component library is ready for review!',
        last_message_owner: {
            name: 'john.doe',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            first_name: 'John',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        last_activity: '2 hours ago',
        is_active: true
    },
    {
        name: '2',
        title: 'UI-kit Design Standards',
        channel_name: 'design-system',
        message_count: 12,
        last_message: 'Updated the color palette documentation',
        last_message_owner: {
            name: 'jane.smith',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            first_name: 'Jane',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        last_activity: '1 day ago',
        is_active: true
    },
    {
        name: '3',
        title: 'Backend API Integration',
        channel_name: 'backend',
        message_count: 8,
        last_message: 'API endpoints are now live in staging',
        last_message_owner: {
            name: 'mike.wilson',
            full_name: 'Mike Wilson',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            first_name: 'Mike',
            enabled: 1,
            type: 'User',
            availability_status: 'Away',
            custom_status: undefined
        },
        last_activity: '2 days ago',
        is_active: false
    },
    {
        name: '4',
        title: 'Product Roadmap Q1',
        channel_name: 'product',
        message_count: 15,
        last_message: 'Sprint planning for next week is confirmed',
        last_message_owner: {
            name: 'sarah.jones',
            full_name: 'Sarah Jones',
            user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            first_name: 'Sarah',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        last_activity: '3 days ago',
        is_active: true
    },
    {
        name: '5',
        title: 'Testing Strategy Discussion',
        channel_name: 'qa',
        message_count: 6,
        last_message: 'Automated tests are passing in CI/CD',
        last_message_owner: {
            name: 'john.doe',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            first_name: 'John',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        last_activity: '4 days ago',
        is_active: false
    },
    {
        name: '6',
        title: 'DevOps Infrastructure',
        channel_name: 'devops',
        message_count: 18,
        last_message: 'Deployment pipeline is now optimized',
        last_message_owner: {
            name: 'jane.smith',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            first_name: 'Jane',
            enabled: 1,
            type: 'User',
            availability_status: 'Do not disturb',
            custom_status: undefined
        },
        last_activity: '1 week ago',
        is_active: true
    }
]

const ChannelThreads = () => {

    const [searchQuery, setSearchQuery] = useState('')

    const filteredThreads = dummyThreads.filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.channel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.last_message_owner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="px-1 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search threads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border/70 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                </div>
            </div>

            {/* Threads List */}
            <ScrollArea className="flex-1">
                <div className="px-1 space-y-2 pb-4">
                    {filteredThreads.map((thread) => (
                        <div
                            key={thread.name}
                            className="group p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            tabIndex={0}
                            role="button"
                            aria-label={`Open thread: ${thread.title}`}>
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <h3 className="text-sm font-medium text-foreground truncate">
                                        {thread.title}
                                    </h3>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    {thread.message_count > 9 ? '9+' : thread.message_count}
                                </Badge>
                            </div>

                            <div className="text-[13px] mb-2 line-clamp-2">
                                {thread.last_message}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                                <UserAvatar
                                    user={thread.last_message_owner}
                                    size="xs"
                                    fontSize="xs"
                                    radius="full"
                                    showStatusIndicator={false}
                                />
                                <span>{thread.last_message_owner.full_name}</span>
                                <span>•</span>
                                <span>{thread.last_activity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default ChannelThreads