import useChatStream, { MessageDateBlock } from '@hooks/useChatStream'
import { useRef } from 'react'
import { LegendList, LegendListRef } from '@legendapp/list'
import DateSeparator from './DateSeparator'
import SystemMessageBlock from './SystemMessageBlock'
import MessageItem from './MessageItem'
import ChannelHistoryFirstMessage from './FirstMessageBlock'

type Props = {
    channelID: string,
    isThread?: boolean
}

const ChatStream = ({ channelID, isThread = false }: Props) => {


    const listRef = useRef<LegendListRef>(null)

    const { data, isLoading, error, mutate } = useChatStream(channelID, listRef, isThread)

    // return <FlatList
    //     data={data}
    //     ref={listRef}
    //     inverted
    //     maintainVisibleContentPosition={{
    //         minIndexForVisible: 0
    //     }}
    //     keyboardDismissMode='on-drag'
    //     // onContentSizeChange={() => {
    //     //     setTimeout(() => {
    //     //         listRef.current?.scrollToEnd({ animated: false })
    //     //     }, 100)
    //     // }}
    //     ListEmptyComponent={isLoading ? <View>
    //         {/* TODO: Add skeleton loader here */}
    //         <Text>Loading...</Text>
    //     </View> : null}
    //     onStartReached={() => {
    //         // TODO: Load newer messages
    //         console.log('onStartReached')
    //     }}
    //     onEndReached={() => {
    //         // TODO: Load older messages
    //         console.log('onEndReached')
    //     }}
    //     renderItem={MessageContentRenderer}
    //     keyExtractor={messageKeyExtractor}
    //     ListFooterComponent={<ChannelHistoryFirstMessage channelID={channelID} />}
    // />

    return (
        <LegendList
            ref={listRef}
            data={data}
            keyExtractor={messageKeyExtractor}
            // drawDistance={500}
            alignItemsAtEnd
            keyboardDismissMode='on-drag'
            maintainVisibleContentPosition
            waitForInitialLayout
            // initialScrollIndex={data.length > 0 ? data.length - 1 : undefined}
            maintainScrollAtEnd
            maintainScrollAtEndThreshold={0.1}
            getEstimatedItemSize={getEstimatedItemSize}
            renderItem={MessageContentRenderer}
            recycleItems={false}
            contentContainerStyle={{
                paddingBottom: 32
            }}
        // contentContainerStyle={{
        //     paddingHorizontal: 4,
        //     // Add bottom padding to prevent last message from being hidden under ChatInput
        //     paddingBottom: 0
        // }}
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
        estimatedHeight += (item.content?.length || 0) * 1.5 || 100
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

    // TODO: Implement reply message press
    const onReplyMessagePress = () => {
        console.log('reply message pressed')
    }

    if (item.message_type === 'date') {
        return <DateSeparator item={item} />
    }

    if (item.message_type === 'System') {
        return <SystemMessageBlock item={item} />
    }

    if (item.message_type === 'header') {
        return <ChannelHistoryFirstMessage channelID={item.name} />
    }

    return <MessageItem message={item} onReplyMessagePress={onReplyMessagePress} />
}

export default ChatStream