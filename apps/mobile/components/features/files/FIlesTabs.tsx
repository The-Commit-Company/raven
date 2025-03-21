import { useState } from 'react'
import { View } from 'react-native'
import { SegmentedControl } from '@components/nativewindui/SegmentedControl/SegmentedControl'
import ImageGrid from './ImageGrid'
import DocGrid from './DocGrid'
import { Divider } from '@components/layout/Divider'

const FilesTabs = ({ searchQuery }: { searchQuery: string }) => {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const values = ['Images', 'Docs']

    const handleIndexChange = (index: number) => {
        setSelectedIndex(index)
    }

    return (
        <View className='flex-1 flex-col gap-3'>
            <View className='px-3'>
                <SegmentedControl
                    values={values}
                    selectedIndex={selectedIndex}
                    onIndexChange={handleIndexChange}
                />
            </View>
            <Divider className='mx-0' prominent />
            <View className='flex-1'>
                {selectedIndex === 0 && <ImageGrid searchQuery={searchQuery} />}
                {selectedIndex === 1 && <DocGrid searchQuery={searchQuery} />}
            </View>
        </View>
    )
}

export default FilesTabs