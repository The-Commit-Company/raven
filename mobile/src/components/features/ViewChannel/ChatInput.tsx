import { useFrappeCreateDoc } from 'frappe-react-sdk'
import React, { useCallback, useState } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import "quill-mention";
import 'quill-mention/dist/quill.mention.css';
import './quill-styles.css'
import { IonButton, IonIcon } from '@ionic/react';
import { paperPlane, paperPlaneOutline, sendOutline } from 'ionicons/icons';

type Props = {
    channelID: string,
    allMembers: { id: string; value: string; }[],
    allChannels: { id: string; value: string; }[],
    onMessageSend: () => void
}

export const ChatInput = ({ channelID, allChannels, allMembers, onMessageSend }: Props) => {
    const { createDoc } = useFrappeCreateDoc()

    const [text, setText] = useState("")

    const handleChange = (value: string) => {
        setText(value)
    }

    const onSubmit = () => {
        createDoc('Raven Message', {
            channel_id: channelID,
            text: text
        }).then(() => {
            setText("")
            onMessageSend()
        })
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