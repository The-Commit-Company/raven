import { IonAvatar } from '@ionic/react'
import avatar from '@/assets/male-avatar.svg'
import { StyleReactProps } from '@ionic/react/dist/types/components/react-component-lib/interfaces'

interface AvatarProps {
    src?: string,
    alt: string,
    slot?: string,
    isActive?: boolean,
    className?: StyleReactProps['className']
}

export const UserAvatar = ({ src, alt, slot, className }: AvatarProps) => {
    return <IonAvatar slot={slot} style={{
        backgroundColor: "var(--ion-color-dark-shade)",
    }} className={className}>
        <img alt={alt} src={src ? src : avatar} />
    </IonAvatar>
}
export const SquareAvatar = ({ src, alt, className, isActive }: AvatarProps) => {
    return <span className="relative inline-block">
        <img
            className="h-8 w-8 rounded-md bg-[color:var(--ion-color-light)] object-cover"
            src={src ? src : avatar}
            alt={alt}
        />
        {isActive &&
            <span className="absolute bottom-0 right-0 block translate-x-1/2 translate-y-1/2 transform rounded-full">
                <span className="block h-2 w-2 rounded-full bg-green-500" />
            </span>
        }
    </span>
}