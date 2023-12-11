import { useInView } from 'react-intersection-observer'
import { Skeleton } from './Skeleton'
import { Avatar } from '@radix-ui/themes'
import { AvatarProps } from '@radix-ui/themes/dist/cjs/components/avatar'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import { clsx } from 'clsx'
import { generateAvatarColor } from '../feature/select-member/GenerateAvatarColor'

interface UserAvatarProps extends Partial<AvatarProps> {
    alt?: string,
    isActive?: boolean,
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

export const UserAvatar = ({ src, alt, size = '1', radius = 'medium', isActive, skeletonSize = '5', fallback, className, ...props }: UserAvatarProps) => {
    const { ref, inView } = useInView(options)
    return <span ref={ref} className="relative inline-block">
        {inView ?
            <Avatar color={generateAvatarColor(alt)} src={src} alt={alt} loading='lazy' fallback={fallback ?? getInitials(alt)} size={size} radius={radius} className={className} {...props} />
            :
            <Skeleton className={radixRadiusToTailwind(radius)} width={skeletonSize} height={skeletonSize} />
        }
        {isActive &&
            <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", radius === 'full' ? 'bottom-1 right-1' : 'bottom-0.5 right-0.5')}>
                <span className="block h-2 w-2 rounded-full border border-slate-2 bg-green-600 shadow-md" />
            </span>
        }
    </span>
}