import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import StarterKit from '@tiptap/starter-kit'
import '@/components/feature/chat/ChatInput/tiptap.styles.css'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { BiClipboard, BiCopy } from 'react-icons/bi'
import { toast } from 'sonner'

const lowlight = createLowlight(common)
lowlight.register('python', python)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('html', html)
lowlight.register('json', json)


type Props = {
    code: string,
}

const CodeBlock = ({ code }: Props) => {
    const [copied, setCopied] = useState(false)

    const editor = useEditor({
        editorProps: {
            attributes: {
                class: 'tiptap'
            }
        },
        editable: false,
        extensions: [
            StarterKit,
            CodeBlockLowlight.configure({
                lowlight
            })
        ],
        content: `<pre><code>${code}</code></pre>`
    })

    const onCopy = async () => {
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(code)
          } else {
            const textarea = document.createElement('textarea')
            textarea.value = code
            textarea.setAttribute('readonly', '')
            textarea.style.position = 'absolute'
            textarea.style.left = '-9999px'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
          }

          setCopied(true)
          toast.success('Copied to clipboard', { duration: 800 })
          setTimeout(() => setCopied(false), 2500)
        } catch (err) {
          console.error('Copy failed:', err)
          toast.error('Failed to copy')
        }
      }


    if (!editor) return null

    return (
        <div className='relative'>
            <EditorContent editor={editor} />
            <Tooltip content={copied ? 'Copied' : 'Copy'}>
                <IconButton
                    variant='ghost'
                    size='2'
                    color='gray'
                    type='button'
                    className='absolute right-3 top-7 text-gray-8 hover:text-gray-1'
                    onClick={onCopy}
                >
                    {copied ? <BiClipboard /> : <BiCopy />}
                </IconButton>
            </Tooltip>
        </div>

    )
}

export default CodeBlock