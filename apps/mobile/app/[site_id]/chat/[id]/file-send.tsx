import { Text, TextInput, View } from "react-native"
import PagerView from 'react-native-pager-view'
import { filesAtom } from "."
import { useAtomValue } from 'jotai'
import { Stack } from "expo-router"
import { useState } from "react"
import UniversalFileIcon from "@components/common/UniversalFileIcon"
import { Button } from "@components/nativewindui/Button"

const FileSend = () => {
    const [headerTitle, setHeaderTitle] = useState<string>()
    const files = useAtomValue(filesAtom)

    return (
        <>
            <Stack.Screen options={{
                title: 'Raven',
                headerShown: true,
                headerTitle: headerTitle,
            }} />
            <PagerView style={{ flex: 1 }} initialPage={0} onPageSelected={({ nativeEvent }) => {
                setHeaderTitle(files[nativeEvent.position].name)
            }}>
                {files.map((file) => {
                    if (file.uri) {
                        return (
                            <View key={file.fileID} style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <UniversalFileIcon fileName={file.name} height={100} width={100} />
                                <View className='h-24 fixed bottom-0 w-full bg-card'>
                                    <View className='px-4 py-2 flex-row h-full w-full gap-2 items-center justify-center'>
                                        <TextInput
                                            placeholder='Type a message...'
                                            className='border h-12 border-border w-[80%] rounded-lg p-2' />
                                        <Button size='icon'><Text>S</Text></Button>
                                    </View>
                                </View>
                            </View>
                        )
                    }
                })}
            </PagerView>
        </>
    )
}

export default FileSend