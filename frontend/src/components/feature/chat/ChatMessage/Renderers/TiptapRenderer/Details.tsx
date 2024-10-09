import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewRendererProps, NodeViewContent } from '@tiptap/react'

export default Node.create({
    name: 'details',

    group: 'block',

    content: 'block+',

    atom: true,

    addAttributes() {
        return {
            'data-summary': {
                default: '',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'details',
            },
        ]
    },

    renderHTML({ HTMLAttributes, node }) {
        return ['details', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(DetailsComponent)
    },
})

const DetailsComponent = ({ node }: NodeViewRendererProps) => {

    return <NodeViewWrapper>
        <details>
            <summary className='text-gray-11 text-sm'>
                {node.attrs['data-summary']}
            </summary>
            <div className='font-mono pl-4'>
                <NodeViewContent />
            </div>
        </details>
    </NodeViewWrapper>
}