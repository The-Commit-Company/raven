
export interface UserEmail{
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
	/**	Email Account : Link - Email Account	*/
	email_account: string
	/**	Email ID : Data	*/
	email_id?: string
	/**	Awaiting Password : Check	*/
	awaiting_password?: 0 | 1
	/**	Used OAuth : Check	*/
	used_oauth?: 0 | 1
	/**	Enable Outgoing : Check	*/
	enable_outgoing?: 0 | 1
}