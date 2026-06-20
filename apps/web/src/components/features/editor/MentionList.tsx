import type { UserData } from "@db"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { cn } from "@lib/utils"

export interface MentionListProps {
    items: UserData[]
    /** Index of the highlighted row (driven by the suggestion closure). */
    selectedIndex: number
    /** Choose the row at `index` (keyboard Enter or click). */
    onSelect: (index: number) => void
    /** Highlight the row at `index` on hover. */
    onHover: (index: number) => void
}

/**
 * The @-mention dropdown — purely presentational. All selection state and keyboard
 * handling live in the suggestion closure (userMention.ts); this just renders the
 * list and reports clicks/hovers. Styling mirrors the dropdown-menu component.
 * Positioned above the composer by the suggestion (no positioning library).
 */
export const MentionList = ({ items, selectedIndex, onSelect, onHover }: MentionListProps) => {
    if (items.length === 0) return null

    return (
        <div
            className="flex max-h-64 min-w-56 flex-col overflow-y-auto rounded-lg bg-surface-elevation-2 p-1 shadow-2xl ring-1 ring-black/5"
            // Keep focus in the editor when clicking a row — otherwise mousedown blurs
            // the editor, the suggestion exits, and the click never lands.
            onMouseDown={(e) => e.preventDefault()}
        >
            {items.map((user, index) => (
                <button
                    key={user.name}
                    type="button"
                    className={cn(
                        "flex select-none items-center gap-2 rounded px-2 py-1.5 text-left text-base text-ink-gray-7",
                        index === selectedIndex ? "bg-surface-gray-3" : "hover:bg-surface-gray-2",
                    )}
                    onMouseEnter={() => onHover(index)}
                    onClick={() => onSelect(index)}
                >
                    <UserAvatar user={user} size="xs" showStatusIndicator={false} />
                    <span className="truncate">{user.full_name || user.name}</span>
                </button>
            ))}
        </div>
    )
}
