import AsyncStorage from "@react-native-async-storage/async-storage"
import { RavenWorkspace } from "@raven/types/Raven/RavenWorkspace"

/** 
 * Key to store all workspaces in AsyncStorage
 */
export const WORKSPACES_KEY = 'workspaces'

/** 
 * Key to store the default workspace in AsyncStorage
 */
export const DEFAULT_WORKSPACE_KEY = 'default-workspace'

/** 
 * Function to get all workspaces from AsyncStorage
 * 
 * @returns All workspaces from AsyncStorage
 */
export const getWorkspacesFromStorage = async (): Promise<Record<string, RavenWorkspace>> => {
    return AsyncStorage.getItem(WORKSPACES_KEY).then((workspaces) => {
        const workspacesObj = JSON.parse(workspaces || '{}')
        return workspacesObj
    })
}

/** 
 * Function to get a workspace from AsyncStorage
 * 
 * @param workspaceID - The ID of the workspace
 * @returns The workspace from AsyncStorage
 */
export const getWorkspaceFromStorage = async (workspaceID: string): Promise<RavenWorkspace | null> => {
    return AsyncStorage.getItem(WORKSPACES_KEY).then((workspaces) => {
        const workspacesObj = JSON.parse(workspaces || '{}')
        return workspacesObj[workspaceID] || null
    })
}

/** 
 * Function to add a workspace to AsyncStorage
 * 
 * @param workspaceID - The ID of the workspace
 * @param workspaceInfo - The workspace information
 */
export const addWorkspaceToStorage = async (workspaceID: string, workspaceInfo: RavenWorkspace) => {
    return AsyncStorage.mergeItem(WORKSPACES_KEY, JSON.stringify({ [workspaceID]: workspaceInfo }))
}

/** 
 * Function to remove a workspace from AsyncStorage
 * 
 * @param workspaceID - The ID of the workspace
 */
export const removeWorkspaceFromStorage = async (workspaceID: string) => {
    return AsyncStorage.getItem(WORKSPACES_KEY).then((workspaces) => {
        const workspacesObj = JSON.parse(workspaces || '{}')
        delete workspacesObj[workspaceID]
    }).then((workspacesObj) => {
        return AsyncStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspacesObj))
    })
}

/** 
 * Function to set the default workspace in AsyncStorage
 * 
 * @param workspaceID - The ID of the workspace
 */
export const setDefaultWorkspace = (workspaceID: string) => {
    return AsyncStorage.setItem(DEFAULT_WORKSPACE_KEY, workspaceID)
}

/** 
 * Function to clear the default workspace from AsyncStorage
 */
export const clearDefaultWorkspace = () => {
    return AsyncStorage.removeItem(DEFAULT_WORKSPACE_KEY)
}

/** 
 * Function to get the default workspace from AsyncStorage
 * 
 * @returns The default workspace from AsyncStorage
 */
export const getDefaultWorkspace = async (): Promise<string | null> => {
    return AsyncStorage.getItem(DEFAULT_WORKSPACE_KEY)
}