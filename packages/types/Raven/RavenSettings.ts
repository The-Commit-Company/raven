import { RavenHRCompanyWorkspace } from '../RavenIntegrations/RavenHRCompanyWorkspace'

export interface RavenSettings{
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
	/**	Automatically add system users to Raven : Check	*/
	auto_add_system_users?: 0 | 1
	/**	Show Raven on Desk : Check	*/
	show_raven_on_desk?: 0 | 1
	/**	Tenor API Key : Data	*/
	tenor_api_key?: string
	/**	Enable AI Integration : Check	*/
	enable_ai_integration?: 0 | 1
	/**	OpenAI Organisation ID : Data	*/
	openai_organisation_id?: string
	/**	OpenAI API Key : Password	*/
	openai_api_key?: string
	/**	OpenAI Project ID : Data - If not set, the integration will use the default project	*/
	openai_project_id?: string
	/**	Automatically Create a Channel for each Department : Check - If checked, a channel will be created in Raven for each department and employees will be synced with Raven Users.	*/
	auto_create_department_channel?: 0 | 1
	/**	Department Channel Type : Select	*/
	department_channel_type?: "Public" | "Private"
	/**	Company Workspace Mapping : Table - Raven HR Company Workspace	*/
	company_workspace_mapping?: RavenHRCompanyWorkspace[]
	/**	Show if a user is on leave : Check	*/
	show_if_a_user_is_on_leave?: 0 | 1
	/**	OAuth Client : Link - OAuth Client	*/
	oauth_client?: string
}