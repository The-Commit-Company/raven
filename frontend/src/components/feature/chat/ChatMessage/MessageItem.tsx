import { UserAvatar, getInitials } from '@/components/common/UserAvatar'
import OnLeaveBadge from '@/components/common/UserLeaveBadge'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { Stack } from '@/components/layout/Stack'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import useOutsideClick from '@/hooks/useOutsideClick'
import { UserContext } from '@/utils/auth/UserProvider'
import { UserFields } from '@/utils/users/UserListProvider'
import { Avatar, Badge, Box, BoxProps, Button, ContextMenu, Flex, HoverCard, Text, Theme } from '@radix-ui/themes'
import { clsx } from 'clsx'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BiChat } from 'react-icons/bi'
import { BsFillCircleFill } from 'react-icons/bs'
import { RiPushpinFill, RiRobot2Fill, RiShareForwardFill } from 'react-icons/ri'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useDoubleTap } from 'use-double-tap'
import { Message, MessageBlock } from '../../../../../../types/Messaging/Message'
import { generateAvatarColor } from '../../selectDropdowns/GenerateAvatarColor'
import { getStatusText } from '../../userSettings/AvailabilityStatus/SetUserAvailabilityMenu'
import { LeftRightLayout } from './LeftRightLayout/LeftRightLayout'
import { MessageContextMenu } from './MessageActions/MessageActions'
import { QuickActions } from './MessageActions/QuickActions/QuickActions'
import { MessageReactions } from './MessageReactions'
import { MessageSeenStatus } from './MessageSeenStatus'
import { DateTooltip, DateTooltipShort } from './Renderers/DateTooltip'
import { DoctypeLinkRenderer } from './Renderers/DoctypeLinkRenderer'
import { FileMessageBlock } from './Renderers/FileMessage'
import { ImageMessageBlock } from './Renderers/ImageMessage'
import { PollMessageBlock } from './Renderers/PollMessage'
import { ThreadMessage } from './Renderers/ThreadMessage'
import { TiptapRenderer } from './Renderers/TiptapRenderer/TiptapRenderer'
import { ReplyMessageBox } from './ReplyMessageBox/ReplyMessageBox'
import RetractedMessage from './RetractedMessage'

interface SeenUser {
  name: string
  full_name: string
  user_image: string
}

interface MessageBlockProps {
  message: Message
  setDeleteMessage: (message: Message) => void
  setEditMessage: (message: Message) => void
  replyToMessage: (message: Message) => void
  forwardMessage: (message: Message) => void
  onReplyMessageClick: (messageID: string) => void
  onAttachDocument: (message: Message) => void
  isHighlighted?: boolean
  setReactionMessage: (message: Message) => void
  showThreadButton?: boolean
  seenUsers: SeenUser[]
  channel: any
  isThinking?: boolean
  isPending?: boolean
  removePendingMessage: (id: string) => void
  sendOnePendingMessage: (id: string) => void
}

