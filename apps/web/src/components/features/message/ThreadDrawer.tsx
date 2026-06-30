import { useRef, useState } from "react"
import { useFrappePostCall, useFrappeDeleteDoc } from "frappe-react-sdk"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { useAtom } from "jotai"
import { toast } from "sonner"
import { Button } from "@components/ui/button"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@components/ui/alert-dialog"
import ChatInput from "@components/features/ChatInput/ChatInput"
import { FileDropZone } from "@components/features/ChatInput/FileDropZone"
import { useComposerGate, ComposerArea } from "@components/features/ChatInput/composerGate"
import ChatStream from "@components/features/message/ChatStream"
import { ThreadHeader } from "./ThreadHeader"
import { ThreadRootMessage } from "./ThreadRootMessage"
import { PollDrawer } from "./renderers/PollDrawer"
import { useChannelById } from "@stores/channels/useChannelList"
import { useChannelMembers } from "@hooks/useChannelMembers"
import { useUserCookieData } from "@hooks/useUserCookieData"
import { focusComposer } from "@components/features/ChatInput/composerFocus"
import { unreadThreadsStore } from "@stores/threads/unreadStore"
import { threadListStore } from "@stores/threads/listStore"
import { pollDrawerAtom } from "@utils/channelAtoms"
import { getErrorMessage } from "@lib/frappe"
import _ from "@lib/translate"

/** Rendered as a child route (`:id/thread/:threadID`) inside the chat view's drawer slot. */
export default function ThreadDrawer() {
    // A thread IS a channel (its id = the original message id), so the stream + composer target
    // the threadID. The parent channel (the route :id) is only used to inherit DM status for the
    // composer's mention banner, and to return focus on close.
    const { threadID } = useParams<{ threadID: string }>()
    // TODO: Move this to a container and pass this down as a prop to reuse ThreadDrawer in other places like notifications, threads etc.
    const { parentChannelID } = useOutletContext<{ parentChannelID: string }>()
    const parentIsDM = useChannelById(parentChannelID)?.is_direct_message === 1
    const threadInputRef = useRef<HTMLFormElement>(null)
    const navigate = useNavigate()

    // Gate the actions by your membership in the thread (already in the members store, seeded by
    // the pill / get_thread_details). Only members can leave; only thread admins can delete.
    const { name: currentUser } = useUserCookieData()
    const { members } = useChannelMembers(threadID ?? "")
    const me = members.find((m) => m.name === currentUser)
    const isMember = !!me
    const isAdmin = me?.is_admin === 1

    // Same composer gate as channels — a non-participant sees the not-member banner + Join.
    const composerGate = useComposerGate(threadID ?? "")

    // A poll inside the thread opens its detail drawer keyed by the THREAD's id — the thread
    // occupies the only rail slot, so we host the drawer here (overlaying the thread), mirroring
    // ChatContentView for the channel. Closing it returns to the thread.
    const [threadPoll, setThreadPoll] = useAtom(pollDrawerAtom(threadID ?? ""))

    const handleClose = () => {
        // Route-relative: from `:id/thread/:threadID` back to the parent `:id` route.
        navigate("..", { replace: true })
        // Return focus to the parent channel's composer (it stayed mounted). Same hook the
        // attach paths use — see composerFocus.
        focusComposer(parentChannelID)
    }

    // A thread IS a channel, so leave/delete reuse the channel APIs on the threadID; both close
    // the thread on success. Threads aren't in the channel_list SWR cache, so (unlike channel
    // leave/delete) there's nothing to patch there — we drop the thread from the unread-threads
    // badge (no more participant-scoped events) and from the threads-list windows so it doesn't
    // linger in the list. (On leave it may reappear under "Other" on that tab's next refetch.)
    const { call: leaveThread, loading: leaving } = useFrappePostCall("raven.api.raven_channel.leave_channel")
    const onLeaveThread = () => {
        if (!threadID) return
        leaveThread({ channel_id: threadID })
            .then(() => {
                unreadThreadsStore.remove(threadID)
                threadListStore.removeEverywhere(threadID)
                toast.success(_("You left the thread"))
                handleClose()
            })
            .catch((e) => toast.error(_("Could not leave the thread"), { description: getErrorMessage(e) }))
    }

    const { deleteDoc, loading: deleting } = useFrappeDeleteDoc()
    const [confirmDelete, setConfirmDelete] = useState(false)
    const onDeleteThread = () => {
        if (!threadID) return
        // Backend permission-gates this to the thread's owner/admins; non-owners get a toast.
        deleteDoc("Raven Channel", threadID)
            .then(() => {
                unreadThreadsStore.remove(threadID)
                threadListStore.removeEverywhere(threadID)
                toast.success(_("Thread deleted"))
                handleClose()
            })
            .catch((e) => toast.error(_("Could not delete the thread"), { description: getErrorMessage(e) }))
    }

    // Esc closes the thread's poll drawer first, then the thread. enableOnContentEditable because
    // the composer (ProseMirror) is a contentEditable, not a form tag. Disabled while the
    // delete-confirm dialog is open — it owns Esc (Radix), so one press doesn't close both.
    useHotkeys(
        "esc",
        () => {
            if (threadPoll) setThreadPoll(null)
            else handleClose()
        },
        { enableOnFormTags: true, enableOnContentEditable: true, enabled: !confirmDelete },
    )

    // A poll in this thread takes over the rail (its detail drawer overlays the thread).
    if (threadPoll) {
        return (
            <div className="flex flex-col h-full">
                <PollDrawer
                    user={threadPoll.user}
                    poll={threadPoll.poll}
                    currentUserVotes={threadPoll.currentUserVotes}
                    onClose={() => setThreadPoll(null)}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Whole-thread drop target (mirrors the channel pane); disabled when you can't post,
                so a drop can't stage files there's no composer to send them from. */}
            <FileDropZone channelID={threadID ?? ""} disabled={composerGate.state !== "composer"}>
                <ThreadHeader
                    onClose={handleClose}
                    onLeave={onLeaveThread}
                    onRequestDelete={() => setConfirmDelete(true)}
                    leaving={leaving}
                    canLeave={isMember}
                    canDelete={isAdmin}
                />

                {/* Root message — what this thread is about (collapsed preview above the replies).
                    Keyed by thread so its expand state resets when you switch threads. */}
                <ThreadRootMessage key={threadID} threadID={threadID ?? ""} parentID={parentChannelID} />

                {/* Thread messages — ChatStream owns its own scroll/virtualization */}
                {threadID && <ChatStream channelID={threadID} />}

                {/* Message input — posts into the thread channel (or skeleton / not-member banner) */}
                <div className="shrink-0">
                    <ComposerArea gate={composerGate} isThread>
                        {threadID && <ChatInput channelID={threadID} ref={threadInputRef} isDirectMessage={parentIsDM} parentChannelID={parentChannelID} />}
                    </ComposerArea>
                </div>
            </FileDropZone>

            {/* Deleting a thread removes it and its replies for everyone — confirm first.
                Controlled (not a trigger) because the dropdown unmounts its items on close. */}
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{_("Delete this thread?")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {_("The thread and all its replies will be permanently deleted for everyone. This can't be undone.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>{_("Cancel")}</AlertDialogCancel>
                        <Button type="button" variant="solid" theme="red" size="md" loading={deleting} loadingText={_("Deleting…")} onClick={onDeleteThread}>
                            {_("Delete thread")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
