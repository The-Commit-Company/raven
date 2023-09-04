import { useFrappeCreateDoc, useFrappeFileUpload, useFrappePostCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useCallback, useMemo, useRef, useState } from 'react'
import { IonActionSheet, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { paperPlane, documentOutline, addOutline, cameraOutline, imageOutline, send, documentAttachOutline, addSharp } from 'ionicons/icons';
import { getFileExtension } from '../../../../../raven-app/src/utils/operations';
import { PickedFile } from '@capawesome/capacitor-file-picker';
import { Message } from '../../../../../types/Messaging/Message';
import { RiAddLine, RiSendPlane2Fill } from 'react-icons/ri';
import { QuillEditor } from './QuillEditor';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getFileExtensionIcon } from '@/utils/layout/fileExtensions';

type Props = {
    channelID: string,
    allMembers: { id: string; value: string }[],
    allChannels: { id: string; value: string; }[],
    onMessageSend: () => void,
    selectedMessage?: Message | null,
    handleCancelReply: () => void
}

interface CustomFile extends PickedFile {
    uploading?: boolean
    uploadProgress?: number
}

export const ChatInput = ({ channelID, allChannels, allMembers, onMessageSend, selectedMessage, handleCancelReply }: Props) => {

    const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

    const { call } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')
    const { createDoc, loading: creatingDoc, error: errorCreatingDoc, reset: resetCreateDoc } = useFrappeCreateDoc()
    const { upload, loading: uploadingFile, progress, error: errorUploadingDoc, reset: resetUploadDoc } = useFrappeFileUpload()
    const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc, reset: resetUpdateDoc } = useFrappeUpdateDoc()

    const [text, setText] = useState("")

    const onTextChange = useCallback((value: string) => {
        setText(value)
    }, [])

    const [files, setFiles] = useState<File[]>([])

    const onSubmit = () => {
        call({
            channel_id: channelID,
            text: text,
            is_reply: selectedMessage ? 1 : 0,
            linked_message: selectedMessage ? selectedMessage.name : null
        }).then(() => {
            console.log("Message Sent")
            setText("")
            handleCancelReply()
            onMessageSend()
        })
        // if (files.length > 0) {
        //     const promises = files.map(async (f: File) => {
        //         let docname = ''
        //         return createDoc('Raven Message', {
        //             channel_id: channelID
        //         }).then((d) => {
        //             docname = d.name
        //             if (f.blob) {
        //                 const file = new File([f.blob], f.name);
        //                 f.uploading = true
        //                 f.uploadProgress = progress
        //                 return upload(file, {
        //                     isPrivate: true,
        //                     doctype: 'Raven Message',
        //                     docname: d.name,
        //                     fieldname: 'file',
        //                 })
        //             }
        //         }).then((r) => {
        //             f.uploading = false
        //             if (r)
        //                 return updateDoc("Raven Message", docname, {
        //                     file: r.file_url,
        //                     message_type: fileExt.includes(getFileExtension(f.name)) ? "Image" : "File",
        //                 })
        //         })
        //     })

        //     Promise.all(promises)
        //         .then(() => {
        //             setFiles([])
        //             resetCreateDoc()
        //             resetUploadDoc()
        //             resetUpdateDoc()
        //         }).catch((e) => {
        //             console.log(e)
        //         })
        // }
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

    const clearFiles = () => {
        setFiles([])
    }

    return (
        <IonToolbar className='flex items-end'>
            <div>
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
                <IonButton onClick={onSubmit} hidden={!hasText}>Send</IonButton>
            </IonButtons>
            <IonModal isOpen={files.length > 0}>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonButton color='medium' onClick={clearFiles}>
                                Close
                            </IonButton>
                        </IonButtons>
                        <IonTitle>Upload files</IonTitle>
                        <IonButtons slot='end'>
                            <IonButton className='font-bold'>
                                Upload
                            </IonButton>
                        </IonButtons>

                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className='py-2 mt-2 px-4 text-sm'>
                        <IonText color='medium'>Files will be shared with all channel members.</IonText>
                    </div>
                    <IonList>
                        {files.map((f, i) => <IonItem key={f.name + i}>
                            <div slot='start'>
                                {getFileExtensionIcon(getFileExtension(f.name))}
                            </div>
                            <IonLabel>{f.name}</IonLabel>
                        </IonItem>)}
                        <IonItem lines='full' detail={false} button onClick={pickFiles}>
                            <IonIcon slot='start' color='primary' icon={addSharp} />
                            <IonLabel color='primary'>Add more</IonLabel>
                        </IonItem>
                    </IonList>
                </IonContent>
            </IonModal>
        </IonToolbar>
    )
}