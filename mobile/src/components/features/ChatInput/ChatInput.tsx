import { useFrappeCreateDoc, useFrappeFileUpload, useFrappePostCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import React, { useCallback, useRef, useState } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import "quill-mention";
import 'quill-mention/dist/quill.mention.css';
import './quill-styles.css'
import { IonButton, IonIcon } from '@ionic/react';
import { paperPlane, paperPlaneOutline, sendOutline } from 'ionicons/icons';
import { getFileExtension } from '../../../../../raven-app/src/utils/operations';
import { CustomFile } from '../../../../../raven-app/src/components/feature/file-upload/FileDrop';
import { Message } from '../../../../../raven-app/src/types/Messaging/Message';

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

    const [files, setFiles] = useState<CustomFile[]>([])

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
        <div className='flex items-center justify-between'>
            <div className='w-5/6'>
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
            <div className='w-1/6 text-center'>
                <IonButton slot="icon-only" onClick={onSubmit} fill='clear' size='small'>
                    <IonIcon color='dark' icon={paperPlane} />
                </IonButton>
            </div>
        </div>
    )
}