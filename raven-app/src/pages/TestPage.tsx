import { useContext } from "react"
import { ChatInterface } from "../components/feature/chat"
import { UserContext } from "../utils/auth/UserProvider"

type Props = {}

export const TestPage = (props: Props) => {
    return (
        <ChatInterface />
    )
}