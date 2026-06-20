import { RavenUser } from "@raven/types/Raven/RavenUser"
import { Dexie, type EntityTable } from "dexie"

export type UserData = Pick<RavenUser, 'name' | 'full_name' | 'user_image' | 'first_name' | 'enabled' | 'type' | 'availability_status' | 'custom_status' | 'contact_number'>

/** An already-uploaded attachment going out with a send (its stable URL + size). */
export interface OutboxFile {
    file_url: string
    file_size: number
}

/**
 * A send that hasn't been acknowledged yet — the durable outbox.
 *
 * Persisted so pending/failed sends survive a refresh (and can auto-retry on
 * reconnect). Keyed by `client_id`, which is also the message_batch_id, so the
 * server can dedupe a retried send and the client can match the realtime echo.
 */
export interface OutboxMessage {
    /** Primary key — the client-generated batch id (= message_batch_id). */
    client_id: string
    channel_id: string
    owner: string
    /** Message HTML (empty when the send is files-only). */
    content: string
    files: OutboxFile[]
    /** Backend-shaped creation timestamp of the optimistic placeholders (live-edge sort). */
    creation: string
    /** sending = in flight / in doubt; failed = the last attempt errored. */
    status: 'sending' | 'failed'
    /** When the send was first queued (ms) — orders the outbox for retry. */
    queued_at: number
}

const db = new Dexie("RavenDB") as Dexie & {
    users: EntityTable<
        UserData,
        "name" // primary key "name"
    >
    outbox: EntityTable<
        OutboxMessage,
        "client_id" // primary key "client_id"
    >
}

// Schema declaration:
db.version(1).stores({
    users: "name, enabled"
})

// v2: durable outbox for un-acked sends (Layer 4). Indexed by channel for
// per-channel rehydration, and by queued_at for stable retry ordering.
db.version(2).stores({
    outbox: "client_id, channel_id, queued_at"
})

export { db }