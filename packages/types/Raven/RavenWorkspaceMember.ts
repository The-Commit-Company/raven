
export interface RavenWorkspaceMember{
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
	/**	User : Link - Raven User	*/
	user: string
	/**	Is Admin : Check	*/
	is_admin?: 0 | 1
	/**	Workspace : Link - Raven Workspace	*/
	workspace: string
}