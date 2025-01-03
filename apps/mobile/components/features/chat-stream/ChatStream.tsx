import { Text } from '@components/nativewindui/Text'
import useChatStream, { MessageDateBlock } from '@hooks/useChatStream'
import { useRef } from 'react'
import { FlatList, View } from 'react-native'
import { LegendList, LegendListRef } from '@legendapp/list'
import DateSeparator from './DateSeparator'
import SystemMessageBlock from './SystemMessageBlock'
import MessageItem from './MessageItem'
import { FlashList } from '@shopify/flash-list'

type Props = {
    channelID: string
}

const ChatStream = ({ channelID }: Props) => {

    const listRef = useRef<FlatList>(null)

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
            <View style={ContentContainerStyles}>
                <FlatList
                    data={data}
                    ref={listRef}
                    onContentSizeChange={() => {
                        setTimeout(() => {
                            listRef.current?.scrollToEnd({ animated: false })
                        }, 100)
                    }}
                    renderItem={MessageContentRenderer}
                    keyExtractor={messageKeyExtractor}
                />
                {/* <LegendList
                    ref={listRef}
                    data={data}
                    keyExtractor={messageKeyExtractor}
                    alignItemsAtEnd
                    maintainVisibleContentPosition
                    initialScrollIndex={data.length - 1}
                    maintainScrollAtEnd
                    maintainScrollAtEndThreshold={0.1}
                    getEstimatedItemSize={getEstimatedItemSize}
                    renderItem={MessageContentRenderer}
                    recycleItems
                /> */}
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

const ContentContainerStyles = {
    paddingBottom: 120
}

const MessageContentRenderer = ({ item }: { item: MessageDateBlock }) => {
    if (item.message_type === 'date') {
        return <DateSeparator item={item} />
    }

    if (item.message_type === 'System') {
        return <SystemMessageBlock item={item} />
    }
    return <MessageItem message={item} />
}

export default ChatStream