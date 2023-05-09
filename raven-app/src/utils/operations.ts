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

/**
 * Utility to convert Date object to DD MonthName YYYY format
 * @param date takes Javascript Date object
 * @returns Date string in DD MonthName YYYY format
 * @example 1 January 2021
 */
export const DateObjectToFormattedDateStringWithoutYear = (date: Date): string => {
    return date.getDate() + " " + MonthNames[date.getMonth()]
}

/**
 * Utility to convert Date-Time object to hour:minute format
 * @param date takes Javascript Date object
 * @returns Time string in hour:minute format
 * @example 08:15 PM or 12:00 AM
 */
export const DateObjectToTimeString = (date: Date): string => {
    var date = new Date(date)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}

/**
 * Function to return extension of a file
 * @param filename name of the file with extension
 * @returns extension
 */
export const getFileExtension = (filename: string) => {

    const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
    return extension;
}