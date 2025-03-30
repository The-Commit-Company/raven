import { useState } from 'react'
import { View } from 'react-native'
import { SegmentedControl } from '@components/nativewindui/SegmentedControl/SegmentedControl'
import ImageGrid from './ImageGrid'
import FileGrid from './FileGrid'
import { Divider } from '@components/layout/Divider'

const MediaTabs = ({ searchQuery }: { searchQuery: string }) => {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const values = ['Images', 'Files']

    const handleIndexChange = (index: number) => {
        setSelectedIndex(index)
    }

    return (
        <View className='flex-1 flex-col'>
            <View className='flex flex-col gap-3'>
                <View className='px-3'>
                    <SegmentedControl
                        values={values}
                        selectedIndex={selectedIndex}
                        onIndexChange={handleIndexChange}
                    />
                </View>
                <Divider prominent />
            </View>
            <View className='flex-1'>
                {selectedIndex === 0 && <ImageGrid searchQuery={searchQuery} />}
                {selectedIndex === 1 && <FileGrid searchQuery={searchQuery} />}
            </View>
        </View>
    )
}

export default MediaTabs