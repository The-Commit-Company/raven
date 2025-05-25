import AttachFileToDocumentDialog from '../ChatMessage/MessageActions/AttachFileToDocument'
import { DeleteMessageDialog } from '../ChatMessage/MessageActions/DeleteMessage'
import { EditMessageDialog } from '../ChatMessage/MessageActions/EditMessage'
import { ForwardMessageDialog } from '../ChatMessage/MessageActions/ForwardMessage'
import { ReactionAnalyticsDialog } from '../ChatMessage/MessageActions/MessageReactionAnalytics'

interface ChatDialogsProps {
  deleteProps: any
  editProps: any
  forwardProps: any
  attachDocProps: any
  reactionProps: any
}

export const ChatDialogs = ({
  deleteProps,
  editProps,
  forwardProps,
  attachDocProps,
  reactionProps
}: ChatDialogsProps) => {
  return (
    <>
      <DeleteMessageDialog {...deleteProps} />
      <EditMessageDialog {...editProps} />
      <ForwardMessageDialog {...forwardProps} />
      <AttachFileToDocumentDialog {...attachDocProps} />
      <ReactionAnalyticsDialog {...reactionProps} />
    </>
  )
}
