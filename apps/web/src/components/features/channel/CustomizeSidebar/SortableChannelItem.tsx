import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { GripVertical } from 'lucide-react'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { cn } from '@lib/utils'

interface SortableChannelItemProps {
    channel: ChannelListItem
}

export const SortableChannelItem = ({
    channel,
}: SortableChannelItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: channel.name })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors cursor-grab active:cursor-grabbing",
                isDragging && "border-muted-foreground/50"
            )}
        >
            <div className="rounded-full border bg-background p-1 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
            </div>
            <ChannelIcon
                type={channel.type || "Public"}
                className="w-4 h-4 flex-shrink-0 text-muted-foreground"
            />
            <span className="truncate text-sm">{channel.channel_name}</span>
        </div>
    )
}
