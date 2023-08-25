
const SetColor = (colorMode: string) => {

    switch (colorMode) {
        case "light":
            return {
                trackColor: "gray.100",
                thumbColor: "gray.400"
            }
        case "dark":
            return {
                trackColor: "gray.700",
                thumbColor: "gray.600"
            }
        default:
            return {
                trackColor: "gray.100",
                thumbColor: "gray.400"
            }
    }

}

export const scrollbarStyles = (colorMode: string) => {

    return {
        '&::-webkit-scrollbar': { width: "6px" },
        '&::-webkit-scrollbar-track': { backgroundColor: "transparent", width: "10px" },
        '&::-webkit-scrollbar-thumb': { backgroundColor: "transparent", borderRadius: "10px" },
        '&:hover': {
            '&::-webkit-scrollbar': { width: "6px" },
            '&::-webkit-scrollbar-track': { backgroundColor: SetColor(colorMode).trackColor, width: "10px" },
            '&::-webkit-scrollbar-thumb': { backgroundColor: SetColor(colorMode).thumbColor, borderRadius: "3px" }
        }
    }
}