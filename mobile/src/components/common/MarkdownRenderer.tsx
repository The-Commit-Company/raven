import React, { useMemo } from 'react'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './renderer.css'

interface MarkdownRendererProps {
  content: string,
  truncate?: boolean,
}

const MAX_TRUNCATED_LENGTH = 100
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, truncate = false }) => {

  const truncatedContent = useMemo(() => {
    if (truncate && content.length > MAX_TRUNCATED_LENGTH) {
      return content.slice(0, MAX_TRUNCATED_LENGTH) + "..."
    } else {
      return content
    }
  }, [content, truncate])

  return <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className='content'
    // @ts-ignore
    rehypePlugins={[rehypeRaw]}>
    {truncatedContent}
  </ReactMarkdown>
}