
export interface RavenMessage{
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
	/**	Channel ID : Link - Raven Channel	*/
	channel_id: string
	/**	Text : Long Text	*/
	text?: string
	/**	File : Attach	*/
	file?: string
	/**	File Thumbnail : Attach	*/
	file_thumbnail?: string
	/**	Message Type : Select	*/
	message_type?: "Text" | "Image" | "File"
	/**	Message Reactions : JSON	*/
	message_reactions?: any
	/**	Is Reply : Check	*/
	is_reply?: 0 | 1
	/**	Linked Message : Link - Raven Message	*/
	linked_message?: string
}