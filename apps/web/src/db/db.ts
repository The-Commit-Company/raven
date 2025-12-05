import { RavenUser } from "@raven/types/Raven/RavenUser"
import { Dexie, type EntityTable } from "dexie"

export type UserData = Pick<RavenUser, 'name' | 'full_name' | 'user_image' | 'first_name' | 'enabled' | 'type' | 'availability_status' | 'custom_status'>

const db = new Dexie("RavenDB") as Dexie & {
    users: EntityTable<
        UserData,
        "name" // primary key "name"
    >
}

// Schema declaration:
db.version(1).stores({
    users: "name, enabled"
})

export { db }