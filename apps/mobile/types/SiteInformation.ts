export type SiteInformation = {
    url: string,
    /** OAuth client ID for Raven Mobile */
    client_id: string,
    /** Site name used for SocketIO connection */
    sitename: string,
    /** Logo of the site as set in Navbar Settings. If not set, the path to the Raven logo is used */
    logo: string,
    /** App name as set in Website Settings or System Settings - defaults to "Raven" */
    app_name: string,
    /** Version of Raven installed on the site */
    raven_version: string,
    /** Version of Frappe installed on the site */
    frappe_version: string,
    /** System timezone as set in System Settings */
    system_timezone: string,
}
