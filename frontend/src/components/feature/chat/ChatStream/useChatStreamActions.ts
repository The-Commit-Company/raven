import { useAttachFileToDocument } from '../ChatMessage/MessageActions/AttachFileToDocument'
import { useDeleteMessage } from '../ChatMessage/MessageActions/DeleteMessage'
import { useEditMessage } from '../ChatMessage/MessageActions/EditMessage'
import { useForwardMessage } from '../ChatMessage/MessageActions/ForwardMessage'
import { useMessageReactionAnalytics } from '../ChatMessage/MessageActions/MessageReactionAnalytics'

export const useChatStreamActions = (onModalClose?: () => void) => {
  const deleteActions = useDeleteMessage(onModalClose)
  const editActions = useEditMessage(onModalClose)
  const forwardActions = useForwardMessage(onModalClose)
  const attachDocActions = useAttachFileToDocument(onModalClose)
  const reactionActions = useMessageReactionAnalytics(onModalClose)

  return {
    deleteActions,
    editActions,
    forwardActions,
    attachDocActions,
    reactionActions
  }
}
