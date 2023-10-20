import { IonIcon, IonItem, IonLabel } from '@ionic/react'
import React, { PropsWithChildren } from 'react'
import { MessageBlock } from '../../../../../../types/Messaging/Message'

export interface ActionProps {
    message: MessageBlock,
    onSuccess: () => void,
}
interface ActionItemProps {
    onClick?: () => void,
}
export const ActionItem = ({ children, onClick }: PropsWithChildren<ActionItemProps>) => {
    return (
        <IonItem className='py-1' onClick={onClick} button detail={false}>
            {children}
        </IonItem>
    )
}

export const ActionIcon = ({ icon }: { icon: string }) => {
    return <IonIcon slot="start" icon={icon} />
}

export const ActionLabel = ({ label }: { label: string }) => {
    return <IonLabel className='font-semibold'>{label}</IonLabel>
}