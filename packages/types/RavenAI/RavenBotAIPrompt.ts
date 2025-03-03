
export interface RavenBotAIPrompt{
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
	/**	Prompt : Small Text	*/
	prompt: string
	/**	Naming Series : Select	*/
	naming_series?: "PR-.#####."
	/**	Raven Bot : Link - Raven Bot - If added, this prompt will only be shown when interacting with the bot	*/
	raven_bot?: string
	/**	Is Global : Check - If checked, this prompt will be available to all users on Raven	*/
	is_global?: 0 | 1
}