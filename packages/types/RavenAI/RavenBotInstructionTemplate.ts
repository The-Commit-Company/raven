
export interface RavenBotInstructionTemplate{
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
	/**	Template Name : Data	*/
	template_name: string
	/**	Dynamic Instructions : Check - Dynamic Instructions allow you to embed Jinja tags in your instruction to the bot. Hence the instruction would be different based on the user who is calling the bot or the data in your system. These instructions are computed every time the bot is called. Check this if you want to embed things like Employee ID, Company Name etc in your instructions dynamically	*/
	dynamic_instructions?: 0 | 1
	/**	Instruction : Long Text - You can use Jinja variables here to customize the instruction to the bot at run time if dynamic instructions are enabled.	*/
	instruction: string
}