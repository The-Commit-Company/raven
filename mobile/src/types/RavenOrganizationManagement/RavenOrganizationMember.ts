
export interface RavenOrganizationMember{
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
	/**	Organization : Link - Raven Organization	*/
	organization: string
	/**	User : Link - Raven User	*/
	user: string
	/**	Manage Channels : Check	*/
	manage_channels?: 0 | 1
	/**	Manage Chat : Check	*/
	manage_chat?: 0 | 1
	/**	Role : Link - Raven Organization Role	*/
	role?: string
}