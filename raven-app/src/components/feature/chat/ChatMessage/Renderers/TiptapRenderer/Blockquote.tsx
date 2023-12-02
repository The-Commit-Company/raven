import { Blockquote } from '@radix-ui/themes';
import TiptapBlockquote from '@tiptap/extension-blockquote'
import { NodeViewRendererProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

export const CustomBlockquote = TiptapBlockquote.extend({
    addNodeView() {
        return ReactNodeViewRenderer(BlockquoteRenderer)
    }
})

const BlockquoteRenderer = ({ node }: NodeViewRendererProps) => {
    return (
        <NodeViewWrapper>
            <Blockquote m='2' size='3'>
                {node.textContent}
            </Blockquote>
        </NodeViewWrapper>
    );
};