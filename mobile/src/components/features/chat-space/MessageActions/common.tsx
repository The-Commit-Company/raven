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
        <IonItem className='py-1 bg-zinc-900 menu-action-button' onClick={onClick} button detail={false} disabled={isLoading} aria-disabled={isLoading}>
            {children}
            {isLoading && <IonSpinner slot='end' name='crescent' />}
        </IonItem>
    )
}

export const ActionIcon = ({ icon }: { icon: string }) => {
    return <IonIcon slot="start" icon={icon} />
}

export const ActionLabel = ({ label }: { label: string }) => {
    return <IonLabel className='font-semibold'>{label}</IonLabel>
}