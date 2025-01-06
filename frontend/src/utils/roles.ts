export const hasRavenUserRole = () => {

    if (import.meta.env.DEV) {
        return true
    }
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('Raven User');
}

export const hasRavenAdminRole = () => {
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('Raven Admin');
}

export const isSystemManager = () => {
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('System Manager');
}

export const hasServerScriptEnabled = () => {
    if (import.meta.env.DEV) {
        return true
    }
    // @ts-expect-error
    return (window?.frappe?.boot?.server_script_enabled)
}