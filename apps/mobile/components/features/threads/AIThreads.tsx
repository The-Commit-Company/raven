import { View } from "react-native"
import { useState } from "react"
import { useDebounce } from "@raven/lib/hooks/useDebounce"
import { SearchInput } from "@components/nativewindui/SearchInput"
import { useColorScheme } from "@hooks/useColorScheme"
import ThreadsList from "./ThreadsList"

const AIThreads = () => {

    const [onlyShowUnread, setOnlyShowUnread] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedText = useDebounce(searchQuery, 200)
    const { colors } = useColorScheme()

    return (
        <View>
            <View className='flex gap-2 justify-between p-2 border-b border-gray-4'>
                <View className='px-4 py-3'>
                    <SearchInput
                        style={{ backgroundColor: colors.grey6 }}
                        placeholder="Search"
                        placeholderTextColor={colors.grey}
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                    />
                </View>
                {/* <View className='flex gap-2'>
                    <UnreadFilter onlyShowUnread={onlyShowUnread} setOnlyShowUnread={setOnlyShowUnread} />
                </View> */}
            </View>
            <View className="h-[calc(100vh-10rem)] overflow-y-auto">
                <ThreadsList
                    content={debouncedText}
                    aiThreads={1}
                    onlyShowUnread={onlyShowUnread}
                />
            </View>
        </View>
    )
}

export default AIThreads
