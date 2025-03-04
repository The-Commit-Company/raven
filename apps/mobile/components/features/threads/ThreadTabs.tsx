import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import AIThreads from './AIThreads'
import OtherThreads from './OtherThreads'
import ParticipatingThreads from './ParticipatingThreads'
import { SegmentedControl } from '@components/nativewindui/SegmentedControl/SegmentedControl'

const ThreadTabs = ({ threadID }: { threadID: string }) => {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const values = ['Participating', 'Other', 'AI Threads']

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