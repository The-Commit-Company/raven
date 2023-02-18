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