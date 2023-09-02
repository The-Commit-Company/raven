import { useColorMode } from "@chakra-ui/react"
import { useCallback, useRef } from "react"
import ReactQuill from "react-quill"
import { CustomFile } from "../../file-upload/FileDrop"
import Quill from 'quill'
import { Linkify, Options } from 'quill-linkify'
import QuillImageDropAndPaste, { ImageData } from 'quill-image-drop-and-paste'
import "quill-mention";
import 'quill-mention/dist/quill.mention.css'
import 'react-quill/dist/quill.snow.css'
import './styles.css'

Quill.register('modules/linkify', Linkify)
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste)

type Props = {
    text: string,
    setText: (text: string) => void,
    onSubmit: () => void,
    setFiles: (f: any) => void,
    allUsers: any[],
    allChannels: any[],
    reactQuillRef: React.RefObject<ReactQuill>
}

export const QuillEditor = ({ text, setText, setFiles, onSubmit, allUsers, allChannels, reactQuillRef }: Props) => {

    const { colorMode } = useColorMode()


    const handleChange = (value: string) => {
        setText(value)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
        }
    }

    const mention = {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@", "#"],
        source: useCallback((searchTerm: string, renderList: any, mentionChar: string) => {

            let values;

            if (mentionChar === "@") {
                values = allUsers;
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

    const linkifyOptions: Options = {
        url: true,
        mail: true,
        phoneNumber: false
    }

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'mention',
        'code-block'
    ]

    const imageDropAndPaste = {
        handler: useCallback((imageData: ImageData) => {
            console.log('Called')
            const file: CustomFile = imageData.toFile() as CustomFile
            if (file) {
                file.fileID = file.name + Date.now()
                file.uploadProgress = 0
                setFiles((f: any) => [...f, file])
            }

        }, [])
    }

    return (
        <ReactQuill
            className={colorMode === 'light' ? 'my-quill-editor light-theme' : 'my-quill-editor dark-theme'}
            onChange={handleChange}
            value={text}
            ref={reactQuillRef}
            placeholder={"Type a message..."}
            modules={{
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'code-block']
                ],
                linkify: linkifyOptions,
                mention,
                imageDropAndPaste,
                clipboard: {
                    matchVisual: false
                }
            }}
            formats={formats}
            onKeyDown={handleKeyDown} />
    )
}