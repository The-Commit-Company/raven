import { Box } from "@chakra-ui/react"
import { useState } from "react"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"

export const ChatInterface = () => {

    const [messages, setMessages] = useState([
        { text: "Hello!", user: "User 1", timestamp: "2023-02-01T12:00:00Z" },
        { text: "Hi there!", user: "User 2", timestamp: "2023-02-01T12:00:00Z" },
        { text: "Ugh, not you guys again...", user: "User 3", timestamp: "2023-02-01T12:00:00Z" },
        { text: "Um, hi everyone", user: "User 4", timestamp: "2023-02-01T12:00:00Z" },
    ])

    const addMessage = (text: string, user: string) => {
        // console.log("called")
        return new Promise<void>(resolve => {
            // console.log("addMessage", text, user)
            setTimeout(() => {
                setMessages([...messages, { text, user, timestamp: new Date().toISOString() }])
                resolve()
            })
        })
    }

    return (
        <Box p={4}>
            <ChatHistory messages={messages} />
            <ChatInput addMessage={addMessage} />
        </Box>
    )
}