export const MessageItem = React.memo(
  ({
    message,
    setDeleteMessage,
    isHighlighted,
    onReplyMessageClick,
    setEditMessage,
    replyToMessage,
    forwardMessage,
    onAttachDocument,
    setReactionMessage,
    showThreadButton = true,
    seenUsers,
    channel,
    isThinking = false,
    isPending,
    removePendingMessage,
    sendOnePendingMessage
  }: MessageBlockProps) => {
    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [selectedText, setSelectedText] = useState('')
    const [isHovered, setIsHovered] = useState(false)

    const {
      owner: userID,
      is_bot_message,
      bot,
      creation: timestamp,
      message_reactions,
      is_continuation,
      linked_message,
      replied_message_details,
      is_retracted
    } = message

    // Lấy thông tin người dùng và trạng thái hoạt động
    const { user, isActive } = useGetUserDetails(is_bot_message && bot ? bot : userID)

    // Xử lý sự kiện xóa tin nhắn
    const onDelete = () => {
      setDeleteMessage(message)
    }

    // Xử lý sự kiện chỉnh sửa tin nhắn
    const onEdit = () => {
      setEditMessage(message)
    }

    // Xử lý sự kiện trả lời tin nhắn
    const onReply = () => {
      replyToMessage(message)
    }

    // Xử lý sự kiện chuyển tiếp tin nhắn
    const onForward = () => {
      forwardMessage(message)
    }

    // Xử lý sự kiện đính kèm vào tài liệu
    const onAttachToDocument = () => {
      onAttachDocument(message)
    }

    // Xử lý sự kiện xem reaction
    const onViewReaction = () => {
      setReactionMessage(message)
    }

    // Kiểm tra xem có phải là thiết bị desktop không
    const isDesktop = useIsDesktop()

    // State để theo dõi trạng thái hover
    const isHoveredDebounced = useDebounce(isHovered, isDesktop ? 400 : 200)

    // Xử lý sự kiện khi di chuột vào
    const onMouseEnter = () => {
      if (isDesktop) {
        setIsHovered(true)
      }
    }

    // Xử lý sự kiện khi di chuột ra
    const onMouseLeave = () => {
      if (isDesktop) {
        setIsHovered(false)
      }
    }

    // Cho thiết bị di động: hiển thị quick actions khi nhấn đúp
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bind = useDoubleTap((event) => {
      if (!isDesktop) setIsHovered(!isHovered)
    })

    // Xử lý sự kiện click bên ngoài để đóng quick actions trên mobile
    const ref = useOutsideClick(() => {
      if (!isDesktop) setIsHovered(false)
    })

    // Xử lý chi tiết tin nhắn được trả lời
    const replyMessageDetails = useMemo(() => {
      if (typeof replied_message_details === 'string') {
        return JSON.parse(replied_message_details)
      } else {
        return replied_message_details
      }
    }, [replied_message_details])

    // @ts-ignore
    const CHAT_STYLE = window.frappe?.boot?.chat_style ?? 'Simple' // Lấy kiểu chat từ cấu hình

    // Xử lý sự kiện thay đổi menu ngữ cảnh (chuột phải)
    const onContextMenuChange = (open: boolean) => {
      if (open) {
        const selection = document.getSelection()
        if (selection) {
          setSelectedText(selection.toString().trim())
        }
      } else {
        setSelectedText('')
      }
    }

    const messageRef = useRef<HTMLDivElement>(null)
    const { currentUser } = useContext(UserContext)
    const [hasBeenSeen, setHasBeenSeen] = useState(false)

    useEffect(() => {
      if (!currentUser || message.owner !== currentUser) return

      const messageTime = new Date(message.creation).getTime()
      const isSeen = seenUsers.some(
        (user: any) => user.user !== currentUser && new Date(user.seen_at).getTime() >= messageTime
      )

      setHasBeenSeen(isSeen)
    }, [message.creation, message.owner, currentUser, seenUsers])

    const seenByOthers = useMemo(() => {
      if (!seenUsers?.length || !message?.creation || !currentUser) return []

      return seenUsers.filter(
        (user: any) =>
          user.user !== currentUser && new Date(user.seen_at).getTime() >= new Date(message.creation).getTime()
      )
    }, [seenUsers, message.creation, currentUser])

    const unseenByOthers = useMemo(() => {
      if (!seenUsers?.length || !message?.creation || !currentUser) return []

      return seenUsers.filter(
        (user: any) =>
          user.user !== currentUser && new Date(user.seen_at).getTime() < new Date(message.creation).getTime()
      )
    }, [seenUsers, message.creation, currentUser])

    const isSaved = JSON.parse(message._liked_by ? message._liked_by : '[]').includes(currentUser)

    return (
      <div ref={messageRef}>
        {CHAT_STYLE === 'Left-Right' ? (
          // Sử dụng LeftRightLayout nếu kiểu chat là 'Left-Right'
          <LeftRightLayout
            message={message}
            user={user}
            isActive={isActive}
            isHighlighted={isHighlighted}
            onReplyMessageClick={onReplyMessageClick}
            onDelete={onDelete}
            showThreadButton={showThreadButton}
            onEdit={onEdit}
            onReply={onReply}
            onForward={onForward}
            onViewReaction={onViewReaction}
            onAttachToDocument={onAttachToDocument}
            hasBeenSeen={hasBeenSeen}
            seenByOthers={seenByOthers}
            channel={channel}
            unseenByOthers={unseenByOthers}
            isThinking={isThinking}
            is_retracted={is_retracted}
            isPending={isPending}
            removePendingMessage={removePendingMessage}
            sendOnePendingMessage={sendOnePendingMessage}
          />
        ) : (
          // Sử dụng layout mặc định nếu không phải 'Left-Right'
          <Box className='relative'>
            {!message.is_continuation && message.is_thread ? (
              <div
                className={`absolute
                        border-l
                        border-b
                        border-gray-5
                        h-[calc(100%-66px)]
                        rounded-bl-lg
                        w-6
                        top-[42px]
                        left-6 z-0`}
              ></div>
            ) : null}

            {is_retracted === 1 ? (
              <div
                className={clsx(
                  `group
                select-none
                sm:select-auto
                data-[state=open]:shadow-sm
                transition-colors
                px-1
                py-1.5
                sm:p-1.5
                rounded-md`
                )}
              >
                <Flex className='gap-2.5 sm:gap-3 items-start'>
                  <MessageLeftElement message={message} user={user} isActive={isActive} />
                  <RetractedMessage
                    message={message}
                    user={user}
                    currentUser={currentUser || ''}
                    alignToRight={false}
                    timestamp={timestamp}
                    is_continuation={is_continuation}
                  />
                </Flex>
              </div>
            ) : (
              <ContextMenu.Root modal={false} onOpenChange={onContextMenuChange}>
                <ContextMenu.Trigger
                  {...bind}
                  ref={ref}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  className={clsx(
                    `group
                select-none
                sm:select-auto
                data-[state=open]:shadow-sm
                transition-colors
                px-1
                py-1.5
                sm:p-1.5
                rounded-md`,
                    // Thêm padding top nếu không phải là tin nhắn tiếp nối
                    is_continuation ? '' : 'pt-2.5 sm:pt-3',
                    // Đổi màu nền nếu được làm nổi bật hoặc đang hover
                    isHighlighted
                      ? 'bg-yellow-50 hover:bg-yellow-50 dark:bg-yellow-300/20 dark:hover:bg-yellow-300/20'
                      : !isDesktop && isHovered
                        ? 'bg-gray-2 dark:bg-gray-3'
                        : '',
                    // Đổi màu nền khi mở emoji picker
                    isEmojiPickerOpen ? 'bg-gray-2 dark:bg-gray-3' : '',
                    isThinking && 'animate-pulse',
                    isPending && 'animate-pulse'
                  )}
                >
                  {/* Nội dung chính của tin nhắn */}
                  <Flex className='gap-2.5 sm:gap-3 items-start'>
                    {/* Hiển thị avatar hoặc thời gian nếu là tin nhắn tiếp nối */}
                    <MessageLeftElement message={message} user={user} isActive={isActive} />
                    {/* Nội dung chi tiết của tin nhắn */}
                    <Flex
                      direction='column'
                      justify='center'
                      className='gap-0.5 w-fit max-w-full relative'
                      style={{ maxWidth: 'min(100%, calc(100% - 70px))' }}
                    >
                      {/* Hiển thị thông tin người gửi và thời gian nếu không phải là tin nhắn tiếp nối */}
                      {!is_continuation ? (
                        <Flex align='center' gap='2' mt='-1'>
                          {/* Hiển thị thông tin người gửi khi hover */}
                          <UserHoverCard user={user} userID={userID} isActive={isActive} />
                          {/* Hiển thị thời gian với tooltip */}
                          <DateTooltip timestamp={timestamp} />
                        </Flex>
                      ) : null}
                      {/* Nội dung tin nhắn */}
                      {/* Hiển thị biểu tượng nếu là tin nhắn được chuyển tiếp */}
                      {message.is_forwarded === 1 && (
                        <Flex className='text-gray-10 text-xs' gap={'1'} align={'center'}>
                          <RiShareForwardFill size='12' /> Chuyển tiếp
                        </Flex>
                      )}
                      {/* Hiển thị biểu tượng nếu tin nhắn được ghim */}
                      {message.is_pinned === 1 && (
                        <Flex className='text-accent-9 text-xs' gap={'1'} align={'center'}>
                          <RiPushpinFill size='12' /> Ghim
                        </Flex>
                      )}
                      {isSaved && (
                        <Flex className='text-accent-9 text-xs' gap={'1'} align={'center'}>
                          <RiPushpinFill size='12' /> Đã gắn cờ
                        </Flex>
                      )}
                      {/* Hiển thị tin nhắn được trả lời nếu có */}
                      {linked_message && replied_message_details && (
                        <ReplyMessageBox
                          className='sm:min-w-[28rem] cursor-pointer mb-1'
                          role='button'
                          onClick={() => onReplyMessageClick(linked_message)}
                          message={replyMessageDetails}
                          currentUser={currentUser}
                        />
                      )}
                      {/* Hiển thị nội dung tin nhắn tùy theo loại */}
                      <MessageContent
                        removePendingMessage={removePendingMessage}
                        sendOnePendingMessage={sendOnePendingMessage}
                        message={message}
                        user={user}
                        currentUser={currentUser}
                      />
                      {/* Hiển thị liên kết tài liệu nếu có */}
                      {message.link_doctype && message.link_document && (
                        <Box className={clsx(message.is_continuation ? 'ml-0.5' : '-ml-0.5')}>
                          <DoctypeLinkRenderer doctype={message.link_doctype} docname={message.link_document} />
                        </Box>
                      )}
                      {/* Hiển thị dấu hiệu đã chỉnh sửa nếu tin nhắn được sửa */}
                      {message.is_edited === 1 && (
                        <Text size='1' className='text-gray-10'>
                          (edited)
                        </Text>
                      )}
                      {/* Hiển thị các reaction của tin nhắn */}
                      {!isPending && message_reactions?.length && (
                        <MessageReactions message={message} message_reactions={message_reactions} />
                      )}
                      {/* Hiển thị thông tin luồng nếu đây là tin nhắn trong luồng */}
                      {message.is_thread === 1 ? <ThreadMessage thread={message} /> : null}
                      {!isPending && (
                        <div className='absolute bottom-0 -right-5'>
                          <MessageSeenStatus
                            hasBeenSeen={hasBeenSeen}
                            channelType={channel?.type}
                            seenByOthers={seenByOthers}
                            unseenByOthers={unseenByOthers}
                            currentUserOwnsMessage={message.owner === currentUser}
                          />
                        </div>
                      )}
                    </Flex>
                    {/* Hiển thị các hành động nhanh khi hover hoặc mở emoji picker */}
                    {!isPending && (isHoveredDebounced || isEmojiPickerOpen) && (
                      <QuickActions
                        message={message}
                        onDelete={onDelete}
                        isEmojiPickerOpen={isEmojiPickerOpen}
                        setIsEmojiPickerOpen={setEmojiPickerOpen}
                        onEdit={onEdit}
                        onReply={onReply}
                        onForward={onForward}
                        showThreadButton={showThreadButton}
                        onAttachDocument={onAttachToDocument}
                      />
                    )}
                  </Flex>
                </ContextMenu.Trigger>

                <MessageContextMenu
                  message={message}
                  onDelete={onDelete}
                  showThreadButton={showThreadButton}
                  onEdit={onEdit}
                  onReply={onReply}
                  onForward={onForward}
                  onViewReaction={onViewReaction}
                  selectedText={selectedText}
                  onAttachDocument={onAttachToDocument}
                />
              </ContextMenu.Root>
            )}
          </Box>
        )}
      </div>
    )
  }
)

