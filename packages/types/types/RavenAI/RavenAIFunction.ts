
export interface RavenAIFunction{
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
	/**	Function Name : Data	*/
	function_name: string
	/**	Description : Small Text	*/
	description: string
	/**	Function Path : Small Text	*/
	function_path?: string
	/**	Type : Select	*/
	type: "Get Document" | "Get Multiple Documents" | "Get List" | "Create Document" | "Create Multiple Documents" | "Update Document" | "Update Multiple Documents" | "Delete Document" | "Delete Multiple Documents" | "Submit Document" | "Cancel Document" | "Get Amended Document" | "Custom Function" | "Send Message" | "Attach File to Document" | "Get Report Result" | "Get Value" | "Set Value"
	/**	Reference DocType : Link - DocType	*/
	reference_doctype?: string
	/**	Pass parameters as JSON : Check - If checked, the params will be passed as a JSON object instead of named parameters	*/
	pass_parameters_as_json?: 0 | 1
	/**	Requires Write Permissions : Check	*/
	requires_write_permissions?: 0 | 1
	/**	Strict : Check	*/
	strict?: 0 | 1
	/**	Parameters : Table - Raven AI Function Params	*/
	parameters?: any
	/**	Params : JSON	*/
	params?: any
	/**	Function Definition : JSON	*/
	function_definition?: any
}