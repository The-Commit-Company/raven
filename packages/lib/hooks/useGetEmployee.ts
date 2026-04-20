import { useFrappeGetCall } from "frappe-react-sdk"

export type Employee = {
    designation?: string
    department?: string
    team?: string
    cell_number?: string
    preferred_email?: string
}


export const useGetEmployee = (userID: string) => {

    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: Employee }>('raven.api.raven_users.get_employee_details', {
        user: userID
    }, ["employee", userID], {
        keepPreviousData: true,
        revalidateIfStale: false
    })

    return {
        employee: data?.message,
        error,
        isLoading,
        mutate
    }
}