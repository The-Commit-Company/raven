import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { NodeViewProps } from '@tiptap/core'
import { Badge, Tooltip } from '@radix-ui/themes'
import { BiCalendar } from 'react-icons/bi'

interface TimelineMentionNodeAttrs {
    timeline_id: string
    experiment_id: string
    timeline_task: string
    label: string
}

export const TimelineMentionRenderer = (props: NodeViewProps) => {
    const attrs = props.node.attrs as TimelineMentionNodeAttrs
    
    return (
        <NodeViewWrapper className="timeline-mention-wrapper inline">
            <Tooltip content={`Timeline: ${attrs.timeline_task} (${attrs.experiment_id})`}>
                <Badge 
                    className="timeline-mention inline-flex items-center gap-1 cursor-pointer"
                    color="blue"
                    variant="soft"
                    size="1"
                >
                    <BiCalendar size={12} />
                    ${attrs.label || attrs.timeline_task}
                </Badge>
            </Tooltip>
            <NodeViewContent />
        </NodeViewWrapper>
    )
}