// Props cho component MessageLeftElement
type MessageLeftElementProps = BoxProps & {
  message: MessageBlock['data']
  user?: UserFields
  isActive?: boolean
}

/**
 * Component hiển thị avatar hoặc thời gian của tin nhắn
 * - Nếu là tin nhắn tiếp nối: hiển thị thời gian (chỉ hiện khi hover)
 * - Ngược lại: hiển thị avatar người gửi
 */
const MessageLeftElement = ({ message, className, user, isActive, ...props }: MessageLeftElementProps) => {
  return (
    <Box
      className={clsx(
        // Ẩn khi là tin nhắn tiếp nối, chỉ hiện khi hover vào nhóm
        message.is_continuation ? 'invisible group-hover:visible flex items-center w-[32px]' : '',
        className
      )}
      {...props}
    >
      {message.is_continuation ? (
        // Hiển thị thời gian cho tin nhắn tiếp nối
        <Box className='-mt-0.5'>
          <DateTooltipShort timestamp={message.creation} />
        </Box>
      ) : (
        // Hiển thị avatar người gửi
        <MessageSenderAvatar userID={message.owner} user={user} isActive={isActive} />
      )}
    </Box>
  )
}

/**
 * Hook tùy chỉnh để lấy thông tin chi tiết người dùng
 * @param userID - ID của người dùng cần lấy thông tin
 * @returns Đối tượng chứa thông tin người dùng và trạng thái hoạt động
 */
