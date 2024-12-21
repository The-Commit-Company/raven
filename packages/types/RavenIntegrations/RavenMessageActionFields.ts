
export interface RavenMessageActionFields{
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
	/**	Label : Data	*/
	label: string
	/**	Helper Text : Data	*/
	helper_text?: string
	/**	Is Required? : Check	*/
	is_required?: 0 | 1
	/**	Type : Select	*/
	type: "Data" | "Number" | "Select" | "Link" | "Date" | "Time" | "Datetime" | "Small Text" | "Checkbox"
	/**	Options : Small Text	*/
	options?: string
	/**	Default Value Type : Select	*/
	default_value_type?: "Static" | "Message Field" | "Jinja"
	/**	Default Value : Small Text	*/
	default_value?: string
}