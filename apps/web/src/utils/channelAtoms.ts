import { atom } from "jotai";
import { atomFamily } from 'jotai-family'
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll";
import type { Message } from "@raven/types/common/Message";
import type { UserData } from "@db";

export type DrawerType = '' | 'members' | 'files' | 'pins' | 'links' | 'threads' | 'settings'

export const channelDrawerAtom = atomFamily((_channelID: string) => atom<DrawerType>(''))

export type PollDrawerData = {
    user: UserData
    poll: RavenPoll
    currentUserVotes: Array<{ option: string }>
} | null

export const pollDrawerAtom = atomFamily((_channelID: string) => atom<PollDrawerData>(null))

/**
 * Message id the chat stream should navigate to (reply click, ?message_id deep
 * link, pinned/search results later). The stream consumes it: scrolls directly
 * when the message is in the loaded window, fetches around it otherwise, then
 * highlights it and resets this to null.
 */
export const messageTargetAtom = atomFamily((_channelID: string) => atom<string | null>(null))

/**
 * The message the action menu (desktop context menu / mobile bottom sheet) is
 * acting on. Non-null while the menu is open — the stream highlights it so the
 * user knows which message the actions apply to. Global: one menu app-wide.
 */
export const messageActionTargetAtom = atom<Message | null>(null)

/**
 * The message the composer is replying to, per channel. Set by the Reply action;
 * the composer shows a preview banner and sends it as `linked_message`, then clears
 * this on send or cancel. Per-channel so a reply drafted in one channel doesn't leak
 * into another.
 */
export const replyToMessageAtom = atomFamily((_channelID: string) => atom<Message | null>(null))

/**
 * The message currently being edited inline, per channel (its id, or null). The
 * message body renderer swaps `RichTextRenderer` for an inline editor when its id
 * matches. Per-channel so an edit in one channel doesn't bleed into another. For a
 * batch this targets the caption-bearing member (the only editable text).
 */
export const editingMessageAtom = atomFamily((_channelID: string) => atom<string | null>(null))

export type MessageDialogType = "delete" | "forward" | "reactions"

/**
 * The currently open message dialog. Separate from the menu target because
 * dialogs outlive the menu (menu closes, dialog stays) and can also be opened
 * from the future hover toolbar or keyboard shortcuts.
 */
export const messageDialogAtom = atom<{ type: MessageDialogType; message: Message } | null>(null)