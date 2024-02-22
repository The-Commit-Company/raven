
export interface RavenSettings{
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
	/**	Automatically add system users to Raven : Check	*/
	auto_add_system_users?: 0 | 1
	/**	Show Raven on Desk : Check	*/
	show_raven_on_desk?: 0 | 1
}