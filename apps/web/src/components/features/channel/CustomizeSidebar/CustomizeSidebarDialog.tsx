import { useState, useMemo } from 'react'
import { Button } from '@components/ui/button'
import {
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog'
import { ScrollArea } from '@components/ui/scroll-area'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCorners, useDroppable, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { SortableGroupItem } from './SortableGroupItem'
import { SortableChannelItem } from './SortableChannelItem'
import { ChannelGroupForm } from './ChannelGroupForm'
import { SidebarPreview } from './SidebarPreview'
import { Plus, GripVertical } from 'lucide-react'
import { ChannelGroup, ChannelSidebarData } from 'src/types/ChannelGroup'
import { cn } from '@lib/utils'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'

interface CustomizeSidebarDialogProps {
    initialData: ChannelSidebarData
    onClose: () => void
    onSave?: (data: ChannelSidebarData) => void
}

export const CustomizeSidebarDialog = ({
    initialData,
    onClose,
    onSave
}: CustomizeSidebarDialogProps) => {
    const [data, setData] = useState<ChannelSidebarData>(initialData)
    const [editingGroup, setEditingGroup] = useState<ChannelGroup | null>(null)
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)
    const [activeChannel, setActiveChannel] = useState<ChannelListItem | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    // Flatten all channels for drag and drop
    const allChannels = useMemo(() => {
        const channels: Array<{ channel: ChannelListItem; groupId: string | null }> = []
        data.groups.forEach(group => {
            group.channels.forEach(channel => {
                channels.push({ channel, groupId: group.id })
            })
        })
        data.ungroupedChannels.forEach(channel => {
            channels.push({ channel, groupId: null })
        })
        return channels
    }, [data])

    const handleDragStart = (event: DragStartEvent) => {
        const channel = allChannels.find(c => c.channel.name === event.active.id)
        if (channel) {
            setActiveChannel(channel.channel)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveChannel(null)

        if (!over) return

        const activeGroup = data.groups.find(g => g.id === active.id)
        const overGroup = data.groups.find(g => g.id === over.id)

        // Reorder groups
        if (activeGroup && overGroup && active.id !== over.id) {
            const oldIndex = data.groups.findIndex(g => g.id === active.id)
            const newIndex = data.groups.findIndex(g => g.id === over.id)
            const newGroups = arrayMove(data.groups, oldIndex, newIndex)
            // Update order property
            const updatedGroups = newGroups.map((group, index) => ({
                ...group,
                order: index
            }))
            setData({ ...data, groups: updatedGroups })
            return
        }

        // Handle channel drag
        const activeChannelData = allChannels.find(c => c.channel.name === active.id)
        if (!activeChannelData) return

        // Dropping on a group
        if (overGroup) {
            const sourceGroupId = activeChannelData.groupId
            const targetGroupId = overGroup.id

            if (sourceGroupId === targetGroupId) {
                // Reordering within the same group
                const group = data.groups.find(g => g.id === sourceGroupId)
                if (group) {
                    const oldIndex = group.channels.findIndex(c => c.name === active.id)
                    const overChannel = group.channels.find(c => c.name === over.id)
                    if (overChannel) {
                        const newIndex = group.channels.findIndex(c => c.name === over.id)
                        const newChannels = arrayMove(group.channels, oldIndex, newIndex)
                        setData({
                            ...data,
                            groups: data.groups.map(g =>
                                g.id === sourceGroupId ? { ...g, channels: newChannels } : g
                            )
                        })
                    }
                }
            } else {
                // Moving to a different group
                const sourceGroup = data.groups.find(g => g.id === sourceGroupId)
                const channel = activeChannelData.channel

                if (sourceGroup) {
                    // Remove from source group
                    const newGroups = data.groups.map(g => {
                        if (g.id === sourceGroupId) {
                            return {
                                ...g,
                                channels: g.channels.filter(c => c.name !== channel.name)
                            }
                        }
                        if (g.id === targetGroupId) {
                            return {
                                ...g,
                                channels: [...g.channels, channel]
                            }
                        }
                        return g
                    })
                    setData({ ...data, groups: newGroups })
                } else {
                    // Moving from ungrouped to a group
                    const newGroups = data.groups.map(g => {
                        if (g.id === targetGroupId) {
                            return {
                                ...g,
                                channels: [...g.channels, channel]
                            }
                        }
                        return g
                    })
                    setData({
                        ...data,
                        groups: newGroups,
                        ungroupedChannels: data.ungroupedChannels.filter(c => c.name !== channel.name)
                    })
                }
            }
            return
        }

        // Dropping on ungrouped area or another channel
        const overChannel = allChannels.find(c => c.channel.name === over.id)
        if (overChannel) {
            const sourceGroupId = activeChannelData.groupId
            const targetGroupId = overChannel.groupId

            if (sourceGroupId === targetGroupId) {
                // Same group - reorder
                if (sourceGroupId) {
                    const group = data.groups.find(g => g.id === sourceGroupId)
                    if (group) {
                        const oldIndex = group.channels.findIndex(c => c.name === active.id)
                        const newIndex = group.channels.findIndex(c => c.name === over.id)
                        const newChannels = arrayMove(group.channels, oldIndex, newIndex)
                        setData({
                            ...data,
                            groups: data.groups.map(g =>
                                g.id === sourceGroupId ? { ...g, channels: newChannels } : g
                            )
                        })
                    }
                } else {
                    // Reordering ungrouped channels
                    const oldIndex = data.ungroupedChannels.findIndex(c => c.name === active.id)
                    const newIndex = data.ungroupedChannels.findIndex(c => c.name === over.id)
                    const newUngrouped = arrayMove(data.ungroupedChannels, oldIndex, newIndex)
                    setData({ ...data, ungroupedChannels: newUngrouped })
                }
            } else {
                // Moving between groups or to/from ungrouped
                const channel = activeChannelData.channel

                if (sourceGroupId && targetGroupId) {
                    // Between groups
                    const newGroups = data.groups.map(g => {
                        if (g.id === sourceGroupId) {
                            return {
                                ...g,
                                channels: g.channels.filter(c => c.name !== channel.name)
                            }
                        }
                        if (g.id === targetGroupId) {
                            const targetIndex = g.channels.findIndex(c => c.name === over.id)
                            const newChannels = [...g.channels]
                            newChannels.splice(targetIndex, 0, channel)
                            return { ...g, channels: newChannels }
                        }
                        return g
                    })
                    setData({ ...data, groups: newGroups })
                } else if (sourceGroupId && !targetGroupId) {
                    // From group to ungrouped
                    const targetIndex = data.ungroupedChannels.findIndex(c => c.name === over.id)
                    const newUngrouped = [...data.ungroupedChannels]
                    newUngrouped.splice(targetIndex, 0, channel)
                    setData({
                        ...data,
                        groups: data.groups.map(g =>
                            g.id === sourceGroupId
                                ? { ...g, channels: g.channels.filter(c => c.name !== channel.name) }
                                : g
                        ),
                        ungroupedChannels: newUngrouped
                    })
                } else if (!sourceGroupId && targetGroupId) {
                    // From ungrouped to group
                    const targetGroup = data.groups.find(g => g.id === targetGroupId)
                    if (targetGroup) {
                        const targetIndex = targetGroup.channels.findIndex(c => c.name === over.id)
                        const newChannels = [...targetGroup.channels]
                        newChannels.splice(targetIndex, 0, channel)
                        setData({
                            ...data,
                            groups: data.groups.map(g =>
                                g.id === targetGroupId ? { ...g, channels: newChannels } : g
                            ),
                            ungroupedChannels: data.ungroupedChannels.filter(c => c.name !== channel.name)
                        })
                    }
                }
            }
        } else if (!overChannel && !overGroup) {
            // Dropping on empty space - move to ungrouped if from a group
            const sourceGroupId = activeChannelData.groupId
            if (sourceGroupId) {
                const channel = activeChannelData.channel
                setData({
                    ...data,
                    groups: data.groups.map(g =>
                        g.id === sourceGroupId
                            ? { ...g, channels: g.channels.filter(c => c.name !== channel.name) }
                            : g
                    ),
                    ungroupedChannels: [...data.ungroupedChannels, channel]
                })
            }
        }
    }

    const handleCreateGroup = (name: string) => {
        const newGroup: ChannelGroup = {
            id: `group-${Date.now()}`,
            name,
            channels: [],
            order: 0,
            isCollapsed: false
        }
        // Add new group at the beginning and update all orders
        const updatedGroups = [newGroup, ...data.groups].map((group, index) => ({
            ...group,
            order: index
        }))
        setData({
            ...data,
            groups: updatedGroups
        })
        setIsCreatingGroup(false)
    }

    const handleUpdateGroup = (updatedGroup: ChannelGroup) => {
        setData({
            ...data,
            groups: data.groups.map(g => g.id === updatedGroup.id ? updatedGroup : g)
        })
        setEditingGroup(null)
    }

    const handleDeleteGroup = (groupId: string) => {
        const group = data.groups.find(g => g.id === groupId)
        if (group) {
            setData({
                ...data,
                groups: data.groups.filter(g => g.id !== groupId),
                ungroupedChannels: [...data.ungroupedChannels, ...group.channels]
            })
        }
    }

    const handleSave = () => {
        if (onSave) {
            onSave(data)
        }
        onClose()
    }

    const handleMoveGroupUp = (groupId: string) => {
        const index = data.groups.findIndex(g => g.id === groupId)
        if (index > 0) {
            const newGroups = arrayMove(data.groups, index, index - 1)
            const updatedGroups = newGroups.map((group, i) => ({
                ...group,
                order: i
            }))
            setData({ ...data, groups: updatedGroups })
        }
    }

    const handleMoveGroupDown = (groupId: string) => {
        const index = data.groups.findIndex(g => g.id === groupId)
        if (index < data.groups.length - 1) {
            const newGroups = arrayMove(data.groups, index, index + 1)
            const updatedGroups = newGroups.map((group, i) => ({
                ...group,
                order: i
            }))
            setData({ ...data, groups: updatedGroups })
        }
    }

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                <DialogHeader>
                    <DialogTitle className="text-xl">Customize Sidebar</DialogTitle>
                </DialogHeader>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left Column - Customization */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r overflow-hidden bg-background">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={() => setActiveChannel(null)}
                    >
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                {/* Create Group Button */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Channel Groups</h3>
                                    {!isCreatingGroup && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsCreatingGroup(true)}
                                            className="h-8"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Group
                                        </Button>
                                    )}
                                </div>

                                {/* Create Group Form */}
                                {isCreatingGroup && (
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                        <ChannelGroupForm
                                            onSubmit={handleCreateGroup}
                                            onCancel={() => setIsCreatingGroup(false)}
                                        />
                                    </div>
                                )}

                                {/* Groups */}
                                <div className="space-y-3">
                                    {data.groups.map((group, index) => (
                                        <SortableGroupItem
                                            key={group.id}
                                            group={group}
                                            onEdit={() => setEditingGroup(group)}
                                            onDelete={() => handleDeleteGroup(group.id)}
                                            isEditing={editingGroup?.id === group.id}
                                            onUpdate={handleUpdateGroup}
                                            onCancelEdit={() => setEditingGroup(null)}
                                            onMoveUp={() => handleMoveGroupUp(group.id)}
                                            onMoveDown={() => handleMoveGroupDown(group.id)}
                                            disableMoveUp={index === 0}
                                            disableMoveDown={index === data.groups.length - 1}
                                        />
                                    ))}
                                </div>

                                {/* Ungrouped Channels */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-normal text-muted-foreground">Ungrouped Channels</h3>
                                    <SortableContext items={data.ungroupedChannels.map(c => c.name)} strategy={verticalListSortingStrategy}>
                                        <UngroupedChannelsDropzone channels={data.ungroupedChannels} />
                                    </SortableContext>
                                </div>
                            </div>
                        </ScrollArea>

                        <DragOverlay dropAnimation={null}>
                            {activeChannel ? (
                                <DraggableChannelPreview channel={activeChannel} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                {/* Right Column - Preview */}
                <div className="flex-none w-64 flex flex-col min-h-0 bg-sidebar/40 border-l overflow-hidden">
                    <div className="px-4 py-3 border-b flex-shrink-0">
                        <h3 className="text-sm font-semibold">Preview</h3>
                    </div>
                    <ScrollArea className="h-full">
                        <SidebarPreview data={data} />
                    </ScrollArea>
                </div>
            </div>
            <div className="border-t p-4 flex items-center justify-end gap-3 flex-shrink-0">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    )
}

interface UngroupedChannelsDropzoneProps {
    channels: ChannelListItem[]
}

const UngroupedChannelsDropzone = ({ channels }: UngroupedChannelsDropzoneProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'ungrouped',
        data: { type: 'ungrouped' }
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "rounded-md border bg-muted/30 p-3 min-h-[72px] transition-colors",
                isOver && "border-primary/40 bg-muted/50"
            )}
        >
            {channels.length === 0 ? (
                <p className="text-xs text-muted-foreground/70 text-center py-4">
                    Drag channels here to leave them ungrouped.
                </p>
            ) : (
                <div className="space-y-2">
                    {channels.map((channel) => (
                        <SortableChannelItem
                            key={channel.name}
                            channel={channel}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface DraggableChannelPreviewProps {
    channel: ChannelListItem
}

const DraggableChannelPreview = ({ channel }: DraggableChannelPreviewProps) => {
    return (
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm cursor-grabbing">
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
