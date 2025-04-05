
export interface RavenChannelMember{
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
	/**	User : Link - Raven User	*/
	user_id: string
	/**	Is Admin : Check	*/
	is_admin?: 0 | 1
	/**	Last Visit : Datetime	*/
	last_visit: string
	/**	Is Synced : Check	*/
	is_synced?: 0 | 1
	/**	Linked DocType : Link - DocType	*/
	linked_doctype?: string
	/**	Linked Document : Dynamic Link	*/
	linked_document?: string
	/**	Allow notifications : Check	*/
	allow_notifications?: 0 | 1
}