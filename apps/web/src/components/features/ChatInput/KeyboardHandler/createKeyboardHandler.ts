import { JSONContent } from "@tiptap/react"
import { Extension } from '@tiptap/core'


/**
 * Creates keyboard handler extension for Enter, Mod-Enter, Shift-Enter, Backspace, ArrowUp
 */
export function createKeyboardHandler(
    onMessageSend?: (html: string, json: JSONContent) => Promise<void>,
    clearReplyMessage?: () => void,
    onUpArrow?: () => void,
    enterKeyBehaviour?: "new-line" | "send-message"
) {

    const handleMessageSendAction = (editor: any) => {
        const hasContent = editor.getText().trim().length > 0
        let html = ''
        let json: JSONContent = {}

        if (hasContent) {
            html = editor.getHTML()
            json = editor.getJSON()
        }

        if (onMessageSend) {
            editor.setEditable(false)
            onMessageSend(html, json)
                .then(() => {
                    editor.commands.clearContent(true)
                    editor.setEditable(true)
                    editor.commands.focus('start')
                })
                .catch(() => {
                    editor.setEditable(true)
                })
            return true
        }

        // If no handler, just clear content
        return editor.commands.clearContent(true)
    }

    const handleNewLineAction = (editor: any) => {
        return editor.commands.first(({ commands }: { commands: any }) => [
            () => commands.newlineInCode(),
            () => commands.createParagraphNear(),
            () => commands.liftEmptyBlock(),
            () => commands.splitBlock(),
        ])
    }

    return Extension.create({
        name: 'keyboardHandler',
        addKeyboardShortcuts() {
            return {
                Enter: () => {
                    // Skip on mobile/tablet devices
                    if (matchMedia('(max-device-width: 768px)').matches) {
                        return false
                    }
                    if (matchMedia('(max-device-width: 1024px)').matches) {
                        return false
                    }

                    const isCodeBlockActive = this.editor.isActive('codeBlock')
                    const isListItemActive = this.editor.isActive('listItem')

                    // Allow default behavior in code blocks and list items
                    if (isCodeBlockActive || isListItemActive) {
                        return false
                    }

                    if (enterKeyBehaviour === 'send-message') {
                        return handleMessageSendAction(this.editor)
                    } else {
                        return handleNewLineAction(this.editor)
                    }
                },

                'Mod-Enter': () => {
                    const isCodeBlockActive = this.editor.isActive('codeBlock')
                    const isListItemActive = this.editor.isActive('listItem')
                    const hasContent = this.editor.getText().trim().length > 0

                    // In code blocks, Mod-Enter creates a new line
                    if (isCodeBlockActive) {
                        return this.editor.commands.newlineInCode()
                    }

                    // In list items, allow default behavior
                    if (isListItemActive) {
                        return false
                    }

                    // Otherwise, send message
                    if (!isCodeBlockActive && !isListItemActive && hasContent) {
                        return handleMessageSendAction(this.editor)
                    }

                    return false
                },

                'Shift-Enter': () => {
                    return handleNewLineAction(this.editor)
                },

                Backspace: () => {
                    const isEditorEmpty = this.editor.isEmpty

                    if (isEditorEmpty) {
                        // Clear the reply message if the editor is empty
                        clearReplyMessage?.()
                        return this.editor.commands.clearContent(true)
                    }

                    return false
                },

                ArrowUp: () => {
                    // If the editor is empty, call the onUpArrow function
                    if (this.editor.isEmpty) {
                        onUpArrow?.()
                    }
                    return false
                },
            }
        },
    })
}
