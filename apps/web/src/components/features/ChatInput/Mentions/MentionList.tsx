/**
 * MentionList.tsx - Suggestion dropdown for @mentions and #channels
 *
 * Handles keyboard navigation (up/down/enter/escape) and mouse selection.
 * Used by both UserMention and ChannelMention suggestions.
 */

import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react'
import { cn } from '@lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'

export interface MentionItem {
    id: string
    label: string
    image?: string
    secondaryLabel?: string
}

interface MentionListProps {
    items: MentionItem[]
    command: (item: { id: string; label: string }) => void
}

export interface MentionListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = items[index]
        if (item) {
            command({ id: item.id, label: item.label })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    if (!items.length) {
        return (
            <div className="p-2 text-sm text-muted-foreground bg-popover border border-border rounded-lg shadow-lg">
                No result
            </div>
        )
    }

    return (
        <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {items.map((item, index) => (
                <MentionItem
                    key={item.id}
                    item={item}
                    index={index}
                    selectItem={selectItem}
                    selectedIndex={selectedIndex}
                    itemsLength={items.length}
                />
            ))}
        </div>
    )
})

MentionList.displayName = 'MentionList'

interface MentionItemProps {
    item: MentionItem
    index: number
    selectItem: (index: number) => void
    selectedIndex: number
    itemsLength: number
}

const MentionItem = ({ item, index, selectItem, selectedIndex, itemsLength }: MentionItemProps) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (index === selectedIndex) {
            ref.current?.scrollIntoView({ block: 'nearest' })
        }
    }, [selectedIndex, index])

    return (
        <div
            ref={ref}
            role="button"
            onClick={() => selectItem(index)}
            className={cn(
                'flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm',
                index === itemsLength - 1 ? 'rounded-b-md' : 'rounded-b-none',
                index === 0 ? 'rounded-t-md' : 'rounded-t-none',
                index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
            )}
        >
            {item.image ? (
                <Avatar className="size-6">
                    <AvatarImage src={item.image} alt={item.label} />
                    <AvatarFallback>{item.label.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            ) : (
                <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {item.label.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                {item.secondaryLabel && (
                    <div className="text-xs text-muted-foreground truncate">{item.secondaryLabel}</div>
                )}
            </div>
        </div>
    )
}

export default MentionList
