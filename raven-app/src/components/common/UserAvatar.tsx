import { useInView } from 'react-intersection-observer'
import { Skeleton } from './Skeleton'
import { Avatar } from '@radix-ui/themes'
import { AvatarProps } from '@radix-ui/themes/dist/cjs/components/avatar'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'

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

const getInitials = (name?: string) => {
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
export const UserAvatar = ({ src, alt, size = '1', radius = 'medium', isActive, skeletonSize = '5', fallback, ...props }: UserAvatarProps) => {
    const { ref, inView } = useInView(options)
    return <span ref={ref} className="relative inline-block">
        {inView ?
            <Avatar src={src} alt={alt} loading='lazy' fallback={fallback ?? getInitials(alt)} size={size} radius={radius} {...props} />
            :

            <Skeleton className={radixRadiusToTailwind(radius)} width={skeletonSize} height={skeletonSize} />
        }
        {isActive &&
            <span className="absolute bottom-0 right-0 block translate-x-1/2 translate-y-1/2 transform rounded-full">
                <span className="block h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
        }
    </span>
}