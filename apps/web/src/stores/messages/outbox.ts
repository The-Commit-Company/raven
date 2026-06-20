import { db, type OutboxMessage } from "@db"

/**
 * Saves/loads the outbox in the browser database (Dexie/IndexedDB). The outbox is the
 * list of sends the server hasn't confirmed yet — kept on disk so they survive a page
 * refresh and can be re-sent. The on-screen message list is what's actually shown;
 * this is just the saved copy. Saving is best-effort: if a write fails we only log it
 * (a storage hiccup must never break sending), so callers don't wait on these.
 */

/**
 * The ids of sends we're in the middle of deleting from the outbox. Deleting runs in
 * the background, so there's a brief gap between a send being confirmed and its record
 * actually leaving storage. During that gap the live outbox query could still see the
 * old record and try to put the message back on screen (or retry it). This list lets
 * those steps skip a record that's on its way out.
 */
const settling = new Set<string>()

/** True while a record is being deleted — don't put it back on screen or retry it. */
export const isSettling = (clientID: string) => settling.has(clientID)

/** Save (or overwrite) one outbox record. Called when a message is first sent. */
export const putOutbox = (record: OutboxMessage) =>
    db.outbox.put(record).catch((error) => console.error("outbox put failed", error))

/** Remove a record once the server confirms its send (or the user discards it). */
export const removeOutbox = (clientID: string) => {
    settling.add(clientID)
    return db.outbox
        .delete(clientID)
        .catch((error) => console.error("outbox delete failed", error))
        .finally(() => settling.delete(clientID))
}

/** Change a record's status (between "sending" and "failed") as its send plays out. */
export const setOutboxStatus = (clientID: string, status: OutboxMessage["status"]) =>
    db.outbox.update(clientID, { status }).catch((error) => console.error("outbox update failed", error))

/** Every saved send, oldest first — used to restore them on app start and retry in order. */
export const getAllOutbox = (): Promise<OutboxMessage[]> =>
    db.outbox.orderBy("queued_at").toArray().catch((error) => {
        console.error("outbox read failed", error)
        return []
    })
