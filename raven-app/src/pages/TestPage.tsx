import { useContext } from "react"
import { ChatInterface } from "../components/feature/chat"
import { UserContext } from "../utils/auth/UserProvider"

type Props = {}

export const TestPage = (props: Props) => {
    const { currentUser } = useContext(UserContext)
    console.log(currentUser)
    return (
        <ChatInterface />
    )
}