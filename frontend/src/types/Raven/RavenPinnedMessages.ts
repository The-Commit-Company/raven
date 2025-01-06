
export interface RavenPinnedMessages{
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
}