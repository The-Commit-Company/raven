/**
 * Utility to convert Date object to DD-MM-YYYY format
 * @param date takes Javascript Date object
 * @returns Date string in DD-MM-YYYY format
 */
export const DateObjectToDateString = (date: Date): string => {
    return (date.getDate() < 10 ? date.getDate().toString().padStart(2, "0") : date.getDate()) + "-" + (date.getMonth() < 9 ? (date.getMonth() + 1).toString().padStart(2, "0") : date.getMonth() + 1) + "-" + date.getFullYear()
}

const MonthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

/**
 * Utility to convert Date object to DD MonthName YYYY format
 * @param date takes Javascript Date object
 * @returns Date string in DD MonthName YYYY format
 * @example 1 January 2021
 */
export const DateObjectToFormattedDateString = (date: Date): string => {
    return date.getDate() + " " + MonthNames[date.getMonth()] + " " + date.getFullYear()
}