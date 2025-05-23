import { UserFields } from "./users/UserListProvider"

/**
 * Function to return extension of a file
 * @param filename name of the file with extension
 * @returns extension
 */
export const getFileExtension = (filename: string) => {

    const fileNameWithoutQuery = filename?.split('?')[0]

    const extension = fileNameWithoutQuery?.split('.').pop()?.toLocaleLowerCase() ?? ''
    return extension;
}

export const VIDEO_FORMATS = ['mp4', 'webm']
/**
 * Function to check if a file is a video
 * @param extension extension of the file
 * @returns boolean
 */
export const isVideoFile = (ext: string) => {

    return VIDEO_FORMATS.includes(ext)
}

/**
 * Function to return name of a file name without extension
 * @param filename name of the file with extension
 * @returns name of the file without extension
 */
export const getFileName = (filename: string) => {

    const name = filename?.split('/')[3]

    // Remove the query params from the filename
    return name?.split('?')[0]
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
                const user_1 = userArray.find((user) => user.name == usersList[0])?.full_name
                const user_2 = userArray.find((user) => user.name == usersList[1])?.full_name
                return `${user_1} and ${user_2}`
            }
        } else if (count === 3) {
            if (currentUserInList) {
                const otherUsers = usersList.filter((user, index) => index !== currentUserIndex)
                return `You, ${userArray.find((user) => user.name == otherUsers[0])?.full_name} and ${userArray.find((user) => user.name == otherUsers[1])?.full_name}`
            } else {
                const user_1 = userArray.find((user) => user.name == usersList[0])?.full_name
                const user_2 = userArray.find((user) => user.name == usersList[1])?.full_name
                const user_3 = userArray.find((user) => user.name == usersList[2])?.full_name
                return `${user_1}, ${user_2} and ${user_3}`
            }
        } else if (count > 3) {


            if (currentUserInList) {
                const otherUsers = usersList.filter((user, index) => index !== currentUserIndex)
                const remainingUsers = otherUsers.length - 50
                if (remainingUsers > 0) {
                    // Show all users upto 50
                    const userString = otherUsers.slice(0, 50).map((user) => userArray.find((u) => u.name == user)?.full_name).join(', ')
                    return `You, ${userString} and ${remainingUsers} others`
                } else {
                    // The user string will need to have an ", and" just before the last user
                    // For example, You, John, Jane, and Henry
                    const numberOfUsers = otherUsers.length
                    const userString = otherUsers.slice(0, numberOfUsers - 1).map((user) => userArray.find((u) => u.name == user)?.full_name).join(', ')
                    const lastUser = userArray.find((u) => u.name == otherUsers[numberOfUsers - 1])?.full_name
                    return `You, ${userString}, and ${lastUser}`
                }
            }
            else {
                const numberOfUsers = usersList.length

                if (numberOfUsers > 50) {
                    const userString = usersList.slice(0, 50).map((user) => userArray.find((u) => u.name == user)?.full_name).join(', ')
                    const remainingUsers = usersList.length - 50
                    return `${userString} and ${remainingUsers} others`
                } else {
                    // The user string will need to have an ", and" just before the last user
                    // For example, John, Jane, and Henry
                    const userString = usersList.slice(0, numberOfUsers - 1).map((user) => userArray.find((u) => u.name == user)?.full_name).join(', ')
                    const lastUser = userArray.find((u) => u.name == usersList[numberOfUsers - 1])?.full_name
                    return `${userString} and ${lastUser}`
                }
            }
        }
    }
}

/**
 * Function to format bytes to human readable format
 * @param bytes size in bytes
 * @param decimals number of decimal places
 * @returns string of human readable size
 */
export const formatBytes = (bytes: number, decimals = 2) => {

    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * Function to remove the current user from the DM Channel Name - used when the peer user is not found
 * @param channelName 
 * @param currentUser 
 * @returns 
 */
export const replaceCurrentUserFromDMChannelName = (channelName: string, currentUser: string) => {
    return channelName.replace(currentUser, '').replace(' _ ', '')
}