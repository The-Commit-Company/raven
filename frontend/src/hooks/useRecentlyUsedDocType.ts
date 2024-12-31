import { useMemo } from 'react'

const useRecentlyUsedDocType = () => {

    const recentlyUsedDoctypes = useMemo(() => {
        const existingItems = sessionStorage.getItem(`recently-used-doctype`) ?? '[]'
        return JSON.parse(existingItems).map((doctype: string) => ({
            value: doctype,
            description: "Recently used"
        }))
    }, [])

    const addRecentlyUsedDocType = (doctype: string) => {
        // Save recently used doctype to session storage
        const existingItems = sessionStorage.getItem(`recently-used-doctype`) ?? '[]'
        let recentlyUsedDoctypes = JSON.parse(existingItems)
        if (!recentlyUsedDoctypes.includes(doctype)) {
            recentlyUsedDoctypes = [doctype, ...recentlyUsedDoctypes].slice(0, 5)
        }
        sessionStorage.setItem(`recently-used-doctype`, JSON.stringify(recentlyUsedDoctypes))
    }

    return {
        recentlyUsedDoctypes,
        addRecentlyUsedDocType
    }
}

export default useRecentlyUsedDocType