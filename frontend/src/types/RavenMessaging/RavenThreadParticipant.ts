
export interface RavenThreadParticipant{
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
	/**	User : Link - Raven User	*/
	user: string
	/**	User Image : Attach	*/
	user_image?: string
	/**	Full Name : Data	*/
	full_name?: string
}