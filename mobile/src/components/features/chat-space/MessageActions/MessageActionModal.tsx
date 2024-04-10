import { useContext, useEffect, useRef, useState } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'
import {
    IonModal,
    IonContent,
    IonList,
} from '@ionic/react';
import './messageActionModal.styles.css'
import { DeleteAction } from './DeleteAction';
import { UserContext } from '@/utils/auth/UserProvider';
import { CopyAction } from './CopyAction';
import { SaveMessageAction } from './SaveMessageAction';
import { useGetUser } from '@/hooks/useGetUser';
import { ShareAction } from './ShareAction';
import { EmojiAction } from './EmojiAction';
import MessagePreview from './MessagePreview';
import { PollActions } from './PollActions';

interface MessageActionModalProps {
    selectedMessage?: Message,
    onDismiss: VoidFunction,
}

export const MessageActionModal = ({ selectedMessage, onDismiss }: MessageActionModalProps) => {
    const { currentUser } = useContext(UserContext)
    const isOwnMessage = selectedMessage?.is_bot_message === 0 ? currentUser === selectedMessage?.owner : false

    const modalRef = useRef<HTMLIonModalElement>(null)


    /**
     * Message action modal needs to be activated after the message is long pressed.
     * However, the user is still touching the screen, so we need to add a delay before the modal is activated.
     */

    const [enablePointerEvents, setEnablePointerEvents] = useState(false)


    useEffect(() => {
        const timeout = setTimeout(() => {
            setEnablePointerEvents(true)
        }, 800)
        return () => {
            clearTimeout(timeout)
            setEnablePointerEvents(false)
        }
    }, [selectedMessage])

    const user = useGetUser(selectedMessage?.is_bot_message === 0 ? selectedMessage?.owner : selectedMessage?.bot)

    return (
        <IonModal
            isOpen={!!selectedMessage}
            breakpoints={[0, 0.45, 0.9]}
            id='message-action-modal'
            ref={modalRef}
            initialBreakpoint={0.45}
            onWillDismiss={onDismiss}>
            <IonContent style={{
                pointerEvents: enablePointerEvents ? 'all' : 'none'
            }}>
                {selectedMessage &&
                    <div className='pb-4'>
                        <div className='rounded-t-md p-2 flex bg-gray-1 border-b border-b-gray-3'>
                            <MessagePreview message={selectedMessage} user={user} />
                        </div>
                        <div className='px-2 pt-2'>
                            <EmojiAction message={selectedMessage} onSuccess={onDismiss}
                                presentingElement={modalRef.current} />
                        </div>

                        <IonList inset>
                            {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={createOutline} />
                            <IonLabel className='font-semibold'>Edit</IonLabel>
                        </IonItem> */}
                            {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={returnDownBackOutline} />
                            <IonLabel className='font-semibold'>Reply</IonLabel>
                        </IonItem> */}

                            {selectedMessage.message_type === 'Poll' && <PollActions message={selectedMessage} onSuccess={onDismiss} />}

                            {selectedMessage.message_type !== 'Poll' &&
                                <ShareAction message={selectedMessage} onSuccess={onDismiss} />}

                            {selectedMessage.message_type !== 'Poll' &&
                                <CopyAction message={selectedMessage} onSuccess={onDismiss} />}

                            <SaveMessageAction message={selectedMessage} onSuccess={onDismiss} />

                            {isOwnMessage &&
                                <DeleteAction message={selectedMessage} onSuccess={onDismiss} />}
                            {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={documentAttachOutline} />
                            <IonLabel className='font-semibold'>Link to document</IonLabel>
                        </IonItem>
                        <IonItem className='py-1'>
                            <IonIcon slot='start' icon={mailOutline} />
                            <IonLabel className='font-semibold'>Send in email</IonLabel>
                        </IonItem> */}
                        </IonList>


                    </div>
                }
            </IonContent>
        </IonModal>
    )
}


export const useMessageActionModal = (mutate?: VoidFunction) => {

    const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(undefined)

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

    const onMessageSelected = (m: Message) => {
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