import { UserFields } from "./users/UserListProvider"

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

    const extension = filename.split('.').pop()?.toLocaleLowerCase() ?? ''
    return extension;
}

/**
 * Function to return name of a file name without extension
 * @param filename name of the file with extension
 * @returns name of the file without extension
 */
export const getFileName = (filename: string) => {

    const name = filename.split('/')[3]
    return name;
}

/**
 * Function to return user names for reactions in a message
 * @param usersList list of users who reacted
 * @param count number of users who reacted
 * @param currentUser current user
 * @param allUsers list of all users
 * @returns string of user names with count for reactions
 */

export const getUsers = (usersList: string[], count: number, currentUser: string, allUsers: Record<string, UserFields>) => {

    if (usersList) {

        const currentUserIndex = usersList.indexOf(currentUser)
        const currentUserInList = currentUserIndex !== -1

        const userArray = Object.values(allUsers) as UserFields[]

        if (count === 1) {
            return currentUserInList ? 'You' : userArray.find((user) => user.name == usersList[0])?.full_name
        } else if (count === 2) {
            if (currentUserInList) {
                const otherUser = usersList.find((user, index) => index !== currentUserIndex)
                return `You and ${userArray.find((user) => user.name == otherUser)?.full_name ?? otherUser}`
            } else {
                return usersList.join(' and ')
            }
        } else if (count === 3) {
            if (currentUserInList) {
                const otherUsers = usersList.filter((user, index) => index !== currentUserIndex)
                return `You, ${userArray.find((user) => user.name == otherUsers[0])?.full_name} and ${userArray.find((user) => user.name == otherUsers[1])?.full_name}`
            } else {
                return usersList.join(', ')
            }
        } else if (count > 3) {
            if (currentUserInList) {
                const otherUsers = usersList.filter((user, index) => index !== currentUserIndex)
                return `You, ${userArray.find((user) => user.name == otherUsers[0])?.full_name},
                ${userArray.find((user) => user.name == otherUsers[1])?.full_name} and ${count - 3} other${count - 3 > 1 ? 's' : ''}`
            }
            else {
                return `${userArray.find((user) => user.name == usersList[0])?.full_name},
                ${userArray.find((user) => user.name == usersList[1])?.full_name},
                ${userArray.find((user) => user.name == usersList[2])?.full_name} and ${count - 3} other${count - 3 > 1 ? 's' : ''}`
            }
        }
    }
}
