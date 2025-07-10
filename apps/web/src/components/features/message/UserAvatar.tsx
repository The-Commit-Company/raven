import { memo, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { cn } from '@lib/utils'
import { UserFields } from '@raven/types/common/UserFields'
import { RiRobot2Fill } from 'react-icons/ri'

interface UserAvatarProps {
    user: UserFields,
    isActive?: boolean,
    size?: 'sm' | 'md' | 'lg',
    className?: string,
    showStatusIndicator?: boolean,
    showBotIndicator?: boolean
}

const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}


const generateAvatarColor = (name: string): string => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
}

const getStatusIndicatorColor = (status: string): string => {
    switch (status) {
        case 'Away':
            return 'bg-yellow-500'
        case 'Do not disturb':
            return 'bg-red-500'
        default:
            return 'bg-green-500'
    }
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
        case 'sm':
            return {
                avatar: 'h-6 w-6 text-xs',
                indicator: 'h-1.5 w-1.5 -bottom-0.5 -right-0.5',
                bot: 'h-2 w-2'
            }
        case 'lg':
            return {
                avatar: 'h-12 w-12 text-lg',
                indicator: 'h-3 w-3 -bottom-1 -right-1',
                bot: 'h-5 w-5'
            }
        default:
            return {
                avatar: 'h-8 w-8 text-sm',
                indicator: 'h-2 w-2 -bottom-0.5 -right-0.5',
                bot: 'h-4 w-4'
            }
    }
}

export const UserAvatar = memo<UserAvatarProps>(({
    user,
    isActive = false,
    size = 'md',
    className,
    showStatusIndicator = true,
    showBotIndicator = true
}) => {
    const displayName = user.full_name || user.name
    const isBot = user.type === 'Bot'
    const availabilityStatus = user.availability_status
    const sizeClasses = getSizeClasses(size)

    const avatarColor = useMemo(() => generateAvatarColor(displayName), [displayName])

    const fallbackStyle = useMemo(() => ({
        backgroundColor: avatarColor
    }), [avatarColor])

    const shouldShowStatusIndicator = useMemo(() => {
        if (!showStatusIndicator) return false
        if (availabilityStatus === 'Invisible') return false
        return availabilityStatus || isActive
    }, [availabilityStatus, isActive, showStatusIndicator])

    const statusLabel = useMemo(() => {
        if (availabilityStatus === 'Invisible') return ''
        if (availabilityStatus) return availabilityStatus
        return isActive ? 'Online' : 'Offline'
    }, [availabilityStatus, isActive])

    return (
        <div className={cn("relative inline-block", className)}>
            <Avatar className={cn(sizeClasses.avatar, "rounded-sm")}>
                <AvatarImage
                    src={user.user_image}
                    alt={`${displayName}'s profile picture`}
                    loading="lazy"
                />
                <AvatarFallback
                    className="text-white font-medium select-none rounded-sm"
                    style={fallbackStyle}
                    aria-label={`${displayName} (initials)`}
                >
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>

            {/* Status Indicator */}
            {shouldShowStatusIndicator && (
                <span
                    className={cn(
                        "absolute block rounded-full border-2 border-white dark:border-gray-900",
                        sizeClasses.indicator,
                        availabilityStatus
                            ? getStatusIndicatorColor(availabilityStatus)
                            : 'bg-green-500'
                    )}
                    aria-label={statusLabel}
                    role="img"
                />
            )}

            {/* Bot Indicator */}
            {isBot && showBotIndicator && (
                <span
                    className={cn(
                        "absolute block rounded-full bg-white dark:bg-gray-900 p-0.5",
                        sizeClasses.indicator
                    )}
                    aria-label="Bot account"
                    role="img"
                >
                    <RiRobot2Fill
                        className={cn("text-blue-600 dark:text-blue-400", sizeClasses.bot)}
                        aria-hidden="true"
                    />
                </span>
            )}
        </div>
    )
})

UserAvatar.displayName = 'UserAvatar'