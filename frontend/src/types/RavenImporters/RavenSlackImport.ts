import { RavenSlackImportUsers } from './RavenSlackImportUsers'
import { RavenSlackImportChannels } from './RavenSlackImportChannels'

export interface RavenSlackImport{
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
	/**	Slack Export Zip File : Attach	*/
	slack_export_zip_file: string
	/**	Status : Select	*/
	status?: "Not Started" | "Staged" | "In Progress" | "Completed"
	/**	Channels JSON File : Attach	*/
	channels_json_file?: string
	/**	Users JSON File : Attach	*/
	users_json_file?: string
	/**	Users : Table - Raven Slack Import Users	*/
	users?: RavenSlackImportUsers[]
	/**	Channels : Table - Raven Slack Import Channels	*/
	channels?: RavenSlackImportChannels[]
	/**	Error Logs : JSON	*/
	error_logs?: any
}