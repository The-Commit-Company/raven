
export interface UserSocialLogin{
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
	/**	Provider : Data	*/
	provider?: string
	/**	Username : Data	*/
	username?: string
	/**	User ID : Data	*/
	userid?: string
}