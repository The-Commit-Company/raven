
export interface RavenAIFunctionParams{
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
	/**	Fieldname : Data	*/
	fieldname: string
	/**	Child Table Name : Data	*/
	child_table_name?: string
	/**	Required : Check	*/
	required?: 0 | 1
	/**	Do not ask AI to fill this variable : Check	*/
	do_not_ask_ai?: 0 | 1
	/**	Default Value : Data	*/
	default_value?: string
	/**	Options : Small Text	*/
	options?: string
	/**	Type : Select	*/
	type: "string" | "integer" | "number" | "float" | "boolean"
	/**	Description : Small Text	*/
	description: string
}