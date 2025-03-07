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
        <View className="flex flex-col gap-4 w-full">
            <SearchInput
                style={{ backgroundColor: colors.grey6 }}
                placeholder="Search"
                placeholderTextColor={colors.grey}
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            <ThreadsList
                content={debouncedText}
                aiThreads={1}
                onlyShowUnread={onlyShowUnread}
            />
        </View>
    )
}

export default AIThreads