export const useGetUserDetails = (userID: string) => {
  // Lấy thông tin người dùng từ hook useGetUser
  const user = useGetUser(userID)

  // Kiểm tra trạng thái hoạt động của người dùng
  const isActive = useIsUserActive(userID)

  return { user, isActive }
}

// Định nghĩa props cho các component liên quan đến người dùng
interface UserProps {
  user?: UserFields
  userID: string
  isActive?: boolean
}
/**
 * Component hiển thị avatar người gửi kèm trạng thái
 * - Hiển thị ảnh đại diện hoặc tên viết tắt
 * - Hiển thị chỉ báo trạng thái (online, away, do not disturb)
 * - Hiển thị biểu tượng bot nếu là tài khoản bot
 */
export const MessageSenderAvatar = memo(({ user, userID, isActive = false }: UserProps) => {
  // Lấy tên hiển thị, mặc định là userID nếu không có tên
  const alt = user?.full_name ?? userID
  // Kiểm tra có phải là bot không
  const isBot = user?.type === 'Bot'
  // Tạo màu avatar dựa trên tên người dùng
  const color = useMemo(() => generateAvatarColor(user?.full_name ?? userID), [user?.full_name, userID])
  // Lấy trạng thái hiện tại của người dùng
  const availabilityStatus = user?.availability_status

  return (
    // Sử dụng theme với màu được tạo từ tên người dùng
    <Theme accentColor={color}>
      <span className='relative inline-block'>
        {/* Avatar chính */}
        <Avatar
          src={user?.user_image}
          alt={alt}
          loading='lazy'
          fallback={getInitials(alt)}
          size={'2'}
          radius={'medium'}
        />

        {/* Hiển thị chỉ báo trạng thái "Away" (vàng) */}
        {availabilityStatus && availabilityStatus === 'Away' && (
          <span
            className={clsx(
              'absolute block translate-x-1/2 translate-y-1/2 transform rounded-full',
              'bottom-0.5 right-0.5'
            )}
          >
            <span className='block h-2 w-2 rounded-full border border-slate-2 bg-[#FFAA33] shadow-md' />
          </span>
        )}

        {/* Hiển thị chỉ báo trạng thái "Do not disturb" (đỏ) */}
        {availabilityStatus && availabilityStatus === 'Do not disturb' && (
          <span
            className={clsx(
              'absolute block translate-x-1/2 translate-y-1/2 transform rounded-full',
              'bottom-0.5 right-0.5'
            )}
          >
            <span className='block h-2 w-2 rounded-full border border-slate-2 bg-[#D22B2B] shadow-md' />
          </span>
        )}

        {/* Hiển thị chỉ báo trạng thái online (xanh lá) nếu không phải Away hoặc Do not disturb và đang hoạt động */}
        {availabilityStatus !== 'Away' && availabilityStatus !== 'Do not disturb' && isActive && (
          <span
            className={clsx(
              'absolute block translate-x-1/2 translate-y-1/2 transform rounded-full',
              'bottom-0.5 right-0.5'
            )}
          >
            <span className='block h-2 w-2 rounded-full border border-slate-2 bg-green-600 shadow-md' />
          </span>
        )}

        {/* Hiển thị biểu tượng bot nếu là tài khoản bot */}
        {isBot && (
          <span className='absolute block translate-x-1/2 translate-y-1/2 transform rounded-full bottom-0.5 right-0.5'>
            <RiRobot2Fill className='text-accent-11 dark:text-accent-11' size='16px' />
          </span>
        )}
      </span>
    </Theme>
  )
})

