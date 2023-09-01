
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
	/**	User : Link - User	*/
	user_id: string
	/**	Is Admin : Check	*/
	is_admin?: 0 | 1
	/**	Last Visit : Datetime	*/
	last_visit: string
}