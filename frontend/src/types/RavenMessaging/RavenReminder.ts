
export interface RavenReminder{
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
	/**	Is Complete : Check	*/
	is_complete?: 0 | 1
	/**	Message ID : Link - Raven Message	*/
	message_id?: string
	/**	User ID : Link - Raven User	*/
	user_id: string
	/**	Remind At : Datetime	*/
	remind_at: string
	/**	Description : Data	*/
	description?: string
	/**	Completed At : Datetime	*/
	completed_at?: string
}