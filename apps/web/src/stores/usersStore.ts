import { liveQuery } from "dexie"
import { db, type UserData } from "@db"

type Listener = () => void

/**
 * Singleton users lookup — the channelMessagesStore pattern at miniature
 * scale: ONE Dexie observable maintains ONE immutable Map snapshot shared by
 * reference across every consumer (via useSyncExternalStore). Previously each
 * consumer ran its own liveQuery, so every write to the users table triggered
 * a full-table IndexedDB read per mounted consumer.
 *
 * The subscription starts on first use and lives for the app's lifetime:
 * users are core data needed by whatever screen is mounted, and tearing down
 * on zero subscribers would just re-read the table on every route transition.
 */
class UsersStore {
    private snapshot: Map<string, UserData> = new Map()
    private listeners = new Set<Listener>()
    private started = false

    private start() {
        if (this.started) return
        this.started = true
        liveQuery(() => db.users.toArray()).subscribe({
            next: (users) => {
                const next = new Map<string, UserData>()
                for (const user of users) next.set(user.name, user)
                this.snapshot = next
                this.listeners.forEach((listener) => listener())
            },
            error: (error) => console.error("users liveQuery failed", error),
        })
    }

    subscribe = (listener: Listener) => {
        this.start()
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener)
        }
    }

    /** Stable reference between table writes — required by useSyncExternalStore. */
    getSnapshot = () => this.snapshot
}

export const usersStore = new UsersStore()
