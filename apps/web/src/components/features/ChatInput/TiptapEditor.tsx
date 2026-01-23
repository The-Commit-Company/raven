/**
 * TiptapEditor.tsx - Core Rich Text Editor for Raven v3
 */
import { useMemo } from 'react'
import {
    useEditor,
    EditorContent,
    EditorContext,
    JSONContent
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import Mention from '@tiptap/extension-mention'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import FileHandler from '@tiptap/extension-file-handler'
import { PluginKey } from '@tiptap/pm/state'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
// load all languages with "all" or common languages with "common"
import { common, createLowlight } from 'lowlight'
import { createMentionSuggestion } from './createMentionSuggestion'
import { MentionItem } from './MentionList'
import { EmojiSuggestion } from './EmojiSuggestion'
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
}

// Base mention extension configs (without suggestion data)
const UserMention = Mention.extend({ name: 'userMention' })
const ChannelMention = Mention.extend({ name: 'channelMention' })

/**
 * Creates extensions array with data-bound mention suggestions
 */
function createExtensions(users: MentionItem[], channels: MentionItem[], onAddFile: (files: FileList) => void) {
    return [
        StarterKit.configure({
            heading: false,
            codeBlock: false,
            link: {
                openOnClick: false,      // Don't navigate on click in editor
                autolink: true,          // Auto-detect URLs as user types
                linkOnPaste: true,       // Convert pasted URLs to links
            },
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
}: TiptapEditorProps) => {

    // Memoize extensions - recreate only when data sources change
    const extensions = useMemo(
        () => createExtensions(users, channels, onAddFile || (() => { })),
        [users, channels, onAddFile]
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
