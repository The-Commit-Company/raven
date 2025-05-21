import { UserFields } from '@/utils/users/UserListProvider'
import { Box } from '@radix-ui/themes'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import Italic from '@tiptap/extension-italic'
import Mention from '@tiptap/extension-mention'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { PluginKey } from '@tiptap/pm/state'
import { EditorContent, EditorContext, mergeAttributes, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { clsx } from 'clsx'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { common, createLowlight } from 'lowlight'
import { TextMessage } from '../../../../../../../../types/Messaging/Message'
import { CustomBold } from './Bold'
import Details from './Details'
import { CustomLink } from './Link'
import LinkPreview from './LinkPreview'
import { ChannelMentionRenderer, UserMentionRenderer } from './Mention'
import TimestampRenderer from './TimestampRenderer'
import './tiptap-renderer.styles.css'
import { CustomUnderline } from './Underline'

const lowlight = createLowlight(common)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)
type TiptapRendererProps = BoxProps & {
  message: TextMessage
  user?: UserFields
  currentUser: string | null | undefined
  showLinkPreview?: boolean
  isScrolling?: boolean
  showMiniImage?: boolean
}

export const TiptapRenderer = ({
  message,
  user,
  currentUser,
  isScrolling = false,
  showMiniImage = false,
  showLinkPreview = true,
  ...props
}: TiptapRendererProps) => {
  const editor = useEditor({
    content: message.text,
    editable: false,
    editorProps: {
      attributes: {
        class: clsx('tiptap-renderer')
      }
    },
    enableCoreExtensions: true,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bold: false,
        italic: false,
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6'
          }
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4'
          }
        },
        listItem: {
          HTMLAttributes: {
            class: 'rt-Text leading-relaxed text-base sm:text-sm'
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'rt-Text text-base sm:text-sm'
          }
        },
        code: {
          HTMLAttributes: {
            class:
              'pt-0.5 px-1 pb-px bg-[var(--gray-a3)] dark:bg-[#0d0d0d] text-[var(--ruby-a11)] dark-[var(--accent-a3)] text text-xs font-mono rounded border border-gray-4 dark:border-gray-6'
          }
        }
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-[var(--yellow-6)] dark:bg-[var(--yellow-11)] px-2 py-1'
        }
      }),
      CustomUnderline,
      CodeBlockLowlight.configure({
        lowlight
      }),
      CustomBold,
      CustomLink,
      Italic,
      Table.configure({
        HTMLAttributes: {
          class: 'rt-TableRootTable border-l border-r border-t border-gray-4 dark:border-gray-7 my-2'
        }
      }).extend({
        renderHTML({ node, HTMLAttributes }) {
          // Wrap the table in a div with a class that will be styled in CSS
          return [
            'div',
            { class: 'table-wrapper rt-TableRoot rt-r-size-1 rt-variant-ghost' },
            [
              'table',
              mergeAttributes(HTMLAttributes, node.attrs, {
                class: 'rt-TableRootTable border-l border-r border-t border-gray-4 dark:border-gray-7 my-2'
              }),
              0
            ]
          ]
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'rt-TableRow'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            'rt-TableHeader px-2 py-1 bg-accent-2 dark:bg-gray-3 border-r border-b border-gray-4 dark:border-gray-7'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'rt-TableCell py-1 px-2 border-r border-gray-4 dark:border-gray-7'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: showMiniImage ? 'w-auto h-16 max-h-16' : 'w-full max-w-48 sm:max-w-96 mt-1 h-auto'
        },
        inline: true
      }),
      Mention.extend({
        name: 'userMention',
        addNodeView() {
          return ReactNodeViewRenderer(UserMentionRenderer)
        }
      }).configure({
        suggestion: {
          char: '@',
          pluginKey: new PluginKey('userMention')
        }
      }),
      Mention.extend({
        name: 'channelMention',
        HTMLAttributes: {
          class: 'mention'
        },
        addNodeView() {
          return ReactNodeViewRenderer(ChannelMentionRenderer)
        }
      }).configure({
        suggestion: {
          char: '#',
          pluginKey: new PluginKey('channelMention')
        }
      }),
      Details,
      TimestampRenderer
    ]
  })

  const isCurrentUser = currentUser === message?.owner

  return (
    <Box
      className={clsx(
        'overflow-x-hidden text-ellipsis p-4 rounded-lg',
        isCurrentUser ? 'bg-atom-1 dark:bg-atom-2' : 'bg-gray-3 dark:bg-gray-4',
        props.className
      )}
      {...props}
    >
      <EditorContext.Provider value={{ editor }}>
        <EditorContent contentEditable={false} editor={editor} readOnly />
        {showLinkPreview && <LinkPreview messageID={message.name} />}
      </EditorContext.Provider>
    </Box>
  )
}
