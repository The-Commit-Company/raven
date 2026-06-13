interface SearchTextRendererProps {
	content: string
}

/**
 * Plain-text renderer for sqlite FTS search results. Recognizes `<mark>…</mark>`
 * spans from FTS snippet output and styles them as amber highlights; React
 * escapes everything else.
 *
 */
export const SearchTextRenderer = ({ content }: SearchTextRendererProps) => {
	const parts = content.split(/<mark>([\s\S]*?)<\/mark>/g)
	return (
		<div className="text-p-base text-ink-gray-8 whitespace-pre-wrap wrap-break-words">
			{parts.map((part, i) =>
				i % 2 === 1
					? <mark key={i} className="bg-surface-amber-2 text-ink-gray-8 rounded-sm px-0.5 font-semibold">{part}</mark>
					: <span key={i}>{part}</span>
			)}
		</div>
	)
}

export default SearchTextRenderer
