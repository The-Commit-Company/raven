import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { GroupedAvatars } from '@components/ui/grouped-avatars'
import { ArrowUpRight } from 'lucide-react'

const CHANNELS: ChannelListItem[] = [
    {
        name: '1',
        channel_name: 'General Discussion',
        type: 'Public',
        channel_description: 'This is a channel for general discussion',
        owner: 'John Doe',
        created_on: '01-09-2021',
        members: [
            { name: 'john_doe', full_name: 'John Doe', user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
            { name: 'jane_smith', full_name: 'Jane Smith', user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
            { name: 'mike_wilson', full_name: 'Mike Wilson', user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '2',
        channel_name: 'Project Alpha',
        type: 'Private',
        channel_description: 'This is a private channel for project alpha, we discuss about project alpha',
        owner: 'Jane Smith',
        created_on: '02-09-2021',
        members: [
            { name: 'jane_smith', full_name: 'Jane Smith', user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
            { name: 'john_doe', full_name: 'John Doe', user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        ]
    },
    {
        name: '3',
        channel_name: 'Random',
        type: 'Open',
        channel_description: '',
        owner: 'Mike Wilson',
        created_on: '03-09-2021',
        members: [
            { name: 'mike_wilson', full_name: 'Mike Wilson', user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '4',
        channel_name: 'Design Team',
        type: 'Public',
        channel_description: 'This is a channel for design team, we discuss about UI/UX and other design related topics',
        owner: 'Sarah Jones',
        created_on: '04-09-2021',
        members: [
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'emma_davis', full_name: 'Emma Davis', user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
            { name: 'lisa_wang', full_name: 'Lisa Wang', user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '5',
        channel_name: 'Development Team',
        type: 'Public',
        channel_description: 'This is a channel for development team, we discuss about code and other development related topics',
        owner: 'Alex Brown',
        created_on: '05-09-2021',
        members: [
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
            { name: 'david_lee', full_name: 'David Lee', user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
            { name: 'john_doe', full_name: 'John Doe', user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '6',
        channel_name: 'Marketing & Growth',
        type: 'Public',
        channel_description: 'This is a channel for marketing team, we discuss about marketing',
        owner: 'Emma Davis',
        created_on: '06-09-2021',
        members: [
            { name: 'emma_davis', full_name: 'Emma Davis', user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
            { name: 'jane_smith', full_name: 'Jane Smith', user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '7',
        channel_name: 'Sales & Support',
        type: 'Public',
        channel_description: '',
        owner: 'David Lee',
        created_on: '07-09-2021',
        members: [
            { name: 'david_lee', full_name: 'David Lee', user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
            { name: 'lisa_wang', full_name: 'Lisa Wang', user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
        ]
    }
]

const THREADS: ThreadListItem[] = [
    {
        name: '1',
        content: 'This is a thread for general discussion about upcoming project milestones and team coordination',
        channel_name: 'General Discussion',
        channel_type: 'Public',
        owner: 'John Doe',
        created_on: '01-09-2021',
        members: [
            { name: 'john_doe', full_name: 'John Doe', user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
            { name: 'jane_smith', full_name: 'Jane Smith', user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
            { name: 'mike_wilson', full_name: 'Mike Wilson', user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '2',
        content: 'This is a thread for project alpha discussions and technical implementation details',
        channel_name: 'Project Alpha',
        channel_type: 'Private',
        owner: 'Jane Smith',
        created_on: '02-09-2021',
        members: [
            { name: 'jane_smith', full_name: 'Jane Smith', user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
            { name: 'john_doe', full_name: 'John Doe', user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
            { name: 'mike_wilson', full_name: 'Mike Wilson', user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '3',
        content: 'This is a thread for random discussions and team bonding activities',
        channel_name: 'Random',
        channel_type: 'Public',
        owner: 'Mike Wilson',
        created_on: '03-09-2021',
        members: [
            { name: 'mike_wilson', full_name: 'Mike Wilson', user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
            { name: 'emma_davis', full_name: 'Emma Davis', user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
            { name: 'david_lee', full_name: 'David Lee', user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
            { name: 'lisa_wang', full_name: 'Lisa Wang', user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '4',
        content: 'This is a thread for design team discussions about UI/UX improvements and design system updates',
        channel_name: 'Design Team',
        channel_type: 'Public',
        owner: 'Sarah Jones',
        created_on: '04-09-2021',
        members: [
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'emma_davis', full_name: 'Emma Davis', user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
            { name: 'lisa_wang', full_name: 'Lisa Wang', user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '5',
        content: 'This is a thread for development team discussions about code architecture and technical decisions',
        channel_name: 'Development Team',
        channel_type: 'Public',
        owner: 'Alex Brown',
        created_on: '05-09-2021',
        members: [
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
            { name: 'david_lee', full_name: 'David Lee', user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
            { name: 'john_doe', full_name: 'John Doe', user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
            { name: 'mike_wilson', full_name: 'Mike Wilson', user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '6',
        content: 'This is a thread for marketing team discussions about campaign strategies and growth initiatives',
        channel_name: 'Marketing Team',
        channel_type: 'Public',
        owner: 'Emma Davis',
        created_on: '06-09-2021',
        members: [
            { name: 'emma_davis', full_name: 'Emma Davis', user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
            { name: 'lisa_wang', full_name: 'Lisa Wang', user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
            { name: 'jane_smith', full_name: 'Jane Smith', user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
        ]
    },
    {
        name: '7',
        content: 'This is a thread for sales team discussions about customer feedback and revenue optimization',
        channel_name: 'Sales Team',
        channel_type: 'Public',
        owner: 'David Lee',
        created_on: '07-09-2021',
        members: [
            { name: 'david_lee', full_name: 'David Lee', user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
            { name: 'lisa_wang', full_name: 'Lisa Wang', user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
            { name: 'sarah_jones', full_name: 'Sarah Jones', user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
            { name: 'alex_brown', full_name: 'Alex Brown', user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
            { name: 'emma_davis', full_name: 'Emma Davis', user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' }
        ]
    }
]

const search_text = 'abc'

const SearchResultsChannelsThreads = () => {
    return (
        <div className="w-full space-y-4">
            {/* Channels */}
            <SearchResultsChannelListItem channels={CHANNELS} search_text={search_text} />
            {/* Threads */}
            <SearchResultsThreadListItem threads={THREADS} search_text={search_text} />
        </div>
    )
}

type ChannelListItem = {
    name: string,
    channel_name: string,
    type: 'Public' | 'Private' | 'Open',
    channel_description: string,
    owner: string,
    created_on: string,
    members: { name: string, full_name: string, user_image: string }[]
}
const SearchResultsChannelListItem = ({ channels, search_text }: { channels: ChannelListItem[], search_text: string }) => {
    return (
        <>
            <div className="font-semibold text-xs mb-2 text-foreground/80">Channels</div>
            {
                channels.length === 0 ? (
                    <div className="text-muted-foreground text-xs p-4 text-center">No channels with a name containing <strong>{search_text}</strong> found</div>
                ) : (
                    <div className="space-y-2">
                        {channels.map((channel) => (
                            <div key={channel.name} className="group relative flex flex-col p-3 rounded-lg border border-border/60 hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200 cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                            <ChannelIcon type={channel.type} className="h-4 w-4 flex-shrink-0" />
                                            <span className="font-medium text-sm text-foreground group-hover:text-foreground/90 transition-colors truncate">{channel.channel_name}</span>
                                            <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                                        </div>
                                        {channel.channel_description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 mt-0.5">
                                                {channel.channel_description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1 text-[11px] italic text-foreground/70 mt-1">
                                            created by {channel.owner} on {channel.created_on}
                                        </div>
                                    </div>
                                    {channel.members.length > 0 && (
                                        <GroupedAvatars
                                            users={channel.members.map(member => ({
                                                id: member.name,
                                                name: member.full_name,
                                                image: member.user_image
                                            }))}
                                            max={3}
                                            size="xs"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </>
    )
}

type ThreadListItem = {
    name: string,
    content: string,
    channel_name: string,
    channel_type: 'Public' | 'Private' | 'Open',
    owner: string,
    created_on: string,
    members: { name: string, full_name: string, user_image: string }[]
}
const SearchResultsThreadListItem = ({ threads, search_text }: { threads: ThreadListItem[], search_text: string }) => {
    return (
        <>
            <div className="font-semibold text-xs mb-2 text-foreground/80">Threads</div>
            {
                threads.length === 0 ? (
                    <div className="text-muted-foreground text-xs p-4 text-center">No threads with a name containing <strong>{search_text}</strong> found</div>
                ) : (
                    <div className="space-y-2">
                        {threads.map((thread) => (
                            <div key={thread.name} className="group relative flex flex-col p-3 rounded-lg border border-border/60 hover:border-foreground/40 hover:bg-muted/30 transition-all duration-200 cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                            <p className="font-medium text-sm leading-relaxed text-foreground line-clamp-1 group-hover:text-foreground/90 transition-colors">
                                                {thread.content}
                                            </p>
                                            <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <ChannelIcon type={thread.channel_type} className="text-muted-foreground h-3.5 w-3.5" />
                                            <span className="text-xs text-muted-foreground">{thread.channel_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] italic text-foreground/70 mt-1">
                                            created by {thread.owner} on {thread.created_on}
                                        </div>
                                    </div>
                                    {thread.members.length > 0 && (
                                        <GroupedAvatars
                                            users={thread.members.map(member => ({
                                                id: member.name,
                                                name: member.full_name,
                                                image: member.user_image
                                            }))}
                                            max={3}
                                            size="xs"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </>
    )
}

export default SearchResultsChannelsThreads