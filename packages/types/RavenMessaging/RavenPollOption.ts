
export interface RavenPollOption {
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
    /**	Option : Small Text	*/
    option: string
    /**	Votes : Int	*/
    votes?: number
}