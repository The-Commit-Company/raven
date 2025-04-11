import { useState } from 'react'
import { View } from 'react-native'
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
        <View className='flex-1 flex-col gap-3 pt-4'>
            <View className='px-3'>
                <SegmentedControl
                    values={values}
                    selectedIndex={selectedIndex}
                    onIndexChange={handleIndexChange}
                />
            </View>
            <View>
                {selectedIndex === 0 && <ParticipatingThreads />}
                {selectedIndex === 1 && <OtherThreads />}
                {selectedIndex === 2 && <AIThreads />}
            </View>
        </View>
    )
}

export default ThreadTabs