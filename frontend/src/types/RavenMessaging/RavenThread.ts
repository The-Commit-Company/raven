import { RavenThreadParticipant } from './RavenThreadParticipant'

export interface RavenThread{
	name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Message ID : Link - Raven Message	*/
	message_id: string
	/**	Channel ID : Link - Raven Channel	*/
	channel_id: string
	/**	Participants : Table - Raven Thread Participant	*/
	participants?: RavenThreadParticipant[]
}