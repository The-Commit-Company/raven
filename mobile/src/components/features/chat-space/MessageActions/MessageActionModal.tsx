import { useContext, useState } from 'react'
import { MessageBlock } from '../../../../../../types/Messaging/Message'
import {
    IonModal,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
} from '@ionic/react';
import { bookmarkOutline, copyOutline, createOutline, documentAttachOutline, downloadOutline, mailOutline, returnDownBack, returnDownBackOutline } from 'ionicons/icons';
import { EmojiAction } from './EmojiAction';
import { DeleteAction } from './DeleteAction';
import { UserContext } from '@/utils/auth/UserProvider';
import { CopyAction } from './CopyAction';
import { SaveMessageAction } from './SaveMessageAction';

interface MessageActionModalProps {
    selectedMessage?: MessageBlock,
    onDismiss: VoidFunction,
}

export const MessageActionModal = ({ selectedMessage, onDismiss }: MessageActionModalProps) => {
    const { currentUser } = useContext(UserContext)
    const isOwnMessage = currentUser === selectedMessage?.data?.owner


    return (
        <IonModal
            isOpen={!!selectedMessage}
            breakpoints={[0, 0.6, 0.8]}
            initialBreakpoint={0.6}
            onWillDismiss={onDismiss}>
            <IonContent className="ion-padding">
                {selectedMessage &&
                    <IonList lines='none'>
                        {/* <EmojiAction /> */}
                        {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={createOutline} />
                            <IonLabel className='font-semibold'>Edit</IonLabel>
                        </IonItem> */}
                        {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={returnDownBackOutline} />
                            <IonLabel className='font-semibold'>Reply</IonLabel>
                        </IonItem> */}
                        {isOwnMessage &&
                            <DeleteAction message={selectedMessage} onSuccess={onDismiss} />
                        }
                        <CopyAction message={selectedMessage} onSuccess={onDismiss} />
                        <IonItem className='py-1'>
                            <IonIcon slot='start' icon={downloadOutline} />
                            <IonLabel className='font-semibold'>Download</IonLabel>
                        </IonItem>
                        <SaveMessageAction message={selectedMessage} onSuccess={onDismiss} />
                        {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={documentAttachOutline} />
                            <IonLabel className='font-semibold'>Link to document</IonLabel>
                        </IonItem>
                        <IonItem className='py-1'>
                            <IonIcon slot='start' icon={mailOutline} />
                            <IonLabel className='font-semibold'>Send in email</IonLabel>
                        </IonItem> */}
                    </IonList>
                }
            </IonContent>
        </IonModal>
    )
}


export const useMessageActionModal = (mutate?: VoidFunction) => {

    const [selectedMessage, setSelectedMessage] = useState<MessageBlock | undefined>(undefined)

    // const [present, dismiss] = useIonModal(MessageActionModal, {
    //     selectedMessage,
    //     currentUser,
    //     onDismiss: (data: string, role: string) => dismiss(data, role),
    // });

    // function openModal() {
    //     present({
    //         initialBreakpoint: 0.6,
    //         breakpoints: [0, 0.6, 0.8],
    //         keyboardClose: true,
    //         onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
    //             setSelectedMessage(undefined);
    //             if (ev.detail.role === 'mutate') {
    //                 mutate?.()
    //             }
    //         },
    //     });
    // }

    const onMessageSelected = (m: MessageBlock) => {
        setSelectedMessage(m)
        // openModal()
    }

    const onDismiss = () => {
        setSelectedMessage(undefined)
    }

    return {
        onMessageSelected,
        selectedMessage,
        onDismiss
    }
}