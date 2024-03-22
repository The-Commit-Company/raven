
export interface TenorCredentials{
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
	/**	Client Key : Data - This is Client ID for the Tenor GIF API	*/
	client_key?: string
	/**	Client Secret : Data - This is Client Secret for Tenor GIF API	*/
	client_secret?: string
}