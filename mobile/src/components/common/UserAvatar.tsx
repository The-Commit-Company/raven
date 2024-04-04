import { useInView } from 'react-intersection-observer'
import { Avatar, AvatarProps, Skeleton, Theme } from '@radix-ui/themes'
import { useMemo } from 'react'
import clsx from 'clsx'
import { RiRobot2Fill } from 'react-icons/ri'

interface UserAvatarProps extends Partial<AvatarProps> {
    alt?: string,
    isActive?: boolean,
    isBot?: boolean,
}

const options = {
    root: null,
    rootMargin: "50px",
    threshold: 0.5,
    triggerOnce: true
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

const getActiveIndicatorSize = (size: AvatarProps['size']) => {
    switch (size) {
        case '1':
            return 'h-2 w-2'
        case '2':
            return 'h-2.5 w-2.5'
        case '3':
            return 'h-3 w-3'
        case '4':
            return 'h-3.5 w-3.5'
        case '5':
            return 'h-4 w-4'
        case '6':
            return 'h-4 w-4'
        case '7':
            return 'h-5 w-5'
        case '8':
            return 'h-5 w-5'
        case '9':
            return 'h-6 w-6'
        default:
            return 'h-2 w-2'
    }
}

export const UserAvatar = ({ src, alt, size = '1', radius = 'medium', isActive, fallback, isBot, className, ...props }: UserAvatarProps) => {
    const { ref, inView } = useInView(options)
    const color = useMemo(() => generateAvatarColor(alt), [alt])
    return <Theme accentColor={color}><span ref={ref} className="relative inline-block">
        <Skeleton loading={!inView}>
            <Avatar src={inView ? src : undefined} alt={alt} loading='lazy' fallback={fallback ?? getInitials(alt)} size={size} radius={radius} className={className} {...props} />
        </Skeleton>
        {isActive &&
            <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
                <span className={clsx("block rounded-full border border-slate-2 bg-green-9 shadow-md", getActiveIndicatorSize(size))} />
            </span>
        }
        {isBot && <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
            <RiRobot2Fill className="text-accent-11 dark:text-accent-11" size={getIconSize(size)} />
        </span>}
    </span>
    </Theme>
}

const COLORS: AvatarProps['color'][] = ["tomato", "red", "ruby", "crimson", "pink", "plum", "purple", "violet", "iris", "indigo", "blue", "cyan", "teal", "jade", "green", "grass", "brown", "orange", "sky", "mint", "lime", "yellow", "amber", "gold", "bronze", "gray"]

const getHashOfString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = Math.abs(hash)
    return hash
}

const normalizeHash = (hash: number, min: number, max: number) => {
    return Math.floor((hash % (max - min)) + min)
}

export const generateAvatarColor = (id?: string): AvatarProps['color'] => {
    const hash = getHashOfString(id || 'random')
    const index = normalizeHash(hash, 0, COLORS.length)
    return COLORS[index]
}

export const getInitials = (name?: string) => {
    if (!name) return ''
    const [firstName, lastName] = name.split(' ')
    return firstName[0] + (lastName?.[0] ?? '')
}