import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, GripVertical, Plus, Trash2, X } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RavenUser } from "@raven/types/Raven/RavenUser";
import { Input } from "@components/ui/input";
import { RavenChannelGroups } from "@raven/types/RavenChannelManagement/RavenChannelGroups";
import { useBoolean } from "usehooks-ts";
import _ from "@lib/translate"

export const GroupDnd = () => {

    const { value: createGroup, toggle: toggleCreate } = useBoolean(false)

    const { control } = useFormContext<RavenUser>()

    const { fields: groups, update: updateGroup, append: appendGroup, remove: removeGroup } = useFieldArray<RavenUser, 'channel_groups'>({
        control,
        name: 'channel_groups'
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = groups.findIndex((group) => group.id === active.id)
            const newIndex = groups.findIndex((group) => group.id === over.id)

            // Reorder the array
            const reorderedGroups = arrayMove(groups, oldIndex, newIndex)

            // Update idx for each item based on new position
            reorderedGroups.forEach((group, index) => {
                updateGroup(index, {
                    ...group,
                    idx: index + 1  // Update the idx field
                })
            })
        }
    }

    const handleGroup = (name: string, index?: number) => {
        if (typeof index === 'number') {
            updateGroup(index, {
                ...groups[index],
                group_name: name
            })
        } else {
            appendGroup({
                group_name: name
            } as RavenChannelGroups)
            toggleCreate()
        }
    }

    return (
        <div className="mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{_("Order Groups")}</h3>
                <Button
                    type="button"
                    variant="outline"
                    onClick={toggleCreate}
                    className="h-8 text-xs"
                >
                    <Plus className="h-4 w-4" />
                    {_("Add Group")}
                </Button>
            </div>
            <div
                className={cn(
                    "rounded-lg border p-1 transition-colors"
                )}
            >
                {groups.length > 0 ? <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={groups.map((group) => group.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
                            {groups.map((group, index) => (
                                <SortableItem
                                    key={group.id}
                                    id={group.id}
                                    content={group.group_name}
                                    index={index}
                                    onEdit={handleGroup}
                                    onDelete={() => removeGroup(index)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext> : (!createGroup && <p className="text-sm text-muted-foreground text-center p-3 pt-3.5">
                    {_("You don't have any groups yet. Add a group to start sorting.")}
                </p>)}
                {createGroup &&
                    <div className={groups.length > 0 ? "mt-1" : ""}>
                        <EditGroup initialName="" onSubmit={handleGroup} onCancel={toggleCreate} />
                    </div>
                }
            </div>
        </div >
    )
}

interface SortableItemProps {
    id: string
    index: number
    content: string
    onEdit: (name: string, index?: number) => void
    onDelete: () => void
}

const SortableItem = ({ id, index, content, onEdit, onDelete }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const { value: editGroup, toggle: toggleEdit } = useBoolean(false)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    if (editGroup) {
        return (
            <EditGroup initialName={content} onSubmit={(name) => onEdit(name, index)} onCancel={toggleEdit} />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            // {...listeners}
            className={cn(
                "flex items-center gap-2 rounded-md border bg-card text-sm transition-colors",
                isDragging && "border-muted-foreground/50"
            )}
        >
            <div className="flex items-center justify-between flex-1 min-w-0">
                <div {...listeners} className="cursor-grab active:cursor-grabbing flex items-center gap-1 w-full h-full p-3">
                    <GripVertical className="h-4 w-4" />
                    <span className="truncate text-sm px-1">{content}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 px-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={toggleEdit}
                        aria-label="Edit group name"
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={onDelete}
                        aria-label="Delete group"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div >
    )
}

const EditGroup = ({ initialName = '', onCancel, onSubmit }: { initialName?: string, onCancel: () => void, onSubmit: (name: string) => void }) => {
    const [name, setName] = useState(initialName)
    return (
        <div className="border rounded-lg pr-2 pl-1 py-1 bg-muted/50 flex items-center justify-between w-full gap-2">
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={_("Group name")}
                autoFocus
                maxLength={50}
            />
            <Button onClick={() => onSubmit(name.trim())} size="sm" disabled={!name.trim()}>
                {initialName ? _("Save") : _("Create")}
            </Button>
            <Button
                onClick={onCancel}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}