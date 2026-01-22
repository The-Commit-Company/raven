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
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
// load all languages with "all" or common languages with "common"
import { common, createLowlight } from 'lowlight'
import './tiptap.css'


export interface TiptapEditorProps {
    /** Channel ID for draft persistence - key for scoping editor state */
    channelID: string

    /** Placeholder text shown when editor is empty */
    placeholder?: string

    /** Initial content - can be HTML string or Tiptap JSON */
    defaultContent?: string | JSONContent

    /** Callback fired on every content change - receives both HTML and JSON */
    onUpdate?: (html: string, json: JSONContent) => void

    /** Whether editor accepts input - useful for "sending" state */
    editable?: boolean

    /** Slot for components that need editor context (toolbar, formatting menu) */
    children?: React.ReactNode
}

const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)

const extensions = [
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
    }).configure({
        lowlight
    }),

    // 3. Mention (user) - for @username mentions
    //    Already installed: @tiptap/extension-mention
    //
    // 4. Mention (channel) - for #channel mentions (extend Mention)
    //
    // 5. Image - for inline images and GIFs
    //    Already installed: @tiptap/extension-image
    //
    // 6. FileHandler - NEW in v3, handles drag/drop and paste
    //    Already installed: @tiptap/extension-file-handler
    //
    // 7. Custom KeyboardHandler - Enter to send, Shift+Enter for newline
    //    Will be a custom extension
    //
    // 8. Emoji - v3 has native emoji extension
]

const TiptapEditor = ({
    channelID,
    placeholder = 'Type a message...',
    defaultContent = '',
    onUpdate,
    editable = true,
    children,
}: TiptapEditorProps) => {


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
