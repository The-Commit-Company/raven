
export interface RavenSlackImportUsers{
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
	/**	Slack User ID : Data	*/
	slack_user_id: string
	/**	Slack Name : Data	*/
	slack_name?: string
	/**	Slack Real Name : Data	*/
	slack_real_name?: string
	/**	Import Type : Select	*/
	import_type: "Map to Existing User" | "Create New User"
	/**	Raven User : Link - Raven User	*/
	raven_user?: string
	/**	First Name : Data	*/
	first_name?: string
	/**	Last Name : Data	*/
	last_name?: string
	/**	Email : Data	*/
	email?: string
	/**	Is Bot : Check	*/
	is_bot?: 0 | 1
}