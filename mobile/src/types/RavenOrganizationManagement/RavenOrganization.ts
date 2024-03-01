
export interface RavenOrganization{
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
	/**	Organization Name : Data	*/
	organization_name: string
	/**	Organization Icon : Image	*/
	organization_icon?: string
	/**	Type : Select	*/
	type: "Public" | "Private"
}