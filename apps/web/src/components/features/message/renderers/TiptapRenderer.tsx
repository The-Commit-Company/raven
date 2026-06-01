import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Image } from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import Emoji from '@tiptap/extension-emoji'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { common, createLowlight } from 'lowlight'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import { useMemo } from 'react'

const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)

interface TiptapRendererProps {
	/** TipTap JSON — object or JSON-as-string (as stored on Message.text / Message.content). */
	content: string | Record<string, unknown>
	/** Render images as 16px thumbnails (used by reply previews / forwarded thread cards). */
	showMiniImage?: boolean
}

const parseJson = (content: TiptapRendererProps['content']): Record<string, unknown> | null => {
	if (typeof content === 'object') return content
	const trimmed = content.trim()
	if (!trimmed) return null
	try {
		const parsed = JSON.parse(trimmed)
		return typeof parsed === 'object' && parsed !== null ? parsed : null
	} catch {
		return null
	}
}

/**
 * Read-only TipTap renderer for stored message JSON.
 *
 * Not (yet) wired: custom Bold/Link/Underline node-view overrides from v2,
 * channel/user Mention NodeViews (rendered as default Mention nodes), and
 * TimestampRenderer (was custom in v2). LinkPreview is owned by MessageContent.
 */
export const TiptapRenderer = ({ content, showMiniImage = false }: TiptapRendererProps) => {
	const json = useMemo(() => parseJson(content), [content])

	const editor = useEditor({
		content: json,
		editable: false,
		editorProps: {
			attributes: {
				class: 'tiptap-renderer text-sm text-ink-gray-8 focus:outline-none',
			},
		},
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
				codeBlock: false,
				orderedList: { HTMLAttributes: { class: 'list-decimal pl-6' } },
				bulletList: { HTMLAttributes: { class: 'list-disc pl-6' } },
				listItem: { HTMLAttributes: { class: 'leading-relaxed' } },
				code: {
					HTMLAttributes: {
						class: 'px-1 py-0.5 rounded bg-surface-gray-2 text-ink-red-5 text-xs font-mono border border-outline-gray-2',
					},
				},
				link: {
					openOnClick: true,
					HTMLAttributes: { class: 'text-ink-blue-5 hover:underline', target: '_blank', rel: 'noopener noreferrer' },
				},
			}),
			CodeBlockLowlight.configure({ lowlight }),
			Highlight.configure({
				multicolor: true,
				HTMLAttributes: { class: 'bg-surface-amber-2 text-ink-amber-5 rounded-sm px-0.5' },
			}),
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			Image.configure({
				HTMLAttributes: {
					class: showMiniImage
						? 'w-auto h-16 max-h-16 rounded-md'
						: 'w-full max-w-96 my-1 h-auto rounded-md',
				},
				inline: true,
			}),
			Table.configure({
				HTMLAttributes: { class: 'border-collapse my-2 border border-outline-gray-2' },
			}),
			TableRow,
			TableHeader.configure({
				HTMLAttributes: { class: 'px-2 py-1 bg-surface-gray-2 border border-outline-gray-2 text-left font-medium' },
			}),
			TableCell.configure({
				HTMLAttributes: { class: 'px-2 py-1 border border-outline-gray-2' },
			}),
			Details,
			DetailsSummary,
			DetailsContent,
			Mention.extend({ name: 'userMention' }).configure({
				HTMLAttributes: { class: 'mention text-ink-blue-5 bg-surface-blue-2 rounded px-1' },
				suggestion: { char: '@', pluginKey: new PluginKey('userMention') },
			}),
			Mention.extend({ name: 'channelMention' }).configure({
				HTMLAttributes: { class: 'mention text-ink-blue-5 bg-surface-blue-2 rounded px-1' },
				suggestion: { char: '#', pluginKey: new PluginKey('channelMention') },
			}),
			Emoji,
		],
	}, [json])

	if (!editor || !json) return null
	return (
		<EditorContext.Provider value={{ editor }}>
			<EditorContent contentEditable={false} editor={editor} readOnly />
		</EditorContext.Provider>
	)
}

export default TiptapRenderer
