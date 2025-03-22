
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
// Hashing function to convert a string to a number
export const getHashOfString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = Math.abs(hash)
    return hash
}

export const normalizeHash = (hash: number, min: number, max: number) => {
    return Math.floor((hash % (max - min)) + min)
}

export const colorToRgba = (color: string, alpha: number) => {
    // Ensure alpha is between 0.1 and 1
    if (alpha < 0.1 || alpha > 1) {
        throw new Error("Alpha value must be between 0.1 and 1.");
    }

    // Handle HEX color
    if (color.startsWith("#")) {
        let hex = color.slice(1);

        // Expand shorthand hex code (e.g., #03F to #0033FF)
        if (hex.length === 3) {
            hex = hex.split("").map((char) => char + char).join("");
        }

        if (hex.length !== 6) {
            throw new Error("Invalid hex color code.");
        }

        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Handle RGB or RGBA color
    const rgbRegex = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([\d.]+))?\)$/;
    const match = color.match(rgbRegex);

    if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);

        // Validate RGB values
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
            throw new Error("Invalid RGB color values.");
        }

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    throw new Error("Invalid color format. Provide a hex, rgb, or rgba color.");
}