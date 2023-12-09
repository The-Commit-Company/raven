import { useContext, useEffect, useState } from 'react'
import { MessageBlock } from '../../../../../../types/Messaging/Message'
import {
    IonModal,
    IonContent,
    IonList,
} from '@ionic/react';
import { EmojiAction } from './EmojiAction';
import './messageActionModal.styles.css'
import { DeleteAction } from './DeleteAction';
import { UserContext } from '@/utils/auth/UserProvider';
import { CopyAction } from './CopyAction';
import { SaveMessageAction } from './SaveMessageAction';
import { NonContinuationMessageBlock } from '../chat-view/MessageBlock';
import { useGetUser } from '@/hooks/useGetUser';
import { ShareAction } from './ShareAction';

interface MessageActionModalProps {
    selectedMessage?: MessageBlock,
    onDismiss: VoidFunction,
}

export const MessageActionModal = ({ selectedMessage, onDismiss }: MessageActionModalProps) => {
    const { currentUser } = useContext(UserContext)
    const isOwnMessage = currentUser === selectedMessage?.data?.owner



    /**
     * Message action modal needs to be activated after the message is long pressed.
     * However, the user is still touching the screen, so we need to add a delay before the modal is activated.
     */

    const [enablePointerEvents, setEnablePointerEvents] = useState(false)


    useEffect(() => {
        const timeout = setTimeout(() => {
            setEnablePointerEvents(true)
        }, 1000)
        return () => {
            clearTimeout(timeout)
            setEnablePointerEvents(false)
        }
    }, [selectedMessage])

    const user = useGetUser(selectedMessage?.data.owner)

    return (
        <IonModal
            isOpen={!!selectedMessage}
            breakpoints={[0, 0.75, 0.9]}
            id='message-action-modal'
            initialBreakpoint={0.75}
            onWillDismiss={onDismiss}>
            <IonContent className="ion-padding" style={{
                pointerEvents: enablePointerEvents ? 'all' : 'none'
            }}>
                {selectedMessage &&
                    <IonList lines='none' className='bg-zinc-900'>
                        <div className='rounded-md pb-2 flex bg-zinc-800'>
                            <NonContinuationMessageBlock message={selectedMessage} user={user} />
                        </div>

                        <div className='h-[2px] bg-zinc-800 my-2'>

                        </div>

                        {/* <EmojiAction /> */}
                        {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={createOutline} />
                            <IonLabel className='font-semibold'>Edit</IonLabel>
                        </IonItem> */}
                        {/* <IonItem className='py-1'>
                            <IonIcon slot="start" icon={returnDownBackOutline} />
                            <IonLabel className='font-semibold'>Reply</IonLabel>
                        </IonItem> */}
                        <ShareAction message={selectedMessage} onSuccess={onDismiss} />
                        <CopyAction message={selectedMessage} onSuccess={onDismiss} />
                        {/* <IonItem className='py-1'>
                            <IonIcon slot='start' icon={downloadOutline} />
                            <IonLabel className='font-semibold'>Download</IonLabel>
                        </IonItem> */}
                        <SaveMessageAction message={selectedMessage} onSuccess={onDismiss} />

                        {isOwnMessage &&
                            <DeleteAction message={selectedMessage} onSuccess={onDismiss} />
                        }
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