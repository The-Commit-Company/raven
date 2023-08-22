export const scrollbarStyles = {
    '&::-webkit-scrollbar': { width: "6px" },
    '&::-webkit-scrollbar-track': { backgroundColor: "transparent", width: "10px" },
    '&::-webkit-scrollbar-thumb': { backgroundColor: "transparent", borderRadius: "10px" },
    '&:hover': {
        '&::-webkit-scrollbar': { width: "6px" },
        '&::-webkit-scrollbar-track': { backgroundColor: "gray.100", width: "10px" },
        '&::-webkit-scrollbar-thumb': { backgroundColor: "gray.400", borderRadius: "3px" }
    }
}