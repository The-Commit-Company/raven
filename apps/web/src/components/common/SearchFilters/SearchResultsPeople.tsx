import { getStatusIndicatorColor, UserAvatar } from '@components/features/message/UserAvatar'
import { cn } from '@lib/utils'
import { RiRobot2Fill } from 'react-icons/ri'
import { ArrowUpRight } from 'lucide-react'

const USERS: UserListItem[] = [
    {
        name: 'john_doe',
        type: 'User',
        full_name: 'John Doe',
        user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '🚀 Working on the new feature'
    },
    {
        name: 'jane_smith',
        type: 'User',
        full_name: 'Jane Smith',
        user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Away',
        custom_status: '📞 In a meeting'
    },
    {
        name: 'mike_wilson',
        type: 'Bot',
        full_name: 'Mike Wilson',
        user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        availability_status: '',
        custom_status: '⚡ Processing requests'
    },
    {
        name: 'sarah_jones',
        type: 'User',
        full_name: 'Sarah Jones',
        user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Invisible',
        custom_status: ''
    },
    {
        name: 'alex_brown',
        type: 'User',
        full_name: 'Alex Brown',
        user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '🤝 Available for collaboration'
    },
    {
        name: 'emma_davis',
        type: 'User',
        full_name: 'Emma Davis',
        user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '🎨 Designing the new UI components'
    },
    {
        name: 'david_lee',
        type: 'User',
        full_name: 'David Lee',
        user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Away',
        custom_status: '🍕 On lunch break'
    },
    {
        name: 'lisa_wang',
        type: 'User',
        full_name: 'Lisa Wang',
        user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Do not disturb',
        custom_status: '🔒 Deep focus mode - coding'
    },
    {
        name: 'robert_chen',
        type: 'User',
        full_name: 'Robert Chen',
        user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        availability_status: '',
        custom_status: '👀 Reviewing pull requests'
    },
    {
        name: 'maria_garcia',
        type: 'User',
        full_name: 'Maria Garcia',
        user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Away',
        custom_status: '💼 Client call'
    },
    {
        name: 'assistant_ai',
        type: 'Bot',
        full_name: 'Assistant AI',
        user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '🤖 AI Assistant - Ready to help'
    },
    {
        name: 'sophie_taylor',
        type: 'User',
        full_name: 'Sophie Taylor',
        user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '📚 Working on documentation'
    },
    {
        name: 'michael_rodriguez',
        type: 'User',
        full_name: 'Michael Rodriguez',
        user_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Invisible',
        custom_status: ''
    },
    {
        name: 'anna_kim',
        type: 'User',
        full_name: 'Anna Kim',
        user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '🧪 Testing new features'
    },
    {
        name: 'thomas_anderson',
        type: 'User',
        full_name: 'Thomas Anderson',
        user_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Do not disturb',
        custom_status: '🐛 In a critical debugging session'
    },
    {
        name: 'rachel_green',
        type: 'User',
        full_name: 'Rachel Green',
        user_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Away',
        custom_status: '👥 Team standup meeting'
    },
    {
        name: 'kevin_zhang',
        type: 'User',
        full_name: 'Kevin Zhang',
        user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '👨‍💻 Pair programming with the team'
    },
    {
        name: 'jessica_martinez',
        type: 'User',
        full_name: 'Jessica Martinez',
        user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '📋 Planning next sprint'
    },
    {
        name: 'daniel_thompson',
        type: 'Bot',
        full_name: 'Daniel Thompson',
        user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        availability_status: 'Available',
        custom_status: '🔍 Code review bot - Analyzing changes'
    }
]

const search_text = 'abc'

type UserListItem = {
    name: string,
    type: 'User' | 'Bot',
    full_name: string,
    user_image: string,
    availability_status: '' | 'Available' | 'Away' | 'Do not disturb' | 'Invisible',
    custom_status: string
}

const getStatusText = (status: string) => {
    switch (status) {
        case 'Available':
            return 'Available'
        case 'Away':
            return 'Away'
        case 'Do not disturb':
            return 'Do not disturb'
        case 'Invisible':
            return 'Invisible'
        default:
            return 'Available'
    }
}

const SearchResultsPeople = () => {
    return (
        <div className="w-full space-y-2">
            {USERS.length === 0 ? (
                <div className="text-muted-foreground text-sm p-4 text-center">
                    No people found with a name containing "{search_text}"
                </div>
            ) : (
                <div className="space-y-2">
                    {USERS.map((user) => (
                        <div
                            key={user.name}
                            className={cn(
                                "group flex items-start gap-1 p-3 rounded-lg border border-border/60 transition-all duration-200",
                                "hover:bg-muted/30 hover:border-foreground/20",
                                "focus-within:bg-muted/30 focus-within:border-foreground/20",
                                "cursor-pointer"
                            )}
                            tabIndex={0}
                            role="button"
                            aria-label={`View ${user.full_name}'s profile`}
                        >
                            <div className="flex-shrink-0">
                                <UserAvatar
                                    user={user}
                                    size="md"
                                    showStatusIndicator={user.type !== 'Bot'}
                                    className="h-10 w-10"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="text-[13px] font-medium">
                                        <span>{user.full_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {user.type !== 'Bot' && user.availability_status !== 'Invisible' && (
                                            <>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusIndicatorColor(user.availability_status))} />
                                                <span className="text-xs text-muted-foreground/90">{getStatusText(user.availability_status)}</span>
                                            </>
                                        )}
                                        {user.type === 'Bot' && (
                                            <RiRobot2Fill className="w-3 h-3 text-blue-600" />
                                        )}
                                        <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                                    <span>@{user.name}</span>
                                </div>

                                {user.custom_status && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {user.custom_status}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchResultsPeople