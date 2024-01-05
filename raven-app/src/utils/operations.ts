import { UserFields } from "./users/UserListProvider"

/**
 * Function to return extension of a file
 * @param filename name of the file with extension
 * @returns extension
 */
export const getFileExtension = (filename: string) => {

    const extension = filename?.split('.').pop()?.toLocaleLowerCase() ?? ''
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
