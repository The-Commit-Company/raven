import { IonAvatar } from '@ionic/react'
import avatar from '@/assets/male-avatar.svg'

interface AvatarProps {
    src?: string,
    alt: string,
    slot?: string,
}

export const UserAvatar = ({ src, alt, slot = 'start' }: AvatarProps) => {
    return <IonAvatar slot={slot} style={{
        backgroundColor: "var(--ion-color-dark-shade)",
    }}>
        <img alt={alt} src={src ? src : avatar} />
    </IonAvatar>
}