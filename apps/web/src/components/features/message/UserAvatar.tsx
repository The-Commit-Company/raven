import { memo, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { cn } from '@lib/utils'
import { UserData } from "@db"
import { BotIcon } from 'lucide-react'

interface UserAvatarProps {
    user: UserData,
    isActive?: boolean,
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    className?: string,
    showStatusIndicator?: boolean,
    showBotIndicator?: boolean,
    addColoredFallback?: boolean
}

const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 1)
}

const generateAvatarColor = (name: string): string => {

    const sampleColors = [
        "bg-surface-green-2 text-ink-green-8",
        "bg-surface-amber-2 text-ink-amber-8",
        "bg-surface-red-2 text-ink-red-8",
        "bg-surface-blue-2 text-ink-blue-8",
        "bg-surface-violet-2 text-ink-violet-8",
        "bg-surface-cyan-2 text-ink-cyan-8",
        "bg-surface-gray-2 text-ink-gray-8",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return sampleColors[hue % sampleColors.length]
}

export const getStatusIndicatorColor = (status: string) => {
    switch (status) {
        case 'Available':
            return 'bg-surface-green-5'
        case 'Away':
            return 'bg-surface-yellow-5'
        case 'Do not disturb':
            return 'bg-surface-red-5'
        case 'Invisible':
            return 'bg-surface-gray-5'
        default:
            return 'bg-surface-green-5'
    }
}

const getSizeClasses = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    switch (size) {
        case 'xs':
            return {
                avatar: 'h-4 w-4 rounded-full',
                indicator: 'h-1 w-1 -bottom-0.5 -right-0.5',
                manualAvailableDot: 'h-0.25 w-0.25',
                bot: 'h-1.5 w-1.5',
                botContainer: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
                font: '!text-[8px] font-bold'
            }
        case 'sm':
            return {
                avatar: 'h-6 w-6 rounded-full',
                indicator: 'h-2 w-2 -bottom-0.5 -right-0.5',
                manualAvailableDot: 'h-0.5 w-0.5',
                bot: 'h-2 w-2',
                botContainer: 'h-3 w-3 -bottom-0.5 -right-0.5',
                font: 'text-[10px]'
            }
        case 'md':
            return {
                avatar: 'h-8 w-8 rounded-full',
                indicator: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
                manualAvailableDot: 'h-0.75 w-0.75',
                bot: 'h-2.5 w-2.5',
                botContainer: 'h-3.5 w-3.5 -bottom-0.5 -right-0.5',
                font: 'text-sm'
            }
        case 'lg':
            return {
                avatar: 'h-12 w-12 rounded-full',
                indicator: 'h-3 w-3 -bottom-1 -right-1',
                manualAvailableDot: 'h-1 w-1',
                bot: 'h-3 w-3',
                botContainer: 'h-4 w-4 -bottom-1 -right-1',
                font: 'text-base'
            }
        case 'xl':
            return {
                avatar: 'h-[160px] w-[160px] rounded-lg shadow-none',
                indicator: 'h-3.5 w-3.5 -bottom-0 right-0 border-2 border-outline-base',
                manualAvailableDot: 'h-1.5 w-1.5',
                bot: 'h-5 w-5',
                botContainer: 'h-7 w-7 -bottom-1 -right-1 border-2 border-outline-base',
                font: 'text-3xl font-semibold',
                fallbackRound: 'rounded-lg'
            }
    }
}

export const UserAvatar = memo<UserAvatarProps>(({
    user,
    isActive = false,
    size = 'md',
    className,
    showStatusIndicator = true,
    showBotIndicator = true,
    addColoredFallback = true
}) => {
    const displayName = user.full_name || user.name
    const isBot = user.type === 'Bot'
    const availabilityStatus = user.availability_status
    const sizeClasses = getSizeClasses(size)

    const avatarColor = useMemo(() => addColoredFallback ? generateAvatarColor(displayName) : 'bg-surface-gray-2 text-ink-gray-9', [displayName, addColoredFallback])

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

    const showManualAvailableDot = availabilityStatus === 'Available' && !isActive

    return (
        <div className={cn("relative inline-block", className)}>
            <Avatar className={sizeClasses.avatar}>
                <AvatarImage
                    src={user.user_image}
                    alt={`${displayName}'s profile picture`}
                    loading="lazy"
                />
                <AvatarFallback
                    className={cn("font-medium select-none border-0", avatarColor, sizeClasses.font, sizeClasses.fallbackRound)}
                    // style={fallbackStyle}
                    aria-label={`${displayName} (initials)`}
                >
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>

            {/* Status Indicator */}
            {shouldShowStatusIndicator && (
                <span
                    className={cn(
                        "absolute flex items-center justify-center rounded-full border-2 border-outline-base",
                        sizeClasses.indicator,
                        availabilityStatus
                            ? getStatusIndicatorColor(availabilityStatus)
                            : 'bg-surface-green-5'
                    )}
                    aria-label={statusLabel}
                    role="img"
                >
                    {showManualAvailableDot && (
                        <span
                            className={cn("rounded-full bg-surface-base", sizeClasses.manualAvailableDot)}
                            aria-hidden="true"
                        />
                    )}
                </span>
            )}

            {/* Bot Indicator */}
            {isBot && showBotIndicator && (
                <span
                    className={cn(
                        "absolute flex items-center justify-center rounded-full bg-surface-base border border-outline-gray-1",
                        sizeClasses.botContainer
                    )}
                    aria-label="Bot account"
                    role="img">
                    <BotIcon
                        className={cn("text-ink-gray-8", sizeClasses.bot)}
                        aria-hidden="true"
                    />
                </span>
            )}
        </div>
    )
})

UserAvatar.displayName = 'UserAvatar'
