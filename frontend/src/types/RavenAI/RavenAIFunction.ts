
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
	/**	Function Path : Data	*/
	function_path: string
	/**	Pass parameters as JSON : Check - If checked, the params will be passed as a JSON object instead of named parameters	*/
	pass_parameters_as_json?: 0 | 1
}