export const hasRavenUserRole = () => {
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('Raven User');
}

export const isSystemManager = () => {
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('System Manager');
}