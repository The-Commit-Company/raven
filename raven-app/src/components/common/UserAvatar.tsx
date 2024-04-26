import { useInView } from 'react-intersection-observer'
import { Skeleton } from './Skeleton'
import { Avatar, Theme } from '@radix-ui/themes'
import { AvatarProps } from '@radix-ui/themes/dist/cjs/components/avatar'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import { clsx } from 'clsx'
import { generateAvatarColor } from '../feature/select-member/GenerateAvatarColor'
import { RiRobot2Fill } from 'react-icons/ri'
import { useMemo } from 'react'

interface UserAvatarProps extends Partial<AvatarProps> {
    alt?: string,
    isActive?: boolean,
    isBot?: boolean,
    skeletonSize?: BoxProps['width'] | BoxProps['height'],
}
const options = {
    root: null,
    rootMargin: "50px",
    threshold: 0.5,
    triggerOnce: true
}

export const getInitials = (name?: string) => {
    if (!name) return ''
    const [firstName, lastName] = name.split(' ')
    return firstName[0] + (lastName?.[0] ?? '')
}

const radixRadiusToTailwind = (radius: "none" | "small" | "medium" | "large" | "full") => {
    switch (radius) {
        case "none":
            return "rounded-none"
        case "small":
            return "rounded-sm"
        case "medium":
            return "rounded-md"
        case "large":
            return "rounded-lg"
        case "full":
            return "rounded-full"
    }
}

const getIconSize = (size: AvatarProps['size']) => {
    switch (size) {
        case '1':
            return '0.8rem'
        case '2':
            return '1rem'
        case '3':
            return '1rem'
        case '4':
            return '1.1rem'
        case '5':
            return '1.2rem'
        case '6':
            return '1.5rem'
        case '7':
            return '1.7rem'
        case '8':
            return '1.8rem'
        case '9':
            return '2rem'
        default:
            return '1rem'

    }
}

export const UserAvatar = ({ src, alt, size = '1', radius = 'medium', isActive, skeletonSize = '5', fallback, isBot, className, ...props }: UserAvatarProps) => {
    const { ref, inView } = useInView(options)
    const color = useMemo(() => generateAvatarColor(alt), [alt])
    return <Theme accentColor={color}><span ref={ref} className="relative inline-block">
        {inView ?
            <Avatar src={src} alt={alt} loading='lazy' fallback={fallback ?? getInitials(alt)} size={size} radius={radius} className={className} {...props} />
            :
            <Skeleton className={radixRadiusToTailwind(radius)} width={skeletonSize} height={skeletonSize} />
        }
        {isActive &&
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