
export interface RavenCustomEmoji{
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
	/**	Image : Attach Image	*/
	image: string
	/**	Emoji Name : Data	*/
	emoji_name: string
	/**	Keywords : Data	*/
	keywords?: string
}