/**
 * Component hiển thị thông tin người dùng khi hover vào tên
 * - Hiển thị ảnh đại diện lớn hơn
 * - Hiển thị tên đầy đủ và trạng thái
 * - Hiển thị nút bắt đầu chat riêng
 */
export const UserHoverCard = memo(({ user, userID, isActive }: UserProps) => {
  const { isBot, fullName, userImage, availabilityStatus, customStatus } = useMemo(() => {
    return {
      fullName: user?.full_name ?? userID,
      availabilityStatus: user?.availability_status,
      customStatus: user?.custom_status,
      userImage: user?.user_image ?? '',
      isBot: user?.type === 'Bot'
    }
  }, [user, userID])

  return (
    <HoverCard.Root>
      {/* Kích hoạt khi hover */}
      <HoverCard.Trigger>
        <Text className='text-gray-12 flex items-center gap-1' weight='medium' size='2'>
          {fullName} {/* Hiển thị badge nếu là bot */}
          {isBot && (
            <Badge color='gray' className='font-semibold px-1 py-0'>
              Bot
            </Badge>
          )}
        </Text>
      </HoverCard.Trigger>

      {/* Nội dung hiển thị khi hover */}
      <HoverCard.Content size='1'>
        <Stack>
          {/* Phần thông tin chính */}
          <Flex gap='2' align='center'>
            {/* Avatar lớn hơn */}
            <UserAvatar src={userImage} alt={fullName} size='4' isBot={isBot} />

            <Flex direction='column'>
              {/* Tên và trạng thái */}
              <Flex gap='3' align='center'>
                <Text className='text-gray-12' weight='bold' size='3'>
                  {fullName}
                </Text>

                {/* Hiển thị trạng thái nếu được đặt và không phải là 'Invisible' */}
                {availabilityStatus && availabilityStatus !== 'Invisible' && (
                  <Flex className='text-gray-10 text-xs flex gap-1 items-center'>
                    {getStatusText(availabilityStatus)}
                  </Flex>
                )}

                {/* Chỉ hiển thị trạng thái online nếu người dùng không đặt trạng thái tùy chỉnh */}
                {!availabilityStatus && isActive && (
                  <Flex gap='1' align='center'>
                    <BsFillCircleFill color={'green'} size='8' />
                    <Text className='text-gray-10' size='1'>
                      Online
                    </Text>
                  </Flex>
                )}
              </Flex>

              {/* Hiển thị thông tin nghỉ phép nếu có */}
              {user && !isBot && <OnLeaveBadge userID={user.name} />}

              {/* Hiển thị trạng thái tùy chỉnh hoặc tên đăng nhập */}
              {customStatus ? (
                <Text className='text-gray-11' size='1'>
                  {customStatus}
                </Text>
              ) : (
                user &&
                !isBot && (
                  <Text className='text-gray-11' size='1'>
                    {user?.name}
                  </Text>
                )
              )}
            </Flex>
          </Flex>

          {/* Nút bắt đầu chat riêng */}
          <StartDMButton userID={userID} />
        </Stack>
      </HoverCard.Content>
    </HoverCard.Root>
  )
})

