
export interface RavenSchedulerEvent{
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
	/**	Name : Data	*/
	event_name: string
	/**	Disabled : Check	*/
	disabled?: 0 | 1
	/**	Event Frequency : Select	*/
	event_frequency?: "Every Day" | "Every Day of the week" | "Date of the month" | "Cron"
	/**	CRON Expression : Data	*/
	cron_expression?: string
	/**	Bot : Link - Raven Bot - This Bot will be used to send the message.	*/
	bot: string
	/**	Send to : Select	*/
	send_to?: "Channel" | "DM"
	/**	Channel : Link - Raven Channel	*/
	channel: string
	/**	DM : Link - Raven Channel	*/
	dm?: string
	/**	Content : Small Text	*/
	content: string
	/**	Scheduler Event ID : Link - Server Script	*/
	scheduler_event_id?: string
}