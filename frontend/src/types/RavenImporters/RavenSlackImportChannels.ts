
export interface RavenSlackImportChannels{
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
	/**	Slack ID : Data	*/
	slack_id: string
	/**	Slack Name : Data	*/
	slack_name?: string
	/**	Slack - Is General : Check	*/
	slack_is_general?: 0 | 1
	/**	Slack - Is Archived : Check	*/
	slack_is_archived?: 0 | 1
	/**	Import Type : Select	*/
	import_type: "Map To Existing Channel" | "Create New Channel"
	/**	Channel Type : Select	*/
	channel_type?: "Open" | "Public" | "Private"
	/**	Raven Workspace : Link - Raven Workspace	*/
	raven_workspace?: string
	/**	Raven Channel : Link - Raven Channel	*/
	raven_channel?: string
	/**	Members : JSON	*/
	members?: any
	/**	Slack Topic : Data	*/
	slack_topic?: string
	/**	Slack Purpose : Data	*/
	slack_purpose?: string
	/**	Slack Creator User ID : Data - This user will be made an admin for this channel	*/
	slack_creator_user_id?: string
	/**	Created On : Datetime	*/
	created_on?: string
}