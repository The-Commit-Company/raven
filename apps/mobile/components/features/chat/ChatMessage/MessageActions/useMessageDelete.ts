import { useCallback, useState } from 'react'
import { useFrappeDeleteDoc, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '@raven/types/common/Message'
import { Poll } from '../Renderers/PollMessage'

const useMessageDelete = (message: Message) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()

    const deleteMessage = (onSuccess: () => void) => {
        deleteDoc('Raven Message', message.name).then(() => {
            //   toast.success('Message deleted', {
            //     duration: 800,
            //   })
            onSuccess()
        })
            .catch(() => {
                // toast.error("Message deletion Failed");
            })
    };

    return { deleteMessage, loading: deletingDoc }
}

export default useMessageDelete