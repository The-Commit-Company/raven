import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonModal, IonTitle, IonToolbar, useIonToast } from "@ionic/react"
import { useContext, useRef } from "react"
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { EditorContent, ReactRenderer, useEditor } from '@tiptap/react'
import { UserListContext } from "@/utils/users/UserListProvider"
import { ChannelListContext, ChannelListContextType } from "@/utils/channel/ChannelListProvider"
import { common, createLowlight } from "lowlight"
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import '../../chat-input/tiptap.styles.css'
import Mention from '@tiptap/extension-mention'
import tippy from 'tippy.js'
import { PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import ChannelMentionList from "../../chat-input/ChannelMentionList"
import MentionList from "../../chat-input/MentionList"

interface EditMessageModalProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    originalText: string,
    messageID: string,
    channelID: string,
}

const lowlight = createLowlight(common)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)

const UserMention = Mention.extend({
    name: 'userMention',
}).configure({
    suggestion: {
        char: '@',
        pluginKey: new PluginKey('userMention'),
    }
})

const ChannelMention = Mention.extend({
    name: 'channelMention',
}).configure({
    suggestion: {
        char: '#',
        pluginKey: new PluginKey('channelMention'),
    }
})

export const EditMessageModal = ({ presentingElement, isOpen, onDismiss, originalText, messageID, channelID }: EditMessageModalProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const [present] = useIonToast()

    const { updateDoc } = useFrappeUpdateDoc()
    const { mutate } = useSWRConfig()

    const { users } = useContext(UserListContext)
    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const extensions = [
        StarterKit.configure({
            heading: false,
            codeBlock: false,
            bold: {
                HTMLAttributes: {
                    class: 'font-bold'
                }
            },
            italic: {
                HTMLAttributes: {
                    class: 'italic'
                }
            },
            strike: {
                HTMLAttributes: {
                    class: 'line-through'
                }
            },
            listItem: {
                HTMLAttributes: {
                    class: 'ml-4'
                }
            },
            blockquote: {
                HTMLAttributes: {
                    class: 'pl-4 border-l-4 border-gray-500'
                }
            },
            orderedList: {
                HTMLAttributes: {
                    class: 'ml-1'
                }
            },
            code: {
                HTMLAttributes: {
                    class: 'font-mono bg-slate-950 text-sm radius-md p-1 text-white'
                }
            },

        }),
        UserMention.configure({
            HTMLAttributes: {
                class: 'mention text-blue-500',
            },
            renderLabel({ options, node }) {
                return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
            },
            suggestion: {
                items: (query) => {
                    return users.filter((user) => user.full_name.toLowerCase().startsWith(query.query.toLowerCase()))
                        .slice(0, 10);
                },
                // char: '@',
                render: () => {
                    let component: any;
                    let popup: any;

                    return {
                        onStart: props => {
                            component = new ReactRenderer(MentionList, {
                                props,
                                editor: props.editor,
                            })

                            if (!props.clientRect) {
                                return
                            }

                            popup = tippy('body' as any, {
                                getReferenceClientRect: props.clientRect as any,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'top-start',
                            })
                        },

                        onUpdate(props) {
                            component.updateProps(props)

                            if (!props.clientRect) {
                                return
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            })
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                popup[0].hide()

                                return true
                            }

                            return component.ref?.onKeyDown(props)
                        },

                        onExit() {
                            popup[0].destroy()
                            component.destroy()
                        },
                    }
                },

            }
        }),
        ChannelMention.configure({
            HTMLAttributes: {
                class: 'mention text-blue-500',
            },
            renderLabel({ options, node }) {
                return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
            },
            suggestion: {
                items: (query) => {
                    return channels.filter((channel) => channel.channel_name.toLowerCase().startsWith(query.query.toLowerCase()))
                        .slice(0, 10);
                },
                // char: '#',
                render: () => {
                    let component: any;
                    let popup: any;

                    return {
                        onStart: props => {
                            component = new ReactRenderer(ChannelMentionList, {
                                props,
                                editor: props.editor,
                            })

                            if (!props.clientRect) {
                                return
                            }

                            popup = tippy('body' as any, {
                                getReferenceClientRect: props.clientRect as any,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'top-start',
                            })
                        },

                        onUpdate(props) {
                            component.updateProps(props)

                            if (!props.clientRect) {
                                return
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            })
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                popup[0].hide()

                                return true
                            }

                            return component.ref?.onKeyDown(props)
                        },

                        onExit() {
                            popup[0].destroy()
                            component.destroy()
                        },
                    }
                },

            }
        }),
        Underline,
        Highlight.configure({
            multicolor: true,
        }),
        Link.configure({
            protocols: ['mailto', 'https', 'http'],
            HTMLAttributes: {
                class: 'underline text-blue-500',

            },
            linkOnPaste: true,
            openOnClick: false,
        }),
        CodeBlockLowlight.configure({
            lowlight
        }),
        Placeholder.configure({
            placeholder: 'Type a message...'
        }),
    ]

    const editor = useEditor({
        extensions,
        content: originalText,
        editorProps: {
            attributes: {
                class: 'focus:outline-none text-md py-1.5 px-2'
            }
        }
    })

    const onSubmit = async (message: string, json: any) => {
        if (editor && !editor.isEmpty) {
            editor.setEditable(false)
            return updateDoc('Raven Message', messageID,
                { text: message, json }).then((d) => {
                    return present({
                        position: 'bottom',
                        color: 'success',
                        duration: 600,
                        message: 'Message updated',
                    })
                }).catch((e) => {
                    console.log(e)
                    present({
                        color: 'danger',
                        duration: 600,
                        message: "Error: Could not update message",
                    })
                }).then(() => mutate(`get_messages_for_channel_${channelID}`))
                .then(() => onDismiss())
        }
    }

    return (
        <IonModal ref={modal} onDidDismiss={onDismiss} isOpen={isOpen} presentingElement={presentingElement}>

            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color="medium" onClick={() => onDismiss()}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        <div className='flex flex-col items-center justify-start'>
                            <h1>Edit Message</h1>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onSubmit} strong={true}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonItem lines="none">
                    <div className='flex justify-between items-end content-start overflow-visible space-x-2 w-full my-2'>
                        <div className='w-full focus:outline-none rounded-md border border-zinc-800 text-md overflow-hidden'>
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </IonItem>
            </IonContent>

        </IonModal>
    )
}