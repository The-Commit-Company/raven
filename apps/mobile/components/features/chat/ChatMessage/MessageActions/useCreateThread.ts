import { useState } from "react"
import { useFrappePostCall } from "frappe-react-sdk"
import { Message } from "@raven/types/common/Message"

const useCreateThread = (message: Message) => {
  const { call } = useFrappePostCall("raven.api.threads.create_thread")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateThread = (onSuccess: () => void) => {
    setIsLoading(true)
    return call({ message_id: message?.name })
      .then((res) => {
        // toast.success("Thread created successfully!")
        onSuccess()
      })
      .catch(() => {
        // toast.error("Failed to create thread")
        throw new Error("Failed to create thread")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return {
    createThread: handleCreateThread,
    isLoading,
  }
}

export default useCreateThread
