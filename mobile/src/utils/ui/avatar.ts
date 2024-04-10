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

const generateHSL = (name: string, saturationRange: number[], lightnessRange: number[]): any => {
    const hash = getHashOfString(name)
    const h = normalizeHash(hash, 0, 360)
    const s = normalizeHash(hash, saturationRange[0], saturationRange[1])
    const l = normalizeHash(hash, lightnessRange[0], lightnessRange[1])
    return [h, s, l]
}

const HSLtoString = (hsl: any) => {
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`
}

export const generateColorHsl = (id: string, saturationRange: number[], lightnessRange: number[]) => {
    return HSLtoString(generateHSL(id, saturationRange, lightnessRange))
}

const COLORS = ["tomato", "red", "ruby","crimson","pink","plum","purple","violet","iris","indigo","blue","cyan","teal","jade","green","grass","bronze","gold","brown","orange","amber","yellow","lime","mint","sky"]

export const generateAvatarColor = (id?: string) => {
    const hash = getHashOfString(id || 'random')
    const index = normalizeHash(hash, 0, COLORS.length)
    return COLORS[index]
}

export const getAvatarColor = (name: string) => ( `avatar-${generateAvatarColor(name)}` )

export const getFallbackInitials = (name: string) => {
    name = name.trim()
    if (name.length <= 2) return name

    return name
        .split(/\s+/)
        .map(w => [...w][0])
        .slice(0, 2)
        .join('')
}