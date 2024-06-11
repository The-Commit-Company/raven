import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { TextMessage } from '../../../../../../../../types/Messaging/Message'
import { UserFields } from '@/utils/users/UserListProvider'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import { Box } from '@radix-ui/themes'
import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import python from 'highlight.js/lib/languages/python'
import { CustomBold } from './Bold'
import { CustomUserMention } from './Mention'
import { CustomLink, LinkPreview } from './Link'
import { CustomUnderline } from './Underline'
import { Image } from '@tiptap/extension-image'
import { clsx } from 'clsx'
import Italic from '@tiptap/extension-italic';
import './tiptap-renderer.styles.css'
const lowlight = createLowlight(common)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)
interface TiptapRendererProps extends BoxProps {
  message: TextMessage,
  user?: UserFields,
  showLinkPreview?: boolean,
  isScrolling?: boolean,
  isTruncated?: boolean
}

export const TiptapRenderer = ({ message, user, isScrolling = false, isTruncated = false, showLinkPreview = true, ...props }: TiptapRendererProps) => {

  const editor = useEditor({
    content: message.text,
    editable: false,
    editorProps: {
      attributes: {
        class: isTruncated ? 'tiptap-renderer line-clamp-3' : 'tiptap-renderer'
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
            class: 'rt-Text leading-relaxed text-sm'
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'rt-Text leading-relaxed text-sm'
          }
        },
        code: {
          HTMLAttributes: {
            class: 'pt-0.5 px-1 pb-px bg-[var(--gray-a3)] dark:bg-[#0d0d0d] text-[var(--ruby-a11)] dark-[var(--accent-a3)] text text-xs font-mono rounded border border-gray-4 dark:border-gray-6'
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
      CustomUserMention,
      CustomLink,
      Italic,
      Image.configure({
        HTMLAttributes: {
          class: 'w-full max-w-48 sm:max-w-96 mt-1 h-auto'
        },
        inline: true
      }),
      // TODO: Add channel mention
      // CustomChannelMention
    ]
  })

  return (
    <Box className={clsx('overflow-x-hidden text-ellipsis', props.className)} {...props}>
      <EditorContext.Provider value={{ editor }}>
        <EditorContent
          contentEditable={false}
          editor={editor}
          readOnly />
        {showLinkPreview && <LinkPreview messageID={message.name} />}
      </EditorContext.Provider>
    </Box>
  )
}