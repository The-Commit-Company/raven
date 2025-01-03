
/**
 * Get the initials of a name
 * @param name 
 * @returns 
 */
export const getInitials = (name?: string) => {
    if (!name) return ''
    const [firstName, lastName] = name.split(' ')
    return firstName[0].toUpperCase() + (lastName?.[0] ?? '').toUpperCase()
}

// ----- Avatar Color Generation ----
const getHashOfString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = Math.abs(hash)
    return hash
}

const normalizeHash = (hash: number, min: number, max: number) => {
    return Math.floor((hash % (max - min)) + min)
}

export const getColorIndexForAvatar = (id?: string, length: number = 10): number => {
    const hash = getHashOfString(id || 'random')
    const index = normalizeHash(hash, 0, length)

    return index
}