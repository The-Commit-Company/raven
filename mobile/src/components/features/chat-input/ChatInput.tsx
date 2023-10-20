import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useMemo, useRef, useState } from 'react'
import { IonButton, IonButtons, IonIcon, IonToolbar } from '@ionic/react';
import { documentAttachOutline } from 'ionicons/icons';

import { Message } from '../../../../../types/Messaging/Message';
import { QuillEditor } from './QuillEditor';
import { FileUploadModal } from './FileUploadModal';

type Props = {
    channelID: string,
    allMembers: { id: string; value: string }[],
    allChannels: { id: string; value: string; }[],
    onMessageSend: () => void,
}
export const ChatInput = ({ channelID, allChannels, allMembers, onMessageSend }: Props) => {

    const { call } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')

    const [text, setText] = useState("")

    const onTextChange = useCallback((value: string) => {
        setText(value)
    }, [])

    const [files, setFiles] = useState<File[]>([])

    const onSubmit = () => {
        call({
            channel_id: channelID,
            text: text,
            is_reply: 0,
            linked_message: null,
        }).then(() => {
            console.log("Message Sent")
            setText("")
            onMessageSend()
        })
    }

    const hasText = useMemo(() => {
        /** We need to check if the text has any content or not.
         * Normally, we could just check it's length. However, the Quill Editor will sometimes return empty HTML tags like <p><br/></p>
         * So we need to check if the text has any content or not.
         */
        let doc = new DOMParser().parseFromString(text ?? "", 'text/html')
        return (doc.body.textContent?.length ?? 0) > 0

    }, [text])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const pickFiles = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const getFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles: File[] = []

        if (e.target.files) {
            for (let i = 0; i < e.target.files.length; i++) {
                newFiles.push(e.target.files[i])
            }
        }

        setFiles(f => [...f, ...newFiles])
    }

    return (
        <div className='flex items-end justify-between overflow-visible space-x-1 pb-4'>
            <div className='w-80'>
                <QuillEditor
                    value={text}
                    onChange={onTextChange}
                    allChannels={allChannels}
                    allMembers={allMembers}
                />
            </div>
            <IonButtons slot='end' className='self-end pb-2 pr-2'>
                <input multiple type='file' hidden ref={fileInputRef} onChange={getFiles} />
                <IonButton slot='icon-only' hidden={hasText} onClick={pickFiles}>
                    <IonIcon icon={documentAttachOutline} />
                </IonButton>
                <IonButton onClick={onSubmit} className='font-bold' size='small' hidden={!hasText}>Send</IonButton>
            </IonButtons>
            <FileUploadModal channelID={channelID} files={files} setFiles={setFiles} pickFiles={pickFiles} onMessageSend={onMessageSend} />
        </div>
    )
}