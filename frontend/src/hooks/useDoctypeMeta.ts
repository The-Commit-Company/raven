import { DocType } from '@/types/Core/DocType'
import { useFrappeGetCall } from 'frappe-react-sdk'

const useDoctypeMeta = (doctype: string) => {
    const { data, isLoading, mutate } = useFrappeGetCall<{ docs: DocType[] }>('frappe.desk.form.load.getdoctype', {
        doctype: doctype
    }, undefined, {
        // 24 hours
        dedupingInterval: 1000 * 60 * 60 * 24,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    const childDocs = data?.docs?.slice(1)

    return {
        doc: data?.docs?.[0],
        childDocs,
        isLoading,
        mutate
    }
}

export default useDoctypeMeta