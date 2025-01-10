import AsyncStorage from "@react-native-async-storage/async-storage"

/** 
 * Function to get the selected workspace for a site from AsyncStorage
 * @param siteID - The ID of the site
 * @returns The workspace from AsyncStorage
 */
export const getWorkspaceFromStorage = async (siteID: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(`${siteID}-workspace`)
    } catch (error) {
        console.error("Error getting workspace:", error)
        return null
    }
}

/** 
 * Function to set the selected workspace for a site in AsyncStorage
 * @param siteID - The ID of the site
 * @param workspaceID - The workspace name
 */
export const addWorkspaceToStorage = async (siteID: string, workspaceID: string) => {
    try {
        await AsyncStorage.setItem(`${siteID}-workspace`, workspaceID)
    } catch (error) {
        console.error("Error adding workspace:", error)
    }
}

/** 
 * Function to remove the selected workspace for a site from AsyncStorage
 * @param siteID - The ID of the site
 */
export const removeWorkspaceFromStorage = async (siteID: string) => {
    try {
        await AsyncStorage.removeItem(`${siteID}-workspace`)
    } catch (error) {
        console.error("Error removing workspace:", error)
    }
}
