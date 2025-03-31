import useChatStream, { MessageDateBlock } from '@hooks/useChatStream'
import { RefObject } from 'react'
import { LegendList, LegendListRef } from '@legendapp/list'
import DateSeparator from './DateSeparator'
import SystemMessageBlock from './SystemMessageBlock'
import MessageItem from './MessageItem'
import ChannelHistoryFirstMessage from './FirstMessageBlock'
import { useAtomValue } from 'jotai'
import { doubleTapMessageEmojiAtom } from '@lib/preferences'
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native'
import ChatStreamSkeletonLoader from './ChatStreamSkeletonLoader'
import ErrorBanner from '@components/common/ErrorBanner'

type Props = {
    channelID: string,
    isThread?: boolean,
    scrollRef?: RefObject<LegendListRef>,
    onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    pinnedMessagesString?: string
}

const ChatStream = ({ channelID, isThread = false, scrollRef, onMomentumScrollEnd, onScrollBeginDrag, pinnedMessagesString }: Props) => {


    /** Fetching this here to avoid blank screen when the user opens the chat. 
     * Each message item fetches this atom value
     * 
     * If this is not fetched here, the chat stream sometimes remains blank
     */
    const doubleTapMessageEmoji = useAtomValue(doubleTapMessageEmojiAtom)

    const { data, isLoading, error, loadOlderMessages, loadNewerMessages } = useChatStream(channelID, scrollRef, isThread, pinnedMessagesString)

    if (isLoading) {
        return <ChatStreamSkeletonLoader />
    }

    if (!data && error) {
        return <View className='px-2 flex-1 justify-center items-center'>
            <ErrorBanner error={error} />
        </View>
    }

    return (
        <LegendList
            ref={scrollRef}
            data={data}
            keyExtractor={messageKeyExtractor}
            // drawDistance={500}
            alignItemsAtEnd
            keyboardDismissMode='on-drag'
            maintainVisibleContentPosition
            waitForInitialLayout
            initialScrollIndex={data.length > 0 ? data.length - 1 : undefined}
            maintainScrollAtEnd
            maintainScrollAtEndThreshold={0.1}
            getEstimatedItemSize={getEstimatedItemSize}
            renderItem={MessageContentRenderer}
            recycleItems={false}
            contentContainerStyle={{
                paddingBottom: 32
            }}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollBeginDrag={onScrollBeginDrag}
            onStartReached={loadOlderMessages}
            onEndReached={loadNewerMessages}
        />
    )

}

/** ---- HEIGHT ESTIMATION ---- */
const DATE_MESSAGE_HEIGHT = 41
const SYSTEM_MESSAGE_HEIGHT = 40
const FORWARDED_BLOCK_HEIGHT = 16
const PINNED_BLOCK_HEIGHT = 16
const EDITED_LABEL_HEIGHT = 16
const REPLY_MESSAGE_HEIGHT = 70
const FILE_MESSAGE_HEIGHT = 62
const NON_CONTINUATION_MESSAGE_OFFSET = 28
const MESSAGE_REACTIONS_ROW_HEIGHT = 41
// TODO: Approx height for polls - depends on the number of options
const POLL_MESSAGE_HEIGHT = 180
// TODO: Approx height for doctype link renderer - depends on the number of fields in preview
const DOCTYPE_LINK_RENDERER_HEIGHT = 160
/** TODO: Add thread block height */
const THREAD_BLOCK_HEIGHT = 30
const LINK_PREVIEW_HEIGHT = 240

/** A function to estimate the size of the item 
 * 
 * Adjust these whenever you change the styles of the components that impact the height
*/
const getEstimatedItemSize = (index: number, item: MessageDateBlock) => {

    if (!item) return 80
    if (item?.message_type === 'date') {
        return DATE_MESSAGE_HEIGHT
    }

    if (item?.message_type === 'header') {
        return 91
    }

    if (item?.message_type === 'System') {
        return SYSTEM_MESSAGE_HEIGHT
    }

    let estimatedHeight = 8

    if (item?.is_continuation) estimatedHeight += NON_CONTINUATION_MESSAGE_OFFSET

    if (item?.is_edited) estimatedHeight += EDITED_LABEL_HEIGHT

    if (item?.is_forwarded) estimatedHeight += FORWARDED_BLOCK_HEIGHT

    if (item?.is_pinned) estimatedHeight += PINNED_BLOCK_HEIGHT

    if (item?.is_reply) estimatedHeight += REPLY_MESSAGE_HEIGHT

    if (item?.message_type === 'Poll') estimatedHeight += POLL_MESSAGE_HEIGHT

    if (item?.message_type === 'File') estimatedHeight += FILE_MESSAGE_HEIGHT

    if (item.message_type === "Image") {
        if (item.thumbnail_height) {
            estimatedHeight += item.thumbnail_height / 2
        } else {
            estimatedHeight += 200
        }
    }

    if (item?.link_doctype && item?.link_document) estimatedHeight += DOCTYPE_LINK_RENDERER_HEIGHT

    if (item?.might_contain_link_preview) estimatedHeight += LINK_PREVIEW_HEIGHT

    if (item?.is_thread) estimatedHeight += THREAD_BLOCK_HEIGHT

    if (item?.text) {
        estimatedHeight += ((item.content?.length || 0) * 1.5 + 100) || 100
    }

    if (item?.message_reactions) {
        estimatedHeight += MESSAGE_REACTIONS_ROW_HEIGHT
    }



    return estimatedHeight
}

const messageKeyExtractor = (item: MessageDateBlock) => {
    if (!item) {
        return 'empty'
    }

    if (item.message_type === 'header') {
        return `header-${item.name}`
    }

    if (item.message_type === 'date') {
        return `date-${item.creation}`
    }
    return `${item.name}-${item.modified}`
}

const MessageContentRenderer = ({ item }: { item: MessageDateBlock }) => {

    if (item.message_type === 'date') {
        return <DateSeparator item={item} />
    }

    if (item.message_type === 'System') {
        return <SystemMessageBlock item={item} />
    }

    if (item.message_type === 'header') {
        return <ChannelHistoryFirstMessage channelID={item.name} isThread={item.isOpenInThread} />
    }

    return <MessageItem message={item} />
}

export default ChatStream