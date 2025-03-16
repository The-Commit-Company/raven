import { Pressable, ScrollView, View } from "react-native"
import AdditionalInputs from "./AdditionalInputs"
import { Button } from "@components/nativewindui/Button"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import SendItem from "./SendItem"
import { useAtom } from 'jotai'
import { CustomFile } from "@raven/types/common/File"
import { FC, useState } from "react"
import { filesAtomFamily } from "@lib/ChatInputUtils"
import { useSendMessage } from "@hooks/useSendMessage"
import { MentionInput, MentionSuggestionsProps, replaceMentionValues } from 'react-native-controlled-mentions'
import { Text } from "@components/nativewindui/Text"
import markdownit from 'markdown-it'
import useSiteContext from "@hooks/useSiteContext"

interface ChatInputProps {
    channelID: string
    onSendMessage?: () => void
}

const ChatInput = ({ channelID, onSendMessage }: ChatInputProps) => {
    // const { id } = useLocalSearchParams()
    // const { uploadFiles } = useFileUpload(id as string)

    const [content, setContent] = useState('Hello world!')

    const siteInfo = useSiteContext()
    const siteID = siteInfo?.sitename ?? ''

    const handleCancelReply = () => {
        console.log('cancel reply')
    }

    // console.log("Rednered")


    // const { sendMessage, loading } = useSendMessage(id as string, files.length, uploadFiles, handleCancelReply)

    // const handleSend = async (files?: CustomFile[]) => {

    //     console.log('html', content)

    //     // setText(content ?? '')

    //     if (files && files?.length > 0) {
    //         // set the caption to first file
    //         setFiles((prevFiles) => {
    //             return prevFiles.map((file) => {
    //                 if (file.fileID === files[0].fileID) {
    //                     return { ...file, caption: content }
    //                 }
    //                 return file
    //             })
    //         })

    //         setContent('')
    //     } else if (content) {
    //         console.log('content', content)
    //         await sendMessage(content)
    //         setContent('')
    //     }
    // }

    const { colors } = useColorScheme()

    const onSend = () => {
        /* Parse the cotent to detect mentions and links.
        For example, when typing "Hey @Mary check this out www.frappe.io"
        The output of the component will be:
        Hey @[Mary](2) check this out www.frappe.io

        We need to detect the mentions and links and replace them with HTML tags before sending the message.
        */

        // Find the mentions in the content and replace them with HTML tags
        const replacedValue = replaceMentionValues(content, (mention) => {
            if (mention.trigger === '@') {
                return `<span data-type="userMention" class="mention" data-id="${mention.id}" data-label="${mention.name}">@${mention.name}</span>`
            }

            if (mention.trigger === '#') {
                return `<span data-type="channelMention" class="mention" data-id="${mention.id}" data-label="${mention.name}">#${mention.name}</span>`
            }

            return mention.original
        })

        // console.log('parsedContent - ExpensiMark', parsedContent)

        // We can allow HTML tags since this is only on the client side. XSS Protection is handled by Frappe on the server side.
        const md = markdownit({ breaks: true, linkify: true, html: true })

        let html = md.render(replacedValue)

        console.log('html', html)

        onSendMessage?.()
    }

    return <View className="flex flex-col bg-background">
        {siteID && <FileScroller channelID={channelID} siteID={siteID} />}

        <View className="flex-row items-end px-4 py-2 gap-2 min-h-16 justify-between">
            <AdditionalInputs channelID={channelID} />
            <View className="flex-1 border-border border p-2 rounded-lg w-full min-h-8">
                <MentionInput
                    value={content}
                    multiline
                    onChange={setContent}
                    partTypes={[
                        {
                            trigger: '@', // Should be a single character like '@' or '#'
                            renderSuggestions,
                            textStyle: { fontWeight: 'bold', color: 'blue' }, // The mention style in the input
                        },
                        {
                            pattern: /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(xn--)?[a-z0-9-]{2,20}\b([-a-zA-Z0-9@:%_\+\[\],.~#?&\/=]*[-a-zA-Z0-9@:%_\+\]~#?&\/=])*/gi,
                            textStyle: { color: 'blue' },
                        },
                    ]}
                    className="text-sm"
                />
                {/* <InputComponentMemoized onChange={onChange} ref={inputRef} defaultContent={content.current} /> */}
            </View>
            <View>
                <Button size='icon' variant="plain" className="w-8 h-8" hitSlop={10} onPress={onSend}>
                    <SendIcon fill={colors.primary} />
                </Button>
            </View>
        </View>
    </View>
}

const suggestions = [
    { id: '1', name: 'David Tabaka' },
    { id: '2', name: 'Mary' },
    { id: '3', name: 'Tony' },
    { id: '4', name: 'Mike' },
    { id: '5', name: 'Grey' },
];

const renderSuggestions: FC<MentionSuggestionsProps> = ({ keyword, onSuggestionPress }) => {
    if (keyword == null) {
        return null;
    }

    return (
        <View>
            {suggestions
                .filter(one => one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
                .map(one => (
                    <Pressable
                        key={one.id}
                        onPress={() => onSuggestionPress(one)}

                        style={{ padding: 12 }}
                    >
                        <Text>{one.name}</Text>
                    </Pressable>
                ))
            }
        </View>
    );
};

const FileScroller = ({ channelID, siteID }: { channelID: string, siteID: string }) => {

    const [files, setFiles] = useAtom(filesAtomFamily(siteID + channelID))

    const removeFile = (file: CustomFile) => {
        setFiles((prevFiles) => {
            return prevFiles.filter((f) => f.fileID !== file.fileID)
        })
    }

    return <View>
        {files.length > 0 && <View className="px-2 py-1 border-t border-border">
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 justify-start items-start py-2 pr-2">
                    {files.map((file) => (
                        <SendItem
                            key={file.fileID}
                            file={file}
                            numberOfFiles={files.length}
                            removeFile={removeFile}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
        }
    </View>
}


export default ChatInput