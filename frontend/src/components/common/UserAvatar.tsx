import { Avatar, Theme } from '@radix-ui/themes'
import { AvatarProps } from '@radix-ui/themes/dist/cjs/components/avatar'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import { clsx } from 'clsx'
import { generateAvatarColor } from '../feature/selectDropdowns/GenerateAvatarColor'
import { RiRobot2Fill } from 'react-icons/ri'
import { useMemo } from 'react'
import { AvailabilityStatus } from '../feature/userSettings/AvailabilityStatus/SetUserAvailabilityMenu'

interface UserAvatarProps extends Partial<AvatarProps> {
    alt?: string,
    isActive?: boolean,
    availabilityStatus?: AvailabilityStatus,
    isBot?: boolean,
    skeletonSize?: BoxProps['width'] | BoxProps['height'],
}

export const getInitials = (name?: string) => {
    if (!name) return ''
    const [firstName, lastName] = name.split(' ')
    return firstName[0] + (lastName?.[0] ?? '')
}

const getIconSize = (size: AvatarProps['size']) => {
    switch (size) {
        case '1':
            return '14px'
        case '2':
            return '16px'
        case '3':
            return '18px'
        case '4':
            return '20px'
        case '5':
            return '22px'
        case '6':
            return '24px'
        case '7':
            return '26px'
        case '8':
            return '28px'
        case '9':
            return '30px'
        default:
            return '16px'

    }
}

export const UserAvatar = ({ src, alt, size = '1', radius = 'medium', isActive, availabilityStatus, skeletonSize = '5', fallback, isBot, className, ...props }: UserAvatarProps) => {
    const color = useMemo(() => generateAvatarColor(alt), [alt])

    return <Theme accentColor={color}><span className="relative inline-block">
        <Avatar src={src} alt={alt}
            loading='lazy'
            fallback={fallback ?? getInitials(alt)} size={size} radius={radius} className={className} {...props} />

        {availabilityStatus && availabilityStatus === 'Away' &&
            <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
                <span className="block h-2 w-2 rounded-full border border-slate-2 bg-[#FFAA33] shadow-md" />
            </span>
        }

        {availabilityStatus && availabilityStatus === 'Do not disturb' &&
            <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
                <span className="block h-2 w-2 rounded-full border border-slate-2 bg-[#D22B2B] shadow-md" />
            </span>
        }

        {availabilityStatus !== 'Away' && availabilityStatus !== 'Do not disturb' && isActive &&
            <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
                <span className="block h-2 w-2 rounded-full border border-slate-2 bg-green-600 shadow-md" />
            </span>
        }

        {isBot && <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
            <RiRobot2Fill className="text-accent-11 dark:text-accent-11" size={getIconSize(size)} />
        </span>}
    </span>
    </Theme>
}