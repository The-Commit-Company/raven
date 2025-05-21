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
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
}

// Component chính hiển thị một tin nhắn trong cuộc trò chuyện
export const MessageItem = ({
  message, // Đối tượng tin nhắn
  setDeleteMessage, // Hàm xử lý xóa tin nhắn
  isHighlighted, // Có đang được làm nổi bật không
  onReplyMessageClick, // Sự kiện khi nhấn vào nút trả lời
  setEditMessage, // Hàm xử lý chỉnh sửa tin nhắn
  replyToMessage, // Hàm trả lời tin nhắn
  forwardMessage, // Hàm chuyển tiếp tin nhắn
  onAttachDocument, // Hàm đính kèm tài liệu
  setReactionMessage, // Hàm xử lý reaction
  showThreadButton = true, // Có hiển thị nút luồng không (mặc định là có)
  seenUsers,
  channel
}: MessageBlockProps) => {
  const {
    owner: userID, // ID người gửi
    is_bot_message, // Có phải là tin nhắn từ bot không
    bot, // Thông tin bot (nếu là tin nhắn từ bot)
    creation: timestamp, // Thời gian tạo tin nhắn
    message_reactions, // Các reaction của tin nhắn
    is_continuation, // Có phải là tin nhắn tiếp nối không
    linked_message, // Tin nhắn được liên kết
    replied_message_details // Chi tiết tin nhắn được trả lời
  } = message

  // Lấy thông tin người dùng và trạng thái hoạt động
  const { user, isActive } = useGetUserDetails(is_bot_message && bot ? bot : userID)

  // Xử lý sự kiện xóa tin nhắn
  const onDelete = () => {
    setDeleteMessage(message) // Gọi hàm xóa tin nhắn với tin nhắn hiện tại
  }

  // Xử lý sự kiện chỉnh sửa tin nhắn
  const onEdit = () => {
    setEditMessage(message) // Gọi hàm chỉnh sửa tin nhắn với tin nhắn hiện tại
  }

  // Xử lý sự kiện trả lời tin nhắn
  const onReply = () => {
    replyToMessage(message) // Gọi hàm trả lời tin nhắn với tin nhắn hiện tại
  }

  // Xử lý sự kiện chuyển tiếp tin nhắn
  const onForward = () => {
    forwardMessage(message) // Gọi hàm chuyển tiếp tin nhắn với tin nhắn hiện tại
  }

  // Xử lý sự kiện đính kèm vào tài liệu
  const onAttachToDocument = () => {
    onAttachDocument(message) // Gọi hàm đính kèm tài liệu với tin nhắn hiện tại
  }

  // Xử lý sự kiện xem reaction
  const onViewReaction = () => {
    setReactionMessage(message) // Gọi hàm hiển thị reaction với tin nhắn hiện tại
  }

  // Kiểm tra xem có phải là thiết bị desktop không
  const isDesktop = useIsDesktop()

  // State để theo dõi trạng thái hover
  const [isHovered, setIsHovered] = useState(false)
  // Sử dụng debounce để tránh hiệu ứng nhấp nháy khi hover
  const isHoveredDebounced = useDebounce(isHovered, isDesktop ? 400 : 200)

  // Xử lý sự kiện khi di chuột vào
  const onMouseEnter = () => {
    if (isDesktop) {
      // Chỉ xử lý hover trên desktop
      setIsHovered(true)
    }
  }

  // Xử lý sự kiện khi di chuột ra
  const onMouseLeave = () => {
    if (isDesktop) {
      // Chỉ xử lý hover trên desktop
      setIsHovered(false)
    }
  }

  // Cho thiết bị di động: hiển thị quick actions khi nhấn đúp
  const bind = useDoubleTap((event) => {
    if (!isDesktop) setIsHovered(!isHovered) // Đảo trạng thái hiển thị quick actions
  })

  // Xử lý sự kiện click bên ngoài để đóng quick actions trên mobile
  const ref = useOutsideClick(() => {
    if (!isDesktop) setIsHovered(false) // Ẩn quick actions khi click ra ngoài
  })

  // Xử lý chi tiết tin nhắn được trả lời
  const replyMessageDetails = useMemo(() => {
    if (typeof replied_message_details === 'string') {
      return JSON.parse(replied_message_details) // Parse nếu là chuỗi JSON
    } else {
      return replied_message_details // Trả về nguyên bản nếu không phải chuỗi
    }
  }, [replied_message_details]) // Chỉ tính toán lại khi replied_message_details thay đổi

  // State cho emoji picker
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)

  // Lấy kiểu chat từ cấu hình (mặc định là 'Simple')
  // @ts-ignore
  const CHAT_STYLE = window.frappe?.boot?.chat_style ?? 'Simple' // Lấy kiểu chat từ cấu hình

  // Lưu trữ văn bản được chọn
  const [selectedText, setSelectedText] = useState('') // Lưu trữ văn bản được chọn

  // Xử lý sự kiện thay đổi menu ngữ cảnh (chuột phải)
  const onContextMenuChange = (open: boolean) => {
    if (open) {
      // Lấy văn bản đang được chọn
      const selection = document.getSelection()
      if (selection) {
        setSelectedText(selection.toString().trim()) // Lưu văn bản được chọn
      }
    } else {
      setSelectedText('') // Xóa văn bản được chọn khi đóng menu
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

  // Render component MessageItem
  return (
    <div ref={messageRef}>
      {/* Kiểm tra kiểu chat để hiển thị layout phù hợp */}
      {CHAT_STYLE === 'Left-Right' ? (
        // Sử dụng LeftRightLayout nếu kiểu chat là 'Left-Right'
        <LeftRightLayout
          message={message} // Truyền đối tượng tin nhắn
          user={user} // Thông tin người dùng
          isActive={isActive} // Trạng thái hoạt động
          isHighlighted={isHighlighted} // Có đang được làm nổi bật không
          onReplyMessageClick={onReplyMessageClick} // Xử lý khi nhấn trả lời
          onDelete={onDelete} // Xử lý xóa tin nhắn
          showThreadButton={showThreadButton} // Có hiển thị nút luồng không
          onEdit={onEdit} // Xử lý chỉnh sửa tin nhắn
          onReply={onReply} // Xử lý trả lời tin nhắn
          onForward={onForward} // Xử lý chuyển tiếp tin nhắn
          onViewReaction={onViewReaction} // Xem các reaction
          onAttachToDocument={onAttachToDocument} // Đính kèm vào tài liệu
          hasBeenSeen={hasBeenSeen}
          seenByOthers={seenByOthers}
          channel={channel}
          unseenByOthers={unseenByOthers}
        />
      ) : (
        // Sử dụng layout mặc định nếu không phải 'Left-Right'
        <Box className='relative'>
          {/* Hiển thị đường kẻ chỉ thị luồng nếu đây là tin nhắn trong luồng và không phải là tin nhắn tiếp nối */}
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
          {/* Context menu cho tin nhắn (hiển thị khi click chuột phải) */}
          <ContextMenu.Root modal={false} onOpenChange={onContextMenuChange}>
            {/* Kích hoạt context menu */}
            <ContextMenu.Trigger
              {...bind} // Bind sự kiện nhấn đúp cho mobile
              ref={ref} // Ref để phát hiện click bên ngoài
              onMouseEnter={onMouseEnter} // Xử lý khi di chuột vào
              onMouseLeave={onMouseLeave} // Xử lý khi di chuột ra
              className={clsx(
                // Các class CSS áp dụng cho tin nhắn
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
                isEmojiPickerOpen ? 'bg-gray-2 dark:bg-gray-3' : ''
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
                      <RiShareForwardFill size='12' /> forwarded
                    </Flex>
                  )}
                  {/* Hiển thị biểu tượng nếu tin nhắn được ghim */}
                  {message.is_pinned === 1 && (
                    <Flex className='text-accent-9 text-xs' gap={'1'} align={'center'}>
                      <RiPushpinFill size='12' /> Pinned
                    </Flex>
                  )}
                  {/* Hiển thị tin nhắn được trả lời nếu có */}
                  {linked_message && replied_message_details && (
                    <ReplyMessageBox
                      className='sm:min-w-[28rem] cursor-pointer mb-1'
                      role='button'
                      onClick={() => onReplyMessageClick(linked_message)} // Xử lý khi nhấn vào tin nhắn được trả lời
                      message={replyMessageDetails} // Chi tiết tin nhắn được trả lời
                      currentUser={currentUser}
                    />
                  )}
                  {/* Hiển thị nội dung tin nhắn tùy theo loại */}
                  <MessageContent message={message} user={user} currentUser={currentUser} />
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
                  {message_reactions?.length && (
                    <MessageReactions message={message} message_reactions={message_reactions} />
                  )}
                  {/* Hiển thị thông tin luồng nếu đây là tin nhắn trong luồng */}
                  {message.is_thread === 1 ? <ThreadMessage thread={message} /> : null}

                  <div className='absolute bottom-0 -right-5'>
                    <MessageSeenStatus
                      hasBeenSeen={hasBeenSeen}
                      channelType={channel?.type}
                      seenByOthers={seenByOthers}
                      unseenByOthers={unseenByOthers}
                      currentUserOwnsMessage={message.owner === currentUser}
                    />
                  </div>
                </Flex>
                {/* Hiển thị các hành động nhanh khi hover hoặc mở emoji picker */}
                {(isHoveredDebounced || isEmojiPickerOpen) && (
                  <QuickActions
                    message={message} // Đối tượng tin nhắn
                    onDelete={onDelete} // Xử lý xóa
                    isEmojiPickerOpen={isEmojiPickerOpen} // Trạng thái mở emoji picker
                    setIsEmojiPickerOpen={setEmojiPickerOpen} // Hàm đóng/mở emoji picker
                    onEdit={onEdit} // Xử lý chỉnh sửa
                    onReply={onReply} // Xử lý trả lời
                    onForward={onForward} // Xử lý chuyển tiếp
                    showThreadButton={showThreadButton} // Có hiển thị nút luồng không
                    onAttachDocument={onAttachToDocument} // Xử lý đính kèm tài liệu
                  />
                )}
              </Flex>
            </ContextMenu.Trigger>

            {/* Menu ngữ cảnh khi click chuột phải */}
            <MessageContextMenu
              message={message} // Đối tượng tin nhắn
              onDelete={onDelete} // Xử lý xóa
              showThreadButton={showThreadButton} // Có hiển thị nút luồng không
              onEdit={onEdit} // Xử lý chỉnh sửa
              onReply={onReply} // Xử lý trả lời
              onForward={onForward} // Xử lý chuyển tiếp
              onViewReaction={onViewReaction} // Xem các reaction
              selectedText={selectedText} // Văn bản được chọn
              onAttachDocument={onAttachToDocument} // Xử lý đính kèm tài liệu
            />
          </ContextMenu.Root>
        </Box>
      )}
    </div>
  )
}

// Props cho component MessageLeftElement
type MessageLeftElementProps = BoxProps & {
  message: MessageBlock['data'] // Dữ liệu tin nhắn
  user?: UserFields // Thông tin người dùng
  isActive?: boolean // Trạng thái hoạt động
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

  // Trả về thông tin người dùng và trạng thái hoạt động
  return { user, isActive }
}

// Định nghĩa props cho các component liên quan đến người dùng
interface UserProps {
  user?: UserFields // Thông tin người dùng (tùy chọn)
  userID: string // ID của người dùng (bắt buộc)
  isActive?: boolean // Trạng thái hoạt động (tùy chọn)
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
          src={user?.user_image} // URL ảnh đại diện
          alt={alt} // Văn bản thay thế
          loading='lazy' // Tải ảnh một cách lười biếng
          fallback={getInitials(alt)} // Hiển thị chữ cái đầu nếu không có ảnh
          size={'2'} // Kích thước trung bình
          radius={'medium'} // Bo tròn vừa phải
        />

        {/* Hiển thị chỉ báo trạng thái "Away" (vàng) */}
        {availabilityStatus && availabilityStatus === 'Away' && (
          <span
            className={clsx(
              'absolute block translate-x-1/2 translate-y-1/2 transform rounded-full',
              'bottom-0.5 right-0.5' // Vị trí góc dưới bên phải
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
              'bottom-0.5 right-0.5' // Vị trí góc dưới bên phải
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
              'bottom-0.5 right-0.5' // Vị trí góc dưới bên phải
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
  // Sử dụng useMemo để tối ưu hiệu năng, chỉ tính toán lại khi user hoặc userID thay đổi
  const { isBot, fullName, userImage, availabilityStatus, customStatus } = useMemo(() => {
    return {
      fullName: user?.full_name ?? userID, // Tên đầy đủ hoặc userID nếu không có tên
      availabilityStatus: user?.availability_status, // Trạng thái hiện tại
      customStatus: user?.custom_status, // Trạng thái tùy chỉnh
      userImage: user?.user_image ?? '', // URL ảnh đại diện
      isBot: user?.type === 'Bot' // Có phải là bot không
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
}

/**
 * Component hiển thị nội dung tin nhắn dựa trên loại tin nhắn
 * - Xử lý hiển thị các loại tin nhắn khác nhau: văn bản, hình ảnh, file, khảo sát
 * - Hỗ trợ xem trước liên kết (link preview)
 */
export const MessageContent = ({
  message,
  user,
  currentUser,
  forceHideLinkPreview = false,
  ...props
}: MessageContentProps) => {
  return (
    <Box {...props}>
      {/* Hiển thị nội dung văn bản nếu có */}
      {message.text ? (
        <TiptapRenderer
          message={{
            ...message, // Giữ nguyên tất cả thuộc tính của tin nhắn
            message_type: 'Text' // Đảm bảo loại tin nhắn là Text
          }}
          user={user} // Thông tin người gửi
          currentUser={currentUser} // Thống tin người dùng hien tại
          // Quyết định có hiển thị xem trước liên kết không
          // Nếu forceHideLinkPreview = true hoặc message.hide_link_preview = true thì ẩn, ngược lại hiển thị
          showLinkPreview={forceHideLinkPreview ? false : message.hide_link_preview ? false : true}
        />
      ) : null}

      {/* Hiển thị hình ảnh nếu loại tin nhắn là Image */}
      {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}

      {/* Hiển thị file đính kèm nếu loại tin nhắn là File */}
      {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}

      {/* Hiển thị khảo sát nếu loại tin nhắn là Poll */}
      {message.message_type === 'Poll' && <PollMessageBlock message={message} user={user} />}
    </Box>
  )
}
