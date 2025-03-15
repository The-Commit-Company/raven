import { RavenLiveKitRoomParticipants } from './RavenLiveKitRoomParticipants'

export interface RavenLiveKitRoom{
	creation: string
	name: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Channel : Link - Raven Channel	*/
	channel_id: string
	/**	Workspace : Link - Raven Workspace	*/
	workspace?: string
	/**	Room Name : Data	*/
	room_name: string
	/**	Description : Small Text	*/
	description?: string
	/**	Invite Entire Channel : Check	*/
	invite_entire_channel?: 0 | 1
	/**	Participants : Table - Raven LiveKit Room Participants	*/
	participants?: RavenLiveKitRoomParticipants[]
}