import { PropsWithChildren } from "react"
import { FiAlertTriangle } from "react-icons/fi"
import { CustomCallout } from "./CustomCallout"


export const ErrorCallout = ({ children, ...props }: PropsWithChildren<{ message?: string }>) => {
    return (<CustomCallout
        rootProps={{ color: "red" }}
        iconChildren={<FiAlertTriangle size="18" />}
        textChildren={children || props.message || "An error occurred"}
    />)
}