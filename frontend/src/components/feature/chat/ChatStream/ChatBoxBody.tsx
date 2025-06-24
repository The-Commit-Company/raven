import { Label } from '@/components/common/Form'
import { HStack, Stack } from '@/components/layout/Stack'
import useFetchChannelMembers, { Member } from '@/hooks/fetchers/useFetchChannelMembers'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useUserData } from '@/hooks/useUserData'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { UserContext } from '@/utils/auth/UserProvider'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box, Checkbox, Flex, IconButton } from '@radix-ui/themes'
import clsx from 'clsx'
import { useSWRConfig } from 'frappe-react-sdk'
import { MutableRefObject, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { BiX } from 'react-icons/bi'
import { useParams } from 'react-router-dom'
import { VirtuosoHandle } from 'react-virtuoso'
import { Message } from '../../../../../../types/Messaging/Message'
import { CustomFile, FileDrop } from '../../file-upload/FileDrop'
import { FileListItem } from '../../file-upload/FileListItem'
import { ArchivedChannelBox } from '../chat-footer/ArchivedChannelBox'
import { JoinChannelBox } from '../chat-footer/JoinChannelBox'
import useFileUpload from '../ChatInput/FileInput/useFileUpload'
import Tiptap from '../ChatInput/Tiptap'
import TypingIndicator from '../ChatInput/TypingIndicator/TypingIndicator'
import { useTyping } from '../ChatInput/TypingIndicator/useTyping'
import { useSendMessage } from '../ChatInput/useSendMessage'
import { ReplyMessageBox } from '../ChatMessage/ReplyMessageBox/ReplyMessageBox'
import ChatStream from './ChatStream'
import { GetMessagesResponse } from './useMessageAPI'

// const randomPlaceholder = COOL_PLACEHOLDERS[Math.floor(Math.random() * (COOL_PLACEHOLDERS?.length))]
interface ChatBoxBodyProps {
  channelData: ChannelListItem | DMChannelListItem
}

// Component chính hiển thị khung nội dung chat của một kênh (channel)
export const ChatBoxBody = ({ channelData }: ChatBoxBodyProps) => {
  // Lấy thông tin user hiện tại (đặc biệt là name để xác định user trong danh sách thành viên)
  const { name: user } = useUserData()

  const { currentUser } = useContext(UserContext)

  const virtuosoRef = useRef<VirtuosoHandle>(null)

  // Fetch danh sách thành viên của channel hiện tại, cũng như trạng thái loading
  const { channelMembers, isLoading } = useFetchChannelMembers(channelData.name)

  // Hook để xử lý trạng thái typing (người dùng đang gõ)
  const { onUserType, onStopTyping } = useTyping(channelData.name)

  // State để lưu thông tin message được chọn để reply
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  // Hàm xử lý khi người dùng chọn reply vào một message
  const handleReplyAction = (message: Message) => {
    setSelectedMessage(message)
  }

  // Hàm reset selected message
  const clearSelectedMessage = () => {
    setSelectedMessage(null)
  }

  // Hook để mutate SWR cache
  const { mutate } = useSWRConfig()

  // Using Virtuoso's ref for scrolling

  // Hàm xử lý khi message được gửi thành công
  const onMessageSendCompleted = (messages: RavenMessage[]) => {
    // Cập nhật cache các tin nhắn của channel

    mutate(
      { path: `get_messages_for_channel_${channelData.name}` },
      (data?: GetMessagesResponse) => {
        if (data && data?.message.has_new_messages) {
          return data // Không thay đổi nếu có tin nhắn mới đang được xử lý
        }

        const existingMessages = data?.message.messages ?? []

        const newMessages = [...existingMessages]

        messages?.forEach((message) => {
          // Kiểm tra nếu tin nhắn đã tồn tại trong mảng tin nhắn hiện có
          const messageIndex = existingMessages.findIndex((m) => m.name === message.name)

          if (messageIndex !== -1) {
            // Nếu tin nhắn đã tồn tại, cập nhật tin nhắn
            // @ts-ignore
            newMessages[messageIndex] = {
              ...message,
              _liked_by: '',
              is_pinned: 0,
              is_continuation: 0
            }
          } else {
            // Nếu tin nhắn không tồn tại, thêm tin nhắn vào mảng
            // @ts-ignore
            newMessages.push({
              ...message,
              _liked_by: '',
              is_pinned: 0,
              is_continuation: 0
            })
          }
        })
        // Trả về danh sách tin nhắn mới đã sort theo thời gian (mới nhất đầu tiên)
        return {
          message: {
            messages: newMessages.sort((a, b) => {
              return new Date(b.creation).getTime() - new Date(a.creation).getTime()
            }),
            has_new_messages: false,
            has_old_messages: data?.message.has_old_messages ?? false
          }
        }
      },
      { revalidate: false }
    )
    // Stop the typing indicator
    onStopTyping()
    // Reset tin nhắn được chọn
    clearSelectedMessage()
  }

  // Lấy thông tin thành viên của user hiện tại trong channel
  const channelMemberProfile: Member | null = useMemo(() => {
    if (user && channelMembers) {
      return channelMembers[user] ?? null
    }
    return null
  }, [user, channelMembers])

  const chatStreamRef = useRef<{ onUpArrow: () => void } | null>(null)

  const onUpArrowPressed = useCallback(() => {
    // Hàm gọi khi người dùng nhấn phím ↑ (dùng để mở lại tin nhắn trước)
    chatStreamRef.current?.onUpArrow()
  }, [])

  const tiptapRef = useRef<{ focusEditor: () => void } | null>(null)

  const isMobile = useIsMobile()

  // Khi modal chỉnh sửa đóng, chúng ta cần focus lại editor
  // Không làm điều này trên mobile vì vậy sẽ mở bàn phím
  const onModalClose = useCallback(() => {
    if (!isMobile) {
      setTimeout(() => {
        tiptapRef.current?.focusEditor()
      }, 50)
    }
  }, [isMobile])

  // Quản lý toàn bộ quá trình upload file đính kèm
  const {
    fileInputRef,
    files,
    setFiles,
    removeFile,
    uploadFiles,
    uploadOneFile,
    addFile,
    fileUploadProgress,
    compressImages,
    setCompressImages
  } = useFileUpload(channelData.name)

  // Gửi tin nhắn (có kèm file và reply message nếu có)
  const { sendMessage, loading, pendingMessages, sendOnePendingMessage, removePendingMessage } = useSendMessage(
    channelData.name,
    uploadFiles, // <--- param 2
    uploadOneFile, // <--- param 3 - CÁI BẠN BỊ THIẾU
    onMessageSendCompleted, // <--- param 4
    selectedMessage // <--- param 5
  )

  // Component hiển thị preview của tin nhắn đang được trả lời
  const PreviousMessagePreview = ({ selectedMessage }: { selectedMessage: any }) => {
    if (selectedMessage) {
      return (
        <ReplyMessageBox
          justify='between'
          align='center'
          className='m-2'
          message={selectedMessage}
          currentUser={currentUser}
        >
          <IconButton color='gray' size='1' variant='soft' onClick={clearSelectedMessage}>
            <BiX size='20' />
          </IconButton>
        </ReplyMessageBox>
      )
    }
    return null
  }

  // Xác định xem người dùng có thể gửi tin nhắn không và có nên hiển thị hộp tham gia không
  const { canUserSendMessage, shouldShowJoinBox } = useMemo(() => {
    if (channelData.is_archived) {
      return {
        canUserSendMessage: false,
        shouldShowJoinBox: false
      }
    }

    if (channelData.type === 'Open') {
      return {
        canUserSendMessage: true,
        shouldShowJoinBox: false
      }
    }

    if (channelMemberProfile) {
      return {
        canUserSendMessage: true,
        shouldShowJoinBox: false
      }
    }

    const isDM = channelData?.is_direct_message === 1 || channelData?.is_self_message === 1

    // Nếu thông tin thành viên không tồn tại và không phải là DM, thì hiển thị hộp tham gia
    if (!channelMemberProfile && !isDM && channelData && !isLoading) {
      return {
        shouldShowJoinBox: true,
        canUserSendMessage: false
      }
    }

    return { canUserSendMessage: false, shouldShowJoinBox: false }
  }, [channelMemberProfile, channelData, isLoading])

  const { threadID } = useParams()

  return (
    <ChatBoxBodyContainer>
      <FileDrop // Component cho phép kéo thả file.
        files={files}
        ref={fileInputRef}
        onFileChange={setFiles}
        width={threadID ? 'w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]' : undefined}
        maxFiles={10}
        maxFileSize={10000000}
      >
        <ChatStream
          channelID={channelData.name}
          onModalClose={onModalClose}
          pinnedMessagesString={channelData.pinned_messages_string}
          replyToMessage={handleReplyAction}
          virtuosoRef={virtuosoRef as MutableRefObject<VirtuosoHandle>}
          ref={chatStreamRef as any}
          pendingMessages={pendingMessages}
          sendOnePendingMessage={sendOnePendingMessage}
          removePendingMessage={removePendingMessage}
        />
        {/* Chỉ hiển thị khu vực nhập liệu nếu người dùng có quyền gửi tin nhắn. */}
        {canUserSendMessage && (
          <Stack>
            <TypingIndicator channel={channelData.name} />
            <Tiptap
              key={channelData.name}
              channelID={channelData.name}
              fileProps={{
                fileInputRef,
                addFile
              }}
              ref={tiptapRef}
              onUpArrow={onUpArrowPressed}
              clearReplyMessage={clearSelectedMessage}
              channelMembers={channelMembers}
              onUserType={onUserType}
              replyMessage={selectedMessage}
              sessionStorageKey={`tiptap-${channelData.name}`}
              onMessageSend={sendMessage}
              messageSending={loading}
              slotBefore={
                <Flex direction='column' justify='center' hidden={!selectedMessage && !files?.length}>
                  {selectedMessage && <PreviousMessagePreview selectedMessage={selectedMessage} />}
                  {files && files?.length > 0 && (
                    <Flex gap='2' width='100%' align='stretch' px='2' p='2' wrap='wrap'>
                      {files?.map((f: CustomFile) => (
                        <Box className='grow-0' key={f.fileID}>
                          <FileListItem
                            file={f}
                            uploadProgress={fileUploadProgress}
                            removeFile={() => removeFile(f.fileID)}
                          />
                        </Box>
                      ))}
                    </Flex>
                  )}
                  {files?.length !== 0 && (
                    <CompressImageCheckbox compressImages={compressImages} setCompressImages={setCompressImages} />
                  )}
                </Flex>
              }
            />
          </Stack>
        )}
        {/* Hiển thị hộp "Tham gia kênh" nếu cần. */}
        {shouldShowJoinBox ? <JoinChannelBox channelData={channelData} user={user} /> : null}
        {/* Hiển thị hộp thông báo kênh đã được lưu trữ nếu cần. */}
        <ArchivedChannelBox
          channelID={channelData.name}
          isArchived={channelData.is_archived}
          isMemberAdmin={channelMemberProfile?.is_admin}
        />
      </FileDrop>
    </ChatBoxBodyContainer>
  )
}

// Checkbox để chọn xem có muốn nén ảnh không
const CompressImageCheckbox = ({
  compressImages,
  setCompressImages
}: {
  compressImages: boolean
  setCompressImages: (compressImages: boolean) => void
}) => {
  return (
    <div className='px-3'>
      <Label size='2' weight='regular'>
        <HStack align='center' gap='2'>
          <Checkbox
            checked={compressImages}
            onCheckedChange={() => {
              setCompressImages(!compressImages)
            }}
          />
          Compress Images
        </HStack>
      </Label>
    </div>
  )
}

// Container để chứa chat box body
const ChatBoxBodyContainer = ({ children }: { children: React.ReactNode }) => {
  const { threadID } = useParams()

  return (
    <div
      className={clsx('flex flex-col overflow-hidden px-2 pt-16 justify-end h-full', threadID ? 'sm:pl-4' : 'sm:px-4')}
    >
      {children}
    </div>
  )
}
