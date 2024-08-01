import { RavenMention } from './RavenMention'
import { RavenThreadParticipant } from './RavenThreadParticipant'

export interface RavenMessage{
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
	/**	Channel ID : Link - Raven Channel	*/
	channel_id: string
	/**	Text : Long Text	*/
	text?: string
	/**	JSON : JSON	*/
	json?: any
	/**	Message Reactions : JSON	*/
	message_reactions?: any
	/**	Is Reply : Check	*/
	is_reply?: 0 | 1
	/**	Replied Message ID : Link - Raven Message	*/
	linked_message?: string
	/**	Replied Message Details : JSON	*/
	replied_message_details?: any
	/**	Message Type : Select	*/
	message_type?: "Text" | "Image" | "File" | "Poll"
	/**	Content : Long Text	*/
	content?: string
	/**	File : Attach	*/
	file?: string
	/**	Image Width : Data	*/
	image_width?: string
	/**	Image Height : Data	*/
	image_height?: string
	/**	File Thumbnail : Attach	*/
	file_thumbnail?: string
	/**	Thumbnail Width : Data	*/
	thumbnail_width?: string
	/**	Thumbnail Height : Data	*/
	thumbnail_height?: string
	/**	Link Doctype : Link - DocType	*/
	link_doctype?: string
	/**	Link Document : Dynamic Link	*/
	link_document?: string
	/**	Is Edited : Check	*/
	is_edited?: 0 | 1
	/**	Is Forwarded : Check	*/
	is_forwarded?: 0 | 1
	/**	Mentions : Table - Raven Mention	*/
	mentions?: RavenMention[]
	/**	Poll ID : Link - Raven Poll	*/
	poll_id?: string
	/**	Is Bot Message : Check	*/
	is_bot_message?: 0 | 1
	/**	Bot : Link - Raven User	*/
	bot?: string
	/**	Hide link preview : Check	*/
	hide_link_preview?: 0 | 1
	/**	Is Thread : Check - This message starts a thread	*/
	is_thread?: 0 | 1
	/**	Is Thread Message : Check - This message is part of a thread	*/
	is_thread_message?: 0 | 1
	/**	Thread ID : Link - Raven Message - ID of the primary message that started the thread	*/
	thread_id?: string
	/**	Thread Messages Count : Int	*/
	thread_messages_count?: number
	/**	Thread participants : Table - Raven Thread Participant	*/
	thread_participants?: RavenThreadParticipant[]
}