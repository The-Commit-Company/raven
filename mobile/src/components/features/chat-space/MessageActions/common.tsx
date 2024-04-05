import { IonIcon, IonItem, IonLabel, IonSpinner } from '@ionic/react'
import React, { PropsWithChildren } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'

export interface ActionProps {
    message: Message,
    onSuccess: () => void,
}
interface ActionItemProps {
    onClick?: () => void,
    isLoading?: boolean
}
export const ActionItem = ({ children, onClick, isLoading }: PropsWithChildren<ActionItemProps>) => {
    return (
        <IonItem color='light' onClick={onClick} button detail={false} disabled={isLoading} aria-disabled={isLoading}>
            {children}
            {isLoading && <IonSpinner slot='end' name='crescent' />}
        </IonItem>
    )
}

export const ActionIcon = ({ icon, color }: { icon: string, color?: string }) => {
    return <IonIcon slot="end" size='small' color={color} icon={icon} />
}

export const ActionLabel = ({ label, color }: { label: string, color?: string }) => {
    return <IonLabel className='py-1' color={color}>{label}</IonLabel>
}