import React from 'react'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './markdown.css'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    // @ts-ignore
    rehypePlugins={[rehypeRaw]}
    className='markdown'>
    {content}
  </ReactMarkdown>
}