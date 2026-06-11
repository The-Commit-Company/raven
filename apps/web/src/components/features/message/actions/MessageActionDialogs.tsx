import { useAtom } from "jotai"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { messageDialogAtom } from "@utils/channelAtoms"
import _ from "@lib/translate"

/**
 * Single instances of every message dialog, mounted once per stream and driven
 * by `messageDialogAtom` — so menu items, the future hover toolbar, and
 * keyboard shortcuts all open the same dialogs without per-message mounting.
 *
 * Bodies are placeholders; the real implementations land with layer 4/5
 * (edit needs the composer, delete/pin/save follow the optimistic contract
 * described in useMessageActions).
 */
export const MessageActionDialogs = () => {
    const [dialog, setDialog] = useAtom(messageDialogAtom)

    const close = () => setDialog(null)

    return (
        <>
            <AlertDialog open={dialog?.type === "delete"} onOpenChange={(open) => !open && close()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{_("Delete message?")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {_("This message will be removed for everyone in the conversation. This cannot be undone.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{_("Cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                // TODO(layer 5): optimistic delete — store.messageDeleted() + API + resync on failure
                                toast.info(`${_("Delete")} — ${_("coming soon")}`)
                                close()
                            }}
                        >
                            {_("Delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
