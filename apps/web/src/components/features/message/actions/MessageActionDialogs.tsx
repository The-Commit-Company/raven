import { useRef } from "react"
import { useAtom } from "jotai"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { messageDialogAtom } from "@utils/channelAtoms"
import { DeleteMessageDialog } from "./dialogs/DeleteMessageDialog"
import _ from "@lib/translate"
import type { Message } from "@raven/types/common/Message"

/**
 * Orchestrator for message dialogs: mounted once per stream, it reads
 * `messageDialogAtom` and mounts each dialog — so menu items, the hover toolbar,
 * and keyboard shortcuts all open the same instances without per-message mounting.
 *
 * Each real dialog lives in ./dialogs/<Name>.tsx (extracted as its layer lands).
 * Delete is done; edit / forward / reactions are still placeholders inline below.
 */
export const MessageActionDialogs = () => {
    const [dialog, setDialog] = useAtom(messageDialogAtom)
    const close = () => setDialog(null)

    // Render the delete dialog from the LAST delete target so its content stays put
    // through the close animation instead of flashing empty (same trick as the menu).
    const lastDeleteRef = useRef<Message | null>(null)
    if (dialog?.type === "delete") lastDeleteRef.current = dialog.message

    return (
        <>
            <DeleteMessageDialog
                open={dialog?.type === "delete"}
                message={dialog?.type === "delete" ? dialog.message : lastDeleteRef.current}
                onClose={close}
            />

            <Dialog open={dialog?.type === "edit"} onOpenChange={(open) => !open && close()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{_("Edit message")}</DialogTitle>
                        <DialogDescription>
                            {/* TODO(layer 4): mount the Tiptap composer seeded with the message content */}
                            {_("The message editor will appear here.")}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Dialog open={dialog?.type === "forward"} onOpenChange={(open) => !open && close()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{_("Forward message")}</DialogTitle>
                        <DialogDescription>
                            {/* TODO(layer 5): channel/user picker + forward_message API */}
                            {_("Choose where to forward this message.")}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Dialog open={dialog?.type === "reactions"} onOpenChange={(open) => !open && close()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{_("Reactions")}</DialogTitle>
                        <DialogDescription>
                            {/* TODO(layer 5): per-emoji reaction list with users */}
                            {_("Reaction details will appear here.")}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}
