
export interface RavenAIFunction{
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
	/**	Function Name : Data	*/
	function_name: string
	/**	Function Path : Small Text	*/
	function_path?: string
	/**	Description : Small Text	*/
	description: string
	/**	Type : Select	*/
	type: "Get Document" | "Get Multiple Documents" | "Get List" | "Create Document" | "Create Multiple Documents" | "Update Document" | "Update Multiple Documents" | "Delete Document" | "Delete Multiple Documents" | "Custom Function" | "Send Message" | "Attach File to Document" | "Get Report Result"
	/**	Pass parameters as JSON : Check - If checked, the params will be passed as a JSON object instead of named parameters	*/
	pass_parameters_as_json?: 0 | 1
	/**	Requires Write Permissions : Check	*/
	requires_write_permissions?: 0 | 1
	/**	Params : JSON	*/
	params?: any
	/**	Function Definition : JSON	*/
	function_definition?: any
}