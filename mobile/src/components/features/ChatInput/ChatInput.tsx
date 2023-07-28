import { useFrappeCreateDoc, useFrappeFileUpload, useFrappePostCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import React, { useCallback, useRef, useState } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import "quill-mention";
import 'quill-mention/dist/quill.mention.css';
import './quill-styles.css'
import { AccordionGroupCustomEvent, IonAccordion, IonAccordionGroup, IonActionSheet, IonButton, IonIcon, IonItem } from '@ionic/react';
import { paperPlane, documentOutline, attachOutline, addOutline, cameraOutline, imageOutline } from 'ionicons/icons';
import { getFileExtension } from '../../../../../raven-app/src/utils/operations';
import { CustomFile } from '../../../../../raven-app/src/components/feature/file-upload/FileDrop';
import { Message } from '../../../../../raven-app/src/types/Messaging/Message';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

type Props = {
    channelID: string,
    allMembers: { id: string; value: string; }[],
    allChannels: { id: string; value: string; }[],
    onMessageSend: () => void,
    selectedMessage?: Message | null,
    handleCancelReply: () => void
}

export const ChatInput = ({ channelID, allChannels, allMembers, onMessageSend, selectedMessage, handleCancelReply }: Props) => {

    const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

    const { call } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')
    const { createDoc, loading: creatingDoc, error: errorCreatingDoc, reset: resetCreateDoc } = useFrappeCreateDoc()
    const { upload, loading: uploadingFile, progress, error: errorUploadingDoc, reset: resetUploadDoc } = useFrappeFileUpload()
    const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc, reset: resetUpdateDoc } = useFrappeUpdateDoc()

    const [text, setText] = useState("")

    const handleChange = (value: string) => {
        setText(value)
    }

    const [isActionSheetOpen, setActionSheetOpen] = useState(false)

    const [files, setFiles] = useState<CustomFile[]>([])

    const pickMedia = async () => {
        const result = await FilePicker.pickMedia({
            multiple: true,
        });
    };

    const pickFiles = async () => {
        const result = await FilePicker.pickFiles({
            multiple: true,
        });
    };

    const takePhoto = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100,
        });
    };

    const handleAction = (action: string) => {
        switch (action) {
            case 'camera':
                takePhoto()
                break;
            case 'media':
                pickMedia()
                break;
            case 'files':
                pickFiles()
                break;
            case 'cancel':
                break;
            default:
                break;
        }
    }

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
        if (files.length > 0) {
            const promises = files.map(async (f: CustomFile) => {
                let docname = ''
                return createDoc('Raven Message', {
                    channel_id: channelID
                }).then((d) => {
                    docname = d.name
                    f.uploading = true
                    f.uploadProgress = progress
                    return upload(f, {
                        isPrivate: true,
                        doctype: 'Raven Message',
                        docname: d.name,
                        fieldname: 'file',
                    })
                }).then((r) => {
                    f.uploading = false
                    return updateDoc("Raven Message", docname, {
                        file: r.file_url,
                        message_type: fileExt.includes(getFileExtension(f.name)) ? "Image" : "File",
                    })
                })
            })

            Promise.all(promises)
                .then(() => {
                    setFiles([])
                    resetCreateDoc()
                    resetUploadDoc()
                    resetUpdateDoc()
                }).catch((e) => {
                    console.log(e)
                })
        }
    }

    const mention = {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@", "#"],
        source: useCallback((searchTerm: string, renderList: any, mentionChar: string) => {

            let values;

            if (mentionChar === "@") {
                values = allMembers;
            } else {
                values = allChannels;
            }

            if (searchTerm.length === 0) {
                renderList(values, searchTerm);
            } else {
                const matches = [];
                if (values)
                    for (let i = 0; i < values.length; i++)
                        if (
                            ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                        )
                            matches.push(values[i]);
                renderList(matches, searchTerm);
            }
        }, [])
    }

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'mention',
        'code-block'
    ]

    return (
        <div className='flex w-full justify-between'>
            <div className='w-1/12 text-center'>
                <IonButton slot="icon-only" onClick={() => setActionSheetOpen(true)} fill='clear' size='small'>
                    <IonIcon color='dark' icon={addOutline} />
                </IonButton>
                <IonActionSheet
                    cssClass="action-sheet"
                    buttons={[
                        {
                            text: 'Camera',
                            icon: cameraOutline,
                            data: {
                                action: 'camera',
                            },
                        },
                        {
                            text: 'Photo & Video Library',
                            icon: imageOutline,
                            data: {
                                action: 'media',
                            },
                        },
                        {
                            text: 'Document',
                            icon: documentOutline,
                            data: {
                                action: 'files',
                            },
                        },
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            data: {
                                action: 'cancel',
                            },
                        },
                    ]} isOpen={isActionSheetOpen}
                    onDidDismiss={({ detail }) => {
                        handleAction(detail.data.action);
                        setActionSheetOpen(false)
                    }}></IonActionSheet>
            </div>
            <div className='w-8/12'>
                <ReactQuill
                    className={'my-quill-editor'}
                    onChange={handleChange}
                    value={text}
                    placeholder={"Type a message..."}
                    modules={{
                        // toolbar: [
                        //     ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        //     [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        //     ['link', 'code-block']
                        // ],
                        toolbar: false,
                        mention
                    }}
                    formats={formats} />
            </div>
            <div className='w-1/12 text-center'>
                <IonButton slot="icon-only" onClick={onSubmit} fill='clear' size='small'>
                    <IonIcon color='dark' icon={attachOutline} />
                </IonButton>
            </div>
            <div className='w-2/12 text-center'>
                <IonButton slot="icon-only" onClick={onSubmit} fill='clear' size='small'>
                    <IonIcon color='dark' icon={paperPlane} />
                </IonButton>
            </div>
        </div >
    )
}