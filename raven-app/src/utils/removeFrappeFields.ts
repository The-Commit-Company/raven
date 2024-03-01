import { FrappeDoc } from "frappe-react-sdk";

type BaseFields = 'owner' | 'creation' | 'modified' | 'modified_by' | 'docstatus';
type ChildFields = 'parent' | 'parenttype' | 'parentfield';
export const removeFrappeFields = <T>(data: FrappeDoc<T>): Omit<FrappeDoc<T>, BaseFields> => {

    try {
        const { owner, creation, modified, modified_by, docstatus, ...withoutBaseFields } = data;
        return withoutBaseFields;
    }
    catch (e) {
        return data
    }
}