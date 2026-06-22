import { X, MoreVertical, LogOut, Trash2 } from "lucide-react"
import { Button } from "@components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import _ from "@lib/translate"

export interface ThreadHeaderProps {
    /** Close the thread (route back to the parent channel). */
    onClose: () => void
    /** Leave the thread. */
    onLeave: () => void
    /** Open the delete confirmation (owned by ThreadDrawer, so its Esc can gate on it). */
    onRequestDelete: () => void
    /** Leave request in flight. */
    leaving?: boolean
    /** You're a participant — only members can leave. */
    canLeave: boolean
    /** You're a thread admin — only admins can delete. */
    canDelete: boolean
}

/** The thread drawer's title bar: name, the actions menu (leave / delete), and close. */
export const ThreadHeader = ({ onClose, onLeave, onRequestDelete, leaving, canLeave, canDelete }: ThreadHeaderProps) => (
    <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <h2 className="text-sm font-medium">{_("Thread")}</h2>
        <div className="flex items-center gap-2">
            {/* Only show the menu if there's an action you're allowed to take. */}
            {(canLeave || canDelete) && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" isIconButton aria-label={_("Thread settings")}>
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {canLeave && (
                            <DropdownMenuItem onClick={onLeave} disabled={leaving}>
                                <LogOut />
                                {_("Leave thread")}
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <DropdownMenuItem variant="destructive" onSelect={onRequestDelete}>
                                <Trash2 />
                                {_("Delete thread")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            <Button variant="ghost" size="sm" isIconButton onClick={onClose} aria-label={_("Close thread")}>
                <X />
            </Button>
        </div>
    </div>
)
