import { RavenAIFunctionParams } from "@/types/RavenAI/RavenAIFunctionParams"
import { BadgeProps } from "@radix-ui/themes"
import { ReactNode } from "react"
import { BaseVariableType } from "./FunctionConstants"

export const getTextAndColorForFieldType = (type: RavenAIFunctionParams['type'] | BaseVariableType['type']): { children: ReactNode, color: BadgeProps['color'] } => {
    switch (type) {
        case 'integer':
            return { children: 'Integer', color: 'blue' }
        case 'number':
            return { children: 'Number', color: 'purple' }
        case 'float':
            return { children: 'Float', color: 'violet' }
        case 'string':
            return { children: 'String', color: 'green' }
        case 'boolean':
            return { children: 'Boolean', color: 'pink' }
        case 'object':
            return { children: 'Object', color: 'orange' }
        case 'array':
            return { children: 'Array', color: 'sky' }
        case 'null':
            return { children: 'Null', color: 'gray' }
    }
}