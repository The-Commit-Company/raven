import React from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Mention from '@tiptap/extension-mention'
import Underline from '@tiptap/extension-underline'
export const CustomUserMention = Mention.extend({
    name: 'userMention',
})

export const CustomChannelMention = Mention.extend({
    name: 'channelMention',
})

const TiptapRenderer = ({ message, isTruncated = false, showLinkPreview = true }) => {

    const editor = useEditor({
        content: message.text,
        editable: false,
        editorProps: {
            attributes: {
                class: isTruncated ? 'line-clamp-3' : '',
            }
        },
        enableCoreExtensions: true,
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                bold: true,
                blockquote: true,
                italic: true,
                listItem: true,
                paragraph: {
                    HTMLAttributes: {
                        class: ''
                    }
                }
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    // style: "background-color: var(--yellow-6); padding: 2px 4px;"
                    // class: 'bg-[var(--yellow-6)] dark:bg-[var(--yellow-11)] px-2 py-1'
                }
            }),
            Link.configure({
                HTMLAttributes: {
                    class: 'break-all'
                },
            }),
            CustomUserMention.configure({
                HTMLAttributes: {
                    class: 'user-mention'
                }
            }),
            //   CustomUnderline,
            //   CodeBlockLowlight.configure({
            //     lowlight
            //   }),
            //   CustomBlockquote,
            //   CustomBold,
            //   CustomUserMention,
            //   CustomLink,
            //   CustomItalic
            // TODO: Add channel mention
            // CustomChannelMention
        ]
    })
    return (
        <div className='raven-tiptap-renderer' style={{
            overflowX: 'hidden',
            width: '100%',
            textOverflow: 'ellipsis',
        }}>
            <EditorContext.Provider value={{ editor }}>
                <EditorContent
                    contentEditable={false}
                    editor={editor}
                    readOnly />
                {/* {showLinkPreview && <LinkPreview isScrolling={isScrolling} />} */}
            </EditorContext.Provider>
        </div>
    )
}

export default TiptapRenderer