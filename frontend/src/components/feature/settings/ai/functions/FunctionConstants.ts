export const FUNCTION_TYPES = [
    {
        value: "Get Document",
        description: "Fetch any document from the system.",
        requires_write_permissions: false
    },
    {
        value: "Get Multiple Documents",
        description: "Fetch multiple document from the system",
        requires_write_permissions: false
    },
    {
        value: "Get List",
        description: "Fetch a list of documents from the system (using filters).",
        requires_write_permissions: false
    },
    {
        value: "Create Document",
        description: "Create any document in the system.",
        requires_write_permissions: true
    },
    {
        value: "Create Multiple Documents",
        description: "Create multiple documents in the system in one go.",
        requires_write_permissions: true
    },
    {
        value: "Update Document",
        description: "Update any document in the system.",
        requires_write_permissions: true
    },
    {
        value: "Update Multiple Documents",
        description: "Update multiple documents in the system in one go.",
        requires_write_permissions: true
    },
    {
        value: "Delete Document",
        description: "Delete any document in the system.",
        requires_write_permissions: true
    },
    {
        value: "Delete Multiple Documents",
        description: "Delete multiple documents in the system in one go.",
        requires_write_permissions: true
    },
    {
        value: "Custom Function",
        description: "Custom function to be used in the system.",
    },
    // { 
    //     value: "Send Message",
    //     description: "Function allows the bot to send a message to any user or channel in the system.",
    //     requires_write_permissions: true
    // },
    {
        value: "Attach File to Document",
        description: "Attach a file to any document.",
        requires_write_permissions: true
    },
    // {
    //     value: "Get Report Result",
    //     description: "Allows the bot to get the result of any report in the system.",
    //     requires_write_permissions: true
    // },
]

export type VariableType = StringVariableType | NumberVariableType | BooleanVariableType | ObjectVariableType | ArrayVariableType

interface BaseVariableType {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
    description: string
    required?: boolean
    enum?: string
    restrictOptions?: boolean
    default?: string
}

interface StringVariableType extends BaseVariableType {
    type: 'string' | 'number'
    enum?: string
    restrictOptions?: boolean
    default?: string
}

interface NumberVariableType extends BaseVariableType {
    type: 'number'
    restrictOptions?: boolean
    enum?: string
    default?: string
}

interface BooleanVariableType extends BaseVariableType {
    type: 'boolean'
    default?: string
}


export interface ObjectVariableType extends BaseVariableType {
    type: 'object'
    properties: Record<string, VariableType>
}

interface ArrayVariableType extends BaseVariableType {
    type: 'array'
    items: VariableType
}