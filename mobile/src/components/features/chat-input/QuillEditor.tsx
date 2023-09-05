import React, { useCallback } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import "quill-mention";
import 'quill-mention/dist/quill.mention.css';
import './quill-styles.css'

type Props = {
    onChange: (value: string) => void,
    value: string,
    allMembers: { id: string; value: string }[],
    allChannels: { id: string; value: string; }[]
}

export const QuillEditor = ({ onChange, value, allChannels, allMembers }: Props) => {

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'mention',
        'code-block'
    ]
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
    return (
        <ReactQuill
            className={'my-quill-editor'}
            onChange={onChange}
            value={value}
            placeholder={"Type a message..."}
            modules={{
                toolbar: false,
                mention
            }}
            formats={formats} />
    )
}