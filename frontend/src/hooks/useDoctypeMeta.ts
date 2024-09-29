import { useFrappeGetCall } from 'frappe-react-sdk'

const useDoctypeMeta = (doctype: string) => {
    const { data, isLoading } = useFrappeGetCall('frappe.desk.form.load.getdoctype', {
        doctype: doctype
    }, undefined, {
        // 24 hours
        dedupingInterval: 1000 * 60 * 60 * 24,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    return {
        doc: data?.docs?.[0],
        isLoading
    }
}

export default useDoctypeMeta