/**
 * Component nút bắt đầu chat riêng (Direct Message)
 * - Tạo kênh chat riêng với người dùng được chọn
 * - Chuyển hướng đến kênh chat mới tạo
 */
const StartDMButton = ({ userID }: { userID: string }) => {
  // Lấy hàm call từ FrappeContext để thực hiện API calls
  const { call } = useContext(FrappeContext) as FrappeConfig

  // Hook để điều hướng giữa các trang
  const navigate = useNavigate()

  // Lấy workspaceID từ URL hiện tại
  const { workspaceID } = useParams()

  // Xử lý khi nhấn nút bắt đầu chat
  const onClick = () => {
    if (userID) {
      // Gọi API để tạo kênh chat riêng
      call
        .post('raven.api.raven_channel.create_direct_message_channel', {
          user_id: userID // ID của người dùng muốn nhắn tin
        })
        .then((res) => {
          // Chuyển hướng đến kênh chat mới tạo
          navigate(`/${workspaceID}/${res?.message}`)
        })
        .catch((err) => {
          // Hiển thị thông báo lỗi nếu có lỗi xảy ra
          toast.error('Không thể tạo kênh chat riêng', {
            description: getErrorMessage(err)
          })
        })
    }
  }

  return (
    <Button
      variant='soft' // Kiểu nút mềm
      className='not-cal' // Loại trừ khỏi lịch (nếu có)
      size='1' // Kích thước nhỏ
      onClick={onClick} // Xử lý khi nhấn
    >
      <BiChat size='14' /> Message {/* Icon chat và văn bản */}
    </Button>
  )
}

