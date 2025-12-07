import { useDroppable } from '@dnd-kit/core'
import { Trash2, ChevronUp, ChevronDown, Edit } from 'lucide-react'
import { Button } from '@components/ui/button'
import { ChannelGroupForm } from './ChannelGroupForm'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableChannelItem } from './SortableChannelItem'
import { cn } from '@lib/utils'
import { ChannelGroup } from 'src/types/ChannelGroup'

interface SortableGroupItemProps {
    group: ChannelGroup
    onEdit: () => void
    onDelete: () => void
    isEditing: boolean
    onUpdate: (group: ChannelGroup) => void
    onCancelEdit: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    disableMoveUp: boolean
    disableMoveDown: boolean
}

export const SortableGroupItem = ({
    group,
    onEdit,
    onDelete,
    isEditing,
    onUpdate,
    onCancelEdit,
    onMoveUp,
    onMoveDown,
    disableMoveUp,
    disableMoveDown
}: SortableGroupItemProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: group.id,
        data: { type: 'channel-group', groupId: group.id }
    })

    if (isEditing) {
        return (
            <div className="border rounded-lg p-4 bg-muted/50">
                <ChannelGroupForm
                    initialName={group.name}
                    onSubmit={(name) => onUpdate({ ...group, name })}
                    onCancel={onCancelEdit}
                />
            </div>
        )
    }

    return (
        <div
            className={cn(
                "rounded-md border bg-card p-4 transition-colors"
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 flex-1">
                    <span className="font-medium text-sm tracking-tight">{group.name}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onEdit}
                        aria-label="Edit group name"
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onMoveUp}
                        disabled={disableMoveUp}
                        aria-label="Move group up"
                    >
                        <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onMoveDown}
                        disabled={disableMoveDown}
                        aria-label="Move group down"
                    >
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="mt-3">
                <SortableContext items={group.channels.map(c => c.name)} strategy={verticalListSortingStrategy}>
                    <div
                        ref={setNodeRef}
                        className={cn(
                            "rounded-md transition-colors",
                            group.channels.length === 0 ? "border-dashed border bg-muted/80 py-2" : "space-y-2",
                            isOver && "border-primary/80 bg-muted/50"
                        )}
                    >
                        {group.channels.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center px-2">
                                Drag channels here to populate this group.
                            </p>
                        ) : (
                            group.channels.map((channel) => (
                                <SortableChannelItem
                                    key={channel.name}
                                    channel={channel}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    )
}
