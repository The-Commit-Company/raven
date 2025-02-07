
export interface RavenPushToken{
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
	/**	User : Link - User	*/
	user: string
	/**	Environment : Select	*/
	environment: "Web" | "Mobile"
	/**	Device Information : Data	*/
	device_information?: string
	/**	FCM Token : Small Text	*/
	fcm_token: string
}