/**
 * Định nghĩa props cho component MessageContent
 * @extends BoxProps - Các thuộc tính cơ bản của Box
 */
type MessageContentProps = BoxProps & {
  user?: UserFields // Thông tin người gửi (tùy chọn)
  currentUser: string | null | undefined // Thống tin người dùng hien tại (tùy chọn)
  message: Message // Đối tượng tin nhắn
  forceHideLinkPreview?: boolean // Có ẩn xem trước liên kết không (tùy chọn, mặc định là false)
  removePendingMessage: (id: string) => void
  sendOnePendingMessage: (id: string) => void
}

/**
 * Component hiển thị nội dung tin nhắn dựa trên loại tin nhắn
 * - Xử lý hiển thị các loại tin nhắn khác nhau: văn bản, hình ảnh, file, khảo sát
 * - Hỗ trợ xem trước liên kết (link preview)
 */
// export const MessageContent = ({
//   message,
//   user,
//   currentUser,
//   forceHideLinkPreview = false,
//   ...props
// }: MessageContentProps) => {
//   return (
//     <Box {...props}>
//       {/* Hiển thị nội dung văn bản nếu có */}
//       {message.text ? (
//         <TiptapRenderer
//           message={{
//             ...message, // Giữ nguyên tất cả thuộc tính của tin nhắn
//             message_type: 'Text' // Đảm bảo loại tin nhắn là Text
//           }}
//           user={user} // Thông tin người gửi
//           currentUser={currentUser} // Thống tin người dùng hien tại
//           // Quyết định có hiển thị xem trước liên kết không
//           // Nếu forceHideLinkPreview = true hoặc message.hide_link_preview = true thì ẩn, ngược lại hiển thị
//           showLinkPreview={forceHideLinkPreview ? false : message.hide_link_preview ? false : true}
//         />
//       ) : null}

//       {/* Hiển thị hình ảnh nếu loại tin nhắn là Image */}
//       {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}

//       {/* Hiển thị file đính kèm nếu loại tin nhắn là File */}
//       {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}

//       {/* Hiển thị khảo sát nếu loại tin nhắn là Poll */}
//       {message.message_type === 'Poll' && <PollMessageBlock message={message} user={user} />}
//     </Box>
//   )
// }

// export const MessageContent = ({
//   message,
//   user,
//   currentUser,
//   forceHideLinkPreview = false,
//   ...props
// }: MessageContentProps) => {
//   const displayText = message.text || message.content

//   return (
//     <Box {...props}>
//       {displayText ? (
//         <TiptapRenderer
//           message={{
//             ...message,
//             message_type: 'Text',
//             text: displayText
//           }}
//           user={user}
//           currentUser={currentUser}
//           showLinkPreview={forceHideLinkPreview ? false : message.hide_link_preview ? false : true}
//         />
//       ) : null}

//       {/* {isPending && !displayText && (
//         <Box className='rounded bg-gray-200 text-gray-500 px-4 py-2 my-1 w-fit min-h-[32px] animate-pulse'>
//           Đang gửi...
//         </Box>
//       )} */}

//       {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}

//       {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}

//       {message.message_type === 'Poll' && <PollMessageBlock message={message} user={user} />}
//     </Box>
//   )
// }

export const MessageContent = ({
  message,
  user,
  currentUser,
  forceHideLinkPreview = false,
  removePendingMessage,
  sendOnePendingMessage,
  ...props
}: MessageContentProps) => {
  const displayText =
    message.message_type === 'File' || message.message_type === 'Image' ? '' : message.text || message.content

  return (
    <Box {...props}>
      {displayText ? (
        <TiptapRenderer
          message={{
            ...message,
            message_type: 'Text',
            text: displayText
          }}
          user={user}
          currentUser={currentUser}
          showLinkPreview={forceHideLinkPreview ? false : message.hide_link_preview ? false : true}
        />
      ) : null}

      {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}

      {message.message_type === 'File' && (
        <FileMessageBlock
          onRetry={(id) => sendOnePendingMessage(id)}
          onRemove={(id) => removePendingMessage(id)}
          message={message}
          user={user}
        />
      )}

      {message.message_type === 'Poll' && <PollMessageBlock message={message} user={user} />}
    </Box>
  )
}
