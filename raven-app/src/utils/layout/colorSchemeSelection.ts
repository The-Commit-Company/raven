import { ProjectStatus } from '../../types/dashboard/Dashboard'

export const badgeColorScheme = (projectStatus: ProjectStatus): string => {

    switch (projectStatus) {
        case 'ON SCHEDULE':
            return 'green'
        case 'DELAYED':
            return 'yellow'
        case 'COMPLETED':
            return 'green'
        default:
            return ''
    }
}


export const progressColorScheme = (progress: number): string => {
    if (progress < 0) return "red"
    else if (progress > 0) return "green"
    else return "black"
}

export const setCellColor = (planned: number, actual: number): string => {
    if (planned > actual) return 'red.500'
    if (actual > planned) return 'green.400'
    else return 'black'
}

export const priorityColorScheme = (priority: string): string => {
    switch (priority) {
        case 'High':
            return 'red'
        case 'Medium':
            return 'yellow'
        case 'Low':
            return 'gray'
        default:
            return ''
    }
}

export const statusColorScheme = (status: string): string => {
    switch (status) {
        case 'To-do':
            return 'blue.400'
        case 'In Progress':
            return 'yellow.500'
        case 'In Review':
            return 'green.400'
        case 'Completed':
            return 'purple'
        default:
            return '';
    }
}