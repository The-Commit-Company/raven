import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import { RavenUser } from '@raven/types/Raven/RavenUser'

export interface ChannelCreationForm {
    channel_name: string
    channel_description: string
    type: RavenChannel['type']
    members?: RavenUser[]
}

export type CreateChannelStep = 1 | 2

