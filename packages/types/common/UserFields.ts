import { RavenUser } from "../Raven/RavenUser";

export type UserFields = Pick<RavenUser, 'name' | 'full_name' | 'user_image' | 'first_name' | 'enabled' | 'type' | 'availability_status' | 'custom_status'>