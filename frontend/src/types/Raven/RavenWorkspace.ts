
export interface RavenWorkspace{
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
	/**	Workspace Name : Data	*/
	workspace_name: string
	/**	Type : Select	*/
	type: "Public" | "Private"
	/**	Can only join via invite? : Check	*/
	can_only_join_via_invite?: 0 | 1
	/**	Description : Small Text	*/
	description?: string
	/**	Logo : Attach Image	*/
	logo?: string
}