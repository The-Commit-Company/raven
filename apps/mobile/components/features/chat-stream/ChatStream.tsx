import { Text } from '@components/nativewindui/Text'
import useChatStream, { MessageDateBlock } from '@hooks/useChatStream'
import { useRef } from 'react'
import { FlatList, View } from 'react-native'
import { LegendList, LegendListRef } from '@legendapp/list'
import DateSeparator from './DateSeparator'
import SystemMessageBlock from './SystemMessageBlock'
import MessageItem from './MessageItem'
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useKeyboardVisible } from '@hooks/useKeyboardVisible'
import ChannelHistoryFirstMessage from './FirstMessageBlock'

type Props = {
    channelID: string
}

const ChatStream = ({ channelID }: Props) => {

    const { bottom } = useSafeAreaInsets()
    const { isKeyboardVisible } = useKeyboardVisible()

    const listRef = useRef<LegendListRef>(null)

    const { data, isLoading, error, mutate } = useChatStream(channelID, listRef)

    if (isLoading) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        )
    }

    if (data) {
        return (
            <View style={{
                paddingBottom: 120 + (isKeyboardVisible ? 0 : bottom), // height of the chat input, adjust this accordindly
            }} className='bg-white dark:bg-background px-1'>
                {/* <FlatList
                    data={data}
                    ref={listRef}
                    onContentSizeChange={() => {
                        setTimeout(() => {
                            listRef.current?.scrollToEnd({ animated: false })
                        }, 100)
                    }}
                    renderItem={MessageContentRenderer}
                    keyExtractor={messageKeyExtractor}
                /> */}
                <LegendList
                    ref={listRef}
                    data={data}
                    keyExtractor={messageKeyExtractor}
                    drawDistance={500}
                    alignItemsAtEnd
                    maintainVisibleContentPosition
                    initialScrollIndex={data.length - 1}
                    maintainScrollAtEnd
                    maintainScrollAtEndThreshold={0.1}
                    getEstimatedItemSize={getEstimatedItemSize}
                    renderItem={MessageContentRenderer}
                    recycleItems={false}
                    ListHeaderComponent={<ChannelHistoryFirstMessage channelID={channelID} />}
                />
            </View>
        )
    }

    // TODO: Add error state
    return (
        <View>
            <Text>No data</Text>
        </View>
    )

}

/** A function to estimate the size of the item 
 * 
 * Adjust these whenever you change the styles of the components that impact the height
*/
const getEstimatedItemSize = (index: number, item: MessageDateBlock) => {
    if (item?.message_type === 'date') {
        return 20
    }

    if (item?.message_type === 'System') {
        return 36
    }
    return 46
}

const messageKeyExtractor = (item: MessageDateBlock) => {
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

    return <MessageItem message={item} onReplyMessagePress={onReplyMessagePress} />
}

export default ChatStream