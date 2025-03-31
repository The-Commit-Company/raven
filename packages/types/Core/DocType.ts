import { DocField } from "./DocField"

export interface DocType {
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
	/**	Permissions : Table - DocPerm	*/
	permissions?: any
	/**	Restrict To Domain : Link - Domain	*/
	restrict_to_domain?: string
	/**	User Cannot Search : Check	*/
	read_only?: 0 | 1
	/**	User Cannot Create : Check	*/
	in_create?: 0 | 1
	/**	Naming Rule : Select	*/
	naming_rule?: "" | "Set by user" | "Autoincrement" | "By fieldname" | 'By "Naming Series" field' | "Expression" | "Expression (old style)" | "Random" | "UUID" | "By script"
	/**	Auto Name : Data	*/
	autoname?: string
	/**	Title Field : Data	*/
	title_field?: string
	/**	Allow Rename : Check	*/
	allow_rename?: 0 | 1
	/**	Module : Link - Module Def	*/
	module: string
	/**	Is Submittable : Check - Once submitted, submittable documents cannot be changed. They can only be Cancelled and Amended.	*/
	is_submittable?: 0 | 1
	/**	Is Child Table : Check - Child Tables are shown as a Grid in other DocTypes	*/
	istable?: 0 | 1
	/**	Is Single : Check - Single Types have only one record no tables associated. Values are stored in tabSingles	*/
	issingle?: 0 | 1
	/**	Is Tree : Check - Tree structures are implemented using Nested Set	*/
	is_tree?: 0 | 1
	/**	Is Calendar and Gantt : Check - Enables Calendar and Gantt views.	*/
	is_calendar_and_gantt?: 0 | 1
	/**	Editable Grid : Check	*/
	editable_grid?: 0 | 1
	/**	Quick Entry : Check - Open a dialog with mandatory fields to create a new record quickly. There must be at least one mandatory field to show in dialog.	*/
	quick_entry?: 0 | 1
	/**	Track Changes : Check - If enabled, changes to the document are tracked and shown in timeline	*/
	track_changes?: 0 | 1
	/**	Track Seen : Check - If enabled, the document is marked as seen, the first time a user opens it	*/
	track_seen?: 0 | 1
	/**	Track Views : Check - If enabled, document views are tracked, this can happen multiple times	*/
	track_views?: 0 | 1
	/**	Custom? : Check	*/
	custom?: 0 | 1
	/**	Beta : Check	*/
	beta?: 0 | 1
	/**	Is Virtual : Check	*/
	is_virtual?: 0 | 1
	/**	Queue in Background (BETA) : Check - Enabling this will submit documents in background	*/
	queue_in_background?: 0 | 1
	/**	Description : Small Text	*/
	description?: string
	/**	Image Field : Data - Must be of type "Attach Image"	*/
	image_field?: string
	/**	Timeline Field : Data - Comments and Communications will be associated with this linked document	*/
	timeline_field?: string
	/**	Parent Field (Tree) : Data	*/
	nsm_parent_field?: string
	/**	Max Attachments : Int	*/
	max_attachments?: number
	/**	Documentation Link : Data - URL for documentation or help	*/
	documentation?: string
	/**	Hide Sidebar, Menu, and Comments : Check	*/
	hide_toolbar?: 0 | 1
	/**	Hide Copy : Check	*/
	allow_copy?: 0 | 1
	/**	Allow Import (via Data Import Tool) : Check	*/
	allow_import?: 0 | 1
	/**	Allow events in timeline : Check	*/
	allow_events_in_timeline?: 0 | 1
	/**	Allow Auto Repeat : Check	*/
	allow_auto_repeat?: 0 | 1
	/**	Make Attachments Public by Default : Check	*/
	make_attachments_public?: 0 | 1
	/**	Show Title in Link Fields : Check	*/
	show_title_field_in_link?: 0 | 1
	/**	Translate Link Fields : Check	*/
	translated_doctype?: 0 | 1
	/**	Search Fields : Data	*/
	search_fields?: string
	/**	Default Print Format : Data	*/
	default_print_format?: string
	/**	Default Sort Field : Data	*/
	sort_field?: string
	/**	Default Sort Order : Select	*/
	sort_order?: "ASC" | "DESC"
	/**	Default View : Select	*/
	default_view?: string
	/**	Force Re-route to Default View : Check	*/
	force_re_route_to_default_view?: 0 | 1
	/**	Show in Module Section : Select	*/
	document_type?: "" | "Document" | "Setup" | "System" | "Other"
	/**	Icon : Data	*/
	icon?: string
	/**	Color : Data	*/
	color?: string
	/**	Show Preview Popup : Check	*/
	show_preview_popup?: 0 | 1
	/**	Make "name" searchable in Global Search : Check	*/
	show_name_in_global_search?: 0 | 1
	/**	Default Email Template : Link - Email Template	*/
	default_email_template?: string
	/**	Allow document creation via Email : Check	*/
	email_append_to?: 0 | 1
	/**	Sender Email Field : Data	*/
	sender_field?: string
	/**	Sender Name Field : Data	*/
	sender_name_field?: string
	/**	Subject Field : Data	*/
	subject_field?: string
	/**	Fields : Table - DocField	*/
	fields?: DocField[]
	/**	Document Actions : Table - DocType Action	*/
	actions?: any
	/**	Document Links : Table - DocType Link	*/
	links?: any
	/**	Document States : Table - DocType State	*/
	states?: any
	/**	Has Web View : Check	*/
	has_web_view?: 0 | 1
	/**	Allow Guest to View : Check	*/
	allow_guest_to_view?: 0 | 1
	/**	Index Web Pages for Search : Check	*/
	index_web_pages_for_search?: 0 | 1
	/**	Route : Data	*/
	route?: string
	/**	Is Published Field : Data	*/
	is_published_field?: string
	/**	Website Search Field : Data	*/
	website_search_field?: string
	/**	Database Engine : Select	*/
	engine?: "InnoDB" | "MyISAM"
	/**	 : Data	*/
	migration_hash?: string
}