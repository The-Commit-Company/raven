export const hasRavenUserRole = () => {

    if (import.meta.env.DEV) {
        return true
    }
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('Raven User');
}

export const isSystemManager = () => {
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('System Manager');
}