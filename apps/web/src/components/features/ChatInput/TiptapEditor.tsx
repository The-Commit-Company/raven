/**
 * TiptapEditor.tsx - Core Rich Text Editor for Raven v3
 */
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import FileHandler from '@tiptap/extension-file-handler'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { Placeholder } from '@tiptap/extensions'
import { PluginKey } from '@tiptap/pm/state'
import {
    EditorContent,
    EditorContext,
    JSONContent,
    useEditor
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { useMemo } from 'react'
// load all languages with "all" or common languages with "common"
import { EmojiSuggestion } from '@components/features/ChatInput/Emoji/EmojiSuggestion'
import { createKeyboardHandler } from '@components/features/ChatInput/KeyboardHandler/createKeyboardHandler'
import { createMentionSuggestion } from '@components/features/ChatInput/Mentions/createMentionSuggestion'
import { MentionItem } from '@components/features/ChatInput/Mentions/MentionList'
import TimestampRenderer from '@components/features/message/renderers/TimestampRenderer'
import { EnterKeyBehaviourAtom } from '@utils/preferences'
import { useAtom } from 'jotai'
import { common, createLowlight } from 'lowlight'

import './tiptap.css'

// Lowlight setup for syntax highlighting
const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)

export interface TiptapEditorProps {
    channelID: string

    /** Placeholder text shown when editor is empty */
    placeholder?: string
    defaultContent?: string | JSONContent
    onUpdate?: (html: string, json: JSONContent) => void

    /** Whether editor accepts input - useful for "sending" state */
    editable?: boolean
    children?: React.ReactNode
    /** Users available for @mentions */
    users?: MentionItem[]
    /** Channels available for #mentions */
    channels?: MentionItem[]
    /** Handler for file uploads (paste/drop) */
    onAddFile?: (files: FileList) => void
    /** Callback when message should be sent (Enter or Mod-Enter) */
    onMessageSend?: (html: string, json: JSONContent) => Promise<void>
    /** Callback when editor is empty and backspace is pressed (to clear reply) */
    clearReplyMessage?: () => void
    /** Callback when editor is empty and up arrow is pressed */
    onUpArrow?: () => void
}

// Base mention extension configs (without suggestion data)
const UserMention = Mention.extend({ name: 'userMention' })
const ChannelMention = Mention.extend({ name: 'channelMention' })

/**
 * Creates extensions array with data-bound mention suggestions
 */
function createExtensions(
    users: MentionItem[],
    channels: MentionItem[],
    onAddFile: (files: FileList) => void,
    onMessageSend?: (html: string, json: JSONContent) => Promise<void>,
    clearReplyMessage?: () => void,
    onUpArrow?: () => void,
    enterKeyBehaviour?: "new-line" | "send-message"
) {
    return [
        StarterKit.configure({
            heading: false,
            codeBlock: false,
            link: {
                openOnClick: false,      // Don't navigate on click in editor
                autolink: true,          // Auto-detect URLs as user types
                linkOnPaste: true,       // Convert pasted URLs to links
                defaultProtocol: 'https',
                protocols: ['http', 'https'],
                isAllowedUri: (url, ctx) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

                        // use default validation
                        if (!ctx.defaultValidate(parsedUrl.href)) {
                            return false
                        }

                        // disallowed protocols
                        const disallowedProtocols = ['ftp', 'file', 'mailto']
                        const protocol = parsedUrl.protocol.replace(':', '')

                        if (disallowedProtocols.includes(protocol)) {
                            return false
                        }

                        // only allow protocols specified in ctx.protocols
                        const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

                        if (!allowedProtocols.includes(protocol)) {
                            return false
                        }

                        // disallowed domains
                        const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
                        const domain = parsedUrl.hostname

                        if (disallowedDomains.includes(domain)) {
                            return false
                        }

                        // all checks have passed
                        return true
                    } catch {
                        return false
                    }
                },
                shouldAutoLink: url => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

                        // only auto-link if the domain is not in the disallowed list
                        const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
                        const domain = parsedUrl.hostname

                        return !disallowedDomains.includes(domain)
                    } catch {
                        return false
                    }
                },
            }
        }),

        Placeholder.configure({
            placeholder: 'Type a message...'
        }),

        CodeBlockLowlight.extend({
            addKeyboardShortcuts() {
                return {
                    // this extends existing shortcuts instead of overwriting
                    ...this.parent?.(),
                    'Mod-Shift-E': () => this.editor.commands.toggleCodeBlock(),
                }
            }
        }).configure({ lowlight }),

        UserMention.configure({
            HTMLAttributes: { class: 'mention' },
            renderHTML({ options, node }) {
                return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
            },
            suggestion: {
                char: '@',
                pluginKey: new PluginKey('userMention'),
                allowedPrefixes: null,
                // Prevent mentions after alphanumeric chars (e.g. "test@" shouldn't trigger)
                allow: ({ state, range }) => {
                    // Do not allow mentions if the preceding character is a letter or digit
                    const precedingCharacter = state.doc.textBetween(range.from - 1, range.from, '')
                    return !/[a-zA-Z0-9]/.test(precedingCharacter)
                },
                ...createMentionSuggestion({
                    getItems: (query) => {
                        const q = query.toLowerCase()
                        return users
                            .filter((u) => u.label.toLowerCase().includes(q))
                            .slice(0, 8)
                    },
                }),
            },
        }),

        ChannelMention.configure({
            HTMLAttributes: { class: 'mention' },
            renderHTML({ options, node }) {
                return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
            },
            suggestion: {
                char: '#',
                pluginKey: new PluginKey('channelMention'),
                allowedPrefixes: null,
                allow: ({ state, range }) => {
                    // Do not allow mentions if the preceding character is a letter or digit
                    const precedingCharacter = state.doc.textBetween(range.from - 1, range.from, '')
                    return !/[a-zA-Z0-9]/.test(precedingCharacter)
                },
                ...createMentionSuggestion({
                    getItems: (query) => {
                        const q = query.toLowerCase()
                        return channels
                            .filter((c) => c.label.toLowerCase().includes(q))
                            .slice(0, 8)
                    },
                }),
            },
        }),
        Image.configure({
            inline: true,
        }),
        FileHandler.configure({
            // TODO: configure allowed mime types later
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            onPaste: (editor, files, htmlContent) => {
                if (files.length > 0) {
                    const dataTransfer = new DataTransfer()
                    files.forEach(file => dataTransfer.items.add(file))
                    onAddFile(dataTransfer.files)
                }
            },
            onDrop: (editor, files, pos) => {
                if (files.length > 0) {
                    const dataTransfer = new DataTransfer()
                    files.forEach(file => dataTransfer.items.add(file))
                    onAddFile(dataTransfer.files)
                }
            },
        }),
        EmojiSuggestion,
        TimestampRenderer,
        createKeyboardHandler(onMessageSend, clearReplyMessage, onUpArrow, enterKeyBehaviour)
    ]
}

