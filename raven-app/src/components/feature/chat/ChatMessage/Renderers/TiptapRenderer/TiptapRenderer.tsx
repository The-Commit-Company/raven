import { EditorContent, EditorContext, EditorProvider, Extension, ReactRenderer, useEditor } from '@tiptap/react'
import { Message, TextMessage } from '../../../../../../../../types/Messaging/Message'
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
import { CustomBlockquote } from './Blockquote'
import { CustomBold } from './Bold'
import { CustomUserMention } from './Mention'
import { CustomLink, LinkPreview } from './Link'
import { CustomItalic } from './Italic'
import { CustomUnderline } from './Underline'
import { clsx } from 'clsx'
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
        class: isTruncated ? 'line-clamp-3' : ''
      }
    },
    enableCoreExtensions: true,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bold: false,
        blockquote: false,
        italic: false,
        listItem: {
          HTMLAttributes: {
            class: 'ml-5 rt-Text rt-r-size-2'
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'rt-Text rt-r-size-2'
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
      CustomBlockquote,
      CustomBold,
      CustomUserMention,
      CustomLink,
      CustomItalic
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
        {showLinkPreview && <LinkPreview isScrolling={isScrolling} />}
      </EditorContext.Provider>
    </Box>
  )
}

export const TruncatedTiptapRenderer = ({ message, user, showLinkPreview = false, ...props }: TiptapRendererProps) => {


  return <Box className='text-ellipsis overflow-hidden line-clamp-3'>
    <TiptapRenderer message={message} user={user} showLinkPreview={showLinkPreview} isTruncated {...props} />
  </Box>

}