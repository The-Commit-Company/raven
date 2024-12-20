import { BlockModule } from './BlockModule'
import { DefaultValue } from './DefaultValue'
import { HasRole } from './HasRole'
import { UserEmail } from './UserEmail'
import { UserSocialLogin } from './UserSocialLogin'

export interface User {
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
	/**	Enabled : Check	*/
	enabled?: 0 | 1
	/**	Email : Data	*/
	email: string
	/**	First Name : Data	*/
	first_name: string
	/**	Middle Name : Data	*/
	middle_name?: string
	/**	Last Name : Data	*/
	last_name?: string
	/**	Full Name : Data	*/
	full_name?: string
	/**	Username : Data	*/
	username?: string
	/**	Language : Link - Language	*/
	language?: string
	/**	Time Zone : Select	*/
	time_zone?: string
	/**	Send Welcome Email : Check	*/
	send_welcome_email?: 0 | 1
	/**	Unsubscribed : Check	*/
	unsubscribed?: 0 | 1
	/**	User Image : Attach Image - Get your globally recognized avatar from Gravatar.com	*/
	user_image?: string
	/**	Role Profile : Link - Role Profile	*/
	role_profile_name?: string
	/**	Roles Assigned : Table - Has Role	*/
	roles?: HasRole[]
	/**	Module Profile : Link - Module Profile	*/
	module_profile?: string
	/**	Block Modules : Table - Block Module	*/
	block_modules?: BlockModule[]
	/**	Home Settings : Code	*/
	home_settings?: string
	/**	Gender : Link - Gender	*/
	gender?: string
	/**	Birth Date : Date	*/
	birth_date?: string
	/**	Interests : Small Text	*/
	interest?: string
	/**	Phone : Data	*/
	phone?: string
	/**	Location : Data	*/
	location?: string
	/**	Bio : Small Text	*/
	bio?: string
	/**	Mobile No : Data	*/
	mobile_no?: string
	/**	Mute Sounds : Check	*/
	mute_sounds?: 0 | 1
	/**	Desk Theme : Select	*/
	desk_theme?: "Light" | "Dark" | "Automatic"
	/**	Banner Image : Attach Image	*/
	banner_image?: string
	/**	Set New Password : Password	*/
	new_password?: string
	/**	Logout From All Devices After Changing Password : Check	*/
	logout_all_sessions?: 0 | 1
	/**	Reset Password Key : Data	*/
	reset_password_key?: string
	/**	Last Reset Password Key Generated On : Datetime - Stores the datetime when the last reset password key was generated.	*/
	last_reset_password_key_generated_on?: string
	/**	Last Password Reset Date : Date	*/
	last_password_reset_date?: string
	/**	Redirect URL : Small Text	*/
	redirect_url?: string
	/**	Send Notifications For Documents Followed By Me : Check	*/
	document_follow_notify?: 0 | 1
	/**	Frequency : Select	*/
	document_follow_frequency?: "Hourly" | "Daily" | "Weekly"
	/**	Auto follow documents that you create : Check	*/
	follow_created_documents?: 0 | 1
	/**	Auto follow documents that you comment on : Check	*/
	follow_commented_documents?: 0 | 1
	/**	Auto follow documents that you Like : Check	*/
	follow_liked_documents?: 0 | 1
	/**	Auto follow documents that are assigned to you : Check	*/
	follow_assigned_documents?: 0 | 1
	/**	Auto follow documents that are shared with you : Check	*/
	follow_shared_documents?: 0 | 1
	/**	Email Signature : Small Text	*/
	email_signature?: string
	/**	Send Notifications For Email Threads : Check	*/
	thread_notify?: 0 | 1
	/**	Send Me A Copy of Outgoing Emails : Check	*/
	send_me_a_copy?: 0 | 1
	/**	Allowed In Mentions : Check	*/
	allowed_in_mentions?: 0 | 1
	/**	User Emails : Table - User Email	*/
	user_emails?: UserEmail[]
	/**	User Defaults : Table - DefaultValue - Enter default value fields (keys) and values. If you add multiple values for a field, the first one will be picked. These defaults are also used to set "match" permission rules. To see list of fields, go to "Customize Form".	*/
	defaults?: DefaultValue[]
	/**	Simultaneous Sessions : Int	*/
	simultaneous_sessions?: number
	/**	Restrict IP : Small Text - Restrict user from this IP address only. Multiple IP addresses can be added by separating with commas. Also accepts partial IP addresses like (111.111.111)	*/
	restrict_ip?: string
	/**	Last IP : Read Only	*/
	last_ip?: string
	/**	Login After : Int - Allow user to login only after this hour (0-24)	*/
	login_after?: number
	/**	User Type : Link - User Type - If the user has any role checked, then the user becomes a "System User". "System User" has access to the desktop	*/
	user_type?: string
	/**	Last Active : Datetime	*/
	last_active?: string
	/**	Login Before : Int - Allow user to login only before this hour (0-24)	*/
	login_before?: number
	/**	Bypass Restricted IP Address Check If Two Factor Auth Enabled : Check - If enabled,  user can login from any IP Address using Two Factor Auth, this can also be set for all users in System Settings	*/
	bypass_restrict_ip_check_if_2fa_enabled?: 0 | 1
	/**	Last Login : Read Only	*/
	last_login?: string
	/**	Last Known Versions : Text - Stores the JSON of last known versions of various installed apps. It is used to show release notes.	*/
	last_known_versions?: string
	/**	Social Logins : Table - User Social Login	*/
	social_logins?: UserSocialLogin[]
	/**	API Key : Data - API Key cannot be regenerated	*/
	api_key?: string
	/**	API Secret : Password	*/
	api_secret?: string
}