const TiptapEditor = ({
    channelID,
    placeholder = 'Type a message...',
    defaultContent = '',
    onUpdate,
    editable = true,
    children,
    users = [],
    channels = [],
    onAddFile,
    onMessageSend,
    clearReplyMessage,
    onUpArrow,
}: TiptapEditorProps) => {

    const [enterKeyBehaviour] = useAtom(EnterKeyBehaviourAtom)

    // Memoize extensions - recreate only when data sources change
    const extensions = useMemo(
        () => createExtensions(
            users,
            channels,
            onAddFile || (() => { }),
            onMessageSend,
            clearReplyMessage,
            onUpArrow,
            enterKeyBehaviour
        ),
        [users, channels, onAddFile, onMessageSend, clearReplyMessage, onUpArrow]
    )

    const editor = useEditor({
        extensions,
        content: defaultContent,
        editable,
        // This prevents "document is not defined" errors and hydration mismatches
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getHTML(), editor.getJSON())
        },

        /**
         * Lifecycle callbacks for debugging/future features.
         *
         * onCreate: ({ editor }) => { console.log('Editor created') },
         * onFocus: ({ editor }) => { // typing indicator start },
         * onBlur: ({ editor }) => { // typing indicator stop },
         * onDestroy: () => { // cleanup },
         */
    })

    // Memoize the context value to prevent unnecessary rerenders of children.
    const editorContextValue = useMemo(() => ({ editor }), [editor])

    return (
        /**
         * EditorContext.Provider makes editor available to all descendants.
         *
         * Child components (toolbar, formatting menu) can use:
         * - useCurrentEditor() hook to get editor instance
         * - useEditorState() hook to subscribe to specific state changes
         */
        <EditorContext.Provider value={editorContextValue}>
            <div
                className="tiptap-editor-container"
                /**
                 * data-channel attribute for CSS scoping and debugging.
                 * Useful when multiple editors exist (main chat + thread).
                 */
                data-channel={channelID}
            >
                {/**
                 * EditorContent renders the actual contenteditable div.
                 */}
                <EditorContent
                    editor={editor}
                    className="tiptap-editor-content"
                />

                {/**
                 * Children slot for toolbar, formatting menu, etc.
                 * These components can use useCurrentEditor() to access editor.
                 *
                 * Example usage:
                 * <TiptapEditor channelID={channelID}>
                 *   <FormattingToolbar />
                 *   <MentionSuggestions />
                 * </TiptapEditor>
                 */}
                {children}
            </div>
        </EditorContext.Provider>
    )
}

export default TiptapEditor
