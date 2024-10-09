
export interface DocField{
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
	/**	Label : Data	*/
	label?: string
	/**	Type : Select	*/
	fieldtype: "Autocomplete" | "Attach" | "Attach Image" | "Barcode" | "Button" | "Check" | "Code" | "Color" | "Column Break" | "Currency" | "Data" | "Date" | "Datetime" | "Duration" | "Dynamic Link" | "Float" | "Fold" | "Geolocation" | "Heading" | "HTML" | "HTML Editor" | "Icon" | "Image" | "Int" | "JSON" | "Link" | "Long Text" | "Markdown Editor" | "Password" | "Percent" | "Phone" | "Read Only" | "Rating" | "Section Break" | "Select" | "Signature" | "Small Text" | "Tab Break" | "Table" | "Table MultiSelect" | "Text" | "Text Editor" | "Time"
	/**	Name : Data	*/
	fieldname?: string
	/**	Precision : Select - Set non-standard precision for a Float or Currency field	*/
	precision?: "" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
	/**	Length : Int	*/
	length?: number
	/**	Non Negative : Check	*/
	non_negative?: 0 | 1
	/**	Hide Days : Check	*/
	hide_days?: 0 | 1
	/**	Hide Seconds : Check	*/
	hide_seconds?: 0 | 1
	/**	Mandatory : Check	*/
	reqd?: 0 | 1
	/**	Virtual : Check	*/
	is_virtual?: 0 | 1
	/**	Index : Check	*/
	search_index?: 0 | 1
	/**	Not Nullable : Check	*/
	not_nullable?: 0 | 1
	/**	Options : Small Text - For Links, enter the DocType as range.
For Select, enter list of Options, each on a new line.	*/
	options?: string
	/**	Sort Options : Check	*/
	sort_options?: 0 | 1
	/**	Show Dashboard : Check	*/
	show_dashboard?: 0 | 1
	/**	Link Filters : JSON	*/
	link_filters?: any
	/**	Default : Small Text	*/
	default?: string
	/**	Fetch From : Small Text	*/
	fetch_from?: string
	/**	Fetch on Save if Empty : Check - If unchecked, the value will always be re-fetched on save.	*/
	fetch_if_empty?: 0 | 1
	/**	Hidden : Check	*/
	hidden?: 0 | 1
	/**	Show on Timeline : Check	*/
	show_on_timeline?: 0 | 1
	/**	Bold : Check	*/
	bold?: 0 | 1
	/**	Allow in Quick Entry : Check	*/
	allow_in_quick_entry?: 0 | 1
	/**	Translatable : Check	*/
	translatable?: 0 | 1
	/**	Print Hide : Check	*/
	print_hide?: 0 | 1
	/**	Print Hide If No Value : Check	*/
	print_hide_if_no_value?: 0 | 1
	/**	Report Hide : Check	*/
	report_hide?: 0 | 1
	/**	Display Depends On (JS) : Code	*/
	depends_on?: string
	/**	Collapsible : Check	*/
	collapsible?: 0 | 1
	/**	Collapsible Depends On (JS) : Code	*/
	collapsible_depends_on?: string
	/**	Hide Border : Check	*/
	hide_border?: 0 | 1
	/**	In List View : Check	*/
	in_list_view?: 0 | 1
	/**	In List Filter : Check	*/
	in_standard_filter?: 0 | 1
	/**	In Preview : Check	*/
	in_preview?: 0 | 1
	/**	In Filter : Check	*/
	in_filter?: 0 | 1
	/**	In Global Search : Check	*/
	in_global_search?: 0 | 1
	/**	Read Only : Check	*/
	read_only?: 0 | 1
	/**	Allow on Submit : Check	*/
	allow_on_submit?: 0 | 1
	/**	Ignore User Permissions : Check	*/
	ignore_user_permissions?: 0 | 1
	/**	Allow Bulk Edit : Check	*/
	allow_bulk_edit?: 0 | 1
	/**	Perm Level : Int	*/
	permlevel?: number
	/**	Ignore XSS Filter : Check - Don't encode HTML tags like &lt;script&gt; or just characters like &lt; or &gt;, as they could be intentionally used in this field	*/
	ignore_xss_filter?: 0 | 1
	/**	Unique : Check	*/
	unique?: 0 | 1
	/**	No Copy : Check	*/
	no_copy?: 0 | 1
	/**	Set only once : Check	*/
	set_only_once?: 0 | 1
	/**	Remember Last Selected Value : Check	*/
	remember_last_selected_value?: 0 | 1
	/**	Mandatory Depends On (JS) : Code	*/
	mandatory_depends_on?: string
	/**	Read Only Depends On (JS) : Code	*/
	read_only_depends_on?: string
	/**	Print Width : Data	*/
	print_width?: string
	/**	Width : Data	*/
	width?: string
	/**	Max Height : Data	*/
	max_height?: string
	/**	Columns : Int - Number of columns for a field in a List View or a Grid (Total Columns should be less than 11)	*/
	columns?: number
	/**	Description : Small Text	*/
	description?: string
	/**	Documentation URL : Data	*/
	documentation_url?: string
	/**	Placeholder : Data	*/
	placeholder?: string
	/**	 : Data	*/
	oldfieldname?: string
	/**	 : Data	*/
	oldfieldtype?: string
}