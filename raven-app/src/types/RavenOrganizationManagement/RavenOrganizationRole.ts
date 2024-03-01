
export interface RavenOrganizationRole{
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
	/**	Role Name : Data	*/
	role_name: string
	/**	Manage Channels : Check	*/
	manage_channels?: 0 | 1
	/**	Manage Chat : Check	*/
	manage_chat?: 0 | 1
}