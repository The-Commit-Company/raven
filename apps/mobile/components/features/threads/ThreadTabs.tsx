import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import AIThreads from './AIThreads'
import OtherThreads from './OtherThreads'
import ParticipatingThreads from './ParticipatingThreads'
import { SegmentedControl } from '@components/nativewindui/SegmentedControl/SegmentedControl'

export type ThreadMessage = {
    bot: string,
    channel_id: string,
    content: string,
    creation: string,
    file: string,
    hide_link_preview: 0 | 1,
    image_height: string
    image_width: string,
    is_bot_message: 0 | 1,
    last_message_timestamp: string,
    link_doctype: string,
    link_document: string,
    message_type: "Text" | "Image" | "File" | "Poll",
    name: string,
    owner: string,
    poll_id: string,
    text: string,
    thread_message_id: string,
    participants: { user_id: string }[],
    workspace?: string,
    reply_count?: number
}

const ThreadTabs = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const values = ['Participating', 'Other', 'AI Agents']

    const handleIndexChange = (index: number) => {
        setSelectedIndex(index)
    }

    return (
        <View className='flex-1 flex-col gap-4 px-4 pt-4'>
            <SegmentedControl
                values={values}
                selectedIndex={selectedIndex}
                onIndexChange={handleIndexChange}
            />
            <ScrollView>
                {selectedIndex === 0 && <ParticipatingThreads />}
                {selectedIndex === 1 && <OtherThreads />}
                {selectedIndex === 2 && <AIThreads />}
            </ScrollView>
        </View>
    )
}

export default ThreadTabs